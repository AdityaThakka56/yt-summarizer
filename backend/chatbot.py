from groq import Groq
import os
from dotenv import load_dotenv

load_dotenv()

client = Groq(api_key=os.getenv("GROQ_API_KEY"))
GROQ_MODEL = "llama-3.3-70b-versatile"  # best free model on Groq

# In-memory store
video_store = {}


def store_video_data(video_id: str, transcript: str, summary: dict):
    video_store[video_id] = {
        "transcript": transcript,
        "summary": summary,
        "chat_history": []
    }


def chat_with_video(video_id: str, user_message: str) -> str:
    if video_id not in video_store:
        return "Video not found. Please summarize the video first."

    data = video_store[video_id]
    transcript = data["transcript"]
    history = data["chat_history"]

    # Build messages list for Groq (OpenAI-style format)
    messages = [
        {
            "role": "system",
            "content": f"""You are an intelligent assistant helping a user understand a YouTube video.
Answer ONLY based on the transcript below.
If the answer is not in the transcript, say "This wasn't covered in the video."
Be conversational, clear and concise.

VIDEO TRANSCRIPT:
{transcript[:25000]}"""
        }
    ]

    # Add last 10 messages of history
    for msg in history[-10:]:
        messages.append({
            "role": msg["role"],  # "user" or "assistant"
            "content": msg["content"]
        })

    # Add current message
    messages.append({"role": "user", "content": user_message})

    response = client.chat.completions.create(
        model=GROQ_MODEL,
        messages=messages,
        max_tokens=1024,
        temperature=0.7
    )

    answer = response.choices[0].message.content.strip()

    # Save to history using OpenAI-style roles
    history.append({"role": "user", "content": user_message})
    history.append({"role": "assistant", "content": answer})

    return answer


def clear_chat_history(video_id: str) -> bool:
    if video_id in video_store:
        video_store[video_id]["chat_history"] = []
        return True
    return False


def get_chat_history(video_id: str) -> list:
    return video_store.get(video_id, {}).get("chat_history", [])