#!/bin/sh
# TrialGuard — disk usage alert (Task 15.3, Availability / Phase 15).
#
# Warns when the root filesystem crosses a usage threshold. Runs from cron on
# the EC2 host (host-level check, not a container service). Logs to syslog and,
# when over threshold, emails an alert via the Gmail SMTP configured in .env.
#
# Install on EC2 (every 6 hours):
#   chmod +x scripts/disk-alert.sh
#   ( crontab -l 2>/dev/null; \
#     echo "0 */6 * * * $HOME/ICT2216-Secure-Software-Development/scripts/disk-alert.sh" \
#   ) | crontab -
#
# View alerts: journalctl -t trialguard-disk-alert
# Test the email path without filling the disk:
#   DISK_ALERT_THRESHOLD=1 scripts/disk-alert.sh

THRESHOLD="${DISK_ALERT_THRESHOLD:-85}"
ALERT_EMAIL="claudeisgoat3@gmail.com"
ENV_FILE="$(CDPATH= cd -- "$(dirname -- "$0")/.." && pwd)/.env"

USAGE=$(df / | awk 'NR==2 { gsub("%", "", $5); print $5 }')

if [ "$USAGE" -lt "$THRESHOLD" ]; then
    logger -t trialguard-disk-alert "OK: root filesystem at ${USAGE}% (threshold ${THRESHOLD}%)"
    exit 0
fi

MSG="WARNING: TrialGuard EC2 root filesystem at ${USAGE}% (threshold ${THRESHOLD}%)"
logger -t trialguard-disk-alert "$MSG"

# Send an email alert via the Gmail SMTP configured in .env (creds never logged).
python3 - "$ENV_FILE" "$ALERT_EMAIL" "$MSG" <<'PYEOF'
import sys, smtplib, ssl
from email.mime.text import MIMEText

env_file, to_addr, body = sys.argv[1], sys.argv[2], sys.argv[3]

cfg = {}
try:
    with open(env_file) as f:
        for line in f:
            line = line.strip()
            if line and not line.startswith('#') and '=' in line:
                k, v = line.split('=', 1)
                cfg[k.strip()] = v.strip()
except OSError:
    sys.exit(0)

host = cfg.get('SMTP_HOST')
port = int(cfg.get('SMTP_PORT', '587'))
user = cfg.get('SMTP_USER')
pw   = cfg.get('SMTP_PASS')
frm  = cfg.get('SMTP_FROM', user)
if not (host and user and pw):
    sys.exit(0)

msg = MIMEText(body)
msg['Subject'] = 'TrialGuard disk alert'
msg['From'] = frm
msg['To'] = to_addr
try:
    ctx = ssl.create_default_context()
    with smtplib.SMTP(host, port, timeout=15) as s:
        s.ehlo()
        s.starttls(context=ctx)
        s.login(user, pw)
        s.sendmail(frm, [to_addr], msg.as_string())
    print("disk-alert email sent to", to_addr)
except Exception as e:
    print("disk-alert email FAILED:", type(e).__name__, "-", e)
PYEOF
