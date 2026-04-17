from fastapi import FastAPI, UploadFile, File, Form
from fastapi.middleware.cors import CORSMiddleware
from groq import Groq
import nltk
from nltk.tokenize import word_tokenize
from nltk.corpus import stopwords
import os
from dotenv import load_dotenv
import asyncio
from concurrent.futures import ThreadPoolExecutor
from pypdf import PdfReader
from io import BytesIO

# Ensure NLTK data exists
try:
    stopwords.words("english")
except LookupError:
    nltk.download("punkt")
    nltk.download("stopwords")

app = FastAPI()

# Enable CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Load Groq API key
load_dotenv()
GROQ_API_KEY = os.getenv("GROQ_API_KEY")

client = Groq(api_key=GROQ_API_KEY)

# Thread pool for blocking AI calls
executor = ThreadPoolExecutor()


# ---------------- NLP PREPROCESSING ---------------- #

def preprocess(text: str):
    tokens = word_tokenize(text.lower())
    stop_words = set(stopwords.words("english"))
    return [w for w in tokens if w.isalpha() and w not in stop_words]


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
                    "content": "You are a medical AI assistant that provides only preliminary assessments."
                },
                {
                    "role": "user",
                    "content": prompt
                }
            ],
            temperature=0.4
        )
    )


# ---------------- API ENDPOINT ---------------- #

@app.post("/analyze")
async def analyze(symptoms: str = Form(None), file: UploadFile = File(None)):

    text = ""

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

    # Case 2: Symptoms typed
    elif symptoms:
        text = symptoms

    # Case 3: Nothing provided
    else:
        return {"predicted_issue": "No input provided"}

    # Debugging output (very useful)
    print("Extracted text length:", len(text))
    print("Extracted text sample:", text[:300])

    # NLP preprocessing
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
- <symptom>

Associated Symptoms:
- <symptom>
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