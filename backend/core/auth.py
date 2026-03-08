import os
import logging
from fastapi import Request, HTTPException, Depends
from jose import jwt, JWTError
from dotenv import load_dotenv

logger = logging.getLogger("auth")
load_dotenv()

# Supabase JWT settings
raw_secret = os.getenv("SUPABASE_JWT_SECRET") or os.getenv("JWT_SECRET_KEY")
SUPABASE_JWT_SECRET = raw_secret.strip().strip('"').strip("'").replace("\\n", "\n") if raw_secret else None
SUPABASE_ALGORITHM = "HS256"

if not SUPABASE_JWT_SECRET:
    logger.error("SUPABASE_JWT_SECRET is MISSING! JWT verification will fail.")

async def get_current_user(request: Request):
    """
    Verifies the Supabase JWT from the Authorization header.
    Returns the user data (sub/id) if valid.
    """
    auth_header = request.headers.get("Authorization")
    if not auth_header:
        # For now, we allow guest access but log it. 
        # In strict mode, raise HTTPException(status_code=401)
        return None

    try:
        token = auth_header.split(" ")[1] if " " in auth_header else auth_header
        payload = jwt.decode(
            token, 
            SUPABASE_JWT_SECRET, 
            algorithms=[SUPABASE_ALGORITHM],
            options={"verify_aud": False}
        )
        user_id = payload.get("sub")
        return user_id
    except Exception as e:
        logger.warning(f"Auth failed (guest access fallback): {str(e)}")
        # We return None instead of raising 401 to allow analysis as guest
        return None
