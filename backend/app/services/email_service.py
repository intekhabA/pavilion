import logging
import smtplib
from email.mime.multipart import MIMEMultipart
from email.mime.text import MIMEText
from typing import Optional
from app.core.config import settings

logger = logging.getLogger("pavilion.email")


class EmailService:
    @staticmethod
    def send_email(to_email: str, subject: str, html_content: str, text_content: Optional[str] = None) -> bool:
        """Sends an email using configured SMTP settings or logs it in development."""
        if not settings.SMTP_ENABLED or not settings.SMTP_USER:
            logger.info(f"[DEV EMAIL LOG] To: {to_email} | Subject: {subject}\nContent: {text_content or html_content}")
            return True

        try:
            msg = MIMEMultipart("alternative")
            msg["Subject"] = subject
            msg["From"] = f"{settings.SMTP_FROM_NAME} <{settings.SMTP_FROM_EMAIL}>"
            msg["To"] = to_email

            if text_content:
                msg.attach(MIMEText(text_content, "plain"))
            msg.attach(MIMEText(html_content, "html"))

            with smtplib.SMTP(settings.SMTP_HOST, settings.SMTP_PORT) as server:
                server.starttls()
                server.login(settings.SMTP_USER, settings.SMTP_PASSWORD)
                server.sendmail(settings.SMTP_FROM_EMAIL, to_email, msg.as_string())
            logger.info(f"Email sent successfully to {to_email}")
            return True
        except Exception as e:
            logger.error(f"Failed to send email to {to_email}: {e}")
            return False

    @staticmethod
    def send_enquiry_notification(enquiry_data: dict, project_name: Optional[str] = None):
        """Notifies the admin team of a new prospective buyer lead."""
        subject = f"New Enquiry: {enquiry_data.get('name')} for {project_name or 'General Enquiry'}"
        html = f"""
        <h2>New Real Estate Lead Captured</h2>
        <p><strong>Name:</strong> {enquiry_data.get('name')}</p>
        <p><strong>Email:</strong> {enquiry_data.get('email')}</p>
        <p><strong>Phone:</strong> {enquiry_data.get('phone')}</p>
        <p><strong>Project:</strong> {project_name or 'General Inquiry'}</p>
        <p><strong>Preferred BHK:</strong> {enquiry_data.get('preferred_bhk', 'N/A')}</p>
        <p><strong>Budget:</strong> {enquiry_data.get('budget_range', 'N/A')}</p>
        <p><strong>Message:</strong> {enquiry_data.get('message', 'N/A')}</p>
        <hr/>
        <p><small>Pavilion Realty CRM System</small></p>
        """
        EmailService.send_email(settings.ADMIN_NOTIFICATION_EMAIL, subject, html)


email_service = EmailService()
