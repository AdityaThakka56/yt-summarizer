import yt_dlp
import re

def extract_video_id(url: str):
    pattern = r"(?:v=|\/)([0-9A-Za-z_-]{11}).*"
    match = re.search(pattern, url)
    if not match:
        raise ValueError("Invalid YouTube URL")
    return match.group(1)


def get_transcript(url: str):
    video_id = extract_video_id(url)

    ydl_opts = {
        "skip_download": True,
        "writesubtitles": True,
        "writeautomaticsub": True,
        "subtitleslangs": ["en"],
        "subtitlesformat": "vtt",
        "quiet": True,
    }

    transcript_text = ""

    try:
        with yt_dlp.YoutubeDL(ydl_opts) as ydl:
            info = ydl.extract_info(url, download=False)

            subtitles = info.get("subtitles") or info.get("automatic_captions")
            if not subtitles:
                raise ValueError("No subtitles available for this video.")

            if "en" not in subtitles:
                raise ValueError("No English transcript available.")

            subtitle_url = subtitles["en"][0]["url"]

            import requests
            response = requests.get(subtitle_url)
            vtt_content = response.text

            for line in vtt_content.splitlines():
                if "-->" not in line and line.strip() and not line.startswith("WEBVTT"):
                    transcript_text += line.strip() + " "

        timestamped_chunks = []  # You can enhance this later
        return transcript_text.strip(), video_id, timestamped_chunks

    except Exception as e:
        raise ValueError(f"Transcript fetch failed: {str(e)}")