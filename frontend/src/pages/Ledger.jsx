import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Database, Clock, FileText, User, Download, Link as LinkIcon, Info } from 'lucide-react';

const Ledger = () => {
  const [data, setData] = useState({ total: 0, blocks: [] });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchBlocks();
  }, []);

  const fetchBlocks = async () => {
    setLoading(true);
    try {
      const res = await axios.get('http://localhost:8000/api/blocks');
      setData({ total: res.data.total, blocks: res.data.blocks.reverse() });
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleDownloadIPFS = (cid) => {
    window.open(`http://localhost:8000/api/ipfs/${cid}`, '_blank');
  };

  return (
    <div className="page-container">
      <div className="page-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
        <div>
          <h1 className="page-title">Blockchain Ledger</h1>
          <p className="page-subtitle">Decentralized, immutable record of all registered documents.</p>
        </div>
        <div className="glass-panel" style={{ padding: '10px 20px', borderRadius: '30px' }}>
          <strong>Total Blocks:</strong> <span style={{ color: 'var(--accent-color)', fontSize: '1.2rem' }}>{data.total}</span>
        </div>
      </div>

      <div className="feature-info-box">
        <Info size={22} className="info-icon" color="var(--accent-color)" />
        <div>
          <h3>IPFS Storage & Document Amendments</h3>
          <p>
            <strong>IPFS (InterPlanetary File System):</strong> Each registered document is stored on a decentralized file network. The green "Download from IPFS" button lets you retrieve the exact original file using its unique Content Identifier (CID) — even years after registration.
            <br /><br />
            <strong>Amendments:</strong> Blocks tagged with a green "Amends Document" badge indicate that they are legal updates to a previously registered contract. This creates a transparent, chronological audit trail linking all versions of a legal agreement.
          </p>
        </div>
      </div>

      {loading ? (
        <p>Syncing with Blockchain...</p>
      ) : (
        <div className="ledger-timeline">
          {data.blocks.map(block => (
            <div className="block-card" key={block.index}>
              <div className="glass-panel" style={{ padding: '20px' }}>
                
                {/* Header */}
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '15px', borderBottom: '1px solid var(--panel-border)', paddingBottom: '15px' }}>
                  <h3 style={{ margin: 0 }}>Block #{block.index}</h3>
                  <span style={{ color: 'var(--text-secondary)', display: 'flex', alignItems: 'center', gap: '5px' }}>
                    <Clock size={16} /> {block.timestamp.slice(0, 19)}
                  </span>
                </div>
                
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
                  {/* Left Column */}
                  <div>
                    <p style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '10px' }}>
                      <FileText size={18} color="var(--accent-color)" />
                      <strong>Document:</strong> {block.doc_name}
                    </p>
                    <p style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '15px' }}>
                      <User size={18} color="var(--accent-hover)" />
                      <strong>Owner:</strong> {block.owner}
                    </p>
                    
                    {block.amends_hash && block.amends_hash !== "None" && (
                      <div className="alert alert-success" style={{ padding: '10px', fontSize: '0.85rem', marginBottom: '15px' }}>
                        <LinkIcon size={14} /> Amends Document: {block.amends_hash.slice(0, 16)}...
                      </div>
                    )}

                    {block.ipfs_cid && block.ipfs_cid !== "None" && (
                      <button 
                        className="btn-primary" 
                        style={{ padding: '8px 16px', fontSize: '0.85rem', background: '#2ea043' }}
                        onClick={() => handleDownloadIPFS(block.ipfs_cid)}
                      >
                        <Download size={14} /> Download from IPFS
                      </button>
                    )}
                  </div>
                  
                  {/* Right Column (Hashes) */}
                  <div style={{ fontSize: '0.85rem' }}>
                    {block.ipfs_cid && block.ipfs_cid !== "None" && (
                      <div style={{ marginBottom: '10px' }}>
                        <strong style={{ color: 'var(--text-secondary)' }}>IPFS CID:</strong>
                        <div className="code-block" style={{ marginTop: '2px', padding: '8px', color: '#3fb950' }}>{block.ipfs_cid}</div>
                      </div>
                    )}
                    <div style={{ marginBottom: '10px' }}>
                      <strong style={{ color: 'var(--text-secondary)' }}>PREVIOUS HASH:</strong>
                      <div className="code-block" style={{ marginTop: '2px', padding: '8px' }}>{block.previous_hash}</div>
                    </div>
                    <div>
                      <strong style={{ color: 'var(--text-secondary)' }}>BLOCK HASH:</strong>
                      <div className="code-block" style={{ marginTop: '2px', padding: '8px', border: '1px solid rgba(88, 166, 255, 0.3)' }}>{block.current_hash}</div>
                    </div>
                  </div>
                </div>
                
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Ledger;
