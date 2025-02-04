import torch 
from pyannote.audio.pipelines import SpeakerDiarization
from pydub import AudioSegment
from pyannote.core import Segment
from groq import Groq
from dotenv import load_dotenv
import os
import time
from collections import deque  
from Pipe.config import client, auth_token
load_dotenv()

audio_path = "./audio/c1_UEMCDEoW.mp3"
audio = AudioSegment.from_file(audio_path)
wav_audio_path = "temp_audio.wav"
audio = audio.set_frame_rate(16000).set_channels(1)
audio.export(wav_audio_path, format="wav")

# Set the Hugging Face authentication token
# auth_token = os.getenv('HF_TOKEN')  

# Load pre-trained model from Pyannote with the token
pipeline = SpeakerDiarization.from_pretrained(
    'pyannote/speaker-diarization-3.0',
    use_auth_token=auth_token
)

# Apply diarization pipeline to the audio file
print("Performing speaker diarization...")
diarization = pipeline(wav_audio_path)


formatted_conversation = []
combined_segments = []  

request_timestamps = deque(maxlen=18)  


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

# Process the combined segments
for segment in combined_segments:
    temp_segment_path = "temp_combined_segment.wav"
    segment["audio"].export(temp_segment_path, format="wav")

    time.sleep(5)


    while len(request_timestamps) == 18 and time.time() - request_timestamps[0] < 60:
        time_to_wait = 60 - (time.time() - request_timestamps[0])
        print(f"Rate limit reached. Waiting for {time_to_wait:.2f} seconds...")
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

    print(f"Start: {segment['start_time']:.2f} seconds, End: {segment['end_time']:.2f} seconds, Speaker: {segment['speaker']}")
    print(f"Transcription: {transcript_text}\n")

    formatted_conversation.append(f"{segment['speaker']}: Audio from {segment['start_time']:.2f}s to {segment['end_time']:.2f}s\n{transcript_text}")

output_file = "diarization_conversation_with_transcription1.txt"
with open(output_file, "w") as file:
    file.write("\n".join(formatted_conversation))

print(f"\nConversation saved to {output_file}")
