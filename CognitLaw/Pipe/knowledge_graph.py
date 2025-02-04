import logging
from .config import client, NEO4J_DATABASE, setup_logging
import re

# Set up logging configuration
setup_logging()

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
        logging.info(f"Generating Cypher queries for case '{case_id}' and category '{category}'")
        chat_completion = client.chat.completions.create(
            messages=[{"role": "user", "content": prompt}],
            model="llama-3.3-70b-versatile",
        )
        cypher_response = chat_completion.choices[0].message.content
        logging.info(f"Generated Cypher queries for case '{case_id}' and category '{category}'")
        return cypher_response
    except Exception as e:
        logging.error(f"Error querying Groq for case '{case_id}' and category '{category}': {e}")
        return None  

def extract_cypher_from_response(response):
    cypher_pattern = r"```cypher\n(.*?)\n```"
    matches = re.findall(cypher_pattern, response, re.DOTALL)
    if matches:
        logging.info("Cypher queries successfully extracted from response.")
    else:
        logging.warning("No Cypher queries found in the response.")
    return matches if matches else []

def execute_cypher_queries(queries, driver):
    with driver.session(database=NEO4J_DATABASE) as session:
        for query in queries:
            try:
                session.run(query)
                logging.info(f"Executed Cypher query:\n{query}\n")
            except Exception as e:
                logging.error(f"Error executing query: {query}\nError: {e}")

def create_knowledge_graph(data, driver):
    for case in data:
        case_id = case["href"]
        keyword = case["keyword"]
        summarized_content = case["summarized_content"]

        # Create the case node
        case_node_query = f"""
        MERGE (case:Case {{id: '{case_id}', keyword: '{keyword}'}})
        """
        logging.info(f"Creating case node for case '{case_id}' with keyword '{keyword}'.")
        execute_cypher_queries([case_node_query], driver)

        # Process the summarized content
        for category, summary in summarized_content.items():
            logging.info(f"Processing category '{category}' for case '{case_id}'...")

            cypher_response = generate_cypher_queries(summary, category, case_id)
            
            if cypher_response:
                cypher_queries = extract_cypher_from_response(cypher_response)
                if cypher_queries:
                    execute_cypher_queries(cypher_queries, driver)
                else:
                    logging.warning(f"No valid Cypher queries found for category '{category}' in case '{case_id}'.")
            else:
                logging.warning(f"No response received from Groq for category '{category}' in case '{case_id}'.")
