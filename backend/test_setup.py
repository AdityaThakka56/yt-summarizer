# test_setup.py
import os
from dotenv import load_dotenv

load_dotenv()

key = os.getenv("GEMINI_API_KEY")

if key:
    print(f"API key loaded! First 10 chars: {key[:10]}...")
else:
    print("ERROR: API key not found. Check your .env file.")

import fastapi
import google.generativeai
import youtube_transcript_api

print("All packages imported successfully!")