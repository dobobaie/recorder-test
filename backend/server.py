from fastapi import FastAPI, APIRouter
from dotenv import load_dotenv
from starlette.middleware.cors import CORSMiddleware
from motor.motor_asyncio import AsyncIOMotorClient
import os
import logging
from pathlib import Path
from pydantic import BaseModel, Field
from typing import List
import uuid
from datetime import datetime


ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / '.env')

# MongoDB connection
mongo_url = os.environ['MONGO_URL']
client = AsyncIOMotorClient(mongo_url)
db = client[os.environ['DB_NAME']]

# Create the main app without a prefix
app = FastAPI()

# Create a router with the /api prefix
api_router = APIRouter(prefix="/api")


# Define Models
class StatusCheck(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    client_name: str
    timestamp: datetime = Field(default_factory=datetime.utcnow)

class StatusCheckCreate(BaseModel):
    client_name: str

# Add your routes to the router instead of directly to app
@api_router.get("/")
async def root():
    return {"message": "Hello World"}

@api_router.post("/status", response_model=StatusCheck)
async def create_status_check(input: StatusCheckCreate):
    status_dict = input.dict()
    status_obj = StatusCheck(**status_dict)
    _ = await db.status_checks.insert_one(status_obj.dict())
    return status_obj

@api_router.get("/status", response_model=List[StatusCheck])
async def get_status_checks():
    status_checks = await db.status_checks.find().to_list(1000)
    return [StatusCheck(**status_check) for status_check in status_checks]

@api_router.post("/reverse-audio")
async def reverse_audio(file: UploadFile = File(...)):
    """
    Reverse an audio file and return the reversed version
    """
    try:
        # Create temp directory for processing
        with tempfile.TemporaryDirectory() as temp_dir:
            # Save uploaded file
            input_path = os.path.join(temp_dir, "input.m4a")
            with open(input_path, "wb") as buffer:
                shutil.copyfileobj(file.file, buffer)
            
            # Load audio
            audio = AudioSegment.from_file(input_path)
            
            # Reverse the audio
            reversed_audio = audio.reverse()
            
            # Export reversed audio
            output_path = os.path.join(temp_dir, "reversed.m4a")
            reversed_audio.export(output_path, format="ipod")
            
            # Save to a persistent location
            output_filename = f"reversed_{uuid.uuid4()}.m4a"
            output_dir = Path("/tmp/audio_outputs")
            output_dir.mkdir(exist_ok=True)
            final_output_path = output_dir / output_filename
            
            shutil.copy(output_path, final_output_path)
            
            # Return the file
            return FileResponse(
                path=str(final_output_path),
                media_type="audio/mp4",
                filename=output_filename
            )
    
    except Exception as e:
        logger.error(f"Error reversing audio: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Failed to reverse audio: {str(e)}")

# Include the router in the main app
app.include_router(api_router)

app.add_middleware(
    CORSMiddleware,
    allow_credentials=True,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

@app.on_event("shutdown")
async def shutdown_db_client():
    client.close()
