import os
import time
import logging
from pydub import AudioSegment
from collections import deque
from Pipe.config import client, setup_logging, request_timestamps

setup_logging()

def transcribe_segments(segments, wav_audio_path,file_id):
    logging.info("Starting transcription...")
    formatted_conversation = []

    for segment in segments:
        start_time = segment["start_time"]
        end_time = segment["end_time"]
        speaker_label = segment["speaker"]

        segment_audio = AudioSegment.from_wav(wav_audio_path)[int(start_time * 1000):int(end_time * 1000)]
        temp_segment_path = f"temp/temp_segment_{file_id}.wav"
        segment_audio.export(temp_segment_path, format="wav")
        time.sleep(5)

        # Handle rate limiting
        wait_for_rate_limit()

        with open(temp_segment_path, "rb") as file:
            transcription = client.audio.transcriptions.create(
                file=(temp_segment_path, file.read()),
                model="whisper-large-v3-turbo",
                prompt="Specify context or spelling",
                response_format="json",
                language="en",
                temperature=0.0
            )
            transcript_text = transcription.text

            request_timestamps.append(time.time())
            formatted_conversation.append({
                "speaker": segment["speaker"],
                "start_time": segment["start_time"],
                "end_time": segment["end_time"],
                "transcription": transcript_text
            })

        os.remove(temp_segment_path)
        logging.info(f"Deleted temporary segment file: {temp_segment_path}")

    return formatted_conversation

def wait_for_rate_limit():
    if len(request_timestamps) == 18 and time.time() - request_timestamps[0] < 60:
        time_to_wait = 60 - (time.time() - request_timestamps[0])
        logging.info(f"Rate limit reached. Waiting for {time_to_wait:.2f} seconds.")
        time.sleep(time_to_wait)
    request_timestamps.append(time.time())
