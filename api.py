from fastapi import FastAPI, File, UploadFile, Form, HTTPException, Request
from fastapi.responses import FileResponse
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import List, Optional
import os
import json
import hashlib
import httpx
from datetime import datetime

from blockchain import Blockchain
from utils import hash_document

app = FastAPI(title="Legal Document Verification API")

# Setup CORS for the React frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Initialize blockchain globally
bc = Blockchain()

# --- IPFS Emulator ---
IPFS_DIR = "data/ipfs"
os.makedirs(IPFS_DIR, exist_ok=True)

def simulate_ipfs_upload(file_bytes: bytes) -> str:
    """Simulates uploading to IPFS by generating a deterministic CID and saving locally."""
    # Simulate a CID v0 (starts with Qm)
    sha256 = hashlib.sha256(file_bytes).hexdigest()
    # Mocking base58 encoding format of real IPFS CIDs for realism
    mock_cid = "Qm" + sha256[:44]
    
    file_path = os.path.join(IPFS_DIR, mock_cid)
    with open(file_path, "wb") as f:
        f.write(file_bytes)
    return mock_cid

# --- Security Audit Log ---
AUDIT_LOG_FILE = "data/audit_log.json"

def _load_audit_log():
    if os.path.exists(AUDIT_LOG_FILE):
        try:
            with open(AUDIT_LOG_FILE, "r") as f:
                content = f.read().strip()
                if not content:
                    return []
                return json.loads(content)
        except (json.JSONDecodeError):
            return []
    return []

def _save_audit_log(log):
    with open(AUDIT_LOG_FILE, "w") as f:
        json.dump(log, f, indent=2)

def get_geolocation(ip: str) -> dict:
    """Get approximate geolocation from IP using free ip-api.com service."""
    try:
        # For localhost/private IPs, return a placeholder
        if ip in ("127.0.0.1", "::1", "localhost", "unknown"):
            return {"city": "Local Machine", "region": "N/A", "country": "Local", "isp": "localhost"}
        url = f"http://ip-api.com/json/{ip}?fields=city,regionName,country,isp,org"
        response = httpx.get(url, timeout=3)
        if response.status_code == 200:
            data = response.json()
            return {
                "city": data.get("city", "Unknown"),
                "region": data.get("regionName", "Unknown"),
                "country": data.get("country", "Unknown"),
                "isp": data.get("isp", "Unknown")
            }
    except Exception:
        pass
    return {"city": "Unknown", "region": "Unknown", "country": "Unknown", "isp": "Unknown"}

def log_audit_event(action: str, doc_hash: str, filename: str, is_valid: bool, client_ip: str, user_agent: str = "Unknown", matched_doc: str = None, owner: str = None, fingerprint: dict = None):
    """Log every audit event (register or verify) to the security audit log."""
    location = get_geolocation(client_ip)
    log = _load_audit_log()
    
    # Build the message based on action type
    if action == "register":
        message = f"Document '{matched_doc}' registered on blockchain by '{owner}'" if is_valid else f"Registration FAILED for '{matched_doc}'"
        alert_level = "info"
    else:  # verify
        if is_valid:
            message = f"Document verified successfully — matched '{matched_doc}'"
            alert_level = "safe"
        else:
            message = "FORGERY ALERT — Document hash NOT found on blockchain. Possible tampering detected!"
            alert_level = "danger"
    
    entry = {
        "timestamp": str(datetime.now()),
        "action": action,
        "doc_hash": doc_hash,
        "filename": filename,
        "owner": owner,
        "is_valid": is_valid,
        "client_ip": client_ip,
        "user_agent": user_agent,
        "location": location,
        "fingerprint": fingerprint,
        "matched_doc": matched_doc,
        "alert_level": alert_level,
        "message": message
    }
    log.append(entry)
    _save_audit_log(log)
    return entry

# --- API Models ---
class VerificationResponse(BaseModel):
    valid: bool
    message: str
    block: Optional[dict] = None

@app.get("/")
def read_root():
    return {"status": "Blockchain verification server is running."}

@app.post("/api/register")
async def register_document(
    request: Request,
    owner_name: str = Form(...),
    doc_name: str = Form(...),
    amends_hash: Optional[str] = Form(None),
    timezone: Optional[str] = Form(None),
    language: Optional[str] = Form(None),
    screen_resolution: Optional[str] = Form(None),
    file: UploadFile = File(...)
):
    try:
        file_bytes = await file.read()
        doc_hash = hash_document(file_bytes)
        client_ip = request.client.host if request.client else "unknown"
        user_agent = request.headers.get("user-agent", "Unknown Device")
        
        # Browser fingerprint
        fingerprint = {
            "timezone": timezone or "Unknown",
            "language": language or "Unknown",
            "screen": screen_resolution or "Unknown"
        }
        
        # 1. Upload to IPFS Emulator
        ipfs_cid = simulate_ipfs_upload(file_bytes)
        
        # 2. Register on Blockchain
        block, message = bc.add_document(
            doc_name=doc_name, 
            doc_hash=doc_hash, 
            owner=owner_name,
            ipfs_cid=ipfs_cid,
            amends_hash=amends_hash if amends_hash else None
        )
        if block:
            # Log registration event
            log_audit_event(
                action="register",
                doc_hash=doc_hash,
                filename=file.filename or "unknown",
                is_valid=True,
                client_ip=client_ip,
                user_agent=user_agent,
                matched_doc=doc_name,
                owner=owner_name,
                fingerprint=fingerprint
            )
            return {
                "success": True,
                "message": message,
                "doc_hash": doc_hash,
                "ipfs_cid": ipfs_cid,
                "block": block.to_dict()
            }
        else:
            raise HTTPException(status_code=400, detail=message)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/api/verify", response_model=VerificationResponse)
async def verify_document(request: Request, file: UploadFile = File(...)):
    try:
        file_bytes = await file.read()
        doc_hash = hash_document(file_bytes)
        client_ip = request.client.host if request.client else "unknown"
        user_agent = request.headers.get("user-agent", "Unknown Device")
        
        found, block = bc.verify_document(doc_hash)
        if found:
            # Log successful verification
            log_audit_event(
                action="verify",
                doc_hash=doc_hash,
                filename=file.filename or "unknown",
                is_valid=True,
                client_ip=client_ip,
                user_agent=user_agent,
                matched_doc=block.doc_name
            )
            return {
                "valid": True,
                "message": "DOCUMENT IS VALID — Hash matches blockchain record!",
                "block": block.to_dict()
            }
        else:
            # Log FORGERY ALERT — tampering attempt
            log_audit_event(
                action="verify",
                doc_hash=doc_hash,
                filename=file.filename or "unknown",
                is_valid=False,
                client_ip=client_ip,
                user_agent=user_agent
            )
            return {
                "valid": False,
                "message": "DOCUMENT IS INVALID — Hash NOT found on blockchain. Document may be tampered or unregistered."
            }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/api/blocks")
def get_blocks():
    # Only returning the blockchain from memory, so we refresh from disk just in case
    bc.chain = bc._load_chain() 
    blocks = bc.get_all_blocks()
    return {"total": len(blocks), "blocks": [b.to_dict() for b in blocks]}

@app.get("/api/integrity")
def check_integrity():
    is_valid = bc.is_chain_valid()
    if is_valid:
        return {"valid": True, "message": "Blockchain is VALID — All blocks are intact and untampered!"}
    else:
        return {"valid": False, "message": "Blockchain INTEGRITY COMPROMISED — Chain has been tampered with!"}

@app.get("/api/ipfs/{cid}")
def get_ipfs_file(cid: str):
    """Retrieve a document from the simulated IPFS network."""
    file_path = os.path.join(IPFS_DIR, cid)
    if not os.path.exists(file_path):
        raise HTTPException(status_code=404, detail="File not found on IPFS network.")
    return FileResponse(file_path, filename=f"{cid}.pdf") 

# --- Security Audit Log Endpoints ---
@app.get("/api/audit-log")
def get_audit_log():
    """Get the full security audit log."""
    log = _load_audit_log()
    return {"total": len(log), "entries": list(reversed(log))}

@app.get("/api/audit-stats")
def get_audit_stats():
    """Get summary statistics from the security audit log."""
    log = _load_audit_log()
    total = len(log)
    safe = sum(1 for e in log if e.get("alert_level") == "safe")
    danger = sum(1 for e in log if e.get("alert_level") == "danger")
    unique_ips = len(set(e.get("client_ip", "") for e in log))
    return {
        "total_verifications": total,
        "successful": safe,
        "forgery_attempts": danger,
        "unique_ips": unique_ips,
        "threat_level": "critical" if danger > 5 else "elevated" if danger > 0 else "clear"
    }
