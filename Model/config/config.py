import os
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

class Config:
    BASE_DIR = os.path.dirname(os.path.abspath(__file__))  # Directory of the config file
    DATASET_DIR = os.path.join(BASE_DIR, "data")  # Path for dataset directory
    VECTORSTORE_PATH = os.path.join(BASE_DIR, "Faiss")  # Path for vector store
    LOG_FILE = os.path.join(BASE_DIR, "dataset_log.txt")  # Path for log file
    GOOGLE_API_KEY = os.getenv("GOOGLE_API_KEY")  # API Key from environment variables
    CHAIN_OF_THOUGHT = {
        "goal": "Provide legal advice based on Indian laws.",
        "approach": [
            "Extract relevant information from uploaded PDFs.",
            "Convert text into vector embeddings.",
            "Use embeddings for similarity searches.",
            "Answer user queries based on the context derived from the PDF documents."
        ],
        "feedback": "Continuously improve the responses based on user interactions."
    }

config = Config()
