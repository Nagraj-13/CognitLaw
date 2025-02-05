import requests
from bs4 import BeautifulSoup
import time
from selenium import webdriver
from selenium.webdriver.common.by import By
from selenium.webdriver.chrome.service import Service
from selenium.webdriver.chrome.options import Options
from .helper import save_json_to_directory
import threading
from queue import Queue
from .config import setup_logging, IK_API_KEY
import logging


setup_logging()

def get_case_details_for_keyword(keyword):
    """
    Fetch case details using the Indian Kanoon API for the given keyword.
    
    :param api_token: str - API Token for authentication
    :param keyword: str - Search keyword
    :param page_num: int - Page number (default: 0)
    :return: list - Formatted list of case details
    """
    url = "https://api.indiankanoon.org/search/"
    headers = {
        "Authorization": f"Token {IK_API_KEY}",
        "Accept": "application/json",
        "Content-Type": "application/x-www-form-urlencoded"
    }
    payload = {
        "formInput": keyword,
        "pagenum": 0
    }
    
    logging.info(f"Fetching case details for keyword: {keyword}")
    
    try:
        response = requests.post(url, headers=headers, data=payload)
        response.raise_for_status()
        
        if response.status_code != 200:
            logging.error(f"Failed to fetch documents. Status Code: {response.status_code}")
            return []
        
        data = response.json()
        result_data = []
        
        for doc in data.get("docs", [])[:4]:
            result_data.append({
                'text': f"{doc.get('title', 'Unknown Title')} on {doc.get('publishdate', 'Unknown Date')}",
                'href': f"https://indiankanoon.org/doc/{doc.get('tid', '')}/",
                'searchElements': "judgments"
            })
        
        logging.info(f"Found {len(result_data)} case results for keyword: {keyword}")
        return result_data
    
    except Exception as e:
        logging.error(f"Error fetching case details for keyword '{keyword}': {e}")
        return []


# def get_case_details_for_keyword(keyword):
#     uri_header = "https://indiankanoon.org/search/?formInput="
#     uri_footer = "doctypes%3A+supremecourt+sortby%3Amostrecent"
#     case_prompt = '+'.join(keyword.split())
#     url = uri_header + case_prompt + uri_footer
#     headers = {"User-Agent": "Mozilla/5.0"}
    
#     logging.info(f"Fetching case details for keyword: {keyword}")
    
#     try:
#         response = requests.get(url, headers=headers)
#         response.raise_for_status()
#         soup = BeautifulSoup(response.text, 'html.parser')
#         result_data = []
#         result_titles = soup.select('.result_title')[:3]
        
#         for element in result_titles:
#             anchor = element.find('a')
#             if anchor:
#                 text = anchor.get_text(strip=True)
#                 href = anchor['href']
#                 href = href.replace('docfragment', 'doc').split('?')[0]
#                 href = "https://indiankanoon.org" + href if href.startswith('/doc/') else href
#                 result_data.append({'text': text, 'href': href, 'searchElements': "judgments"})
        
#         logging.info(f"Found {len(result_data)} case results for keyword: {keyword}")
#         return result_data
    
#     except Exception as e:
#         logging.error(f"Error fetching case details for keyword '{keyword}': {e}")
#     return []

def get_case_details(keywords, file_id):
    logging.info("Starting case detail fetching for multiple keywords.")
    
    all_results = []
    for keyword in keywords:
        result = get_case_details_for_keyword(keyword)
        if result:
            all_results.append({'keyword': keyword, 'cases': result})
    
    file_name = save_json_to_directory(all_results, 'Cases', 'case_details', file_id)
    logging.info(f"Saved case details to file: {file_name}")
    return all_results

def classify_case_details_thread(keyword_data_queue, results_queue, lock, chromedriver_path):
    options = Options()
    options.add_argument('--headless')
    service = Service(executable_path=chromedriver_path)
    driver = webdriver.Chrome(service=service, options=options)
    classification_mapping = {
        "Fact": ["Facts","Fact", "Background"],
        "Issue": ["Issue", "Issues Raised"],
        "Court's Reasoning": ["Court's Reasoning", "CDiscource"],
        "Respondent's Argument": ["Respondent's Argument", "RespArg"],
        "Petitioner's Argument": ["Petitioner's Argument", "PetArg"],
        "Precedent Analysis": ["Precedent", "Precedent Analysis"],
        "Conclusion": ["Conclusion", "Judgment"]
    }

    logging.info("Starting case classification threads.")
    
    while not keyword_data_queue.empty():
        keyword_data = keyword_data_queue.get()
        keyword = keyword_data["keyword"]
        extracted_data = []
        
        for case in keyword_data["cases"]:
            href = case["href"]
            try:
                logging.info(f"Processing case: {href}")
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
                logging.error(f"Error processing URL {href}: {e}")
        
        with lock:
            results_queue.put(extracted_data)
    
    driver.quit()
    logging.info("Case classification threads completed.")

def classify_case_details(case_details, chromedriver_path, file_id):
    max_threads = 5
    keyword_data_queue = Queue()
    results_queue = Queue()
    lock = threading.Lock()

    logging.info(f"Classifying {len(case_details)} sets of case details using {max_threads} threads.")

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

    filename = save_json_to_directory(extracted_data, 'Classified Content', 'classified_case_details', file_id)
    logging.info(f"Classified case details saved to file: {filename}")
    return extracted_data, filename
