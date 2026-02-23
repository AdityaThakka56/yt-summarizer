from google import genai
import os
import json
from dotenv import load_dotenv

load_dotenv()
client = genai.Client(api_key=os.getenv("GEMINI_API_KEY"))

SUPPORTED_LANGUAGES = {
    "en": "English",
    "hi": "Hindi",
    "es": "Spanish",
    "fr": "French",
    "de": "German"
}


def summarize_transcript(transcript: str, timestamped_chunks: list) -> dict:
    trimmed = transcript[:30000]

    prompt = f"""
You are an expert video summarizer. Analyze the following YouTube video transcript and provide:

1. TITLE_GUESS - One line guess
2. QUICK_SUMMARY - 3-4 sentences for a 10 year old
3. KEY_TAKEAWAYS - Exactly 5 bullet points
4. DETAILED_SUMMARY - 3-4 paragraphs
5. KEYWORDS - 5-8 keywords separated by commas

Format EXACTLY like this:

TITLE_GUESS: text

QUICK_SUMMARY: text

KEY_TAKEAWAYS:
- point
- point
- point
- point
- point

DETAILED_SUMMARY: text

KEYWORDS: keyword1, keyword2, keyword3

TRANSCRIPT:
{trimmed}
"""
    print("Generating summary...")
    response = client.models.generate_content(
        model="gemini-2.5-flash",
        contents=prompt
    )
    summary = parse_summary_response(response.text)

    print("Generating timestamped breakdown...")
    summary["timestamped_summary"] = generate_timestamped_summary(timestamped_chunks)

    print("Generating quiz...")
    summary["quiz"] = generate_quiz(trimmed)

    print("Generating video recommendations...")
    summary["related_suggestions"] = generate_suggestions(summary)

    return summary


def generate_quiz(transcript: str) -> list:
    prompt = f"""
You are a quiz generator. Based on the YouTube video transcript below,
generate exactly 5 multiple choice questions to test understanding.

Return ONLY a valid JSON array, nothing else, no markdown, no backticks.

Format:
[
  {{
    "question": "Question text here?",
    "options": ["Option A", "Option B", "Option C", "Option D"],
    "correct": 0,
    "explanation": "Brief explanation of why this is correct"
  }}
]

Rules:
- "correct" is the index (0-3) of the correct option
- Questions should test genuine understanding, not just memory
- Make wrong options believable
- Keep questions clear and concise

TRANSCRIPT:
{transcript[:25000]}
"""
    response = client.models.generate_content(
        model="gemini-2.5-flash",
        contents=prompt
    )
    raw = response.text.strip().replace("```json", "").replace("```", "").strip()

    try:
        return json.loads(raw)
    except json.JSONDecodeError:
        start = raw.find("[")
        end = raw.rfind("]") + 1
        if start != -1 and end != 0:
            return json.loads(raw[start:end])
        return []


def generate_suggestions(summary: dict) -> list:
    title = summary.get("title_guess", "")
    keywords = ", ".join(summary.get("keywords", []))

    prompt = f"""
Based on this YouTube video topic and keywords, suggest 5 real and relevant YouTube videos.

Video Topic: {title}
Keywords: {keywords}

Return ONLY a valid JSON array of 5 objects, no markdown, no backticks:
[
  {{
    "title": "Actual video title",
    "channel": "Channel name",
    "reason": "One short sentence why this is relevant",
    "search_query": "exact search query to find this video"
  }}
]

Rules:
- Suggest real well-known videos that actually exist on YouTube
- Titles should be specific and realistic
- Channel names should be real YouTube channels
- search_query should help find the exact video
"""
    response = client.models.generate_content(
        model="gemini-2.5-flash",
        contents=prompt
    )
    raw = response.text.strip().replace("```json", "").replace("```", "").strip()

    try:
        suggestions = json.loads(raw)
    except json.JSONDecodeError:
        start = raw.find("[")
        end = raw.rfind("]") + 1
        if start != -1 and end != 0:
            suggestions = json.loads(raw[start:end])
        else:
            return []

    for s in suggestions:
        query = s.get("search_query") or s.get("title", "")
        s["url"] = f"https://www.youtube.com/results?search_query={query.replace(' ', '+')}"

    return suggestions


def generate_timestamped_summary(chunks: list) -> list:
    chunks_text = ""
    for chunk in chunks:
        chunks_text += f"[{chunk['timestamp_label']}] {chunk['text']}\n\n"

    prompt = f"""
Below is a YouTube transcript split into 30-second chunks with timestamps.
For EACH chunk, write ONE short sentence (max 15 words) summarizing what is discussed.

Return ONLY in this exact format, one per line, nothing else:
TIMESTAMP | SUMMARY

Example:
0:00 | Speaker introduces the topic of machine learning
0:30 | Explains the difference between supervised and unsupervised learning

TRANSCRIPT CHUNKS:
{chunks_text[:20000]}
"""
    response = client.models.generate_content(
        model="gemini-2.5-flash",
        contents=prompt
    )
    return parse_timestamped_response(response.text)


def translate_summary(summary: dict, target_language: str) -> dict:
    if target_language == "en":
        return summary

    lang_name = SUPPORTED_LANGUAGES.get(target_language, "English")

    fields_to_translate = {
        "title_guess": summary.get("title_guess", ""),
        "quick_summary": summary.get("quick_summary", ""),
        "detailed_summary": summary.get("detailed_summary", ""),
        "key_takeaways": "\n".join(summary.get("key_takeaways", []))
    }

    prompt = f"""
Translate the following text fields into {lang_name}.
Return ONLY valid JSON with the same keys, no markdown, no backticks.

{json.dumps(fields_to_translate, ensure_ascii=False)}
"""
    response = client.models.generate_content(
        model="gemini-2.5-flash",
        contents=prompt
    )
    raw = response.text.strip().replace("```json", "").replace("```", "").strip()

    try:
        translated = json.loads(raw)
        result = summary.copy()
        result["title_guess"] = translated.get("title_guess", summary["title_guess"])
        result["quick_summary"] = translated.get("quick_summary", summary["quick_summary"])
        result["detailed_summary"] = translated.get("detailed_summary", summary["detailed_summary"])
        takeaways_text = translated.get("key_takeaways", "")
        result["key_takeaways"] = [
            line.strip().lstrip("-•* ")
            for line in takeaways_text.split("\n")
            if line.strip()
        ]
        return result
    except Exception:
        return summary


def parse_summary_response(text: str) -> dict:
    sections = ["TITLE_GUESS:", "QUICK_SUMMARY:", "KEY_TAKEAWAYS:",
                "DETAILED_SUMMARY:", "KEYWORDS:"]
    result = {}

    for i, section in enumerate(sections):
        start = text.find(section)
        if start == -1:
            result[section.replace(":", "").lower()] = "Not available"
            continue
        start += len(section)
        end = text.find(sections[i + 1]) if i + 1 < len(sections) else len(text)
        result[section.replace(":", "").lower()] = text[start:end].strip()

    if "key_takeaways" in result:
        lines = result["key_takeaways"].split("\n")
        result["key_takeaways"] = [
            line.strip().lstrip("-•* ") for line in lines if line.strip()
        ]

    if "keywords" in result:
        result["keywords"] = [k.strip() for k in result["keywords"].split(",")]

    return result


def parse_timestamped_response(text: str) -> list:
    result = []
    for line in text.strip().split("\n"):
        if "|" in line:
            parts = line.split("|", 1)
            if len(parts) == 2:
                timestamp = parts[0].strip()
                summary_text = parts[1].strip()
                if timestamp.lower() == "timestamp":
                    continue
                result.append({"timestamp": timestamp, "summary": summary_text})
    return result