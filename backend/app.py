"""
app.py
-------
Flask JSON REST API for the Academic Credential Verification System (CredChain).

This is a pure API backend — no server-rendered templates. All routes return
JSON. A separate React frontend (localhost:3000) consumes this API
(localhost:5000) over CORS.
"""

from flask import Flask, jsonify, request
from flask_cors import CORS

from blockchain_core import Blockchain
from crypto_utils import Authority, verify_signature
from consensus import PoAConsensus

app = Flask(__name__)

CORS(app, resources={r"/api/*": {"origins": [
    "http://localhost:3000",
    "https://credchain-seven.vercel.app",
]}})

blockchain = Blockchain()
university = Authority("State University Registrar Office")
poa = PoAConsensus(["RegistrarNode-A", "RegistrarNode-B", "RegistrarNode-C"])

pending_credentials = []


def ok(data=None, message=None, status=200):
    body = {"success": True}
    if message is not None:
        body["message"] = message
    if data is not None:
        body["data"] = data
    return jsonify(body), status


def err(message, status=400):
    return jsonify({"success": False, "error": message}), status


@app.route("/api/health")
def health():
    return ok({"status": "up", "chain_length": len(blockchain.chain)})


@app.route("/api/chain")
def api_chain():
    chain_data = blockchain.to_dict_list()
    is_valid, message = blockchain.is_chain_valid()
    return ok({
        "chain": chain_data,
        "length": len(blockchain.chain),
        "is_valid": is_valid,
        "validity_message": message,
        "pending_count": len(pending_credentials),
        "validators": poa.get_status(),
    })


@app.route("/api/chain/validity")
def chain_validity():
    is_valid, message = blockchain.is_chain_valid()
    return ok({"is_valid": is_valid, "message": message})


@app.route("/api/pending")
def get_pending():
    return ok({"pending": pending_credentials, "count": len(pending_credentials)})


@app.route("/api/issue", methods=["POST"])
def issue_credential():
    payload = request.get_json(silent=True) or {}

    certificate_id = (payload.get("certificate_id") or "").strip()
    student_name = (payload.get("student_name") or "").strip()
    course = (payload.get("course") or "").strip()
    grade = (payload.get("grade") or "").strip()
    year = (payload.get("year") or "").strip()

    missing = [
        field for field, value in [
            ("certificate_id", certificate_id),
            ("student_name", student_name),
            ("course", course),
            ("grade", grade),
            ("year", year),
        ] if not value
    ]
    if missing:
        return err(f"Missing required field(s): {', '.join(missing)}", status=422)

    if blockchain.find_credential(certificate_id):
        return err(f"Certificate ID '{certificate_id}' already exists in the sealed chain.", status=409)
    if any(c["certificate_id"] == certificate_id for c in pending_credentials):
        return err(f"Certificate ID '{certificate_id}' is already pending in this batch.", status=409)

    credential = {
        "certificate_id": certificate_id,
        "student_name": student_name,
        "course": course,
        "grade": grade,
        "year": year,
        "issuer": university.name,
    }

    signature = university.sign_credential(credential)
    credential["signature"] = signature

    pending_credentials.append(credential)

    return ok(
        {"credential": credential, "pending_count": len(pending_credentials)},
        message=f"Credential for {student_name} (ID: {certificate_id}) signed and added to pending batch.",
        status=201,
    )


@app.route("/api/seal-block", methods=["POST"])
def seal_block():
    global pending_credentials

    if not pending_credentials:
        return err("No pending credentials to seal into a block.", status=400)

    approved, votes, validator = poa.reach_consensus(pending_credentials)

    if approved:
        new_block = blockchain.add_block(pending_credentials.copy(), validator)
        sealed_count = len(pending_credentials)
        pending_credentials = []
        return ok(
            {
                "block": new_block.to_dict(),
                "votes": votes,
                "validator": validator,
                "sealed_count": sealed_count,
            },
            message=f"Consensus reached! Block #{new_block.index} sealed by {validator}.",
            status=201,
        )
    else:
        return err(
            "PoA consensus FAILED — not enough validator nodes online/approved.",
            status=409,
        )


@app.route("/api/verify/<certificate_id>")
def verify_credential(certificate_id):
    found = blockchain.find_credential(certificate_id)

    if not found:
        return ok({"found": False}, status=200)

    cred = found["credential"].copy()
    signature = cred.pop("signature", None)
    sig_valid = verify_signature(cred, signature, university.public_key) if signature else False

    return ok({
        "found": True,
        "block_index": found["block_index"],
        "block_hash": found["block_hash"],
        "credential": found["credential"],
        "signature_valid": sig_valid,
    })


@app.route("/api/tamper-demo", methods=["POST"])
def tamper_demo():
    if len(blockchain.chain) <= 1:
        return err(
            "Need at least one real block before running the tamper demo. Issue and seal a credential first.",
            status=400,
        )

    fake = {
        "certificate_id": "FAKE-9999",
        "student_name": "Attacker Inserted Record",
        "course": "N/A",
        "grade": "A+",
        "year": "2099",
        "issuer": "UNKNOWN",
    }
    blockchain.tamper_block(1, fake)

    is_valid, validity_message = blockchain.is_chain_valid()

    return ok(
        {
            "tampered_block_index": 1,
            "is_valid": is_valid,
            "validity_message": validity_message,
            "chain": blockchain.to_dict_list(),
        },
        message="Block #1 was just tampered with directly (bypassing consensus & signatures).",
    )


@app.route("/api/reset", methods=["POST"])
def reset_chain():
    """Dev/demo convenience: wipe state back to a fresh genesis chain."""
    global blockchain, pending_credentials
    blockchain = Blockchain()
    pending_credentials = []
    return ok({"chain": blockchain.to_dict_list()}, message="Chain reset to genesis.")


@app.route("/api/validators")
def get_validators():
    return ok({"validators": poa.get_status()})


@app.route("/api/validators/<int:node_id>/toggle", methods=["POST"])
def toggle_validator(node_id):
    current = next((n for n in poa.get_status() if n["node_id"] == node_id), None)
    if not current:
        return err(f"No validator node with id {node_id}.", status=404)

    poa.set_node_status(node_id, not current["online"])
    return ok({"validators": poa.get_status()})


if __name__ == "__main__":
    app.run(debug=True, host="0.0.0.0", port=5000)