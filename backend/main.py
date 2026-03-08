import logging
from fastapi import FastAPI, UploadFile, File, HTTPException, Depends
from fastapi.middleware.cors import CORSMiddleware
from schemas import AnalysisRequest, AnalysisResponse, ParseResponse
from services.parser import parse_resume
from services.ai_service import analyze_resume
from core.auth import get_current_user
import httpx
import os
import json
import traceback
from fastapi import Request
from fastapi.responses import JSONResponse

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s [%(levelname)s] %(name)s: %(message)s",
    handlers=[logging.StreamHandler()]
)
logger = logging.getLogger("api")

# Environment sanitization
def get_env_safe(key, fallback=""):
    val = os.getenv(key, fallback)
    if val:
        # Strip all pesky characters from Vercel dash pasting
        return val.strip().strip('"').strip("'").replace("\\n", "\n")
    return fallback

# Recovery Fallbacks
SUPABASE_URL = get_env_safe("SUPABASE_URL") or get_env_safe("NEXT_PUBLIC_SUPABASE_URL") or "https://owkksnnlbufmkfqnqpxa.supabase.co"
SUPABASE_ANON_KEY = get_env_safe("SUPABASE_ANON_KEY") or get_env_safe("NEXT_PUBLIC_SUPABASE_ANON_KEY") or "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im93a2tzbm5sYnVmbWtmcW5xcHhhIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzI2NTIxOTUsImV4cCI6MjA4ODIyODE5NX0.o9DHsAF2Kqlx_LVonSV4Vkybsaf7POPoQLnfH-PaUUI"

app = FastAPI(title="AI Resume Analyzer API", version="1.0")

# Standard CORS Middleware - Best for browser compatibility
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"], # Wildcard is safer for complex local/preview/prod setups
    allow_credentials=False, # Must be False for wildcard "*"
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.middleware("http")
async def log_requests(request: Request, call_next):
    logger.info(f"Incoming: {request.method} {request.url.path}")
    try:
        response = await call_next(request)
        return response
    except Exception as e:
        logger.exception("Middleware caught crash")
        # Ensure errors return a JSON response with CORS headers
        response = JSONResponse(
            status_code=500,
            content={"detail": str(e), "type": type(e).__name__}
        )
        response.headers["Access-Control-Allow-Origin"] = "*"
        return response

@app.get("/health")
async def health_check():
    return {"status": "healthy", "version": "1.0"}

@app.post("/parse-pdf", response_model=ParseResponse)
async def parse_pdf_route(file: UploadFile = File(...)):
    try:
        if not file.filename.lower().endswith(('.pdf', '.docx', '.txt')):
            raise HTTPException(status_code=400, detail="Unsupported file format. Please upload PDF, DOCX, or TXT.")
        
        text = await parse_resume(file)
        if not text or len(text.strip()) < 10:
             logger.warning(f"Extracted text too short for {file.filename}")
        
        return {"text": text or "", "filename": file.filename, "page_count": 1}
    except Exception as e:
        logger.error(f"Parse error: {str(e)}")
        # Re-raise to be caught by global handler
        raise e

@app.post("/analyze", response_model=AnalysisResponse)
async def analyze_route(request: AnalysisRequest, user_id: str = Depends(get_current_user)):
    logger.info(f"Processing analysis request for user: {user_id or 'Guest'}")
    try:
        response = await analyze_resume(request.resume_text, request.job_description)
        
        # Save to Supabase if user is logged in
        if user_id and SUPABASE_URL and SUPABASE_ANON_KEY:
            try:
                data = {
                    "user_id": user_id,
                    "resume_text": request.resume_text[:1000] + "...", 
                    "job_description": request.job_description[:1000] + "...",
                    "ats_score": response.ats_score,
                    "full_result": response.dict(),
                }
                
                headers = {
                    "apikey": SUPABASE_ANON_KEY,
                    "Authorization": f"Bearer {SUPABASE_ANON_KEY}",
                    "Content-Type": "application/json"
                }
                
                async with httpx.AsyncClient() as client:
                    res = await client.post(
                        f"{SUPABASE_URL}/rest/v1/analysis_results",
                        headers=headers,
                        json=data
                    )
                    res.raise_for_status()
                logger.info("Saved to Supabase")
            except Exception as se:
                logger.error(f"Save failed: {str(se)}")
                
        return response
    except Exception as e:
        logger.error(f"Analysis failed: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/history")
async def get_history(user_id: str = Depends(get_current_user)):
    if not user_id:
        raise HTTPException(status_code=401, detail="Please sign in to view history")
    
    try:
        headers = {
            "apikey": SUPABASE_ANON_KEY,
            "Authorization": f"Bearer {SUPABASE_ANON_KEY}",
            "Accept": "application/json"
        }
        
        params = {
            "user_id": f"eq.{user_id}",
            "order": "created_at.desc"
        }
        
        async with httpx.AsyncClient() as client:
            res = await client.get(
                f"{SUPABASE_URL}/rest/v1/analysis_results",
                headers=headers,
                params=params
            )
            res.raise_for_status()
            return res.json()
    except Exception as e:
        logger.error(f"History fetch failed: {str(e)}")
        raise HTTPException(status_code=500, detail="Database error")

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
