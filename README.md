# 🛡️ Legal Document Verification System

A high-end, full-stack application for modernizing legal document verification using **Blockchain** technology and **IPFS** (InterPlanetary File System) simulation. 

This system ensures that legal documents (contracts, certificates, deeds) are immutable, verifiable, and protected against tampering.

---

## ✨ Key Features

*   **⛓️ Blockchain Ledger**: Every registration is a "block" in an immutable chain, ensuring a permanent audit trail.
*   **🌍 IPFS Simulation**: Documents are assigned deterministic CIDs (Content Identifiers) and stored in a decentralized-style local network.
*   **📝 Document Versioning**: Register amendments to previous documents to maintain a clear legal history.
*   **🚨 Security Audit Log**: Real-time tracking of all verification attempts, including IP geolocation, browser fingerprinting, and **Automatic Forgery Detection**.
*   **🏆 Printable QR Certificates**: Instantly generate a "Certificate of Authenticity" with a scannable QR code for physical document verification.
*   **🎨 Premium UI**: A modern, glassmorphic React interface with dark mode support and smooth micro-animations.

---

## 🛠️ Technology Stack

*   **Backend**: Python, FastAPI, Uvicorn, Pydantic
*   **Frontend**: React (Vite), Axios, Lucide-React, CSS3 (Modern Glassmorphism)
*   **Storage**: Simulated IPFS + JSON-based Blockchain persistence

---

## 🚀 Getting Started

### 1. Prerequisites
*   Python 3.8+
*   Node.js 16+
*   npm

### 2. Backend Setup
```bash
# Install dependencies
pip install -r requirements.txt

# Start the FastAPI server
python -m uvicorn api.py:app --reload
```
*The API will run on **http://localhost:8000***

### 3. Frontend Setup
```bash
# Navigate to frontend
cd frontend

# Install dependencies
npm install

# Start development server
npm run dev
```
*The Web App will run on **http://localhost:5173***

---

## 📸 Usage
1.  **Register**: Upload a document and name it. The system will "mint" a new block and generate a certificate.
2.  **Verify**: Upload any document to see if it matches the blockchain record.
3.  **Audit**: Check the "Security Audit Log" to see when and where documents were verified.

---

## 🛡️ Security Note
This project uses a custom blockchain implementation and local file storage to simulate decentralization. For production use, it can be integrated with Ethereum/Polygon and a real IPFS node.
