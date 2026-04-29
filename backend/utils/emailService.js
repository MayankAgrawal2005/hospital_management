const nodemailer = require("nodemailer");

// Create a reusable transporter object
let transporter;

const setupTransporter = async () => {
  if (process.env.SMTP_USER && process.env.SMTP_PASS) {
    // Use real SMTP if provided in .env
    transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST || "smtp.gmail.com",
      port: process.env.SMTP_PORT || 587,
      secure: false,
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
    });
  } else {
    // Fallback to Ethereal Email for safe local testing
    console.log("No SMTP credentials found in .env. Falling back to Ethereal Email.");
    let testAccount = await nodemailer.createTestAccount();
    transporter = nodemailer.createTransport({
      host: "smtp.ethereal.email",
      port: 587,
      secure: false,
      auth: {
        user: testAccount.user,
        pass: testAccount.pass,
      },
    });
  }
};

// Initialize the transporter immediately
setupTransporter();

/**
 * Send an email and log the Ethereal URL if in test mode
 */
const sendMail = async (mailOptions) => {
  try {
    if (!transporter) {
      await setupTransporter();
    }
    const info = await transporter.sendMail(mailOptions);
    console.log(`✉️ Email sent to ${mailOptions.to} [${info.messageId}]`);
    
    // Preview only available when sending through an Ethereal account
    if (info.messageId && nodemailer.getTestMessageUrl(info)) {
      console.log(`🔗 Preview Email: ${nodemailer.getTestMessageUrl(info)}`);
    }
    return info;
  } catch (error) {
    console.error("Error sending email:", error);
  }
};

const sendBookingConfirmation = async (patientEmail, patientName, doctorName, date, time) => {
  const mailOptions = {
    from: '"CarePoint Hospital" <noreply@carepoint.com>',
    to: patientEmail,
    subject: `Appointment Confirmed - Dr. ${doctorName}`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e2e8f0; border-radius: 10px;">
        <h2 style="color: #2563eb;">Appointment Confirmed!</h2>
        <p>Dear <strong>${patientName}</strong>,</p>
        <p>Your appointment has been successfully scheduled. Here are the details:</p>
        <div style="background-color: #f8fafc; padding: 15px; border-radius: 8px; margin: 20px 0;">
          <p style="margin: 5px 0;"><strong>Doctor:</strong> Dr. ${doctorName}</p>
          <p style="margin: 5px 0;"><strong>Date:</strong> ${new Date(date).toLocaleDateString()}</p>
          <p style="margin: 5px 0;"><strong>Time:</strong> ${time}</p>
        </div>
        <p>Please try to arrive 10 minutes early. If you need to cancel, please log in to your dashboard.</p>
        <br/>
        <p>Stay Healthy,<br/><strong>The CarePoint Team</strong></p>
      </div>
    `,
  };
  await sendMail(mailOptions);
};

const sendCancellationNotice = async (patientEmail, patientName, doctorName, date, time, reason, cancelledByRole) => {
  const roleText = cancelledByRole === 'doctor' ? 'the Doctor' : 'the Patient';
  
  const mailOptions = {
    from: '"CarePoint Hospital" <noreply@carepoint.com>',
    to: patientEmail,
    subject: `Appointment Cancelled - Dr. ${doctorName}`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e2e8f0; border-radius: 10px;">
        <h2 style="color: #dc2626;">Appointment Cancelled</h2>
        <p>Dear <strong>${patientName}</strong>,</p>
        <p>Your appointment with Dr. ${doctorName} on ${new Date(date).toLocaleDateString()} at ${time} has been cancelled by <strong>${roleText}</strong>.</p>
        <div style="background-color: #fee2e2; color: #991b1b; padding: 15px; border-radius: 8px; margin: 20px 0;">
          <p style="margin: 0;"><strong>Reason:</strong> ${reason || "No specific reason provided."}</p>
        </div>
        <p>If you need to reschedule, please visit our portal at your earliest convenience.</p>
        <br/>
        <p>Best Regards,<br/><strong>The CarePoint Team</strong></p>
      </div>
    `,
  };
  await sendMail(mailOptions);
};

const sendCompletionNotice = async (patientEmail, patientName, doctorName) => {
  const mailOptions = {
    from: '"CarePoint Hospital" <noreply@carepoint.com>',
    to: patientEmail,
    subject: `Thank you for your visit! - Dr. ${doctorName}`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e2e8f0; border-radius: 10px;">
        <h2 style="color: #16a34a;">Appointment Completed</h2>
        <p>Dear <strong>${patientName}</strong>,</p>
        <p>Your appointment with Dr. ${doctorName} has been marked as completed.</p>
        <p>We hope you had a satisfactory visit. Please log in to your portal to view any notes or prescriptions.</p>
        <br/>
        <p>Best Regards,<br/><strong>The CarePoint Team</strong></p>
      </div>
    `,
  };
  await sendMail(mailOptions);
};

const sendRescheduleRequestNotice = async (doctorEmail, doctorName, patientName, oldDate, oldTime, reqDate, reqTime) => {
  const mailOptions = {
    from: '"CarePoint Hospital" <noreply@carepoint.com>',
    to: doctorEmail,
    subject: `Reschedule Request - Patient ${patientName}`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e2e8f0; border-radius: 10px;">
        <h2 style="color: #d97706;">Reschedule Request</h2>
        <p>Dear <strong>Dr. ${doctorName}</strong>,</p>
        <p>Your patient <strong>${patientName}</strong> has requested to reschedule their appointment.</p>
        
        <div style="background-color: #f3f4f6; padding: 15px; border-radius: 8px; margin: 20px 0;">
          <p style="margin: 0 0 10px 0;"><strong>Original Slot:</strong> ${new Date(oldDate).toLocaleDateString()} at ${oldTime}</p>
          <p style="margin: 0;"><strong>Requested Slot:</strong> <span style="color: #2563eb; font-weight: bold;">${new Date(reqDate).toLocaleDateString()} at ${reqTime}</span></p>
        </div>
        
        <p>Please log in to your dashboard to review and approve this request. You can accept the requested time or propose a different one.</p>
        <br/>
        <p>Best Regards,<br/><strong>The CarePoint Team</strong></p>
      </div>
    `,
  };
  await sendMail(mailOptions);
};

const sendRescheduleConfirmationNotice = async (patientEmail, patientName, doctorName, newDate, newTime) => {
  const mailOptions = {
    from: '"CarePoint Hospital" <noreply@carepoint.com>',
    to: patientEmail,
    subject: `Appointment Rescheduled - Dr. ${doctorName}`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e2e8f0; border-radius: 10px;">
        <h2 style="color: #2563eb;">Appointment Rescheduled</h2>
        <p>Dear <strong>${patientName}</strong>,</p>
        <p>Your appointment with Dr. ${doctorName} has been officially rescheduled by the doctor.</p>
        
        <div style="background-color: #eff6ff; padding: 15px; border-radius: 8px; margin: 20px 0; border: 1px solid #bfdbfe;">
          <p style="margin: 0;"><strong>New Approved Slot:</strong> <span style="color: #1d4ed8; font-weight: bold;">${new Date(newDate).toLocaleDateString()} at ${newTime}</span></p>
        </div>
        
        <p>Please make sure to note this new time on your calendar.</p>
        <br/>
        <p>Best Regards,<br/><strong>The CarePoint Team</strong></p>
      </div>
    `,
  };
  await sendMail(mailOptions);
};

module.exports = {
  sendBookingConfirmation,
  sendCancellationNotice,
  sendCompletionNotice,
  sendRescheduleRequestNotice,
  sendRescheduleConfirmationNotice
};
