"""
crypto_utils.py
----------------
Digital signature utilities.

Why this matters for the project:
    Hashing/chaining (in blockchain_core.py) proves a credential has NOT
    been altered after being recorded. But it does NOT prove WHO issued it.

    Digital signatures solve that: the university (issuing authority) has a
    private key it keeps secret, and a public key it shares with everyone.
    It signs every credential with the private key. Anyone — an employer,
    another university — can use the public key to verify that:
        1. The credential really was issued by this university, AND
        2. Nobody altered it after signing.
"""

import json
from cryptography.hazmat.primitives.asymmetric import rsa, padding
from cryptography.hazmat.primitives import hashes, serialization
from cryptography.exceptions import InvalidSignature


class Authority:
    """
    Represents a credential-issuing authority (e.g. a university).
    Generates its own RSA key pair on creation.
    """

    def __init__(self, name):
        self.name = name
        self.private_key = rsa.generate_private_key(public_exponent=65537, key_size=2048)
        self.public_key = self.private_key.public_key()

    def sign_credential(self, credential: dict) -> str:
        """
        Signs a credential dict and returns the signature as a hex string.
        """
        message = json.dumps(credential, sort_keys=True).encode()
        signature = self.private_key.sign(
            message,
            padding.PSS(mgf=padding.MGF1(hashes.SHA256()), salt_length=padding.PSS.MAX_LENGTH),
            hashes.SHA256(),
        )
        return signature.hex()

    def get_public_key_pem(self) -> str:
        """Returns the public key in PEM format (what you'd share publicly)."""
        pem = self.public_key.public_bytes(
            encoding=serialization.Encoding.PEM,
            format=serialization.PublicFormat.SubjectPublicKeyInfo,
        )
        return pem.decode()


def verify_signature(credential: dict, signature_hex: str, public_key) -> bool:
    """
    Verifies that `credential` was really signed by the holder of the
    private key matching `public_key`, and that it hasn't been altered
    since signing.
    """
    message = json.dumps(credential, sort_keys=True).encode()
    signature = bytes.fromhex(signature_hex)
    try:
        public_key.verify(
            signature,
            message,
            padding.PSS(mgf=padding.MGF1(hashes.SHA256()), salt_length=padding.PSS.MAX_LENGTH),
            hashes.SHA256(),
        )
        return True
    except InvalidSignature:
        return False