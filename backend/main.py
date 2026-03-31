from fastapi import FastAPI
from fastapi.openapi.docs import get_swagger_ui_html
from fastapi.middleware.cors import CORSMiddleware
from Route.auth_routes import router as auth_router
from Route.api_routes import router as api_router


app = FastAPI(root_path="/api")  

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],  
    allow_headers=["*"], 
)



app.include_router(auth_router, prefix="/auth")
app.include_router(api_router, prefix="/data")   #/api per andare al backend da nginx, /api/data va alla mia api
