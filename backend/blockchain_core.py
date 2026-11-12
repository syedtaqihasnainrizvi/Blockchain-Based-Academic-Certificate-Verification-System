"""
blockchain_core.py
------------------
Core blockchain data structures for the Academic Credential Verification System.

Contains:
    - MerkleTree   : Batches multiple credentials into a single root hash per block
    - Block        : A single block in the chain
    - Blockchain   : The chain itself, with validation and tamper detection
"""

import hashlib
import json
import time


# ---------------------------------------------------------------------------
# MERKLE TREE
# ---------------------------------------------------------------------------
class MerkleTree:
    """
    Builds a Merkle tree from a list of credential records and exposes the
    root hash. This lets us store many credentials in ONE block while still
    being able to prove any single credential belongs to that block,
    without re-hashing everything.
    """

    def __init__(self, credentials):
        # credentials: list of dicts (each dict = one credential record)
        self.leaves = [self._hash_record(c) for c in credentials]
        self.root = self._build_tree(self.leaves) if self.leaves else self._hash_record({})

    @staticmethod
    def _hash_record(record):
        record_string = json.dumps(record, sort_keys=True)
        return hashlib.sha256(record_string.encode()).hexdigest()

    def _build_tree(self, leaves):
        if len(leaves) == 1:
            return leaves[0]

        new_level = []
        for i in range(0, len(leaves), 2):
            left = leaves[i]
            # if odd number of leaves, pair the last one with itself
            right = leaves[i + 1] if i + 1 < len(leaves) else leaves[i]
            combined = left + right
            new_level.append(hashlib.sha256(combined.encode()).hexdigest())

        return self._build_tree(new_level)

    def get_root(self):
        return self.root


# ---------------------------------------------------------------------------
# BLOCK
# ---------------------------------------------------------------------------
class Block:
    """
    A single block in the credential chain.

    Each block stores:
        - index            : position in the chain
        - timestamp        : when it was created
        - credentials      : list of credential records in this block
        - merkle_root       : root hash of all credentials in this block
        - previous_hash    : hash of the block before this one (the "link")
        - validator        : which authority node validated this block (PoA)
        - nonce            : kept for extensibility / educational completeness
        - hash             : this block's own hash
    """

    def __init__(self, index, credentials, previous_hash, validator="Genesis"):
        self.index = index
        self.timestamp = time.time()
        self.credentials = credentials
        self.merkle_root = MerkleTree(credentials).get_root()
        self.previous_hash = previous_hash
        self.validator = validator
        self.nonce = 0
        self.hash = self.compute_hash()

    def compute_hash(self):
        """
        The block's hash is derived from everything inside it.
        If even one character of any credential changes, this hash changes
        completely — that's the tamper-evidence property.
        """
        block_content = {
            "index": self.index,
            "timestamp": self.timestamp,
            "merkle_root": self.merkle_root,
            "previous_hash": self.previous_hash,
            "validator": self.validator,
            "nonce": self.nonce,
        }
        block_string = json.dumps(block_content, sort_keys=True)
        return hashlib.sha256(block_string.encode()).hexdigest()

    def to_dict(self):
        return {
            "index": self.index,
            "timestamp": self.timestamp,
            "credentials": self.credentials,
            "merkle_root": self.merkle_root,
            "previous_hash": self.previous_hash,
            "validator": self.validator,
            "nonce": self.nonce,
            "hash": self.hash,
        }


# ---------------------------------------------------------------------------
# BLOCKCHAIN
# ---------------------------------------------------------------------------
class Blockchain:
    """
    The chain of blocks. Provides:
        - add_block()        : append a new validated block
        - is_chain_valid()   : walk the whole chain and verify integrity
        - tamper_block()     : (for demo purposes) deliberately corrupt a block
        - find_credential()  : search for a credential by certificate ID
    """

    def __init__(self):
        self.chain = [self._create_genesis_block()]

    def _create_genesis_block(self):
        return Block(index=0, credentials=[{"info": "Genesis Block - Credential Chain Initialized"}],
                     previous_hash="0", validator="System")

    def get_latest_block(self):
        return self.chain[-1]

    def add_block(self, credentials, validator):
        new_block = Block(
            index=len(self.chain),
            credentials=credentials,
            previous_hash=self.get_latest_block().hash,
            validator=validator,
        )
        self.chain.append(new_block)
        return new_block

    def is_chain_valid(self):
        """
        Returns (True, "OK") if the chain is untampered, or
        (False, reason) pointing at exactly where the tampering was detected.
        """
        for i in range(1, len(self.chain)):
            current = self.chain[i]
            previous = self.chain[i - 1]

            # Check 1: does this block's stored hash match what it SHOULD be
            # if we recompute it right now from its current contents?
            if current.hash != current.compute_hash():
                return False, f"Block {current.index} data has been tampered with (hash mismatch)."

            # Check 2: does this block correctly point to the previous block?
            if current.previous_hash != previous.hash:
                return False, f"Block {current.index} is not correctly linked to Block {previous.index} (chain broken)."

        return True, "Blockchain is valid. No tampering detected."

    def tamper_block(self, index, fake_credential):
        """
        FOR DEMO PURPOSES ONLY.
        Simulates an attacker editing a credential directly in storage
        without going through proper consensus or re-signing.
        """
        if 0 <= index < len(self.chain):
            block = self.chain[index]
            block.credentials.append(fake_credential)
            block.merkle_root = MerkleTree(block.credentials).get_root()
            return True
        return False

    def find_credential(self, certificate_id):
        """Search every block for a credential with the given certificate_id."""
        for block in self.chain:
            for cred in block.credentials:
                if cred.get("certificate_id") == certificate_id:
                    return {"block_index": block.index, "credential": cred, "block_hash": block.hash}
        return None

    def to_dict_list(self):
        return [block.to_dict() for block in self.chain]