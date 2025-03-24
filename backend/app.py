from fastapi import FastAPI, UploadFile, File
from fastapi.middleware.cors import CORSMiddleware

import pdfplumber
from docx import Document
import spacy
import io
import re
import json
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.metrics.pairwise import cosine_similarity

app = FastAPI()

# Enable CORS for frontend integration
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Change to ["http://localhost:3000"] in production
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Load NLP model
nlp = spacy.load("en_core_web_sm")

# Sample job descriptions for matching
job_descriptions = [
    {"id": 1, "title": "Software Engineer", "skills": "Python, FastAPI, Machine Learning"},
    {"id": 2, "title": "Data Scientist", "skills": "Python, NLP, Data Analysis"},
    {"id": 3, "title": "Frontend Developer", "skills": "React.js, JavaScript, UI/UX"},
]

# Extract text from PDF
def extract_text_from_pdf(pdf_file):
    text = ""
    with pdfplumber.open(pdf_file) as pdf:
        for page in pdf.pages:
            extracted_text = page.extract_text()
            if extracted_text:
                text += extracted_text + "\n"
    return text

# Extract text from DOCX
def extract_text_from_docx(docx_file):
    doc = Document(docx_file)
    return "\n".join([para.text for para in doc.paragraphs])

# Extract details from text (Name, Email, Phone, Skills)
def extract_info(text):
    doc = nlp(text)
    
    # Extract Email & Phone
    email_match = re.search(r'[\w\.-]+@[\w\.-]+', text)
    phone_match = re.search(r'\+?\d{10,13}', text)
    
    # Extract Name (if available in the first entities)
    name = "Unknown"
    for ent in doc.ents:
        if ent.label_ == "PERSON":
            name = ent.text
            break

    # Extract Skills
    skills = [token.text for token in doc if token.pos_ in ["NOUN", "PROPN"]]
    
    return {
        "name": name,
        "email": email_match.group(0) if email_match else "Not Found",
        "phone": phone_match.group(0) if phone_match else "Not Found",
        "skills": ", ".join(set(skills)),  # Convert skills list to a string
    }

#  Match extracted skills with job descriptions
def match_jobs(resume_skills):
    vectorizer = TfidfVectorizer()

    # Convert skills text into vector
    job_texts = [job["skills"] for job in job_descriptions]
    all_texts = [resume_skills] + job_texts
    vectors = vectorizer.fit_transform(all_texts)

    # Compute similarity between resume and job descriptions
    resume_vector = vectors[0]
    job_vectors = vectors[1:]

    # Fix cosine similarity shape issue
    scores = cosine_similarity(resume_vector, job_vectors).flatten()

    return [{"title": job["title"], "match_score": round(score * 100, 2)} for job, score in zip(job_descriptions, scores)]

# General text extraction (PDF or DOCX)
def extract_text(file: bytes, filename: str):
    if filename.endswith(".pdf"):
        return extract_text_from_pdf(io.BytesIO(file))
    elif filename.endswith(".docx"):
        return extract_text_from_docx(io.BytesIO(file))
    else:
        return "Unsupported file format"

# API endpoint to upload and process resumes
@app.post("/upload/")
async def upload_resume(file: UploadFile = File(...)):
    contents = await file.read()
    
    # Extract text from resume
    extracted_text = extract_text(contents, file.filename)
    
    # Extract information (Name, Email, Phone, Skills)
    extracted_info = extract_info(extracted_text)
    
    # Match skills with job descriptions
    job_matches = match_jobs(extracted_info["skills"])
    
    return {
        "filename": file.filename,
        "extracted_info": extracted_info,
        "job_matches": job_matches
    }
