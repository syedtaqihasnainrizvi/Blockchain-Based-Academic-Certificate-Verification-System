# 🛡 tanm — Blockchain-Based Academic Certificate  Verification System

![Status](https://img.shields.io/badge/status-live-brightgreen)
![Backend](https://img.shields.io/badge/backend-Flask%20%2B%20Python-blue)
![Frontend](https://img.shields.io/badge/frontend-React%20%2B%20Vite-61dafb)
![Consensus](https://img.shields.io/badge/consensus-Proof%20of%20Authority-green)
![Crypto](https://img.shields.io/badge/crypto-RSA%20%2B%20SHA--256-orange)
![License](https://img.shields.io/badge/license-MIT-lightgrey)

> A permissioned blockchain system for issuing, sealing, and verifying
> academic credentials — with cryptographic signing, Proof-of-Authority
> consensus, Merkle tree batching, and real-time tamper detection.

---

## 🌐 Live Demo

| Service | URL |
|---|---|
| 🖥 Frontend (Vercel) | https://credchain-seven.vercel.app |
| ⚙️ Backend API (Render) | https://credchain-api-ncgc.onrender.com/api/health |

> **Note:** The Render backend is on a free tier — it spins down after
> inactivity. If the first request is slow (~30s), just wait for it to
> wake up. All subsequent requests are fast.

---

## 📸 Screenshots

> Dashboard · Issue · Verify · Chain Visualization · Tamper Demo

---

## 🏗 Architecture

```
┌─────────────────────────────────────────────────────────┐
│                    APPLICATION LAYER                     │
│         React Frontend  ←→  Flask REST API              │
├─────────────────────────────────────────────────────────┤
│                    CONSENSUS LAYER                       │
│     Proof-of-Authority — 3 Validator Nodes              │
│     Majority vote required to seal each block           │
├─────────────────────────────────────────────────────────┤
│                    SECURITY LAYER                       │
│     RSA-2048 Digital Signatures (per credential)        │
│     SHA-256 Hash Chaining (per block)                   │
├─────────────────────────────────────────────────────────┤
│                      DATA LAYER                         │
│     Block → MerkleTree → Blockchain                     │
│     Each block stores a Merkle root of credentials      │
└─────────────────────────────────────────────────────────┘
```

---

## 🔑 Key Design Decisions

### Why Proof-of-Authority, not Proof-of-Work?

| | Proof-of-Work | Proof-of-Authority |
|---|---|---|
| Network type | Public, trustless | Permissioned, known validators |
| Trust mechanism | Computational cost | Validator identity |
| Speed | Slow (minutes) | Fast (instant majority vote) |
| Energy | Extremely high | Negligible |
| Real-world use | Bitcoin | **Hyperledger Fabric, this project** |

A university certificate verification system has a **known, fixed set of participants**
(registrar offices). PoW's expensive computation serves no purpose here —
PoA is the industry-standard choice for exactly this use case.

### Why Merkle Trees?

Rather than hashing each credential individually into its own block,
credentials are **batched** into a Merkle tree. The root hash of the tree
is stored in the block. This means:
- Many credentials fit in one block (efficient)
- Any single credential can be proven to belong to a block without
  re-hashing everything (scalable verification)

### Why RSA Signatures?

Hash chaining proves a credential **hasn't changed** after being recorded.
But it doesn't prove **who issued it**. RSA signatures solve that:
the university signs every credential with its private key. Anyone can
verify authenticity using the public key — without contacting the university.

---

## 📁 Project Structure

```
tanm/
├── backend/
│   ├── app.py              # Flask REST API (11 routes)
│   ├── blockchain_core.py  # Block, MerkleTree, Blockchain
│   ├── crypto_utils.py     # RSA signing + verification
│   ├── consensus.py        # PoA validator nodes + voting
│   ├── requirements.txt
│   └── Procfile            # Render deployment config
│
└── frontend/
    ├── src/
    │   ├── api/client.js       # Axios API wrapper
    │   ├── components/         # Sidebar, Toast
    │   └── pages/
    │       ├── Landing.jsx         # Marketing home page
    │       ├── Dashboard.jsx       # Live chain status
    │       ├── IssueCredential.jsx # Sign + queue credentials
    │       ├── VerifyCredential.jsx# Verify by certificate ID
    │       ├── ChainVisualization.jsx # Animated block nodes
    │       └── TamperDemo.jsx      # Live tamper detection
    └── vite.config.js
```

---

## 🚀 Running Locally

### Backend

```bash
cd backend
python -m venv venv
venv\Scripts\activate        # Windows
pip install -r requirements.txt
python app.py                # Runs on http://localhost:5000
```

### Frontend

```bash
cd frontend
npm install
npm run dev                  # Runs on http://localhost:3000
```

---

## 🔌 API Reference

| Method | Route | Description |
|---|---|---|
| GET | `/api/health` | Liveness check |
| GET | `/api/chain` | Full chain + validity + validators |
| GET | `/api/chain/validity` | `{is_valid, message}` |
| GET | `/api/pending` | Pending unsealed credentials |
| POST | `/api/issue` | Sign + queue a credential |
| POST | `/api/seal-block` | Run PoA consensus, seal block |
| GET | `/api/verify/<id>` | Verify credential by ID |
| POST | `/api/tamper-demo` | Corrupt block #1 (demo) |
| POST | `/api/reset` | Reset chain to genesis |
| GET | `/api/validators` | Validator node status |
| POST | `/api/validators/<id>/toggle` | Toggle node online/offline |

---

## 🎓 Academic Context

This working prototype (**tanm**) was developed as a **4th Year External Project Assignment** for the **B.Tech in Computer Science & Engineering(CSE)** program under the topic **"Blockchain-Based Academic Certificate Verification System"**. 

The project solves real-world certificate forgery and slow manual verification by implementing:
- **Layered Blockchain Architecture:** Clear separation of Data, Security, Consensus, and Application layers.
- **Proof-of-Authority (PoA) Consensus:** Fast, energy-efficient block sealing using trusted registrar validator nodes instead of heavy Proof-of-Work mining.
- **RSA-2048 Digital Signatures:** Cryptographic signing by the issuing institution to prove certificate authenticity without needing direct database access.
- **Merkle Tree Batching:** Efficient grouping of multiple academic credentials into a single block root hash.
- **Real-Time Tamper Detection:** Instant detection of any unauthorized modification via SHA-256 hash chain validation.
- **Full-Stack Implementation:** End-to-end working web application built with a **Python/Flask** backend and a **React/Vite** frontend.

---

## 🛠 Tech Stack

**Backend:** Python 3, Flask, flask-cors, cryptography (RSA), gunicorn

**Frontend:** React 18, Vite, framer-motion, axios, react-router-dom

**Deployment:** Render (backend) · Vercel (frontend) · GitHub (source)

---

*👨‍💻 Developed By (B.Tech CSE — 4th Year)*
- **Syed Mohd Taqi Hasnain Rizvi**(Leader)
- **Suhail Ansari**
- **Syed Mohd Murtaza Husain**