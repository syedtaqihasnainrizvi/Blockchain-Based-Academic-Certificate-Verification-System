import { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import { getPending, issueCredential, sealBlock } from '../api/client';

const emptyForm = { certificate_id: '', student_name: '', course: '', grade: '', year: '' };

export default function IssueCredential({ showToast }) {
  const [form, setForm] = useState(emptyForm);
  const [pending, setPending] = useState([]);
  const [submitting, setSubmitting] = useState(false);
  const [sealing, setSealing] = useState(false);

  const loadPending = useCallback(async () => {
    try {
      const data = await getPending();
      setPending(data.pending);
    } catch (e) {
      /* silent - dashboard will surface connectivity errors */
    }
  }, []);

  useEffect(() => {
    loadPending();
  }, [loadPending]);

  const handleChange = (field) => (e) => setForm((f) => ({ ...f, [field]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const res = await issueCredential(form);
      showToast(res.message, 'success');
      setForm(emptyForm);
      loadPending();
    } catch (e) {
      const msg = e.response?.data?.error || 'Failed to issue credential.';
      showToast(msg, 'error');
    } finally {
      setSubmitting(false);
    }
  };

  const handleSeal = async () => {
    setSealing(true);
    try {
      const res = await sealBlock();
      showToast(res.message, 'success');
      loadPending();
    } catch (e) {
      const msg = e.response?.data?.error || 'Failed to seal block.';
      showToast(msg, 'error');
    } finally {
      setSealing(false);
    }
  };

  return (
    <div>
      <div className="page-header">
        <div className="page-title">Issue Credential</div>
        <div className="page-subtitle">Sign a new credential and queue it for sealing</div>
      </div>

      <div className="grid-main-side">
        <div className="panel">
          <div className="panel-title">New Credential</div>
          <form onSubmit={handleSubmit}>
            <div className="input-group">
              <label className="input-label">Certificate ID</label>
              <input className="input-field" value={form.certificate_id} onChange={handleChange('certificate_id')} placeholder="CERT-2026-001" required />
            </div>
            <div className="input-group">
              <label className="input-label">Student Name</label>
              <input className="input-field" value={form.student_name} onChange={handleChange('student_name')} placeholder="Asha Rao" required />
            </div>
            <div className="grid-2">
              <div className="input-group">
                <label className="input-label">Course</label>
                <input className="input-field" value={form.course} onChange={handleChange('course')} placeholder="B.Tech CSE" required />
              </div>
              <div className="input-group">
                <label className="input-label">Grade</label>
                <input className="input-field" value={form.grade} onChange={handleChange('grade')} placeholder="A+" required />
              </div>
            </div>
            <div className="input-group">
              <label className="input-label">Year</label>
              <input className="input-field" value={form.year} onChange={handleChange('year')} placeholder="2026" required />
            </div>
            <button className="btn btn-primary" type="submit" disabled={submitting} style={{ width: '100%', marginTop: 8 }}>
              {submitting ? 'Signing…' : 'Sign & Queue Credential'}
            </button>
          </form>
        </div>

        <div className="panel">
          <div className="panel-title">Pending Batch ({pending.length})</div>
          {pending.length === 0 ? (
            <div className="empty-state">No credentials pending. Issue one to begin a new batch.</div>
          ) : (
            <div className="pending-list">
              {pending.map((c) => (
                <motion.div key={c.certificate_id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="pending-item">
                  <div className="pending-item-name">{c.student_name}</div>
                  <div className="pending-item-meta">{c.certificate_id} · {c.course}</div>
                </motion.div>
              ))}
            </div>
          )}
          <button
            className="btn btn-primary"
            style={{ width: '100%', marginTop: 16 }}
            disabled={pending.length === 0 || sealing}
            onClick={handleSeal}
          >
            {sealing ? 'Running PoA Consensus…' : 'Seal Block (Run Consensus)'}
          </button>
        </div>
      </div>
    </div>
  );
}