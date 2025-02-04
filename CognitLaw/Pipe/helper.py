import os
import json
from .config import directories, setup_logging
import logging
setup_logging()


def create_directories():
    """
    Creates required directories as defined in the `directories` list from the config.
    """
    logging.info("Creating necessary directories...")
    base_path = './Database'
    
    for directory in directories:
        full_path = os.path.join(base_path, directory)
        try:
            os.makedirs(full_path, exist_ok=True)
            logging.debug(f"Directory created or already exists: {full_path}")
        except Exception as e:
            logging.error(f"Failed to create directory {full_path}: {e}")
            raise

def clean_json_response(response_text):
    """
    Cleans the JSON response string by removing code formatting artifacts (e.g., Markdown fences).

    Args:
        response_text (str): Raw response text containing JSON.

    Returns:
        str: Cleaned JSON string.
    """
    try:
        cleaned_text = response_text.strip().replace("```json", "").replace("```", "").strip()
        logging.debug("Successfully cleaned the JSON response.")
        return cleaned_text
    except Exception as e:
        logging.error(f"Error while cleaning JSON response: {e}")
        raise

def save_json_to_directory(data, directory, prefix, file_id):
    """
    Saves a JSON object to a specified directory with a given prefix and file ID.

    Args:
        data (dict): Data to be saved.
        directory (str): Subdirectory within './Database' where the file will be saved.
        prefix (str): Prefix for the file name.
        file_id (str): Unique identifier for the file.

    Returns:
        str: Full path of the saved file.
    """
    base_directory = './Database'
    full_directory = os.path.join(base_directory, directory)

    try:
        os.makedirs(full_directory, exist_ok=True)
        logging.debug(f"Directory ensured for saving JSON: {full_directory}")
    except Exception as e:
        logging.error(f"Failed to create or access directory {full_directory}: {e}")
        raise

    # Construct the filename
    filename = os.path.join(full_directory, f"{prefix}_{file_id}.json")
    logging.info(f"Saving data to file: {filename}")

    try:
        with open(filename, 'w') as json_file:
            json.dump(data, json_file, indent=2)
        logging.info(f"Data successfully saved to {filename}")
        return filename
    except Exception as e:
        logging.error(f"Error saving data to file {filename}: {e}")
        raise
