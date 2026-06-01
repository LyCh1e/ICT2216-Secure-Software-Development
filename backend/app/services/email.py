import os
import smtplib
import ssl
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart

_SMTP_HOST = os.environ.get('SMTP_HOST', 'sandbox.smtp.mailtrap.io')
_SMTP_PORT = int(os.environ.get('SMTP_PORT', '2525'))
_SMTP_USER = os.environ.get('SMTP_USER', '')
_SMTP_PASS = os.environ.get('SMTP_PASS', '')
_FROM_ADDR = os.environ.get('SMTP_FROM', 'noreply@trialguard.com')
_APP_URL   = os.environ.get('APP_URL', 'https://medi.trialguard.com')


def send_verification_email(to_email: str, token: str) -> bool:
    """Send email verification link. Returns True on success."""
    verify_url = f"{_APP_URL}/verify-email?token={token}"

    msg = MIMEMultipart('alternative')
    msg['Subject'] = 'Verify your TrialGuard account'
    msg['From']    = f'TrialGuard <{_FROM_ADDR}>'
    msg['To']      = to_email

    text = f"""Welcome to TrialGuard.

Please verify your email address by visiting:
{verify_url}

This link expires in 24 hours. If you did not register, ignore this email.
"""
    html = f"""<p>Welcome to <strong>TrialGuard</strong>.</p>
<p>Please verify your email address:</p>
<p><a href="{verify_url}">{verify_url}</a></p>
<p>This link expires in 24 hours. If you did not register, ignore this email.</p>
"""
    msg.attach(MIMEText(text, 'plain'))
    msg.attach(MIMEText(html, 'html'))

    try:
        context = ssl.create_default_context()
        with smtplib.SMTP(_SMTP_HOST, _SMTP_PORT) as server:
            server.ehlo()
            server.starttls(context=context)
            server.login(_SMTP_USER, _SMTP_PASS)
            server.sendmail(_FROM_ADDR, to_email, msg.as_string())
        return True
    except Exception:
        return False
