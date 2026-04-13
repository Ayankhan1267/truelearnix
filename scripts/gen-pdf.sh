#!/bin/bash
set -e

OUT_DIR="/var/www/trulearnix/scripts/diagrams"
mkdir -p "$OUT_DIR"

# Extract and render each mermaid block
ARCH="/var/www/trulearnix/ARCHITECTURE.md"
IDX=0

python3 - <<'PYEOF'
import re, os, subprocess

arch = open("/var/www/trulearnix/ARCHITECTURE.md").read()
out_dir = "/var/www/trulearnix/scripts/diagrams"
os.makedirs(out_dir, exist_ok=True)

blocks = re.findall(r'```mermaid\n(.*?)```', arch, re.DOTALL)

for i, block in enumerate(blocks):
    mmd_file = f"{out_dir}/diagram_{i}.mmd"
    png_file = f"{out_dir}/diagram_{i}.png"
    open(mmd_file, "w").write(block.strip())
    result = subprocess.run(
        ["mmdc", "-i", mmd_file, "-o", png_file,
         "-b", "white", "-w", "1200", "-H", "800",
         "--puppeteerConfigFile", "/dev/null"],
        capture_output=True, text=True
    )
    if result.returncode != 0:
        print(f"[WARN] diagram_{i} failed: {result.stderr[:200]}")
    else:
        print(f"[OK] diagram_{i}.png")

print("Done rendering diagrams.")
PYEOF
