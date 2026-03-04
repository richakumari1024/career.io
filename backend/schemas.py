from pydantic import BaseModel, Field
from typing import List, Optional

class AnalysisRequest(BaseModel):
    resume_text: str
    job_description: str

class KeywordMatch(BaseModel):
    keyword: str
    status: str # 'found' or 'missing'
    importance: str # 'Critical', 'Important', 'Nice-to-have'

class BulletRewrite(BaseModel):
    original: str
    suggestions: List[str]
    score: int
    explanation: str

class AnalysisResponse(BaseModel):
    ats_score: int
    technical_skills: List[KeywordMatch]
    soft_skills: List[KeywordMatch]
    keyword_gaps: List[str]
    bullet_analysis: List[BulletRewrite]
    summary_impact: str

class ParseResponse(BaseModel):
    text: str
    filename: str
    page_count: int
