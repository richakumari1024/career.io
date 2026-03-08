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

# Supabase configuration
def get_env_stripped(key, default=None):
    val = os.getenv(key, default)
    if val:
        val = val.strip().strip('"').strip("'").replace("\\n", "\n")
    return val

# Recovery Fallbacks (found in frontend env)
FALLBACK_URL = "https://owkksnnlbufmkfqnqpxa.supabase.co"
FALLBACK_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im93a2tzbm5sYnVmbWtmcW5xcHhhIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzI2NTIxOTUsImV4cCI6MjA4ODIyODE5NX0.o9DHsAF2Kqlx_LVonSV4Vkybsaf7POPoQLnfH-PaUUI"

supabase_url = get_env_stripped("SUPABASE_URL") or get_env_stripped("NEXT_PUBLIC_SUPABASE_URL")
supabase_key = get_env_stripped("SUPABASE_ANON_KEY") or get_env_stripped("NEXT_PUBLIC_SUPABASE_ANON_KEY")

# Final check: if the key looks wrong (like sb_publishable), use the verified key from the frontend
if not supabase_key or supabase_key.startswith("sb_publishable_"):
    supabase_key = FALLBACK_KEY

if not supabase_url or " " in supabase_url:
    supabase_url = FALLBACK_URL

app = FastAPI(title="AI Resume Analyzer API", version="1.0")

# Manual CORS Middleware (more reliable than built-in on some Vercel setups)
@app.middleware("http")
async def cors_middleware(request: Request, call_next):
    if request.method == "OPTIONS":
        response = JSONResponse(content="OK")
    else:
        response = await call_next(request)
    
    # Mirror the origin if it's our frontend or localhost
    origin = request.headers.get("origin")
    allowed_list = [
        "https://frontend-lemon-seven-42.vercel.app",
        "https://frontend-lemon-seven-42-git-main-richas-projects-90d3473f.vercel.app", # Vercel preview
        "http://localhost:3000",
        "http://127.0.0.1:3000"
    ]
    
    if origin in allowed_list or (origin and "vercel.app" in origin):
        response.headers["Access-Control-Allow-Origin"] = origin
        response.headers["Access-Control-Allow-Credentials"] = "true"
    elif not origin:
        response.headers["Access-Control-Allow-Origin"] = "*"
    else:
        # Fallback to wildcard for safety during debug
        response.headers["Access-Control-Allow-Origin"] = "*"

    response.headers["Access-Control-Allow-Methods"] = "GET, POST, PUT, DELETE, OPTIONS"
    response.headers["Access-Control-Allow-Headers"] = "Content-Type, Authorization, X-Requested-With, apikey"
    response.headers["Access-Control-Expose-Headers"] = "*"
    
    return response

@app.exception_handler(Exception)
async def global_exception_handler(request: Request, exc: Exception):
    error_detail = f"{type(exc).__name__}: {str(exc)}"
    logger.error(f"Global exception: {error_detail}\n{traceback.format_exc()}")
    
    # We still want our manual CORS to apply, but since this is an exception handler,
    # we have to set the headers manually here as well
    response = JSONResponse(
        status_code=500,
        content={"detail": error_detail, "error_type": type(exc).__name__}
    )
    
    origin = request.headers.get("origin", "*")
    response.headers["Access-Control-Allow-Origin"] = origin
    response.headers["Access-Control-Allow-Methods"] = "*"
    response.headers["Access-Control-Allow-Headers"] = "*"
    return response

@app.middleware("http")
async def add_logging_header(request: Request, call_next):
    logger.info(f"Incoming: {request.method} {request.url.path}")
    response = await call_next(request)
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
        if user_id and supabase_url and supabase_key:
            try:
                data = {
                    "user_id": user_id,
                    "resume_text": request.resume_text[:1000] + "...", # Store snippet for list view
                    "job_description": request.job_description[:1000] + "...",
                    "ats_score": response.ats_score,
                    "full_result": response.dict(),
                }
                
                headers = {
                    "apikey": supabase_key,
                    "Authorization": f"Bearer {supabase_key}",
                    "Content-Type": "application/json"
                }
                
                async with httpx.AsyncClient() as client:
                    res = await client.post(
                        f"{supabase_url}/rest/v1/analysis_results",
                        headers=headers,
                        json=data
                    )
                    res.raise_for_status()
                
                logger.info("Result saved to Supabase via HTTPX")
            except Exception as se:
                logger.error(f"Failed to save to Supabase: {str(se)}")
                
        return response
    except Exception as e:
        logger.error(f"Analysis failed: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/history")
async def get_history(user_id: str = Depends(get_current_user)):
    if not user_id:
        raise HTTPException(status_code=401, detail="Authentication required for history")
    
    if not supabase_url or not supabase_key:
        raise HTTPException(status_code=503, detail="Supabase not configured")

    try:
        headers = {
            "apikey": supabase_key,
            "Authorization": f"Bearer {supabase_key}",
            "Accept": "application/json"
        }
        
        params = {
            "user_id": f"eq.{user_id}",
            "order": "created_at.desc"
        }
        
        async with httpx.AsyncClient() as client:
            res = await client.get(
                f"{supabase_url}/rest/v1/analysis_results",
                headers=headers,
                params=params
            )
            res.raise_for_status()
            return res.json()
    except Exception as e:
        logger.error(f"Failed to fetch history: {str(e)}")
        raise HTTPException(status_code=500, detail="Database fetch failed")

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
