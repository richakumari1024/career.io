import json
import sys
import os
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
from openai import OpenAI
from schemas import AnalysisResponse
from dotenv import load_dotenv

load_dotenv()

# OpenRouter configuration
client = OpenAI(
  base_url="https://openrouter.ai/api/v1",
  api_key=os.getenv("OPENROUTER_API_KEY"),
  default_headers={
    "HTTP-Referer": "http://localhost:3000", # Optional, for OpenRouter rankings
    "X-Title": "Career.io Resume Analyzer", # Optional, for OpenRouter rankings
  }
)

SYSTEM_PROMPT = """
You are an expert ATS system and resume coach. Analyze the resume against the job description and return ONLY valid JSON with the following structure:
{
  "ats_score": number (0-100),
  "technical_skills": [{"keyword": string, "status": "found"|"missing", "importance": "Critical"|"Important"|"Nice-to-have"}],
  "soft_skills": [{"keyword": string, "status": "found"|"missing", "importance": "Critical"|"Important"|"Nice-to-have"}],
  "keyword_gaps": [string],
  "bullet_analysis": [{"original": string, "suggestions": [string], "score": number (1-5), "explanation": string}],
  "summary_impact": string
}
Never fabricate experience. Be specific and actionable.
"""

import logging

# Configure logging
logger = logging.getLogger("ai_service")

async def analyze_resume(resume_text: str, job_description: str) -> AnalysisResponse:
    try:
        prompt = f"Resume:\n{resume_text}\n\nJob Description:\n{job_description}"
        
        logger.info("Calling OpenRouter API (Step 3.5 Flash)")
        # Removed response_format for better compatibility with all models
        response = client.chat.completions.create(
            model="stepfun/step-3.5-flash:free",
            messages=[
                {"role": "system", "content": SYSTEM_PROMPT},
                {"role": "user", "content": prompt}
            ]
        )
        
        # Extract JSON content from response
        content = response.choices[0].message.content
        logger.debug(f"Raw AI Response received: {len(content)} chars")
        
        # Robust JSON extraction
        json_content = content
        if "```json" in content:
            json_content = content.split("```json")[1].split("```")[0].strip()
        elif "```" in content:
            json_content = content.split("```")[1].split("```")[0].strip()
        
        # In case the model adds conversational prefix like "Here is the JSON:"
        if not json_content.startswith("{") and "{" in json_content:
            json_content = json_content[json_content.find("{"):]
        if not json_content.endswith("}") and "}" in json_content:
            json_content = json_content[:json_content.rfind("}")+1]

        try:
            data = json.loads(json_content)
            return AnalysisResponse(**data)
        except json.JSONDecodeError as je:
            logger.error(f"JSON Decode Error: {str(je)}")
            raise Exception("AI returned invalid JSON format")
        except Exception as ve:
            logger.error(f"Validation Error: {str(ve)}")
            raise Exception("AI response failed schema validation")
            
    except Exception as e:
        logger.exception("analyze_resume Critical Error")
        # Provide more context in the exception for the frontend to display if needed
        raise Exception(f"Analysis failed: {str(e)}")
