import fs from 'fs';
import { sendEmail } from '../utils/emailService.js';

export const submitApplication = async (req, res) => {
  try {
    const { name, email, phone, message } = req.body;
    
    // Check if file is uploaded
    const files = req.files; // if using uploadDocumentArray
    const file = req.file;   // if using uploadDocumentSingle

    if (!name || !email || !phone) {
      return res.status(400).json({ success: false, message: 'Name, email, and phone are required.' });
    }

    let attachments = [];
    const uploadedFiles = file ? [file] : (files || []);

    if (uploadedFiles.length > 0) {
      for (const f of uploadedFiles) {
        // Read file as Buffer for Resend
        const fileContent = fs.readFileSync(f.path);
        attachments.push({
          filename: f.originalname,
          content: fileContent
        });
      }
    } else {
      return res.status(400).json({ success: false, message: 'CV or document attachment is required.' });
    }

    const htmlContent = `
      <h2>New Job Application Received</h2>
      <p><strong>Name:</strong> ${name}</p>
      <p><strong>Email:</strong> ${email}</p>
      <p><strong>Phone:</strong> ${phone}</p>
      <p><strong>Message / Cover Letter:</strong><br/>${message ? message.replace(/\n/g, '<br/>') : 'N/A'}</p>
      <hr />
      <p>Documents are attached to this email.</p>
    `;

    // Send email to vaccancies@optimaswifi.co.ke
    const emailResult = await sendEmail({
      to: 'vaccancies@optimaswifi.co.ke',
      subject: `Job Application: ${name}`,
      html: htmlContent,
      attachments
    });

    if (!emailResult.success) {
      // Clean up files synchronously or asynchronously
      uploadedFiles.forEach(f => {
        if (fs.existsSync(f.path)) fs.unlinkSync(f.path);
      });
      return res.status(500).json({ success: false, message: 'Failed to send application email.', error: emailResult.error });
    }

    // Email successfully sent. Clean up the uploaded files from server disk.
    uploadedFiles.forEach(f => {
      if (fs.existsSync(f.path)) fs.unlinkSync(f.path);
    });

    res.status(200).json({ success: true, message: 'Application submitted successfully.' });
  } catch (error) {
    console.error('Vacancy application error:', error);
    res.status(500).json({ success: false, message: 'Server error processing application.', error: error.message });
  }
};
