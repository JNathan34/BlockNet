#!/usr/bin/env python3
"""Reassemble the original BlockNet Word plan from GitHub-sized chunks.

This keeps the original 47-page Word document byte-for-byte identical, including
all concept photos, drawings and tables. Used automatically by GitHub Actions.
"""
from pathlib import Path
import hashlib

root = Path(__file__).resolve().parents[1]
parts_dir = root / "docs" / ".parts"
parts = sorted(parts_dir.glob("BlockNet_Business_Plan_2026.docx.part*"))
if len(parts) != 9:
    raise SystemExit(f"Expected nine business-plan parts; found {len(parts)}")

output = root / "docs" / "BlockNet_Business_Plan_2026.docx"
expected = (parts_dir / "SHA256.txt").read_text().split()[0]
with output.open("wb") as dest:
    for part in parts:
        dest.write(part.read_bytes())
actual = hashlib.sha256(output.read_bytes()).hexdigest()
if actual != expected:
    output.unlink(missing_ok=True)
    raise SystemExit(f"SHA-256 mismatch: expected {expected}, received {actual}")
print(f"Restored {output.relative_to(root)} ({output.stat().st_size:,} bytes) — checksum OK")
