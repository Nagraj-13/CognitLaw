import google.generativeai as genai
from neo4j import GraphDatabase
from groq import Groq
from dotenv import load_dotenv
import os
from pyannote.audio.pipelines import SpeakerDiarization
from collections import deque
import logging

load_dotenv()

# Load environment variables
flask_port = int(os.getenv('FLASK_PORT', 5000))
google_api_key = os.getenv('GOOGLE_API_KEY')
model_name = os.getenv('MODEL_NAME')
generation_config=os.getenv('GENERATION_CONFIG')
system_instruction=os.getenv('SYSTEM_INSTRUCTION')
NEO4J_URI = os.getenv('NEO4J_URI')
NEO4J_USERNAME = os.getenv('NEO4J_USERNAME')
NEO4J_PASSWORD = os.getenv('NEO4J_PASSWORD')
NEO4J_DATABASE = os.getenv('NEO4J_DATABASE')
auth_token = os.getenv('HF_TOKEN')
chromedriver_path = os.getenv('CHROME_DRIVER_PATH')

# Configure Google AI and Groq
genai.configure(api_key=google_api_key)
model = genai.GenerativeModel(
    model_name=model_name,
    generation_config=generation_config,
    system_instruction=system_instruction,
)
chat_session = model.start_chat(history=[])

groq_api_key = os.getenv('GROQ_API')
client = Groq(api_key=groq_api_key)

# Define directories
directories = ['Case Analysis', 'Cases', 'Classified Content', 'Conversations']

# Initialize speaker diarization pipeline
pipeline = SpeakerDiarization.from_pretrained(
    'pyannote/speaker-diarization-3.0',
    use_auth_token=auth_token
)
request_timestamps = deque(maxlen=18)

# Set up logging configuration
def setup_logging():
    log_dir = 'logs'
    if not os.path.exists(log_dir):
        os.makedirs(log_dir)
    logging.basicConfig(
        level=logging.INFO,
        format="%(asctime)s [%(levelname)s] %(message)s",
        handlers=[
            logging.FileHandler(os.path.join(log_dir, "app.log")),  # Save logs to logs/app.log
            logging.StreamHandler()  # Print logs to the console
        ]
    )
    logging.info("Logging setup complete.")

# Call this to initialize logging
setup_logging()

# Example log usage:
logging.info("Configuration and logging initialized successfully.")
