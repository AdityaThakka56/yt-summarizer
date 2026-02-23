import sqlite3
import json
from datetime import datetime

DB_PATH = "summarizer.db"


def init_db():
    """Create all tables if they don't exist"""
    conn = sqlite3.connect(DB_PATH)
    cursor = conn.cursor()

    # Videos table — stores every summarized video
    cursor.execute("""
        CREATE TABLE IF NOT EXISTS videos (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            video_id TEXT UNIQUE NOT NULL,
            url TEXT NOT NULL,
            title_guess TEXT,
            quick_summary TEXT,
            keywords TEXT,
            summarized_at TEXT DEFAULT CURRENT_TIMESTAMP
        )
    """)

    # Quiz scores table
    cursor.execute("""
        CREATE TABLE IF NOT EXISTS quiz_scores (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            video_id TEXT NOT NULL,
            username TEXT NOT NULL,
            score INTEGER NOT NULL,
            total INTEGER NOT NULL,
            attempted_at TEXT DEFAULT CURRENT_TIMESTAMP
        )
    """)

    # Bookmarks table
    cursor.execute("""
        CREATE TABLE IF NOT EXISTS bookmarks (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            video_id TEXT NOT NULL,
            username TEXT NOT NULL,
            url TEXT NOT NULL,
            title_guess TEXT,
            bookmarked_at TEXT DEFAULT CURRENT_TIMESTAMP,
            UNIQUE(video_id, username)
        )
    """)

    conn.commit()
    conn.close()
    print("Database initialized!")


# ─── Videos ───────────────────────────────────────────────

def save_video(video_id: str, url: str, summary: dict):
    conn = sqlite3.connect(DB_PATH)
    cursor = conn.cursor()
    cursor.execute("""
        INSERT OR REPLACE INTO videos 
        (video_id, url, title_guess, quick_summary, keywords)
        VALUES (?, ?, ?, ?, ?)
    """, (
        video_id,
        url,
        summary.get("title_guess", ""),
        summary.get("quick_summary", ""),
        json.dumps(summary.get("keywords", []))
    ))
    conn.commit()
    conn.close()


def get_history(limit: int = 10) -> list:
    conn = sqlite3.connect(DB_PATH)
    cursor = conn.cursor()
    cursor.execute("""
        SELECT video_id, url, title_guess, quick_summary, keywords, summarized_at
        FROM videos
        ORDER BY summarized_at DESC
        LIMIT ?
    """, (limit,))
    rows = cursor.fetchall()
    conn.close()

    return [
        {
            "video_id": row[0],
            "url": row[1],
            "title_guess": row[2],
            "quick_summary": row[3],
            "keywords": json.loads(row[4]) if row[4] else [],
            "summarized_at": row[5]
        }
        for row in rows
    ]


# ─── Quiz Scores ───────────────────────────────────────────

def save_quiz_score(video_id: str, username: str, score: int, total: int):
    conn = sqlite3.connect(DB_PATH)
    cursor = conn.cursor()
    cursor.execute("""
        INSERT INTO quiz_scores (video_id, username, score, total)
        VALUES (?, ?, ?, ?)
    """, (video_id, username, score, total))
    conn.commit()
    conn.close()


def get_quiz_scores(video_id: str) -> list:
    conn = sqlite3.connect(DB_PATH)
    cursor = conn.cursor()
    cursor.execute("""
        SELECT username, score, total, attempted_at
        FROM quiz_scores
        WHERE video_id = ?
        ORDER BY attempted_at DESC
    """, (video_id,))
    rows = cursor.fetchall()
    conn.close()

    return [
        {
            "username": row[0],
            "score": row[1],
            "total": row[2],
            "percentage": round((row[1] / row[2]) * 100),
            "attempted_at": row[3]
        }
        for row in rows
    ]


# ─── Bookmarks ─────────────────────────────────────────────

def add_bookmark(video_id: str, username: str, url: str, title_guess: str):
    conn = sqlite3.connect(DB_PATH)
    cursor = conn.cursor()
    try:
        cursor.execute("""
            INSERT INTO bookmarks (video_id, username, url, title_guess)
            VALUES (?, ?, ?, ?)
        """, (video_id, username, url, title_guess))
        conn.commit()
        result = True
    except sqlite3.IntegrityError:
        result = False  # already bookmarked
    conn.close()
    return result


def remove_bookmark(video_id: str, username: str):
    conn = sqlite3.connect(DB_PATH)
    cursor = conn.cursor()
    cursor.execute("""
        DELETE FROM bookmarks WHERE video_id = ? AND username = ?
    """, (video_id, username))
    conn.commit()
    conn.close()


def get_bookmarks(username: str) -> list:
    conn = sqlite3.connect(DB_PATH)
    cursor = conn.cursor()
    cursor.execute("""
        SELECT video_id, url, title_guess, bookmarked_at
        FROM bookmarks
        WHERE username = ?
        ORDER BY bookmarked_at DESC
    """, (username,))
    rows = cursor.fetchall()
    conn.close()

    return [
        {
            "video_id": row[0],
            "url": row[1],
            "title_guess": row[2],
            "bookmarked_at": row[3]
        }
        for row in rows
    ]


def is_bookmarked(video_id: str, username: str) -> bool:
    conn = sqlite3.connect(DB_PATH)
    cursor = conn.cursor()
    cursor.execute("""
        SELECT 1 FROM bookmarks WHERE video_id = ? AND username = ?
    """, (video_id, username))
    result = cursor.fetchone() is not None
    conn.close()
    return result