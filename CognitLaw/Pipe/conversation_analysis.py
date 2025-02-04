from .config import model, setup_logging
from .helper import clean_json_response
import json
import logging

setup_logging()

def analyze_conversation_with_gemini(conversation):
    """
    Analyze a conversation between a lawyer and a client using the configured AI model.

    Args:
        conversation (list): A list of conversation messages.

    Returns:
        dict: Parsed and cleaned JSON analysis of the conversation.
    """
    logging.info("Starting conversation analysis with Gemini model.")
    
    # Initiate chat with predefined system message
    chat = model.start_chat(
        history=[{
            "role": "user",
            "parts": [
                "You are Lawbot, a highly experienced attorney providing legal advice based on Indian laws."
            ]
        }]
    )
    
    # Format the conversation for the prompt
    formatted_conversation = "\n".join([f"{i+1}. {msg}" for i, msg in enumerate(conversation)])
    logging.debug(f"Formatted conversation: {formatted_conversation}")
    
    # Define the prompt for analysis
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
    
    try:
        # Send the prompt to the model
        response = chat.send_message(conversation_analysis_prompt)
        logging.info("Received response from Gemini model.")
        
        # Clean and parse the JSON response
        cleaned_response = clean_json_response(response.text)
        parsed_response = json.loads(cleaned_response)
        
        logging.info("Successfully parsed the response.")
        return parsed_response
    
    except json.JSONDecodeError as e:
        logging.error(f"Failed to decode JSON response: {e}")
        raise ValueError("Error in decoding JSON response from Gemini model.") from e
    
    except Exception as e:
        logging.error(f"Unexpected error during conversation analysis: {e}")
        raise

