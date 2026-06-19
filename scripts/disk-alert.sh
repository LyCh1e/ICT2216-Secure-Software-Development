#!/bin/sh
# TrialGuard — disk usage alert (Task 15.3, Availability / Phase 15).
#
# Warns when the root filesystem crosses a usage threshold. Intended to run
# from cron on the EC2 host (it is a host-level check, not a container service).
#
# Install on EC2 (runs every 6 hours, no root needed):
#   chmod +x scripts/disk-alert.sh
#   ( crontab -l 2>/dev/null; \
#     echo "0 */6 * * * $HOME/ICT2216-Secure-Software-Development/scripts/disk-alert.sh" \
#   ) | crontab -
#
# Alerts are written to the system log (view with: journalctl -t trialguard-disk-alert).
# To also email, configure an MTA/SMTP relay and uncomment the mail line below.

THRESHOLD=85
EMAIL="lcslayer22@gmail.com"

USAGE=$(df / | awk 'NR==2 { gsub("%", "", $5); print $5 }')

if [ "$USAGE" -ge "$THRESHOLD" ]; then
    MSG="WARNING: TrialGuard EC2 root filesystem at ${USAGE}% (threshold ${THRESHOLD}%)"
    logger -t trialguard-disk-alert "$MSG"
    # Uncomment once an MTA (e.g. msmtp/ssmtp/postfix relay) is configured:
    # echo "$MSG" | mail -s "TrialGuard disk alert (${USAGE}%)" "$EMAIL"
else
    logger -t trialguard-disk-alert "OK: root filesystem at ${USAGE}% (threshold ${THRESHOLD}%)"
fi
