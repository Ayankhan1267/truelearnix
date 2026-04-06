#!/bin/bash
cd /root/trulearnix

# Check if there are any changes
if [[ -n $(git status --porcelain) ]]; then
  git add -A
  git commit -m "Auto deploy: $(date '+%Y-%m-%d %H:%M:%S')"
  git push origin main
  echo "[$(date)] Deployed successfully"
else
  echo "[$(date)] No changes to deploy"
fi
