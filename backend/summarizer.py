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


# ===================== MAIN SUMMARIZER =====================

def summarize_transcript(transcript: str) -> dict:
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
    summary["timestamped_summary"] = generate_timestamped_summary_from_text(trimmed)

    print("Generating quiz...")
    summary["quiz"] = generate_quiz(trimmed)

    print("Generating video recommendations...")
    summary["related_suggestions"] = generate_suggestions(summary)

    return summary


# ===================== QUIZ =====================

def generate_quiz(transcript: str) -> list:
    prompt = f"""
You are a quiz generator. Based on the YouTube video transcript below,
generate exactly 5 multiple choice questions to test understanding.

Return ONLY a valid JSON array.

Format:
[
  {{
    "question": "Question?",
    "options": ["A", "B", "C", "D"],
    "correct": 0,
    "explanation": "Why correct"
  }}
]

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
    except:
        start = raw.find("[")
        end = raw.rfind("]") + 1
        if start != -1 and end != 0:
            return json.loads(raw[start:end])
        return []


# ===================== SUGGESTIONS =====================

def generate_suggestions(summary: dict) -> list:
    title = summary.get("title_guess", "")
    keywords = ", ".join(summary.get("keywords", []))

    prompt = f"""
Suggest 5 real YouTube videos related to:

Topic: {title}
Keywords: {keywords}

Return ONLY JSON array:
[
  {{
    "title": "...",
    "channel": "...",
    "reason": "...",
    "search_query": "..."
  }}
]
"""

    response = client.models.generate_content(
        model="gemini-2.5-flash",
        contents=prompt
    )

    raw = response.text.strip().replace("```json", "").replace("```", "").strip()

    try:
        suggestions = json.loads(raw)
    except:
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


# ===================== TIMESTAMPED SUMMARY =====================

def generate_timestamped_summary_from_text(transcript: str) -> list:
    prompt = f"""
Divide the following transcript into logical sections.

Return format:
0:00 | Short summary
1:00 | Short summary
2:00 | Short summary

Keep each summary under 15 words.

TRANSCRIPT:
{transcript[:20000]}
"""

    response = client.models.generate_content(
        model="gemini-2.5-flash",
        contents=prompt
    )

    return parse_timestamped_response(response.text)


# ===================== TRANSLATION =====================

def translate_summary(summary: dict, target_language: str) -> dict:
    if target_language == "en":
        return summary

    lang_name = SUPPORTED_LANGUAGES.get(target_language, "English")

    fields = {
        "title_guess": summary.get("title_guess", ""),
        "quick_summary": summary.get("quick_summary", ""),
        "detailed_summary": summary.get("detailed_summary", ""),
        "key_takeaways": "\n".join(summary.get("key_takeaways", []))
    }

    prompt = f"""
Translate into {lang_name}.
Return ONLY JSON.

{json.dumps(fields, ensure_ascii=False)}
"""

    response = client.models.generate_content(
        model="gemini-2.5-flash",
        contents=prompt
    )

    raw = response.text.strip().replace("```json", "").replace("```", "").strip()

    try:
        translated = json.loads(raw)
        result = summary.copy()
        result.update(translated)
        result["key_takeaways"] = [
            line.strip().lstrip("-•* ")
            for line in translated.get("key_takeaways", "").split("\n")
            if line.strip()
        ]
        return result
    except:
        return summary


# ===================== PARSERS =====================

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
        result["key_takeaways"] = [
            line.strip().lstrip("-•* ")
            for line in result["key_takeaways"].split("\n")
            if line.strip()
        ]

    if "keywords" in result:
        result["keywords"] = [
            k.strip() for k in result["keywords"].split(",")
        ]

    return result


def parse_timestamped_response(text: str) -> list:
    result = []
    for line in text.strip().split("\n"):
        if "|" in line:
            parts = line.split("|", 1)
            if len(parts) == 2:
                result.append({
                    "timestamp": parts[0].strip(),
                    "summary": parts[1].strip()
                })
    return result