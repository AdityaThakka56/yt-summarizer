import subprocess
import json
import re

def get_transcript(url: str):
    try:
        video_id = extract_video_id(url)

        # Use yt-dlp to fetch subtitles as JSON
        cmd = [
            "yt-dlp",
            "--skip-download",
            "--write-auto-sub",
            "--sub-format", "json3",
            "--sub-lang", "en",
            "--output", "%(id)s",
            url
        ]

        subprocess.run(cmd, check=True)

        filename = f"{video_id}.en.json3"

        with open(filename, "r", encoding="utf-8") as f:
            data = json.load(f)

        transcript = []
        timestamped_chunks = []

        for event in data.get("events", []):
            if "segs" in event:
                text = "".join(seg.get("utf8", "") for seg in event["segs"])
                transcript.append(text)

                seconds = int(event.get("tStartMs", 0) / 1000)
                timestamp_label = f"{seconds//60}:{seconds%60:02d}"

                timestamped_chunks.append({
                    "timestamp_label": timestamp_label,
                    "text": text
                })

        full_text = " ".join(transcript)

        return full_text, video_id, timestamped_chunks

    except Exception as e:
        raise ValueError(f"Transcript fetch failed: {str(e)}")


def extract_video_id(url):
    match = re.search(r"(?:v=|youtu\.be/)([^&]+)", url)
    if not match:
        raise ValueError("Invalid YouTube URL")
    return match.group(1)