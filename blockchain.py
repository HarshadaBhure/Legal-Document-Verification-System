import json
import os
from datetime import datetime
from utils import hash_document, hash_block

BLOCKCHAIN_FILE = "data/blockchain.json"

class Block:
    def __init__(self, index, timestamp, doc_name, doc_hash, owner, previous_hash, ipfs_cid=None, amends_hash=None):
        self.index = index
        self.timestamp = timestamp
        self.doc_name = doc_name
        self.doc_hash = doc_hash
        self.owner = owner
        self.ipfs_cid = ipfs_cid
        self.amends_hash = amends_hash
        self.previous_hash = previous_hash
        self.current_hash = self._calculate_hash()

    def _calculate_hash(self):
        # Using string conversion for None values to keep it deterministic
        block_string = f"{self.index}{self.timestamp}{self.doc_name}{self.doc_hash}{self.owner}{self.ipfs_cid}{self.amends_hash}{self.previous_hash}"
        return hash_block(block_string)

    def to_dict(self):
        return {
            "index": self.index,
            "timestamp": self.timestamp,
            "doc_name": self.doc_name,
            "doc_hash": self.doc_hash,
            "owner": self.owner,
            "ipfs_cid": self.ipfs_cid,
            "amends_hash": self.amends_hash,
            "previous_hash": self.previous_hash,
            "current_hash": self.current_hash
        }

    @staticmethod
    def from_dict(data):
        b = Block(
            data["index"], data["timestamp"], data["doc_name"],
            data["doc_hash"], data["owner"], data["previous_hash"],
            data.get("ipfs_cid"), data.get("amends_hash")
        )
        b.current_hash = data["current_hash"]
        return b


class Blockchain:
    def __init__(self):
        os.makedirs("data", exist_ok=True)
        self.chain = self._load_chain()
        if not self.chain:
            self.chain = [self._create_genesis_block()]
            self._save_chain()

    def _create_genesis_block(self):
        return Block(0, str(datetime.now()), "Genesis Block", "0", "System", "0", "None", "None")

    def _load_chain(self):
        if os.path.exists(BLOCKCHAIN_FILE):
            try:
                with open(BLOCKCHAIN_FILE, "r") as f:
                    content = f.read().strip()
                    if not content:  # File is empty
                        return []
                    data = json.loads(content)
                    return [Block.from_dict(b) for b in data]
            except (json.JSONDecodeError, KeyError):
                return []  # Corrupted or invalid file, start fresh
        return []

    def _save_chain(self):
        with open(BLOCKCHAIN_FILE, "w") as f:
            json.dump([b.to_dict() for b in self.chain], f, indent=2)

    def get_latest_block(self):
        return self.chain[-1]

    def add_document(self, doc_name, doc_hash, owner, ipfs_cid=None, amends_hash=None):
        """Register a new document on the blockchain."""
        # Check for duplicate document hash
        for block in self.chain[1:]:
            if block.doc_hash == doc_hash:
                return None, "Document already registered on blockchain."

        # If amending, make sure the previous hash exists
        if amends_hash:
            found = any(block.doc_hash == amends_hash for block in self.chain[1:])
            if not found:
                return None, "The document you are trying to amend does not exist on the blockchain."

        new_block = Block(
            index=len(self.chain),
            timestamp=str(datetime.now()),
            doc_name=doc_name,
            doc_hash=doc_hash,
            owner=owner,
            ipfs_cid=ipfs_cid,
            amends_hash=amends_hash,
            previous_hash=self.get_latest_block().current_hash
        )
        self.chain.append(new_block)
        self._save_chain()
        return new_block, "Document successfully registered!"

    def verify_document(self, doc_hash):
        """Verify if a document exists and is untampered."""
        for block in self.chain[1:]:
            if block.doc_hash == doc_hash:
                return True, block
        return False, None

    def is_chain_valid(self):
        """Validate the entire blockchain integrity."""
        for i in range(1, len(self.chain)):
            current = self.chain[i]
            previous = self.chain[i - 1]

            # Recalculate hash and compare
            recalc = hash_block(
                f"{current.index}{current.timestamp}{current.doc_name}"
                f"{current.doc_hash}{current.owner}{current.ipfs_cid}{current.amends_hash}{current.previous_hash}"
            )
            if current.current_hash != recalc:
                return False
            if current.previous_hash != previous.current_hash:
                return False
        return True

    def get_all_blocks(self):
        return self.chain