import React, { useState, useRef } from 'react';
import axios from 'axios';
import { Search, FileQuestion, CheckCircle, AlertOctagon, Info } from 'lucide-react';

const Verify = () => {
  const [file, setFile] = useState(null);
  const [status, setStatus] = useState({ type: '', message: '', block: null });
  const [loading, setLoading] = useState(false);
  
  const fileInputRef = useRef(null);

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files.length > 0) {
      setFile(e.target.files[0]);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!file) {
      setStatus({ type: 'error', message: 'Please upload a file to verify.' });
      return;
    }

    const formData = new FormData();
    formData.append('file', file);

    setLoading(true);
    setStatus({ type: '', message: '', block: null });

    try {
      const res = await axios.post('http://localhost:8000/api/verify', formData);
      setStatus({ 
        type: res.data.valid ? 'success' : 'error', 
        message: res.data.message, 
        block: res.data.block 
      });
      setFile(null);
    } catch (err) {
      setStatus({ 
        type: 'error', 
        message: err.response?.data?.detail || 'An error occurred during verification.' 
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="page-container">
      <div className="page-header">
        <h1 className="page-title">Verify Authenticity</h1>
        <p className="page-subtitle">Upload a document to check if it has been tampered with or exists on the blockchain.</p>
      </div>

      <div className="feature-info-box" style={{ maxWidth: '800px' }}>
        <Info size={22} className="info-icon" color="var(--accent-color)" />
        <div>
          <h3>How Document Verification Works</h3>
          <p>
            Upload the exact same file you originally registered. The system computes its SHA-256 cryptographic hash and checks it against every block on the ledger. If the hashes match, the document is confirmed authentic and untampered. Even a single byte change (e.g., editing one letter in a PDF) will produce an entirely different hash, instantly flagging potential forgery.
          </p>
        </div>
      </div>

      <div className="glass-panel" style={{ maxWidth: '800px', display: 'flex', gap: '40px' }}>
        <div style={{ flex: 1 }}>
          <form onSubmit={handleSubmit}>
            <div 
              className="file-upload-zone"
              onClick={() => fileInputRef.current.click()}
              style={{ minHeight: '300px', justifyContent: 'center' }}
            >
              <FileQuestion size={48} className="file-upload-icon" color="#3182ce" />
              <p style={{ margin: 0, fontWeight: 500, marginTop: '20px' }}>
                {file ? `Selected: ${file.name}` : "Click to select a document for verification"}
              </p>
              <input 
                type="file" 
                ref={fileInputRef}
                onChange={handleFileChange}
              />
            </div>

            <div style={{ marginTop: '30px', display: 'flex', justifyContent: 'center' }}>
              <button type="submit" className="btn-primary" disabled={loading} style={{ width: '100%', justifyContent: 'center' }}>
                <Search size={18} />
                {loading ? 'Analyzing Cryptographic Hash...' : 'Verify against Ledger'}
              </button>
            </div>
          </form>
        </div>

        <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
          <h3>Verification Status</h3>
          <div style={{ flex: 1, background: 'rgba(0,0,0,0.3)', borderRadius: '12px', padding: '20px', marginTop: '15px' }}>
            {!status.message ? (
              <p style={{ color: 'var(--text-secondary)' }}>Awaiting document...</p>
            ) : (
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '20px' }}>
                  {status.type === 'success' ? <CheckCircle color="var(--success-color)" size={32} /> : <AlertOctagon color="var(--error-color)" size={32} />}
                  <strong style={{ fontSize: '1.2rem', color: status.type === 'success' ? 'var(--success-color)' : 'var(--error-color)' }}>
                    {status.type === 'success' ? 'Authentic' : 'Invalid / Tampered'}
                  </strong>
                </div>
                <p>{status.message}</p>
                {status.block && (
                  <div className="code-block" style={{ marginTop: '15px', fontSize: '0.85rem' }}>
                    <pre>{JSON.stringify(status.block, null, 2)}</pre>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Verify;
