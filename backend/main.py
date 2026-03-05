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

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s [%(levelname)s] %(name)s: %(message)s",
    handlers=[logging.StreamHandler()]
)
logger = logging.getLogger("api")

# Supabase configuration
supabase_url = os.getenv("SUPABASE_URL")
supabase_key = os.getenv("SUPABASE_ANON_KEY")

app = FastAPI(title="AI Resume Analyzer API", version="1.0")

# CORS Configuration
allowed_origins = os.getenv("ALLOWED_ORIGINS", "*").split(",")
allowed_origins = [o.strip() for o in allowed_origins if o.strip()]

app.add_middleware(
    CORSMiddleware,
    allow_origins=allowed_origins if allowed_origins else ["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/health")
async def health_check():
    return {"status": "healthy", "version": "1.0"}

@app.post("/parse-pdf", response_model=ParseResponse)
async def parse_pdf_route(file: UploadFile = File(...)):
    if not file.filename.endswith(('.pdf', '.docx', '.txt')):
        raise HTTPException(status_code=400, detail="Unsupported file format")
    
    text = await parse_resume(file)
    return {"text": text, "filename": file.filename, "page_count": 1}

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
