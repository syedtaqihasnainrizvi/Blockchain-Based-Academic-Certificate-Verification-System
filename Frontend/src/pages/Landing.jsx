import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import './Landing.css';

const fadeUp = {
  hidden: { opacity: 0, y: 24 },
  show: { opacity: 1, y: 0, transition: { duration: 0.6, ease: 'easeOut' } },
};

export default function Landing() {
  const navigate = useNavigate();

  return (
    <div className="landing">
      {/* ---------- HERO ---------- */}
      <section className="hero">
        <div className="hero-glow" />
        <nav className="landing-nav">
          <div className="landing-brand">
            <div className="landing-logo">🛡</div>
            <span>Tanm</span>
          </div>
          <button className="btn btn-ghost" onClick={() => navigate('/dashboard')}>
            Launch App →
          </button>
        </nav>

        <motion.div
          className="hero-content"
          initial="hidden"
          animate="show"
          variants={fadeUp}
        >
          <div className="hero-eyebrow">Blockchain Architecture Project</div>
          <h1 className="hero-title">
            Academic Credentials,<br />
            <span className="hero-title-accent">Verified On-Chain.</span>
          </h1>
          <p className="hero-subtitle">
            A permissioned blockchain system where universities sign and seal
            student credentials with cryptographic proof — tamper-evident,
            consensus-validated, instantly verifiable.
          </p>
          <div className="hero-actions">
            <button className="btn btn-primary btn-lg" onClick={() => navigate('/dashboard')}>
              Launch Dashboard
            </button>
            <button className="btn btn-ghost btn-lg" onClick={() => navigate('/chain')}>
              View Live Chain
            </button>
          </div>
        </motion.div>

        <motion.div
          className="hero-chain-preview"
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
        >
          <PreviewChain />
        </motion.div>
      </section>

      {/* ---------- PROBLEM STATEMENT ---------- */}
      <Section eyebrow="The Problem" title="Paper certificates can be forged. Verification is slow and manual.">
        <div className="problem-grid">
          <ProblemCard
            icon="✕"
            title="Forgery"
            text="Physical and PDF credentials are trivially editable, with no built-in way to detect tampering."
          />
          <ProblemCard
            icon="⏱"
            title="Slow Verification"
            text="Employers and institutions must call or email the issuing university and wait days for confirmation."
          />
          <ProblemCard
            icon="⚠"
            title="No Single Source of Truth"
            text="Records live in disconnected silos — registrar databases, PDFs, photocopies — each editable independently."
          />
        </div>
      </Section>

      {/* ---------- ARCHITECTURE LAYERS ---------- */}
      <Section eyebrow="The Architecture" title="Four layers, working together.">
        <div className="layer-stack">
          <LayerRow
            num="01"
            title="Data Layer"
            text="Each Block stores a Merkle root of its credentials, a previous_hash pointer, and its own hash — the chain of custody."
          />
          <LayerRow
            num="02"
            title="Security Layer"
            text="The issuing university signs every credential with an RSA private key. Anyone can verify it with the public key — proving authenticity and integrity."
          />
          <LayerRow
            num="03"
            title="Consensus Layer"
            text="Proof-of-Authority: a fixed set of trusted registrar nodes vote. A majority must approve before a block is sealed."
          />
          <LayerRow
            num="04"
            title="Application Layer"
            text="A web dashboard for issuing, sealing, verifying credentials, and visualizing the chain — with a live tamper-detection demo."
          />
        </div>
      </Section>

      {/* ---------- WHY POA NOT POW ---------- */}
      <Section eyebrow="Design Justification" title="Why Proof-of-Authority, not Proof-of-Work?">
        <div className="compare-grid">
          <div className="compare-card compare-card-out">
            <div className="compare-label">Proof-of-Work (Bitcoin-style)</div>
            <ul>
              <li>Built for public, trustless, anonymous networks</li>
              <li>Needs expensive computation to deter spam attacks</li>
              <li>Slow block times, high energy cost</li>
              <li>Overkill when participants are already known</li>
            </ul>
          </div>
          <div className="compare-card compare-card-in">
            <div className="compare-label">Proof-of-Authority (this project)</div>
            <ul>
              <li>Fits a <strong>permissioned</strong> network of known registrars</li>
              <li>No wasted computation — fast, majority-vote sealing</li>
              <li>Mirrors real consortium chains (Hyperledger Fabric)</li>
              <li>Validator identity itself is the trust mechanism</li>
            </ul>
          </div>
        </div>
      </Section>

      {/* ---------- TAMPER EVIDENCE ---------- */}
      <Section eyebrow="The 'Wow' Moment" title="Watch the chain break in real time.">
        <p className="section-lead">
          Corrupt a block directly — bypassing consensus and signatures entirely —
          and the dashboard visibly shows the broken link, the failed hash check,
          and exactly which block was compromised.
        </p>
        <button className="btn btn-primary btn-lg" onClick={() => navigate('/tamper')}>
          Try the Tamper Demo →
        </button>
      </Section>

          <footer className="landing-footer">
      <span>Tanm — Academic Credential Verification System</span>
      <span>Created by: Syed Mohd Taqi Hasnain Rizvi[LEADER], Suhail Ansari & Syed Mohd Murtaza Husain</span>
      <span>Blockchain Architecture Design Submission</span>
    </footer>
    </div>
  );
}

function Section({ eyebrow, title, children }) {
  return (
    <motion.section
      className="landing-section"
      initial="hidden"
      whileInView="show"
      viewport={{ once: true, margin: '-80px' }}
      variants={fadeUp}
    >
      <div className="section-eyebrow">{eyebrow}</div>
      <h2 className="section-title">{title}</h2>
      {children}
    </motion.section>
  );
}

function ProblemCard({ icon, title, text }) {
  return (
    <div className="problem-card">
      <div className="problem-icon">{icon}</div>
      <div className="problem-title">{title}</div>
      <div className="problem-text">{text}</div>
    </div>
  );
}

function LayerRow({ num, title, text }) {
  return (
    <div className="layer-row">
      <div className="layer-num">{num}</div>
      <div className="layer-body">
        <div className="layer-title">{title}</div>
        <div className="layer-text">{text}</div>
      </div>
    </div>
  );
}

function PreviewChain() {
  const blocks = [0, 1, 2, 3];
  return (
    <div className="preview-chain">
      {blocks.map((b, i) => (
        <div className="preview-chain-item" key={b}>
          {i > 0 && <div className="preview-link" />}
          <div className="preview-block">
            <div className="preview-block-label">{b === 0 ? 'GENESIS' : `BLOCK #${b}`}</div>
            <div className="preview-block-hash">0x{(b + 1).toString(16).repeat(8)}</div>
          </div>
        </div>
      ))}
    </div>
  );
}