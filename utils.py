import hashlib

def hash_document(file_bytes: bytes) -> str:
    """Generate SHA-256 hash of a document's bytes."""
    sha256 = hashlib.sha256()
    sha256.update(file_bytes)
    return sha256.hexdigest()

def hash_block(block_data: str) -> str:
    """Generate SHA-256 hash for a block."""
    return hashlib.sha256(block_data.encode()).hexdigest()