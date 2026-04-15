import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Bell, Shield, AlertTriangle, CheckCircle, Clock, Globe, Info, RefreshCw } from 'lucide-react';

const AuditLog = () => {
  const [log, setLog] = useState({ total: 0, entries: [] });
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [logRes, statsRes] = await Promise.all([
        axios.get('http://localhost:8000/api/audit-log'),
        axios.get('http://localhost:8000/api/audit-stats')
      ]);
      setLog(logRes.data);
      setStats(statsRes.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const getThreatColor = (level) => {
    switch (level) {
      case 'critical': return '#f85149';
      case 'elevated': return '#d29922';
      case 'clear': return '#2ea043';
      default: return 'var(--text-secondary)';
    }
  };

  return (
    <div className="page-container">
      <div className="page-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
        <div>
          <h1 className="page-title">Security Audit Log</h1>
          <p className="page-subtitle">Real-time monitoring of all verification attempts and tampering alerts.</p>
        </div>
        <button className="btn-primary" onClick={fetchData} style={{ padding: '8px 16px', fontSize: '0.9rem' }}>
          <RefreshCw size={16} /> Refresh
        </button>
      </div>

      <div className="feature-info-box">
        <Info size={22} className="info-icon" color="var(--accent-color)" />
        <div>
          <h3>How the Tampering Alert System Works</h3>
          <p>
            Every time someone attempts to verify a document, the system logs the event — including the timestamp, the client's IP address, and the uploaded filename. If the document's SHA-256 hash does not match any record on the blockchain, a <strong style={{ color: '#f85149' }}>FORGERY ALERT</strong> is triggered and flagged in red. Successful verifications are logged in green. This creates a complete security audit trail, allowing administrators to detect and investigate potential forgery attempts in real time.
          </p>
        </div>
      </div>

      {/* Stats Dashboard */}
      {stats && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '16px', marginBottom: '30px' }}>
          <div className="glass-panel" style={{ textAlign: 'center', padding: '20px' }}>
            <Shield size={28} color="var(--accent-color)" style={{ marginBottom: '8px' }} />
            <p style={{ fontSize: '2rem', fontWeight: '700', margin: '0' }}>{stats.total_verifications}</p>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem' }}>Total Verifications</p>
          </div>
          <div className="glass-panel" style={{ textAlign: 'center', padding: '20px' }}>
            <CheckCircle size={28} color="var(--success-color)" style={{ marginBottom: '8px' }} />
            <p style={{ fontSize: '2rem', fontWeight: '700', margin: '0', color: 'var(--success-color)' }}>{stats.successful}</p>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem' }}>Authentic</p>
          </div>
          <div className="glass-panel" style={{ textAlign: 'center', padding: '20px' }}>
            <AlertTriangle size={28} color="var(--error-color)" style={{ marginBottom: '8px' }} />
            <p style={{ fontSize: '2rem', fontWeight: '700', margin: '0', color: 'var(--error-color)' }}>{stats.forgery_attempts}</p>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem' }}>Forgery Alerts</p>
          </div>
          <div className="glass-panel" style={{ textAlign: 'center', padding: '20px' }}>
            <Globe size={28} color={getThreatColor(stats.threat_level)} style={{ marginBottom: '8px' }} />
            <p style={{ fontSize: '1.2rem', fontWeight: '700', margin: '0', color: getThreatColor(stats.threat_level), textTransform: 'uppercase' }}>{stats.threat_level}</p>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem' }}>Threat Level ({stats.unique_ips} IPs)</p>
          </div>
        </div>
      )}

      {/* Log Entries */}
      {loading ? (
        <p>Loading audit log...</p>
      ) : log.entries.length === 0 ? (
        <div className="glass-panel" style={{ textAlign: 'center', padding: '60px', color: 'var(--text-secondary)' }}>
          <Shield size={48} style={{ marginBottom: '15px', opacity: 0.5 }} />
          <h3>No Verification Attempts Yet</h3>
          <p>When documents are verified, all attempts will be logged here in real-time.</p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          {log.entries.map((entry, idx) => (
            <div 
              key={idx} 
              className="glass-panel" 
              style={{ 
                padding: '16px 20px',
                borderLeft: `4px solid ${
                  entry.action === 'register' ? 'var(--accent-color)' : 
                  (entry.alert_level === 'safe' ? 'var(--success-color)' : 'var(--error-color)')
                }`,
                display: 'flex',
                alignItems: 'flex-start',
                gap: '16px'
              }}
            >
              {/* Icon */}
              <div style={{ flexShrink: 0, marginTop: '4px' }}>
                {entry.action === 'register' 
                  ? <Shield size={28} color="var(--accent-color)" />
                  : (entry.alert_level === 'safe' 
                    ? <CheckCircle size={28} color="var(--success-color)" /> 
                    : <AlertTriangle size={28} color="var(--error-color)" />)
                }
              </div>

              {/* Content */}
              <div style={{ flex: 1 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <strong style={{ 
                      color: entry.action === 'register' ? 'var(--accent-color)' : 
                             (entry.alert_level === 'safe' ? 'var(--success-color)' : 'var(--error-color)'),
                      fontSize: '1rem',
                      textTransform: 'uppercase'
                    }}>
                      {entry.action === 'register' ? '✦ REGISTRATION' : 
                       (entry.alert_level === 'safe' ? '✓ VERIFIED' : '⚠ FORGERY ALERT')}
                    </strong>
                    {entry.owner && (
                      <span className="badge" style={{ background: 'rgba(56, 139, 253, 0.15)', color: 'var(--accent-color)', fontSize: '0.75rem', padding: '2px 8px', borderRadius: '12px' }}>
                        Owner: {entry.owner}
                      </span>
                    )}
                  </div>
                  <span style={{ color: 'var(--text-secondary)', fontSize: '0.8rem', display: 'flex', alignItems: 'center', gap: '4px' }}>
                    <Clock size={12} /> {entry.timestamp.slice(0, 19).replace('T', ' ')}
                  </span>
                </div>
                <p style={{ margin: 0, fontSize: '0.9rem', color: 'var(--text-secondary)' }}>
                  {entry.message}
                </p>

                {/* Row 1: File, IP, Hash */}
                <div style={{ display: 'flex', gap: '20px', marginTop: '10px', fontSize: '0.8rem', flexWrap: 'wrap' }}>
                  <span style={{ color: 'var(--text-secondary)' }}>
                    <strong>File:</strong> {entry.filename}
                  </span>
                  <span style={{ color: 'var(--text-secondary)' }}>
                    <strong>IP:</strong> {entry.client_ip}
                  </span>
                  <span style={{ color: 'var(--text-secondary)', fontFamily: 'monospace' }}>
                    Hash: {entry.doc_hash.slice(0, 16)}...
                  </span>
                </div>

                {/* Row 2: Location & Device */}
                <div style={{ 
                  display: 'flex', flexDirection: 'column', gap: '8px', marginTop: '10px',
                  padding: '10px 14px', background: 'rgba(0,0,0,0.3)', borderRadius: '8px',
                  border: '1px solid rgba(255,255,255,0.05)'
                }}>
                  <div style={{ display: 'flex', gap: '20px', fontSize: '0.8rem', flexWrap: 'wrap' }}>
                    <span style={{ color: entry.alert_level === 'danger' ? '#ff7b72' : 'var(--text-secondary)' }}>
                      <Globe size={12} style={{ verticalAlign: 'middle', marginRight: '4px' }} />
                      <strong>Location:</strong> {entry.location 
                        ? `${entry.location.city}, ${entry.location.country}` 
                        : 'Unknown'}
                    </span>
                    <span style={{ color: entry.alert_level === 'danger' ? '#ff7b72' : 'var(--text-secondary)' }}>
                      <strong>ISP:</strong> {entry.location?.isp || 'Unknown'}
                    </span>
                    <span style={{ color: 'var(--text-secondary)', maxWidth: '400px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      <strong>Browser:</strong> {entry.user_agent || 'Unknown'}
                    </span>
                  </div>

                  {entry.fingerprint && entry.fingerprint.timezone !== 'Unknown' && (
                    <div style={{ display: 'flex', gap: '20px', fontSize: '0.75rem', borderTop: '1px solid rgba(255,255,255,0.05)', paddingTop: '6px', color: 'rgba(255,255,255,0.5)' }}>
                      <span><strong>Timezone:</strong> {entry.fingerprint.timezone}</span>
                      <span><strong>Language:</strong> {entry.fingerprint.language}</span>
                      <span><strong>Resolution:</strong> {entry.fingerprint.screen}</span>
                      <span style={{ marginLeft: 'auto', fontStyle: 'italic', fontSize: '0.7rem' }}>Browser Fingerprint ID Active</span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default AuditLog;
