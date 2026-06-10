import re
import os
import asyncio
from io import BytesIO
from concurrent.futures import ThreadPoolExecutor
from fastapi import FastAPI, UploadFile, File, Form
from fastapi.middleware.cors import CORSMiddleware
from pypdf import PdfReader
from groq import Groq
from dotenv import load_dotenv

app = FastAPI()

# Enable CORS for frontend integration
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Load Groq configuration
load_dotenv()
GROQ_API_KEY = os.getenv("GROQ_API_KEY")
client = Groq(api_key=GROQ_API_KEY)

# Thread pool execution loop for non-blocking third-party API payloads
executor = ThreadPoolExecutor()


# ----- LIGHTWEIGHT PURE PYTHON NLP PREPROCESSING (NO NLTK DEPS!) -----
def preprocess(text: str) -> list:
    """
    Tokenizes text and filters out common grammatical structural stop-words 
    using native regex to maintain a minimal serverless build size footprint.
    """
    STOP_WORDS = {
        "i", "me", "my", "myself", "we", "our", "ours", "ourselves", "you", "your", "yours", 
        "he", "him", "his", "himself", "she", "her", "hers", "herself", "it", "its", "itself", 
        "they", "them", "their", "theirs", "themselves", "what", "which", "who", "whom", "this", 
        "that", "these", "those", "am", "is", "are", "was", "were", "be", "been", "being", "have", 
        "has", "had", "having", "do", "does", "did", "doing", "a", "an", "the", "and", "but", "if", 
        "or", "because", "as", "until", "while", "of", "at", "by", "for", "with", "about", "against", 
        "between", "into", "through", "during", "before", "after", "above", "below", "to", "from", 
        "up", "down", "in", "out", "on", "off", "over", "under", "again", "further", "then", "once",
        "is", "are", "was", "were", "be", "been", "being", "have", "has", "had", "having"
    }
    # Tokenize words containing letters using alphanumeric boundaries
    words = re.findall(r'\b[a-zA-Z]+\b', text.lower())
    # Return filtered diagnostic tokens
    return [w for w in words if w not in STOP_WORDS and len(w) > 2]


# ---------------- GROQ CALL ---------------- #
async def run_groq(prompt: str):
    loop = asyncio.get_running_loop()
    return await loop.run_in_executor(
        executor,
        lambda: client.chat.completions.create(
            model="llama-3.1-8b-instant",
            messages=[
                {
                    "role": "system",
                    "content": "You are a medical AI assistant providing preliminary diagnostic assessment summaries."
                },
                {
                    "role": "user",
                    "content": prompt
                }
            ],
            temperature=0.4
        )
    )


# ---------------- API ENDPOINTS ---------------- #

# @app.get("/api")
# async def health_check():
#     return {"status": "AIMED Parsing Engine Active", "mode": "Serverless"}

@app.get("/api/analyze")
def home():
    return {"message": "AIMED NLP Backend is running"}


@app.post("/api/analyze")
async def analyze(symptoms: str = Form(None), file: UploadFile = File(None)):
    text = ""

    # Parse uploaded medical files
    if file is not None:
        content = await file.read()
        if file.filename.endswith(".pdf"):
            pdf = PdfReader(BytesIO(content))
            for page in pdf.pages:
                page_text = page.extract_text()
                if page_text:
                    text += page_text
        elif file.filename.endswith(".txt"):
            text = content.decode("utf-8")
            
    # Parse standard manual text input forms
    elif symptoms:
        text = symptoms
    else:
        return {"predicted_issue": "No input provided"}

    print("Extracted text length:", len(text))

    # Clean the input text via pure regex token evaluation
    keywords = preprocess(text)

    prompt = f"""
You are assisting a nurse who is collecting structured patient information for a doctor.

Based on the extracted symptoms or report keywords below:
{keywords}

Create a structured medical intake summary.
The output MUST follow this format exactly:

PATIENT SYMPTOM SUMMARY
Primary Symptoms:
- <symptom>
Associated Symptoms:
- <symptom>
Duration:
- <estimated duration if mentioned or unknown>
Severity:
- <mild / moderate / severe / unknown>
Possible Triggers:
- <trigger if mentioned>
Additional Notes:
- <short clinical style note>

Possible Conditions:
<condition 1>
<condition 2>

Rules:
- Do NOT diagnose.
- Keep it structured like a nurse report.
- Do NOT write paragraphs.
- Use short bullet points.
- Possible conditions must be one word each.
- Clearly state that this is not a medical diagnosis if needed.
"""

    response = await run_groq(prompt)

    return {
        "symptoms_identified": keywords,
        "predicted_issue": response.choices[0].message.content,
        "warning": "⚠ This is an AI-based preliminary assessment. Please consult a qualified doctor."
    }