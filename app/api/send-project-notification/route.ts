import nodemailer from 'nodemailer';
import { NextResponse } from 'next/server';

// Configure nodemailer transporter
const createEmailTransporter = () => {
  return nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: parseInt(process.env.SMTP_PORT || '587'),
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS
    }
  });
};

export async function POST(req: Request) {
  try {
    const { 
      projectName, 
      supervisorEmail, 
      teamMemberEmails,
      startDate,
      clientName 
    } = await req.json();

    if (!projectName) {
      return NextResponse.json({ error: 'Project name is required' }, { status: 400 });
    }

    const recipients = [];
    if (supervisorEmail) recipients.push(supervisorEmail);
    if (teamMemberEmails && teamMemberEmails.length > 0) {
      recipients.push(...teamMemberEmails);
    }

    if (recipients.length === 0) {
      return NextResponse.json({ error: 'No recipients specified' }, { status: 400 });
    }

    const transporter = createEmailTransporter();

    const mailOptions = {
      from: process.env.SMTP_USER,
      to: recipients.join(', '),
      subject: `New Project Assigned: ${projectName}`,
      html: `
        <div style="font-family: Arial, sans-serif; padding: 20px; max-width: 600px;">
          <h2 style="color: #2563eb;">New Project Assignment</h2>
          <p>A new project has been created for you in the BIMaided portal.</p>
          
          <div style="background-color: #f3f4f6; padding: 15px; border-radius: 8px; margin: 20px 0;">
            <h3 style="margin-top: 0; color: #1f2937;">Project Details:</h3>
            <p><strong>Project Name:</strong> ${projectName}</p>
            ${clientName ? `<p><strong>Client:</strong> ${clientName}</p>` : ''}
            ${startDate ? `<p><strong>Start Date:</strong> ${new Date(startDate).toLocaleDateString()}</p>` : ''}
          </div>
          
          <p>Please log in to the BIMaided portal to view complete project details and start working on your tasks.</p>
          
          <div style="margin-top: 30px;">
            <a href="${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/employee" 
               style="background-color: #2563eb; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block;">
              View Project
            </a>
          </div>
          
          <p style="color: #6b7280; font-size: 14px; margin-top: 30px;">
            This is an automated notification from BIMaided. Please do not reply to this email.
          </p>
        </div>
      `
    };

    await transporter.sendMail(mailOptions);

    return NextResponse.json({ 
      success: true, 
      message: 'Project notification emails sent successfully',
      recipients: recipients.length 
    });

  } catch (error: any) {
    console.error('Error sending project notification:', error);
    return NextResponse.json({ 
      error: 'Failed to send email notifications', 
      message: error.message 
    }, { status: 500 });
  }
}
