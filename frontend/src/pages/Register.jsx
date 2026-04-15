import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { FileUp, CheckCircle, Award, Printer, Info } from 'lucide-react';
import { QRCodeSVG } from 'qrcode.react';

const Register = () => {
  const [file, setFile] = useState(null);
  const [owner, setOwner] = useState('');
  const [docName, setDocName] = useState('');
  const [amendsHash, setAmendsHash] = useState('');
  const [status, setStatus] = useState({ type: '', message: '', block: null, ipfs_cid: null });
  const [loading, setLoading] = useState(false);
  
  // For dropdown
  const [existingBlocks, setExistingBlocks] = useState([]);

  const fileInputRef = useRef(null);

  useEffect(() => {
    // Fetch blocks to populate the "Amends" dropdown
    const fetchBlocks = async () => {
      try {
        const res = await axios.get('http://localhost:8000/api/blocks');
        setExistingBlocks(res.data.blocks.filter(b => b.index > 0)); // Exclude genesis
      } catch (err) {
        console.error("Could not fetch blocks for amendment.", err);
      }
    };
    fetchBlocks();
  }, []);

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files.length > 0) {
      setFile(e.target.files[0]);
    }
  };

  const handleDragOver = (e) => e.preventDefault();
  
  const handleDrop = (e) => {
    e.preventDefault();
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      setFile(e.dataTransfer.files[0]);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!file || !owner || !docName) {
      setStatus({ type: 'error', message: 'Please fill all fields and select a file.' });
      return;
    }

    const formData = new FormData();
    formData.append('file', file);
    formData.append('owner_name', owner);
    formData.append('doc_name', docName);
    
    // Browser Fingerprinting
    formData.append('timezone', Intl.DateTimeFormat().resolvedOptions().timeZone);
    formData.append('language', navigator.language);
    formData.append('screen_resolution', `${window.screen.width}x${window.screen.height}`);

    if (amendsHash) {
      formData.append('amends_hash', amendsHash);
    }

    setLoading(true);
    setStatus({ type: '', message: '', block: null, ipfs_cid: null });

    try {
      const res = await axios.post('http://localhost:8000/api/register', formData);
      setStatus({ 
        type: 'success', 
        message: res.data.message, 
        block: res.data.block,
        ipfs_cid: res.data.ipfs_cid
      });
      // reset forms but keep certificate view active
      setFile(null);
      setOwner('');
      setDocName('');
      setAmendsHash('');
    } catch (err) {
      setStatus({ 
        type: 'error', 
        message: err.response?.data?.detail || 'An error occurred during registration.' 
      });
    } finally {
      setLoading(false);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="page-container">
      <div className="page-header no-print">
        <h1 className="page-title">Register Document</h1>
        <p className="page-subtitle">Upload a document to register its hash and secure it on IPFS.</p>
      </div>

      <div className="feature-info-box no-print" style={{ maxWidth: '800px' }}>
        <Info size={22} className="info-icon" color="var(--accent-color)" />
        <div>
          <h3>QR Certificate + IPFS + Versioning</h3>
          <p>
            <strong>QR Code Certificate:</strong> After registration, a printable Certificate of Authenticity is generated containing the document's SHA-256 hash, IPFS Content ID, and a scannable QR code that links directly to the verification page.
            <br /><br />
            <strong>IPFS Storage:</strong> Your file is stored on a decentralized network (IPFS) and assigned a unique Content Identifier (CID). This means the original document can be retrieved at any time, even years later.
            <br /><br />
            <strong>Document Amendments:</strong> If this document is an update to a previous version (e.g., Contract v2 amending Contract v1), select the original from the dropdown below. The blockchain will permanently record this amendment link, creating a transparent legal audit trail.
          </p>
        </div>
      </div>

      <div className="glass-panel no-print" style={{ maxWidth: '800px' }}>
        <form onSubmit={handleSubmit}>
          <div style={{ display: 'flex', gap: '20px', marginBottom: '20px' }}>
            <div className="input-group" style={{ flex: 1 }}>
              <label>Owner Name</label>
              <input 
                type="text" 
                className="input-field" 
                placeholder="e.g. John Doe"
                value={owner}
                onChange={(e) => setOwner(e.target.value)}
              />
            </div>
            <div className="input-group" style={{ flex: 1 }}>
              <label>Document Name</label>
              <input 
                type="text" 
                className="input-field" 
                placeholder="e.g. Property Agreement 2026"
                value={docName}
                onChange={(e) => setDocName(e.target.value)}
              />
            </div>
          </div>

          <div className="input-group">
            <label>Legal Amendment (Optional)</label>
            <select 
              className="input-field" 
              value={amendsHash}
              onChange={(e) => setAmendsHash(e.target.value)}
            >
              <option value="">-- Does not amend an existing document --</option>
              {existingBlocks.map(b => (
                <option key={b.doc_hash} value={b.doc_hash}>
                  Amend: {b.doc_name} by {b.owner} (Hash: {b.doc_hash.slice(0,10)}...)
                </option>
              ))}
            </select>
          </div>

          <div 
            className="file-upload-zone"
            onDragOver={handleDragOver}
            onDrop={handleDrop}
            onClick={() => fileInputRef.current.click()}
          >
            <FileUp size={48} className="file-upload-icon" />
            <p style={{ margin: 0, fontWeight: 500 }}>
              {file ? `Selected: ${file.name}` : "Drag & drop a document here, or click to browse"}
            </p>
            <p style={{ margin: 0, fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
              Supports PDF, DOCX, TXT, PNG, JPG
            </p>
            <input 
              type="file" 
              ref={fileInputRef}
              onChange={handleFileChange}
            />
          </div>

          <div style={{ marginTop: '30px', display: 'flex', justifyContent: 'flex-end' }}>
            <button type="submit" className="btn-primary" disabled={loading}>
              <CheckCircle size={18} />
              {loading ? 'Minting Block & Uploading IPFS...' : 'Register Document'}
            </button>
          </div>
        </form>

        {status.message && (
          <div className={`alert alert-${status.type}`} style={{ marginTop: '30px' }}>
            {status.message}
          </div>
        )}
      </div>

      {status.block && status.type === 'success' && (
        <div className="certificate-container" style={{ marginTop: '40px' }}>
          <div className="glass-panel printable-certificate" style={{ padding: '40px', background: '#fff', color: '#000', borderRadius: '12px', border: '5px double #3182ce', maxWidth: '800px', margin: '0 auto', textAlign: 'center' }}>
            <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '20px' }}>
              <Award size={64} color="#3182ce" />
            </div>
            <h1 style={{ color: '#000', marginBottom: '10px', fontSize: '2.5rem', fontFamily: 'serif' }}>Certificate of Authenticity</h1>
            <p style={{ fontSize: '1.2rem', marginBottom: '30px' }}>This cryptographic certificate verifies that the digital document has been permanently recorded on the blockchain.</p>
            
            <div style={{ textAlign: 'left', background: '#f8f9fa', padding: '20px', borderRadius: '8px', border: '1px solid #dee2e6', marginBottom: '30px' }}>
              <p><strong>Document Name:</strong> {status.block.doc_name}</p>
              <p><strong>Registered Owner:</strong> {status.block.owner}</p>
              <p><strong>Timestamp:</strong> {status.block.timestamp}</p>
              <p><strong>Document SHA-256 Hash:</strong> <br/><span style={{ fontFamily: 'monospace', wordBreak: 'break-all' }}>{status.block.doc_hash}</span></p>
              <p><strong>IPFS Content ID:</strong> <br/><span style={{ fontFamily: 'monospace', wordBreak: 'break-all' }}>{status.ipfs_cid}</span></p>
              {status.block.amends_hash && status.block.amends_hash !== "None" && (
                <p><strong>Amends Previous Document:</strong> <br/><span style={{ fontFamily: 'monospace', wordBreak: 'break-all', color: '#e53e3e' }}>{status.block.amends_hash}</span></p>
              )}
            </div>

            <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '40px' }}>
              <div>
                <QRCodeSVG 
                  value={`http://localhost:5173/verify?hash=${status.block.doc_hash}`} 
                  size={150} 
                  level="H" 
                  style={{ border: '10px solid white', borderRadius: '8px', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}/>
                <p style={{ fontSize: '0.9rem', marginTop: '10px', color: '#6c757d' }}>Scan to instantly verify</p>
              </div>
              <div style={{ textAlign: 'left', maxWidth: '300px' }}>
                <h4 style={{ color: '#000', marginBottom: '10px' }}>Official Blockchain Record</h4>
                <p style={{ fontSize: '0.9rem', color: '#6c757d' }}>Block Index #{status.block.index}</p>
                <p style={{ fontSize: '0.8rem', color: '#6c757d', wordBreak: 'break-all' }}>Tx ID: {status.block.current_hash}</p>
              </div>
            </div>
          </div>
          
          <div className="no-print" style={{ display: 'flex', justifyContent: 'center', marginTop: '20px' }}>
            <button className="btn-primary" onClick={handlePrint}>
              <Printer size={18} />
              Print / Save as PDF Certificate
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default Register;
