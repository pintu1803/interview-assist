"""
Sends the full Q&A transcript to a user-supplied email address over SMTP.

Works with any SMTP provider (Gmail, Outlook, SendGrid, Mailgun, etc.) — no
vendor SDK required. See the bottom of this file for the settings/.env keys
it expects.
"""

import html
import logging
import smtplib
from email.message import EmailMessage

from app.config.settings import settings

logger = logging.getLogger(__name__)

# ---------------------------------------------------------------------------
# Brand/company details shown in the email header and "Best regards" footer.
# Edit these directly — they're the single source of truth for both the
# HTML and plain-text versions of the email.
# ---------------------------------------------------------------------------
COMPANY_NAME = "Prism"
COMPANY_TAGLINE = "Java interview assistant"
COMPANY_ADDRESS = "27th Main, Bangalore, India" 
LOGO_URL = ""  # paste a hosted image URL here if/when you have one; falls back to a text wordmark until then
SOCIAL_LINKS = [
    ("Portfolio", "https://pintusaini.vercel.app/"),
    ("X (Twitter)", "https://x.com/okpintuok"),
    ("LinkedIn", "https://linkedin.com/in/pinsaini-in"),
    ("GitHub", "https://github.com/pintu1803"),
]

_ACCENT = "#d97757"
_INK = "#12151c"
_MUTED = "#6b7280"
_MUTED_LIGHT = "#9ca3af"
_BORDER = "#e5e5e5"


def _format_transcript_text(history: list[dict]) -> str:
    """Plain-text fallback body (shown by clients that can't render HTML)."""
    rows = [
        f"Q{i}: {turn['question']}\n\nA{i}: {turn['answer']}\n"
        for i, turn in enumerate(history, start=1)
    ]
    body = "\n---\n\n".join(rows)

    social_lines = "\n".join(f"{name}: {url}" for name, url in SOCIAL_LINKS)
    signature = f"\n\n--\nBest regards,\n{COMPANY_NAME}\n{COMPANY_TAGLINE}\n"
    if COMPANY_ADDRESS:
        signature += f"{COMPANY_ADDRESS}\n"
    signature += f"\n{social_lines}\n"

    return body + signature


def _logo_html() -> str:
    if LOGO_URL:
        return f'<img src="{LOGO_URL}" alt="{html.escape(COMPANY_NAME)}" style="height:28px; display:block; border:0;" />'
    return (
        f'<span style="font:italic 600 22px Georgia,\'Iowan Old Style\',serif; '
        f'color:#f5f4f0;">{html.escape(COMPANY_NAME)}</span>'
    )


def _address_html() -> str:
    if not COMPANY_ADDRESS:
        return ""
    return f'<p style="margin:0 0 12px; color:{_MUTED}; font-size:13px;">{html.escape(COMPANY_ADDRESS)}</p>'


def _social_links_html() -> str:
    links = " &nbsp;&middot;&nbsp; ".join(
        f'<a href="{url}" style="color:{_ACCENT}; text-decoration:none;">{html.escape(name)}</a>'
        for name, url in SOCIAL_LINKS
    )
    return f'<p style="margin:0; font-size:13px;">{links}</p>'


def _format_transcript_html(history: list[dict]) -> str:
    """HTML body — table-based, inline-styled, for compatibility across email clients."""
    count = len(history)
    rows = "".join(
        f"""
        <div style="margin-bottom:20px; padding-bottom:20px; border-bottom:1px solid {_BORDER};">
            <p style="margin:0 0 6px; color:{_ACCENT}; font-weight:600; font-size:14px;">
                Q{i}. {html.escape(turn['question'])}
            </p>
            <p style="margin:0; color:#374151; font-size:14px; white-space:pre-wrap;">
                {html.escape(turn['answer'])}
            </p>
        </div>
        """
        for i, turn in enumerate(history, start=1)
    )

    return f"""
    <html>
      <body style="margin:0; padding:0; background:#f4f4f5; font-family:-apple-system,'Segoe UI',Roboto,Helvetica,Arial,sans-serif;">
        <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#f4f4f5; padding:32px 16px;">
          <tr>
            <td align="center">
              <table role="presentation" width="600" cellpadding="0" cellspacing="0"
                     style="max-width:600px; width:100%; background:#ffffff; border-radius:10px; overflow:hidden; border:1px solid {_BORDER};">
                <tr>
                  <td style="background:{_INK}; padding:28px 32px;">
                    {_logo_html()}
                    <p style="margin:4px 0 0; color:#8b93a7; font-size:13px;">{html.escape(COMPANY_TAGLINE)}</p>
                  </td>
                </tr>
                <tr>
                  <td style="padding:28px 32px 8px;">
                    <h2 style="margin:0 0 4px; color:{_INK}; font-size:20px;">Your interview transcript</h2>
                    <p style="margin:0; color:{_MUTED}; font-size:14px;">
                      Here's the full Q&amp;A from your session — {count} question{'s' if count != 1 else ''}.
                    </p>
                  </td>
                </tr>
                <tr>
                  <td style="padding:8px 32px 8px;">
                    {rows}
                  </td>
                </tr>
                <tr>
                  <td style="padding:24px 32px 32px; border-top:1px solid {_BORDER};">
                    <p style="margin:0 0 4px; color:#374151; font-size:14px;">Best regards,</p>
                    <p style="margin:0 0 12px; color:{_INK}; font-size:15px; font-weight:600;">{html.escape(COMPANY_NAME)}</p>
                    {_address_html()}
                    {_social_links_html()}
                  </td>
                </tr>
              </table>
            </td>
          </tr>
        </table>
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
    msg["Subject"] = f"Your {COMPANY_NAME} interview transcript"
    msg["From"] = settings.email_from
    msg["To"] = to_email
    msg.set_content(_format_transcript_text(history))
    msg.add_alternative(_format_transcript_html(history), subtype="html")

    with smtplib.SMTP(settings.smtp_host, settings.smtp_port) as server:
        server.starttls()
        server.login(settings.smtp_user, settings.smtp_password)
        server.send_message(msg)

    logger.info("Sent transcript email to %s (%d turns)", to_email, len(history))
