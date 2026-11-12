import { useState } from 'react';
import { motion } from 'framer-motion';
import { tamperDemo } from '../api/client';
import { useNavigate } from 'react-router-dom';

export default function TamperDemo({ showToast }) {
  const [result, setResult] = useState(null);
  const [running, setRunning] = useState(false);
  const navigate = useNavigate();

  const handleTamper = async () => {
    setRunning(true);
    try {
      const res = await tamperDemo();
      setResult(res.data);
      showToast(res.message, 'error');
    } catch (e) {
      const msg = e.response?.data?.error || 'Tamper demo failed.';
      showToast(msg, 'error');
    } finally {
      setRunning(false);
    }
  };

  return (
    <div>
      <div className="page-header">
        <div className="page-title">Tamper Demo</div>
        <div className="page-subtitle">Directly corrupt a block, bypassing consensus & signatures</div>
      </div>

      <div className="panel" style={{ maxWidth: 640 }}>
        <p className="tamper-explainer">
          This simulates an attacker with raw database access editing a credential
          record directly — skipping PoA consensus and university signing entirely.
          Block #1's stored hash will no longer match its recomputed hash, which is
          exactly how tamper-evidence is detected.
        </p>
        <button className="btn btn-danger" onClick={handleTamper} disabled={running} style={{ marginTop: 16 }}>
          {running ? 'Tampering…' : 'Tamper With Block #1'}
        </button>

        {result && (
          <motion.div
            initial={{ opacity: 0, scale: 0.97 }}
            animate={{ opacity: 1, scale: 1 }}
            className={`tamper-result ${result.is_valid ? 'tamper-result-ok' : 'tamper-result-bad'}`}
          >
            <div className="tamper-result-title">
              {result.is_valid ? 'Chain still valid (unexpected)' : 'CHAIN INTEGRITY BROKEN'}
            </div>
            <div className="tamper-result-message">{result.validity_message}</div>
            <button
              className="btn btn-ghost"
              style={{ marginTop: 14 }}
              onClick={() => navigate('/chain')}
            >
              View it on the Chain Visualization →
            </button>
          </motion.div>
        )}
      </div>
    </div>
  );
}