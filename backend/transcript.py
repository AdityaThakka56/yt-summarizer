import re
from youtube_transcript_api import YouTubeTranscriptApi
from youtube_transcript_api._errors import TranscriptsDisabled, NoTranscriptFound


def extract_video_id(url: str) -> str:
    patterns = [
        r"(?:v=)([0-9A-Za-z_-]{11})",
        r"(?:youtu\.be\/)([0-9A-Za-z_-]{11})",
        r"(?:shorts\/)([0-9A-Za-z_-]{11})"
    ]
    for pattern in patterns:
        match = re.search(pattern, url)
        if match:
            return match.group(1)
    raise ValueError("Invalid YouTube URL")


def format_time(seconds: float) -> str:
    seconds = int(seconds)
    hrs = seconds // 3600
    mins = (seconds % 3600) // 60
    secs = seconds % 60
    if hrs > 0:
        return f"{hrs}:{mins:02d}:{secs:02d}"
    return f"{mins}:{secs:02d}"


def get_transcript(url: str):
    video_id = extract_video_id(url)
    print(f"Video ID found: {video_id}")

    try:
        api = YouTubeTranscriptApi()
        transcript = api.fetch(video_id)
    except TranscriptsDisabled:
        raise ValueError("Transcripts are disabled for this video.")
    except NoTranscriptFound:
        raise ValueError("No transcript found for this video.")
    except Exception as e:
        raise ValueError(f"Unexpected error: {e}")

    # Full clean transcript for chatbot
    full_text = " ".join([entry.text for entry in transcript])
    full_text = re.sub(r'\[.*?\]', '', full_text)
    full_text = re.sub(r'\s+', ' ', full_text).strip()

    # Timestamped chunks every 30 seconds for timestamped summary
    timestamped_chunks = []
    current_chunk = []
    chunk_start_time = 0

    for entry in transcript:
        if not current_chunk:
            chunk_start_time = entry.start
        current_chunk.append(entry.text)

        if entry.start - chunk_start_time >= 30:
            timestamped_chunks.append({
                "start": chunk_start_time,
                "timestamp_label": format_time(chunk_start_time),
                "text": " ".join(current_chunk)
            })
            current_chunk = []

    if current_chunk:
        timestamped_chunks.append({
            "start": chunk_start_time,
            "timestamp_label": format_time(chunk_start_time),
            "text": " ".join(current_chunk)
        })

    print(f"Transcript: {len(full_text)} chars | Chunks: {len(timestamped_chunks)}")
    return full_text, video_id, timestamped_chunks