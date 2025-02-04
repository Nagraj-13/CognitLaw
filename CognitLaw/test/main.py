from Pipe.config import chromedriver_path, NEO4J_URI, NEO4J_PASSWORD, NEO4J_USERNAME
from Pipe.conversation_analysis import analyze_conversation_with_gemini
from Pipe.helper import save_json_to_directory, create_directories
from Pipe.scarapper import get_case_details, classify_case_details
from Pipe.knowledge_graph import create_knowledge_graph
from neo4j import GraphDatabase
import json
import os
if __name__ == "__main__":
    create_directories()
    user_conversation = [
        "Client: I received a termination notice from my employer without any prior warning. Is this legal?",
        "Lawyer: Employers are generally required to provide notice or follow due process unless specified otherwise in your employment contract.",
        "Client: My contract does not mention anything about immediate termination. What should I do?",
        "Lawyer: You can file a complaint with the labor tribunal or approach a court for wrongful termination if the termination violates labor laws or the terms of your contract.",
        "Client: Can I demand compensation for the sudden termination?",
        "Lawyer: Yes, if you can prove wrongful termination, you may be entitled to compensation for loss of income and damages."
    ]

    conversation_analysis = analyze_conversation_with_gemini(user_conversation)
    save_json_to_directory(conversation_analysis, 'Case Analysis', 'conversation_analysis')
    keywords = conversation_analysis['keywords']
    case_details = get_case_details(keywords)
    data, filename = classify_case_details(case_details, chromedriver_path)

    print(f"Pipeline execution complete. Results saved to: {filename}")

    # with open(filename, "r") as file:
    #     summarized_data = json.load(file)

    # driver = GraphDatabase.driver(NEO4J_URI, auth=(NEO4J_USERNAME, NEO4J_PASSWORD))
    # create_knowledge_graph(summarized_data, driver)
    # driver.close()

    print("Pipeline execution complete. Knowledge graph created in Neo4j.")
