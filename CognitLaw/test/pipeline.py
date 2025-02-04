import google.generativeai as genai
import requests
from bs4 import BeautifulSoup
import json
import time
from selenium import webdriver
from selenium.webdriver.common.by import By
from selenium.webdriver.chrome.service import Service
from selenium.webdriver.chrome.options import Options
from dotenv import load_dotenv
import os
import re
from neo4j import GraphDatabase
from groq import Groq
import uuid
import threading
from queue import Queue

# Load environment variables
load_dotenv()
api_key = os.getenv('GOOGLE_API_KEY')

# Configure Gemini API
genai.configure(api_key=api_key)
model = genai.GenerativeModel("models/gemini-1.5-flash")

# Neo4j connection details
NEO4J_URI = ""
NEO4J_USERNAME = ""
NEO4J_PASSWORD = ""
NEO4J_DATABASE = ""  

# Initialize Groq client
client = Groq(api_key='')

# Path to ChromeDriver
chromedriver_path = r''


# Ensure Directories Exist
directories = ['Case Analysis', 'Cases', 'Classified Content']
for directory in directories:
    if not os.path.exists(directory):
        os.makedirs(directory)

# Function Definitions
def clean_json_response(response_text):
    response_text = response_text.strip().replace("```json", "").replace("```", "").strip()
    return response_text

def save_json_to_directory(data, directory, prefix):
    unique_id = str(uuid.uuid4())
    filename = os.path.join(directory, f"{prefix}_{unique_id}.json")
    with open(filename, 'w') as json_file:
        json.dump(data, json_file, indent=2)
    print(f"Data saved to {filename}")
    return filename

def analyze_conversation_with_gemini(conversation):
    chat = model.start_chat(
        history=[{"role": "user", "parts": ["You are Lawbot, a highly experienced attorney providing legal advice based on Indian laws."]}]
    )
    formatted_conversation = "\n".join([f"{i+1}. {msg}" for i, msg in enumerate(conversation)])
    conversation_analysis_prompt = f"""
    Analyze the following conversation between a lawyer and a client:

    {formatted_conversation}

    Perform the following tasks:
    1. Identify the key legal issues discussed.
    2. Summarize the conversation.
    3. Extract the most relevant keywords, legal terms, and laws cited (if any).
    4. Provide any next steps or legal recommendations based on the conversation.

    Output the response in JSON format with the following schema:
    {{
        "key_issues": [...],
        "keywords": [...],
        "laws_cited": [...],
        "summary": "...",
        "recommendations": [...]
    }}
    """
    response = chat.send_message(conversation_analysis_prompt)
    cleaned_response = clean_json_response(response.text)
    return json.loads(cleaned_response)

def get_case_details_for_keyword(keyword):
    uri_header = "https://indiankanoon.org/search/?formInput="
    uri_footer = "doctypes%3A+supremecourt+sortby%3Amostrecent"
    case_prompt = '+'.join(keyword.split())
    url = uri_header + case_prompt + uri_footer
    headers = {"User-Agent": "Mozilla/5.0"}
    response = requests.get(url, headers=headers)
    if response.status_code == 200:
        soup = BeautifulSoup(response.text, 'html.parser')
        result_data = []
        result_titles = soup.select('.result_title')[:3]
        for element in result_titles:
            anchor = element.find('a')
            if anchor:
                text = anchor.get_text(strip=True)
                href = anchor['href']
                href = href.replace('docfragment', 'doc').split('?')[0]
                href = "https://indiankanoon.org" + href if href.startswith('/doc/') else href
                result_data.append({'text': text, 'href': href, 'searchElements': "judgments"})
        return result_data
    return []

def get_case_details(keywords):
    all_results = []
    for keyword in keywords:
        result = get_case_details_for_keyword(keyword)
        if result:
            all_results.append({'keyword': keyword, 'cases': result})
    file_name = save_json_to_directory(all_results, 'Cases', 'case_details')
    return all_results

def classify_case_details_thread(keyword_data_queue, results_queue, lock, chromedriver_path):
    options = Options()
    options.add_argument('--headless')
    service = Service(executable_path=chromedriver_path)
    driver = webdriver.Chrome(service=service, options=options)
    classification_mapping = {
        "Fact": ["Facts", "Fact", "Background"],
        "Issue": ["Issue", "Issues Raised"],
        "Court's Reasoning": ["Court's Reasoning"],
        "Conclusion": ["Conclusion", "Judgment"]
    }
    
    while not keyword_data_queue.empty():
        keyword_data = keyword_data_queue.get()
        keyword = keyword_data["keyword"]
        extracted_data = []
        for case in keyword_data["cases"]:
            href = case["href"]
            try:
                driver.get(href)
                time.sleep(5)
                classified_content = {}
                elements = driver.find_elements(By.XPATH, '//*[@data-structure or @title]')
                for element in elements:
                    title = element.get_attribute("title")
                    for category, keywords in classification_mapping.items():
                        if title and any(keyword in title for keyword in keywords):
                            content = element.text.strip()
                            if content:
                                if category not in classified_content:
                                    classified_content[category] = []
                                classified_content[category].append(content)
                extracted_data.append({
                    "keyword": keyword,
                    "href": href,
                    "classified_content": classified_content
                })
            except Exception as e:
                print(f"Error processing URL {href}: {e}")
        
        with lock:
            results_queue.put(extracted_data)

    driver.quit()


def classify_case_details(case_details, chromedriver_path):
    max_threads = 5
    keyword_data_queue = Queue()
    results_queue = Queue()
    lock = threading.Lock()

    for keyword_data in case_details:
        keyword_data_queue.put(keyword_data)

    threads = []
    for _ in range(min(max_threads, len(case_details))):
        thread = threading.Thread(target=classify_case_details_thread, args=(keyword_data_queue, results_queue, lock, chromedriver_path))
        threads.append(thread)
        thread.start()

    for thread in threads:
        thread.join()

    # Gather results from the queue
    extracted_data = []
    while not results_queue.empty():
        extracted_data.extend(results_queue.get())

    filename = save_json_to_directory(extracted_data, 'Classified Content', 'classified_case_details')
    return extracted_data, filename

def generate_cypher_queries(summary, category, case_id):
    prompt = (
        f"Analyze the following text and generate Cypher queries to create nodes and relationships "
        f"for a Neo4j knowledge graph. The graph should represent the entities and relationships found "
        f"in the text. Ensure that:\n\n"
        f"- There is a node for the case with ID '{case_id}' and a category '{category}'.\n"
        f"- Entities are linked to the case and to each other based on relationships.\n\n"
        f"Category: {category}\nText:\n{summary}\n\n"
        f"Output the Cypher queries in plain text format."
    )
    try:
        chat_completion = client.chat.completions.create(
            messages=[{"role": "user", "content": prompt}],
            model="llama-3.3-70b-versatile",
        )
        return chat_completion.choices[0].message.content
    except Exception as e:
        print(f"Error querying Groq: {e}")
        return None  

def extract_cypher_from_response(response):
    cypher_pattern = r"```cypher\n(.*?)\n```"
    matches = re.findall(cypher_pattern, response, re.DOTALL)
    return matches if matches else []

def execute_cypher_queries(queries, driver):
    with driver.session(database=NEO4J_DATABASE) as session:
        for query in queries:
            try:
                session.run(query)
                print(f"Executed Cypher query:\n{query}\n")
            except Exception as e:
                print(f"Error executing query: {query}\nError: {e}")

def create_knowledge_graph(data, driver):
    for case in data:
        case_id = case["href"]
        keyword = case["keyword"]
        summarized_content = case["summarized_content"]

        case_node_query = f"""
        MERGE (case:Case {{id: '{case_id}', keyword: '{keyword}'}})
        """
        execute_cypher_queries([case_node_query], driver)

        for category, summary in summarized_content.items():
            print(f"Processing category '{category}' for case '{case_id}'...")

            cypher_response = generate_cypher_queries(summary, category, case_id)
            
            if cypher_response:
                cypher_queries = extract_cypher_from_response(cypher_response)
                if cypher_queries:
                    execute_cypher_queries(cypher_queries, driver)
                else:
                    print(f"No valid Cypher queries found in Groq response:\n{cypher_response}")
            else:
                print(f"No response received from Groq for category '{category}'.")

# Pipeline execution
if __name__ == "__main__":
    user_conversation = [
        "Client: I received a notice under Section 148 of the Income Tax Act. What does it mean?",
        "Lawyer: Section 148 allows the Income Tax Department to reopen an assessment if they believe income has escaped assessment.",
        "Client: What should I do next?",
        "Lawyer: You should file a response explaining your position or submit additional documents if needed.",
        "Client: Will I be penalized under Section 271(1)(c)?",
        "Lawyer: If there is concealment of income or inaccurate details provided, you might face a penalty under Section 271(1)(c)."
    ]
    conversation_analysis = analyze_conversation_with_gemini(user_conversation)
    save_json_to_directory(conversation_analysis, 'Case Analysis', 'conversation_analysis')
    keywords = conversation_analysis['keywords']
    case_details = get_case_details(keywords)
    filename = classify_case_details(case_details, chromedriver_path)
    print("Pipeline execution complete. Results saved to directories.")
    # Load summarized data and connect to Neo4j
    with open(filename, "r") as file:
        summarized_data = json.load(file)

    driver = GraphDatabase.driver(NEO4J_URI, auth=(NEO4J_USERNAME, NEO4J_PASSWORD))
    create_knowledge_graph(summarized_data, driver)
    driver.close()

    print("Pipeline execution complete. Knowledge graph created in Neo4j.")

# Pipeline Execution
# if __name__ == "__main__":
#     user_conversation = [
#         "Client: I received a notice under Section 148 of the Income Tax Act. What does it mean?",
#         "Lawyer: Section 148 allows the Income Tax Department to reopen an assessment if they believe income has escaped assessment.",
#         "Client: What should I do next?",
#         "Lawyer: You should file a response explaining your position or submit additional documents if needed.",
#         "Client: Will I be penalized under Section 271(1)(c)?",
#         "Lawyer: If there is concealment of income or inaccurate details provided, you might face a penalty under Section 271(1)(c)."
#     ]
#     conversation_analysis = analyze_conversation_with_gemini(user_conversation)
#     save_json_to_directory(conversation_analysis, 'Case Analysis', 'conversation_analysis')
#     keywords = conversation_analysis['keywords']
#     case_details = get_case_details(keywords)
#     classify_case_details(case_details)
#     print("Pipeline execution complete. Results saved to directories.")

