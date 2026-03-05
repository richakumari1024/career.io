import pdfplumber
import docx
from typing import Optional
from fastapi import UploadFile

def extract_text_from_pdf(file_path: str) -> str:
    text = ""
    with pdfplumber.open(file_path) as pdf:
        for page in pdf.pages:
            text += page.extract_text() + "\n"
    return text

def extract_text_from_docx(file_path: str) -> str:
    doc = docx.Document(file_path)
    text = "\n".join([paragraph.text for paragraph in doc.paragraphs])
    return text

async def parse_resume(file: UploadFile) -> str:
    content = await file.read()
    filename = file.filename.lower()
    
    import uuid
    # Save temporary file with a safe name
    temp_filename = f"temp_{uuid.uuid4().hex}_{filename[-10:]}"
    temp_path = f"/tmp/{temp_filename}"
    with open(temp_path, "wb") as f:
        f.write(content)
        
    try:
        if filename.endswith(".pdf"):
            text = extract_text_from_pdf(temp_path)
        elif filename.endswith(".docx"):
            text = extract_text_from_docx(temp_path)
        elif filename.endswith(".txt"):
            text = content.decode("utf-8")
        else:
            text = ""
    finally:
        import os
        if os.path.exists(temp_path):
            os.remove(temp_path)
            
    return text
