from fastapi import FastAPI, Depends
from keycloak_auth import get_current_user

app = FastAPI()

@app.get("/secure-data")
async def secure_data(user: dict = Depends(get_current_user)):
    return {"message": "Secure Data", "user": user}