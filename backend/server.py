from fastapi import FastAPI, APIRouter, HTTPException, Depends, UploadFile, File, Form
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from dotenv import load_dotenv
from starlette.middleware.cors import CORSMiddleware
from motor.motor_asyncio import AsyncIOMotorClient
import os
import logging
from pathlib import Path
from pydantic import BaseModel, EmailStr, Field, ConfigDict
from typing import List, Optional
import uuid
from datetime import datetime, timezone
from auth_utils import hash_password, verify_password, create_access_token, decode_access_token
from email_service import email_service
import base64

ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / '.env')

mongo_url = os.environ['MONGO_URL']
client = AsyncIOMotorClient(mongo_url)
db = client[os.environ['DB_NAME']]

app = FastAPI()
api_router = APIRouter(prefix="/api")
security = HTTPBearer()

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Models
class AdminSignup(BaseModel):
    email: EmailStr
    password: str
    name: str

class AdminLogin(BaseModel):
    email: EmailStr
    password: str

class LabComplaintCreate(BaseModel):
    name: str
    roll_number: str
    stream: str
    phone: str
    email: EmailStr
    lab_number: str
    complaint: str
    photo_base64: Optional[str] = None

class ICCComplaintCreate(BaseModel):
    name: str
    roll_number: str
    stream: str
    phone: str
    email: EmailStr
    complaint: str

class StatusUpdate(BaseModel):
    status: str

class Complaint(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str
    name: str
    roll_number: str
    stream: str
    phone: str
    email: EmailStr
    complaint: str
    status: str
    created_at: datetime
    lab_number: Optional[str] = None
    photo_base64: Optional[str] = None

class Admin(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str
    email: EmailStr
    name: str

# Auth dependency
async def get_current_admin(credentials: HTTPAuthorizationCredentials = Depends(security), admin_type: str = "lab"):
    token = credentials.credentials
    payload = decode_access_token(token)
    if not payload:
        raise HTTPException(status_code=401, detail="Invalid or expired token")
    
    admin_id = payload.get("sub")
    admin_type_from_token = payload.get("type")
    
    if admin_type_from_token != admin_type:
        raise HTTPException(status_code=403, detail="Access denied")
    
    collection = db.lab_admins if admin_type == "lab" else db.icc_admins
    admin = await collection.find_one({"id": admin_id}, {"_id": 0})
    
    if not admin:
        raise HTTPException(status_code=401, detail="Admin not found")
    
    return admin

# Lab Admin Routes
@api_router.post("/auth/lab-admin/signup")
async def lab_admin_signup(admin: AdminSignup):
    existing = await db.lab_admins.find_one({"email": admin.email}, {"_id": 0})
    if existing:
        raise HTTPException(status_code=400, detail="Email already registered")
    
    admin_id = str(uuid.uuid4())
    hashed_pwd = hash_password(admin.password)
    
    admin_doc = {
        "id": admin_id,
        "email": admin.email,
        "password": hashed_pwd,
        "name": admin.name,
        "created_at": datetime.now(timezone.utc).isoformat()
    }
    
    await db.lab_admins.insert_one(admin_doc)
    
    token = create_access_token({"sub": admin_id, "type": "lab"})
    return {"token": token, "admin": {"id": admin_id, "email": admin.email, "name": admin.name}}

@api_router.post("/auth/lab-admin/login")
async def lab_admin_login(credentials: AdminLogin):
    admin = await db.lab_admins.find_one({"email": credentials.email}, {"_id": 0})
    if not admin or not verify_password(credentials.password, admin["password"]):
        raise HTTPException(status_code=401, detail="Invalid credentials")
    
    token = create_access_token({"sub": admin["id"], "type": "lab"})
    return {"token": token, "admin": {"id": admin["id"], "email": admin["email"], "name": admin["name"]}}

# ICC Admin Routes
@api_router.post("/auth/icc-admin/signup")
async def icc_admin_signup(admin: AdminSignup):
    existing = await db.icc_admins.find_one({"email": admin.email}, {"_id": 0})
    if existing:
        raise HTTPException(status_code=400, detail="Email already registered")
    
    admin_id = str(uuid.uuid4())
    hashed_pwd = hash_password(admin.password)
    
    admin_doc = {
        "id": admin_id,
        "email": admin.email,
        "password": hashed_pwd,
        "name": admin.name,
        "created_at": datetime.now(timezone.utc).isoformat()
    }
    
    await db.icc_admins.insert_one(admin_doc)
    
    token = create_access_token({"sub": admin_id, "type": "icc"})
    return {"token": token, "admin": {"id": admin_id, "email": admin.email, "name": admin.name}}

@api_router.post("/auth/icc-admin/login")
async def icc_admin_login(credentials: AdminLogin):
    admin = await db.icc_admins.find_one({"email": credentials.email}, {"_id": 0})
    if not admin or not verify_password(credentials.password, admin["password"]):
        raise HTTPException(status_code=401, detail="Invalid credentials")
    
    token = create_access_token({"sub": admin["id"], "type": "icc"})
    return {"token": token, "admin": {"id": admin["id"], "email": admin["email"], "name": admin["name"]}}

# Lab Complaint Routes
@api_router.post("/lab-complaints")
async def create_lab_complaint(complaint: LabComplaintCreate):
    complaint_id = str(uuid.uuid4())
    
    complaint_doc = {
        "id": complaint_id,
        "name": complaint.name,
        "roll_number": complaint.roll_number,
        "stream": complaint.stream,
        "phone": complaint.phone,
        "email": complaint.email,
        "lab_number": complaint.lab_number,
        "complaint": complaint.complaint,
        "photo_base64": complaint.photo_base64,
        "status": "pending",
        "created_at": datetime.now(timezone.utc).isoformat()
    }
    
    await db.lab_complaints.insert_one(complaint_doc)
    
    return {"message": "Complaint submitted successfully", "complaint_id": complaint_id}

@api_router.get("/lab-complaints", response_model=List[Complaint])
async def get_lab_complaints(admin: dict = Depends(lambda: get_current_admin(admin_type="lab"))):
    complaints = await db.lab_complaints.find({}, {"_id": 0}).sort("created_at", -1).to_list(1000)
    
    for c in complaints:
        if isinstance(c.get('created_at'), str):
            c['created_at'] = datetime.fromisoformat(c['created_at'])
    
    return complaints

@api_router.patch("/lab-complaints/{complaint_id}/status")
async def update_lab_complaint_status(
    complaint_id: str,
    status_update: StatusUpdate,
    admin: dict = Depends(lambda: get_current_admin(admin_type="lab"))
):
    complaint = await db.lab_complaints.find_one({"id": complaint_id}, {"_id": 0})
    if not complaint:
        raise HTTPException(status_code=404, detail="Complaint not found")
    
    await db.lab_complaints.update_one(
        {"id": complaint_id},
        {"$set": {"status": status_update.status}}
    )
    
    email_service.send_status_update_email(
        to_email=complaint["email"],
        complaint_type="Lab",
        student_name=complaint["name"],
        status=status_update.status,
        complaint_id=complaint_id
    )
    
    return {"message": "Status updated successfully"}

# ICC Complaint Routes
@api_router.post("/icc-complaints")
async def create_icc_complaint(complaint: ICCComplaintCreate):
    complaint_id = str(uuid.uuid4())
    
    complaint_doc = {
        "id": complaint_id,
        "name": complaint.name,
        "roll_number": complaint.roll_number,
        "stream": complaint.stream,
        "phone": complaint.phone,
        "email": complaint.email,
        "complaint": complaint.complaint,
        "status": "pending",
        "created_at": datetime.now(timezone.utc).isoformat()
    }
    
    await db.icc_complaints.insert_one(complaint_doc)
    
    return {"message": "Complaint submitted successfully", "complaint_id": complaint_id}

@api_router.get("/icc-complaints", response_model=List[Complaint])
async def get_icc_complaints(admin: dict = Depends(lambda: get_current_admin(admin_type="icc"))):
    complaints = await db.icc_complaints.find({}, {"_id": 0}).sort("created_at", -1).to_list(1000)
    
    for c in complaints:
        if isinstance(c.get('created_at'), str):
            c['created_at'] = datetime.fromisoformat(c['created_at'])
    
    return complaints

@api_router.patch("/icc-complaints/{complaint_id}/status")
async def update_icc_complaint_status(
    complaint_id: str,
    status_update: StatusUpdate,
    admin: dict = Depends(lambda creds: get_current_admin(creds, "icc"))
):
    complaint = await db.icc_complaints.find_one({"id": complaint_id}, {"_id": 0})
    if not complaint:
        raise HTTPException(status_code=404, detail="Complaint not found")
    
    await db.icc_complaints.update_one(
        {"id": complaint_id},
        {"$set": {"status": status_update.status}}
    )
    
    email_service.send_status_update_email(
        to_email=complaint["email"],
        complaint_type="ICC",
        student_name=complaint["name"],
        status=status_update.status,
        complaint_id=complaint_id
    )
    
    return {"message": "Status updated successfully"}

app.include_router(api_router)

app.add_middleware(
    CORSMiddleware,
    allow_credentials=True,
    allow_origins=os.environ.get('CORS_ORIGINS', '*').split(','),
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.on_event("shutdown")
async def shutdown_db_client():
    client.close()
