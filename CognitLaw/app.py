from flask import Flask, request, jsonify
from flask_cors import CORS
import asyncio
from Pipe.config import chromedriver_path, flask_port,model,chat_session, NEO4J_URI, NEO4J_PASSWORD, NEO4J_USERNAME, setup_logging
from Pipe.conversation_analysis import analyze_conversation_with_gemini
from Pipe.helper import save_json_to_directory, create_directories
from Pipe.scrapper import get_case_details, classify_case_details
from Pipe.knowledge_graph import create_knowledge_graph
from Pipe.audio_processing import process_audio_file
from neo4j import GraphDatabase
import json
import os
import logging

setup_logging()

# Initialize Flask app
app = Flask(__name__)
CORS(app, resources={r"/*": {"origins": "*"}})


BASE_DIR = './Database'
create_directories()


# Async function for case processing pipeline
async def process_case(conversation_data, file_id):
    logging.info(f"Processing case for file_id: {file_id}")
    try:
        conversation_analysis = await asyncio.to_thread(analyze_conversation_with_gemini, conversation_data)
        logging.debug(f"Conversation analysis completed: {conversation_analysis}")

        await asyncio.to_thread(save_json_to_directory, conversation_analysis, 'Case Analysis', 'conversation_analysis', file_id)
        keywords = conversation_analysis['keywords']
        logging.info(f"Keywords extracted: {keywords}")

        case_details = await asyncio.to_thread(get_case_details, keywords, file_id)
        data, filename = await asyncio.to_thread(classify_case_details, case_details, chromedriver_path, file_id)

        logging.info(f"Case processing pipeline completed for file_id: {file_id}. Results saved to {filename}.")
        return {
            "result": f"Pipeline execution complete. Results saved to: {filename}",
            "filename": filename
        }
    except Exception as e:
        logging.error(f"Error processing case for file_id {file_id}: {e}")
        raise

# Route for conversation processing
@app.route('/process_conversation', methods=['POST'])
async def process_conversation():
    logging.info("Received request at /process_conversation")

    data = request.get_json()
    if not data or 'conversation' not in data or 'file_id' not in data:
        logging.warning("Invalid request: Missing conversation data or file_id.")
        return jsonify({"error": "Invalid request, conversation data or file_id missing"}), 400

    try:
        task = asyncio.create_task(process_case(data['conversation'], data['file_id']))
        result = await task
        logging.info(f"Conversation processing completed for file_id: {data['file_id']}")
        return jsonify({
            "message": "Your request has been processed.",
            "result": result
        }), 200
    except Exception as e:
        logging.error(f"Error handling /process_conversation: {e}")
        return jsonify({"error": "Internal Server Error"}), 500

# Route for audio processing
@app.route('/process_audio', methods=['POST'])
async def process_audio():
    logging.info("Received request at /process_audio")

    if 'file' not in request.files or 'file_id' not in request.form:
        logging.warning("Invalid request: Missing file or file_id.")
        return jsonify({'error': 'File or file_id missing in the request'}), 400

    audio_file = request.files['file']
    file_id = request.form['file_id']

    try:
        logging.info(f"Processing audio file for file_id: {file_id}")
        response = process_audio_file(audio_file, file_id)

        if "error" in response:
            logging.error(f"Error processing audio file for file_id {file_id}: {response['error']}")
            return jsonify(response), 500

        logging.info(f"Audio processing completed for file_id: {file_id}")
        return jsonify(response), 200
    except Exception as e:
        logging.error(f"Unexpected error processing audio for file_id {file_id}: {e}")
        return jsonify({"error": "Internal Server Error"}), 500


@app.route('/get_data/<file_id>', methods=['GET'])
def get_data(file_id):
    try:
        # Define the directories and corresponding filenames
        file_mapping = {
            "Case Analysis": f"conversation_analysis_{file_id}.json",
            "Cases": f"case_details_{file_id}.json",
            "Classified Content": f"classified_case_details_{file_id}.json"
        }

        aggregated_data = {}

        for directory, filename in file_mapping.items():
            file_path = os.path.join(BASE_DIR, directory, filename)

            if os.path.exists(file_path):
                with open(file_path, 'r') as file:
                    aggregated_data[directory] = json.load(file)
            else:
                # aggregated_data[directory] = f"File {filename} not found in {directory}"
                return jsonify({"error": f"File {filename} not found in {directory}"}), 404

        return jsonify(aggregated_data), 200

    except Exception as e:
        return jsonify({"error": str(e)}), 500



@app.route('/get_conversation/<file_id>', methods=['GET'])
def get_conversation(file_id):
    try:
        # Define the directories and corresponding filenames
        file_mapping = {
            "Conversations": f"conversation_{file_id}.json",
        }

        aggregated_data = {}

        for directory, filename in file_mapping.items():
            file_path = os.path.join(BASE_DIR, directory, filename)

            if os.path.exists(file_path):
                with open(file_path, 'r') as file:
                    aggregated_data[directory] = json.load(file)
            else:
                aggregated_data[directory] = f"File {filename} not found in {directory}"

        return jsonify(aggregated_data), 200

    except Exception as e:
        return jsonify({"error": str(e)}), 500


@app.route('/api/query', methods=['POST'])
def handle_query_chat():
    data = request.json
    
    query = data.get('query')

    try:
        response = chat_session.send_message(query)
        response_text = response.text

        return jsonify({
            'success': True,
            'query': query,
            'response': response_text
        }), 200
    except Exception as e:
        return jsonify({
            'success': False,
            'query': query,
            'response': str(e)
        }), 500

@app.route('/api/content', methods=['POST'])
def handle_query_content():
    data = request.json
    query = data.get('query')
   
    try:
        response = model.generate_content(query)
        response_text = response.text

        return jsonify({
            'success': True,
            'query': query,
            'response': response_text
        }), 200
    except Exception as e:
        return jsonify({
            'success': False,
            'query': query,
            'response': str(e)
        }), 500


# Main entry point
if __name__ == "__main__":
    app.run(debug=True, use_reloader=False, port=flask_port)
