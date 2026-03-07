import io
import pdfplumber
import docx
from typing import Optional
from fastapi import UploadFile

async def parse_resume(file: UploadFile) -> str:
    content = await file.read()
    filename = file.filename.lower()
    
    # Use in-memory stream to avoid Vercel filesystem issues
    stream = io.BytesIO(content)
    
    try:
        if filename.endswith(".pdf"):
            text = ""
            with pdfplumber.open(stream) as pdf:
                for page in pdf.pages:
                    text += (page.extract_text() or "") + "\n"
            return text
        elif filename.endswith(".docx"):
            doc = docx.Document(stream)
            text = "\n".join([paragraph.text for paragraph in doc.paragraphs])
            return text
        elif filename.endswith(".txt"):
            return content.decode("utf-8")
        else:
            return ""
    except Exception as e:
        import logging
        logging.getLogger("api").error(f"In-memory parse failed: {str(e)}")
        raise e
