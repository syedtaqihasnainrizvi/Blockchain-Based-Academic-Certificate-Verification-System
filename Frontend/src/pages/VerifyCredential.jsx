import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { verifyCredential } from '../api/client';

export default function VerifyCredential({ showToast }) {
  const [certId, setCertId] = useState('');
  const [result, setResult] = useState(null);
  const [searching, setSearching] = useState(false);

  const handleSearch = async (e) => {
    e.preventDefault();
    if (!certId.trim()) return;
    setSearching(true);
    setResult(null);
    try {
      const data = await verifyCredential(certId.trim());
      setResult(data);
    } catch (e) {
      showToast('Verification request failed.', 'error');
    } finally {
      setSearching(false);
    }
  };

  return (
    <div>
      <div className="page-header">
        <div className="page-title">Verify Credential</div>
        <div className="page-subtitle">Look up a certificate by ID and check its signature</div>
      </div>

      <div className="panel" style={{ maxWidth: 560 }}>
        <form onSubmit={handleSearch} style={{ display: 'flex', gap: 12 }}>
          <input
            className="input-field"
            style={{ flex: 1 }}
            value={certId}
            onChange={(e) => setCertId(e.target.value)}
            placeholder="Enter Certificate ID, e.g. CERT-2026-001"
          />
          <button className="btn btn-primary" type="submit" disabled={searching}>
            {searching ? 'Searching…' : 'Verify'}
          </button>
        </form>
      </div>

      <AnimatePresence>
        {result && (
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            className="panel"
            style={{ maxWidth: 560, marginTop: 20 }}
          >
            {!result.found ? (
              <div className="verify-not-found">No credential found with that Certificate ID.</div>
            ) : (
              <>
                <div className={`verify-banner ${result.signature_valid ? 'verify-banner-ok' : 'verify-banner-bad'}`}>
                  {result.signature_valid ? '✓ AUTHENTIC — Signature Valid' : '✕ INVALID SIGNATURE'}
                </div>
                <div className="verify-detail-grid">
                  <DetailRow label="Student" value={result.credential.student_name} />
                  <DetailRow label="Certificate ID" value={result.credential.certificate_id} />
                  <DetailRow label="Course" value={result.credential.course} />
                  <DetailRow label="Grade" value={result.credential.grade} />
                  <DetailRow label="Year" value={result.credential.year} />
                  <DetailRow label="Issuer" value={result.credential.issuer} />
                  <DetailRow label="Sealed in Block" value={`#${result.block_index}`} />
                  <DetailRow label="Block Hash" value={result.block_hash} mono />
                </div>
              </>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function DetailRow({ label, value, mono }) {
  return (
    <div className="detail-row">
      <span className="detail-label">{label}</span>
      <span className={mono ? 'truncate-hash' : 'detail-value'}>{value}</span>
    </div>
  );
}