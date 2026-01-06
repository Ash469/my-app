import nodemailer from 'nodemailer';

// Email configuration
const EMAIL_HOST = process.env.EMAIL_HOST || 'smtp.gmail.com';
const EMAIL_PORT = parseInt(process.env.EMAIL_PORT || '587');
const EMAIL_SECURE = process.env.EMAIL_SECURE === 'true';
const EMAIL_USER = process.env.EMAIL_USER!;
const EMAIL_PASSWORD = process.env.EMAIL_PASSWORD!;
const FROM_EMAIL = process.env.FROM_EMAIL || EMAIL_USER;

let transporter: nodemailer.Transporter | null = null;

function getTransporter() {
  if (!transporter && EMAIL_USER && EMAIL_PASSWORD) {
    transporter = nodemailer.createTransport({
      host: EMAIL_HOST,
      port: EMAIL_PORT,
      secure: EMAIL_SECURE,
      auth: {
        user: EMAIL_USER,
        pass: EMAIL_PASSWORD,
      },
    });
  }
  return transporter;
}

/**
 * Send referee invitation email with secure chat link
 */
export async function sendRefereeInvitation(
  refereeEmail: string,
  refereeName: string,
  chatUrl: string,
  jobTitle: string,
  companyName: string
): Promise<void> {
  const transport = getTransporter();
  if (!transport) {
    console.warn('Email transporter not configured. Email not sent.');
    return;
  }

  const mailOptions = {
    from: FROM_EMAIL,
    to: refereeEmail,
    subject: `Reference Request for ${jobTitle} at ${companyName}`,
    html: `
      <!DOCTYPE html>
      <html>
      <head>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
          .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
          .button { display: inline-block; background: #667eea; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; margin: 20px 0; }
          .footer { text-align: center; margin-top: 20px; font-size: 12px; color: #666; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>Reference Request</h1>
          </div>
          <div class="content">
            <p>Hello ${refereeName},</p>
            <p>A recruiter from <strong>${companyName}</strong> has requested to contact you as a reference for a candidate who applied for the position of <strong>${jobTitle}</strong>.</p>
            <p>You can securely communicate with the recruiter through our encrypted chat system. No account creation is required.</p>
            <p style="text-align: center;">
              <a href="${chatUrl}" class="button">Access Secure Chat</a>
            </p>
            <p><strong>Important:</strong> This link is unique and secure. Do not share it with anyone else.</p>
            <p>If you did not expect this email or believe it was sent in error, please disregard it.</p>
          </div>
          <div class="footer">
            <p>This is an automated message from the Recruitment Verification Platform.</p>
          </div>
        </div>
      </body>
      </html>
    `,
  };

  try {
    await transport.sendMail(mailOptions);
    console.log(`Referee invitation sent to ${refereeEmail}`);
  } catch (error) {
    console.error('Error sending referee invitation:', error);
    throw error;
  }
}

/**
 * Send new message notification
 */
export async function sendNewMessageNotification(
  recipientEmail: string,
  recipientName: string,
  chatUrl: string
): Promise<void> {
  const transport = getTransporter();
  if (!transport) {
    console.warn('Email transporter not configured. Email not sent.');
    return;
  }

  const mailOptions = {
    from: FROM_EMAIL,
    to: recipientEmail,
    subject: 'New Message in Your Chat',
    html: `
      <!DOCTYPE html>
      <html>
      <head>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
          .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
          .button { display: inline-block; background: #667eea; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; margin: 20px 0; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>New Message</h1>
          </div>
          <div class="content">
            <p>Hello ${recipientName},</p>
            <p>You have received a new message in your chat.</p>
            <p style="text-align: center;">
              <a href="${chatUrl}" class="button">View Message</a>
            </p>
          </div>
        </div>
      </body>
      </html>
    `,
  };

  try {
    await transport.sendMail(mailOptions);
    console.log(`New message notification sent to ${recipientEmail}`);
  } catch (error) {
    console.error('Error sending new message notification:', error);
    // Don't throw error for notifications to avoid blocking message sending
  }
}

/**
 * Send application status update notification
 */
export async function sendApplicationStatusUpdate(
  employeeEmail: string,
  employeeName: string,
  jobTitle: string,
  status: string,
  feedback?: string
): Promise<void> {
  const transport = getTransporter();
  if (!transport) {
    console.warn('Email transporter not configured. Email not sent.');
    return;
  }

  const statusMessages: Record<string, string> = {
    SUBMITTED: 'Your application has been submitted successfully.',
    UNDER_REVIEW: 'Your application is now under review.',
    REFEREE_CONTACTED: 'We have contacted your references.',
    VERIFIED: 'Your references have been verified.',
    REJECTED: 'Unfortunately, we will not be moving forward with your application.',
    HIRED: 'Congratulations! You have been selected for the position.',
  };

  const mailOptions = {
    from: FROM_EMAIL,
    to: employeeEmail,
    subject: `Application Update: ${jobTitle}`,
    html: `
      <!DOCTYPE html>
      <html>
      <head>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
          .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
          .status { background: white; padding: 15px; border-left: 4px solid #667eea; margin: 20px 0; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>Application Status Update</h1>
          </div>
          <div class="content">
            <p>Hello ${employeeName},</p>
            <p>Your application for <strong>${jobTitle}</strong> has been updated.</p>
            <div class="status">
              <strong>Status:</strong> ${status.replace('_', ' ')}<br>
              <p>${statusMessages[status] || 'Your application status has been updated.'}</p>
              ${feedback ? `<p><strong>Feedback:</strong> ${feedback}</p>` : ''}
            </div>
          </div>
        </div>
      </body>
      </html>
    `,
  };

  try {
    await transport.sendMail(mailOptions);
    console.log(`Application status update sent to ${employeeEmail}`);
  } catch (error) {
    console.error('Error sending application status update:', error);
  }
}
