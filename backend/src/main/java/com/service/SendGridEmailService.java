package com.service;

import jakarta.mail.MessagingException;
import jakarta.mail.internet.MimeMessage;
import lombok.RequiredArgsConstructor;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.stereotype.Service;

import java.io.UnsupportedEncodingException;

@Service
@RequiredArgsConstructor
public class SendGridEmailService {

    private static final Logger log = LoggerFactory.getLogger(SendGridEmailService.class);

    private final JavaMailSender mailSender;

    @Value("${sendgrid.from.email}")
    private String fromEmail;

    @Value("${sendgrid.from.name}")
    private String fromName;

    public boolean sendOtpEmail(String toEmail, String otp) {
        String subject = "Your AssetFlow Verification Code";
        String htmlContent = buildOtpEmailHtml(otp);

        try {
            MimeMessage message = mailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(message, true, "UTF-8");
            helper.setFrom(fromEmail, fromName);
            helper.setTo(toEmail);
            helper.setSubject(subject);
            helper.setText(htmlContent, true);
            mailSender.send(message);
            log.info("OTP email sent successfully via SendGrid to: {}", toEmail);
            return true;
        } catch (MessagingException | UnsupportedEncodingException e) {
            log.error("Failed to send OTP email via SendGrid to: {}. Error: {}", toEmail, e.getMessage(), e);
            return false;
        }
    }

    private String buildOtpEmailHtml(String otp) {
        return """
            <!DOCTYPE html>
            <html>
            <head>
                <meta charset="UTF-8">
                <style>
                    body { font-family: 'Inter', Arial, sans-serif; background: #f5f5f5; margin: 0; padding: 0; }
                    .container { max-width: 480px; margin: 40px auto; background: #ffffff; border-radius: 16px; padding: 36px; box-shadow: 0 4px 20px rgba(0,0,0,0.05); }
                    .logo { font-size: 24px; font-weight: 900; color: #0f172a; letter-spacing: -0.5px; margin-bottom: 8px; }
                    .subtitle { font-size: 11px; color: #94a3b8; font-weight: 700; text-transform: uppercase; letter-spacing: 2px; margin-bottom: 24px; }
                    .otp-box { background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 12px; padding: 20px; text-align: center; margin: 24px 0; }
                    .otp-code { font-size: 36px; font-weight: 900; color: #0f172a; letter-spacing: 12px; font-family: 'Courier New', monospace; }
                    .info { font-size: 13px; color: #64748b; line-height: 1.6; margin: 16px 0; }
                    .footer { font-size: 11px; color: #94a3b8; border-top: 1px solid #e2e8f0; padding-top: 16px; margin-top: 24px; }
                </style>
            </head>
            <body>
                <div class="container">
                    <div class="logo">AssetFlow</div>
                    <div class="subtitle">Enterprise ERP</div>
                    <h2 style="font-size: 18px; color: #0f172a; margin: 0;">Verify Your Email</h2>
                    <p class="info">Use the following code to complete your verification. This code expires in 5 minutes.</p>
                    <div class="otp-box">
                        <div class="otp-code">%s</div>
                    </div>
                    <p class="info">If you did not request this code, please ignore this email.</p>
                    <div class="footer">
                        &copy; 2026 AssetFlow &middot; Enterprise Portfolio Command Center
                    </div>
                </div>
            </body>
            </html>
            """.formatted(otp);
    }
}