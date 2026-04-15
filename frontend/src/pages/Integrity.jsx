import React, { useState } from 'react';
import axios from 'axios';
import { ShieldAlert, Fingerprint, ShieldCheck, Info } from 'lucide-react';

const Integrity = () => {
  const [status, setStatus] = useState(null);
  const [loading, setLoading] = useState(false);

  const checkIntegrity = async () => {
    setLoading(true);
    setStatus(null);
    try {
      const res = await axios.get('http://localhost:8000/api/integrity');
      setStatus(res.data);
    } catch (err) {
      console.error(err);
      setStatus({ valid: false, message: 'Failed to contact blockchain node.' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="page-container">
      <div className="page-header">
        <h1 className="page-title">Chain Integrity Verification</h1>
        <p className="page-subtitle">Run a deep cryptographic scan of the entire ledger to ensure no records have been altered.</p>
      </div>

      <div className="feature-info-box" style={{ maxWidth: '800px' }}>
        <Info size={22} className="info-icon" color="var(--accent-color)" />
        <div>
          <h3>How Integrity Verification Works</h3>
          <p>
            Every block in the chain stores a SHA-256 cryptographic hash of the previous block. This scan recalculates every hash from scratch and compares it to the stored value. If even a single character has been altered in any document record, the recalculated hash will differ — causing a cascading failure that immediately flags tampering. This is the fundamental security guarantee of blockchain technology.
          </p>
        </div>
      </div>

      <div className="glass-panel" style={{ maxWidth: '800px', display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center', padding: '60px 40px' }}>
        <Fingerprint size={80} color="var(--accent-color)" style={{ marginBottom: '20px', opacity: 0.8 }} />
        <h2 style={{ marginBottom: '15px' }}>Cryptographic Proof of Work</h2>
        <p style={{ color: 'var(--text-secondary)', marginBottom: '40px', maxWidth: '600px' }}>
          Click the button below to validate that every block in the chain maintains a valid cryptographic link to its predecessor. A single tampered record will break the entire chain.
        </p>

        <button onClick={checkIntegrity} disabled={loading} className="btn-primary" style={{ padding: '16px 40px', fontSize: '1.2rem', minWidth: '250px', justifyContent: 'center' }}>
          {loading ? 'Running Scan...' : 'Run Full Integrity Scan'}
        </button>

        {status && (
          <div style={{ marginTop: '40px', width: '100%' }}>
            {status.valid ? (
              <div className="alert alert-success" style={{ flexDirection: 'column', alignItems: 'center', padding: '30px' }}>
                <ShieldCheck size={48} color="var(--success-color)" style={{ marginBottom: '10px' }} />
                <h3 style={{ margin: 0, color: 'var(--success-color)' }}>Blockchain is Intact</h3>
                <p style={{ marginTop: '10px' }}>{status.message}</p>
              </div>
            ) : (
              <div className="alert alert-error" style={{ flexDirection: 'column', alignItems: 'center', padding: '30px' }}>
                <ShieldAlert size={48} color="var(--error-color)" style={{ marginBottom: '10px' }} />
                <h3 style={{ margin: 0, color: 'var(--error-color)' }}>Integrity Compromised</h3>
                <p style={{ marginTop: '10px' }}>{status.message}</p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default Integrity;
