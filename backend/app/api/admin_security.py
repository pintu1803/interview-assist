import secrets
from fastapi import Header, HTTPException
from app.config.settings import settings

def require_admin(x_admin_key: str = Header(default="")):
    expected_value = settings.admin_api_key
    if not expected_value:
        raise HTTPException(status_code=503, detail="Admin access not configured")

    if not secrets.compare_digest(expected_value.encode(), x_admin_key.encode()):
        raise HTTPException(status_code=401, detail="Admin Authentication Failed: Invalid API Key")