"""
Sends the full Q&A transcript to a user-supplied email address over SMTP.

Works with any SMTP provider (Gmail, Outlook, SendGrid, Mailgun, etc.) — no
vendor SDK required. See the bottom of this file for the settings/.env keys
it expects.
"""

import logging
import smtplib
from email.message import EmailMessage

from app.config.settings import settings

logger = logging.getLogger(__name__)


def _format_transcript_text(history: list[dict]) -> str:
    """Plain-text fallback body (shown by clients that can't render HTML)."""
    parts = [
        f"Q{i}: {turn['question']}\n\nA{i}: {turn['answer']}\n"
        for i, turn in enumerate(history, start=1)
    ]
    return "\n---\n\n".join(parts)


def _format_transcript_html(history: list[dict]) -> str:
    """HTML body — what most inboxes will actually render."""
    rows = "".join(
        f"""
        <div style="margin-bottom:24px;">
            <p style="color:#d97757; font-weight:600; margin:0 0 6px;">
                Q{i}. {turn['question']}
            </p>
            <p style="margin:0; white-space:pre-wrap;">{turn['answer']}</p>
        </div>
        """
        for i, turn in enumerate(history, start=1)
    )
    return f"""
    <html>
      <body style="font-family:sans-serif; color:#1a1a1a; max-width:640px; margin:0 auto;">
        <h2 style="color:#12151c;">Your Prism interview transcript</h2>
        {rows}
      </body>
    </html>
    """


def send_transcript_email(to_email: str, history: list[dict]) -> None:
    """
    Sends the transcript. Raises on failure — the calling route is
    responsible for turning that into an HTTP error response.
    """
    if not history:
        raise ValueError("No answered questions to send yet.")

    msg = EmailMessage()
    msg["Subject"] = "Your Prism interview transcript"
    msg["From"] = settings.email_from
    msg["To"] = to_email
    msg.set_content(_format_transcript_text(history))
    msg.add_alternative(_format_transcript_html(history), subtype="html")

    with smtplib.SMTP(settings.smtp_host, settings.smtp_port) as server:
        server.starttls()
        server.login(settings.smtp_user, settings.smtp_password)
        server.send_message(msg)

    logger.info("Sent transcript email to %s (%d turns)", to_email, len(history))
