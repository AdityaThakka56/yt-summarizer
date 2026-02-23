from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import FileResponse
from pydantic import BaseModel
from typing import Optional
from transcript import get_transcript
from summarizer import summarize_transcript, translate_summary, SUPPORTED_LANGUAGES
from chatbot import store_video_data, chat_with_video, clear_chat_history, get_chat_history, video_store
from pdf_export import generate_pdf
from database import (
    init_db, save_video, get_history,
    save_quiz_score, get_quiz_scores,
    add_bookmark, remove_bookmark, get_bookmarks, is_bookmarked
)

init_db()

app = FastAPI(title="YT Summarizer API", version="2.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

url_store = {}


class SummarizeRequest(BaseModel):
    url: str
    language: Optional[str] = "en"

class ChatRequest(BaseModel):
    video_id: str
    message: str

class ClearHistoryRequest(BaseModel):
    video_id: str

class QuizScoreRequest(BaseModel):
    video_id: str
    username: str
    score: int
    total: int

class BookmarkRequest(BaseModel):
    video_id: str
    username: str

class TranslateRequest(BaseModel):
    video_id: str
    language: str


@app.get("/")
def root():
    return {"message": "YT Summarizer API v2 is live!"}

@app.get("/health")
def health():
    return {"status": "healthy"}


@app.post("/summarize")
async def summarize(request: SummarizeRequest):
    try:
        transcript, video_id, timestamped_chunks = get_transcript(request.url)
        summary = summarize_transcript(transcript, timestamped_chunks)

        if request.language and request.language != "en":
            summary = translate_summary(summary, request.language)

        save_video(video_id, request.url, summary)
        store_video_data(video_id, transcript, summary)
        url_store[video_id] = request.url

        return {
            "success": True,
            "video_id": video_id,
            "summary": summary,
            "supported_languages": SUPPORTED_LANGUAGES
        }
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Server error: {str(e)}")


@app.post("/chat")
async def chat(request: ChatRequest):
    try:
        if not request.message.strip():
            raise HTTPException(status_code=400, detail="Message cannot be empty")
        answer = chat_with_video(request.video_id, request.message)
        return {"success": True, "answer": answer}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Chat error: {str(e)}")


@app.get("/history/{video_id}")
async def get_chat_history_route(video_id: str):
    return {"history": get_chat_history(video_id)}


@app.post("/clear-history")
async def clear_history(request: ClearHistoryRequest):
    success = clear_chat_history(request.video_id)
    if not success:
        raise HTTPException(status_code=404, detail="Video not found")
    return {"success": True}


@app.get("/export-pdf/{video_id}")
async def export_pdf(video_id: str):
    try:
        if video_id not in video_store:
            raise HTTPException(status_code=404, detail="Summarize the video first.")
        summary = video_store[video_id]["summary"]
        url = url_store.get(video_id, "Unknown URL")
        pdf_path = generate_pdf(summary, url)
        return FileResponse(
            path=pdf_path,
            media_type="application/pdf",
            filename="video_summary.pdf"
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"PDF error: {str(e)}")


# Quiz is pre-generated during summarize, just return stored data
@app.get("/quiz/{video_id}")
async def get_quiz(video_id: str):
    try:
        if video_id not in video_store:
            raise HTTPException(status_code=404, detail="Summarize the video first.")
        quiz = video_store[video_id]["summary"].get("quiz", [])
        return {"success": True, "questions": quiz}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Quiz error: {str(e)}")


@app.post("/quiz/score")
async def submit_score(request: QuizScoreRequest):
    try:
        save_quiz_score(request.video_id, request.username,
                        request.score, request.total)
        return {"success": True, "message": "Score saved!"}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@app.get("/quiz/scores/{video_id}")
async def get_scores(video_id: str):
    scores = get_quiz_scores(video_id)
    return {"scores": scores}


@app.get("/search-history")
async def search_history():
    return {"history": get_history(10)}


@app.post("/bookmark")
async def bookmark(request: BookmarkRequest):
    if request.video_id not in video_store:
        raise HTTPException(status_code=404, detail="Summarize the video first.")
    summary = video_store[request.video_id]["summary"]
    url = url_store.get(request.video_id, "")
    title = summary.get("title_guess", "Unknown")
    added = add_bookmark(request.video_id, request.username, url, title)
    return {"success": True, "bookmarked": added}


@app.delete("/bookmark")
async def unbookmark(request: BookmarkRequest):
    remove_bookmark(request.video_id, request.username)
    return {"success": True, "bookmarked": False}


@app.get("/bookmarks/{username}")
async def user_bookmarks(username: str):
    return {"bookmarks": get_bookmarks(username)}


@app.get("/is-bookmarked/{video_id}/{username}")
async def check_bookmark(video_id: str, username: str):
    return {"bookmarked": is_bookmarked(video_id, username)}


@app.post("/translate")
async def translate(request: TranslateRequest):
    try:
        if request.video_id not in video_store:
            raise HTTPException(status_code=404, detail="Summarize the video first.")
        summary = video_store[request.video_id]["summary"]
        translated = translate_summary(summary, request.language)
        return {"success": True, "summary": translated}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))