from fastapi import Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer
from sqlalchemy.orm import Session
from app.database import get_db
from app.core.security import decode_access_token
from app.models.user import User

oauth2_scheme = OAuth2PasswordBearer(tokenUrl="auth/login")

async def get_current_user(
        token: str = Depends(oauth2_scheme),
        db: Session = Depends(get_db)
        ):

    credential_exceptions = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials",
        headers={"WWW-Authenticate" : "Bearer"}
    )

    payload = decode_access_token(token)

    if payload is None:
        raise credential_exceptions

    username = payload.get("sub")
    if username is None:
        raise credential_exceptions

    user = db.query(User).filter(User.email == username).first()

    if user is None:
        raise credential_exceptions

    return user
    