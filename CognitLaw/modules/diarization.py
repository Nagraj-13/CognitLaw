import logging
from pyannote.audio.pipelines import SpeakerDiarization
from Pipe.config import auth_token, setup_logging

setup_logging()

pipeline = SpeakerDiarization.from_pretrained(
    'pyannote/speaker-diarization-3.0',
    use_auth_token=auth_token
)

def perform_diarization(audio_path):
    logging.info("Performing diarization...")
    diarization = pipeline(audio_path)

    segments = []
    for _, (speech_turn, _, speaker) in enumerate(diarization.itertracks(yield_label=True)):
        segments.append({
            "start_time": speech_turn.start,
            "end_time": speech_turn.end,
            "speaker": f"Person{int(speaker.split('_')[1]) + 1}"
        })
    logging.info(f"Diarization completed with {len(segments)} segments.")
    return segments
