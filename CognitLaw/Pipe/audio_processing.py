import os
import uuid
import logging
from pydub import AudioSegment
from modules.diarization import perform_diarization
from modules.transcription import transcribe_segments
from Pipe.helper import save_json_to_directory
from Pipe.config import pipeline, request_timestamps, client

import time

def process_audio_file(audio_file, file_id):

    audio_path = os.path.join("temp", f"temp_upload_{file_id}.mp3")
    wav_audio_path = os.path.join("temp", f"temp_audio_{file_id}.wav")

    os.makedirs("temp", exist_ok=True)

    try:
        audio_file.save(audio_path)
        logging.info(f"Saved uploaded file to {audio_path}")

        audio = AudioSegment.from_file(audio_path)
        audio = audio.set_frame_rate(16000).set_channels(1)
        audio.export(wav_audio_path, format="wav")
        logging.info(f"Converted audio file to WAV format: {wav_audio_path}")

        diarization = pipeline(wav_audio_path)

        formatted_conversation = []
        combined_segments = []

        for _, (speech_turn, _, speaker) in enumerate(diarization.itertracks(yield_label=True)):
            start_time = speech_turn.start
            end_time = speech_turn.end
            speaker_num = int(speaker.split('_')[1])
            speaker_label = f"Person{speaker_num + 1}"

            segment_audio = AudioSegment.from_wav(wav_audio_path)[int(start_time * 1000):int(end_time * 1000)]
            if combined_segments and combined_segments[-1]["speaker"] == speaker_label:
                combined_segments[-1]["audio"] += segment_audio
                combined_segments[-1]["end_time"] = end_time
            else:
                combined_segments.append({"speaker": speaker_label, "audio": segment_audio, "start_time": start_time, "end_time": end_time})

        for segment in combined_segments:
            temp_segment_path = os.path.join("temp", f"temp_segment_{file_id}.wav")
            segment["audio"].export(temp_segment_path, format="wav")
            logging.info(f"Exported segment to {temp_segment_path}")
            # time.sleep()

            while len(request_timestamps) == 18 and time.time() - request_timestamps[0] < 60:
                time_to_wait = 60 - (time.time() - request_timestamps[0])
                logging.info(f"Rate limit reached. Waiting for {time_to_wait:.2f} seconds.")
                time.sleep(time_to_wait)

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

        filename = save_json_to_directory(
            data={"conversation": formatted_conversation},
            directory="Conversations",
            prefix="conversation",
            file_id=file_id
        )
        logging.info(f"Conversation saved to {filename}")

        return {"message": "Audio processing completed successfully", "file": filename}

    except Exception as e:
        logging.error(f"Error processing audio: {e}")
        return {"error": f"Audio processing failed: {str(e)}"}

    finally:
        if os.path.exists(audio_path):
            os.remove(audio_path)
            logging.info(f"Deleted temporary audio file: {audio_path}")
        if os.path.exists(wav_audio_path):
            os.remove(wav_audio_path)
            logging.info(f"Deleted temporary WAV file: {wav_audio_path}")
