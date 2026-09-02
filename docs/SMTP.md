SMTP providers and quick setup

1) SendGrid (recommended)
- Host: smtp.sendgrid.net
- Port: 587
- User: apikey
- Pass: <SENDGRID_API_KEY>
- From: your@domain.com

2) Gmail (using App Passwords)
- If using Gmail, enable 2FA and create an App Password.
- Host: smtp.gmail.com
- Port: 587 (TLS) or 465 (SSL)
- User: your@gmail.com
- Pass: <APP_PASSWORD>
- From: your@gmail.com

3) Mailgun (SMTP)
- Host: smtp.mailgun.org
- Port: 587
- User: postmaster@YOUR_DOMAIN
- Pass: <MAILGUN_SMTP_PASSWORD>

Notes:
- Never commit `.env` with secrets.
- If you don't have SMTP, leave SMTP_* blank; the app will fallback to logging and `mailto:` links.

Testing notify endpoint (curl):

curl -X POST http://localhost:3000/api/notify -H "Content-Type: application/json" -d '{"to":"schekinacamille@gmail.com","subject":"Test","text":"Test SMTP"}'

For SendGrid, you can also use their API key via SMTP credentials as above.
