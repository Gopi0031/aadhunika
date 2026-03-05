import nodemailer from 'nodemailer';

function getTransporter() {
  return nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
  });
}

// =============================================
// HTML TEMPLATES
// =============================================

function patientBookingHTML(booking) {
  let paymentHTML = '';
  if (booking.paymentId && booking.amountPaid > 0) {
    paymentHTML = `
      <div style="margin:15px 30px;background:#F0FDF4;border-radius:12px;overflow:hidden;border:2px solid #86EFAC;">
        <div style="background:#059669;padding:12px 20px;">
          <h4 style="color:#ffffff;margin:0;font-size:14px;">💳 Payment Confirmed</h4>
        </div>
        <table style="width:100%;border-collapse:collapse;">
          <tr>
            <td style="padding:12px 20px;font-weight:600;color:#374151;border-bottom:1px solid #E5E7EB;font-size:13px;">Payment ID</td>
            <td style="padding:12px 20px;color:#059669;border-bottom:1px solid #E5E7EB;font-size:13px;font-weight:700;">${booking.paymentId}</td>
          </tr>
          <tr>
            <td style="padding:12px 20px;font-weight:600;color:#374151;font-size:13px;">Amount</td>
            <td style="padding:12px 20px;color:#059669;font-size:18px;font-weight:800;">₹${booking.amountPaid}</td>
          </tr>
        </table>
      </div>
    `;
  }

  return `
    <div style="font-family:'Segoe UI',Arial,sans-serif;max-width:600px;margin:auto;border:1px solid #e5e7eb;border-radius:16px;overflow:hidden;">
      <div style="background:linear-gradient(135deg,#0F766E,#14B8A6);padding:30px;text-align:center;">
        <h1 style="color:#ffffff;margin:0;font-size:24px;font-weight:800;">🏥 Aadhunika Hospital</h1>
      </div>
      <div style="text-align:center;padding:25px 30px;">
        <h2 style="color:#0F172A;margin:0;font-size:22px;">📋 Appointment Request Received!</h2>
        <p style="color:#374151;font-size:14px;margin:10px 0 0;">
          ${booking.appointmentType === 'Online'
            ? '📹 Zoom meeting link will be sent once admin confirms your appointment'
            : 'Please wait for confirmation before visiting the hospital.'}
        </p>
      </div>
      ${paymentHTML}
      <div style="margin:20px 30px;background:#F9FAFB;border-radius:12px;overflow:hidden;border:1px solid #E5E7EB;">
        <table style="width:100%;border-collapse:collapse;">
          <tr><td style="padding:14px 20px;font-weight:600;color:#374151;border-bottom:1px solid #E5E7EB;">👤 Patient</td><td style="padding:14px 20px;color:#0F172A;border-bottom:1px solid #E5E7EB;font-weight:700;">${booking.name}</td></tr>
          <tr><td style="padding:14px 20px;font-weight:600;color:#374151;border-bottom:1px solid #E5E7EB;">🏥 Department</td><td style="padding:14px 20px;color:#0F172A;border-bottom:1px solid #E5E7EB;">${booking.department}</td></tr>
          <tr><td style="padding:14px 20px;font-weight:600;color:#374151;border-bottom:1px solid #E5E7EB;">📅 Date</td><td style="padding:14px 20px;color:#0F172A;border-bottom:1px solid #E5E7EB;font-weight:700;">${booking.date}</td></tr>
          <tr><td style="padding:14px 20px;font-weight:600;color:#374151;">⏰ Time</td><td style="padding:14px 20px;color:#0F172A;font-weight:700;">${booking.time}</td></tr>
        </table>
      </div>
      <div style="background:#F9FAFB;padding:20px;text-align:center;border-top:1px solid #E5E7EB;">
        <p style="color:#9CA3AF;font-size:11px;margin:0;">© ${new Date().getFullYear()} Aadhunika Hospital</p>
      </div>
    </div>
  `;
}

function adminNewBookingHTML(booking) {
  const isOnline = booking.appointmentType === 'Online';
  const isPaid = booking.paymentStatus === 'PAID';

  return `
    <div style="font-family:'Segoe UI',Arial,sans-serif;max-width:650px;margin:auto;border:1px solid #e5e7eb;border-radius:16px;overflow:hidden;box-shadow:0 4px 12px rgba(0,0,0,0.08);">
      <div style="background:linear-gradient(135deg,#1E40AF,#3B82F6);padding:30px;text-align:center;">
        <h1 style="color:#ffffff;margin:0;font-size:24px;font-weight:800;">🔔 New Appointment Request</h1>
        <p style="color:#BFDBFE;margin:8px 0 0;font-size:13px;">Aadhunika Hospital — Admin Dashboard</p>
      </div>
      <div style="text-align:center;padding:20px 30px 10px;">
        <div style="display:inline-flex;gap:8px;flex-wrap:wrap;justify-content:center;">
          ${isOnline
            ? `<span style="background:#DBEAFE;color:#1E40AF;padding:6px 16px;border-radius:20px;font-size:12px;font-weight:700;border:1px solid #93C5FD;">📹 ONLINE CONSULTATION</span>`
            : `<span style="background:#F0FDF4;color:#166534;padding:6px 16px;border-radius:20px;font-size:12px;font-weight:700;border:1px solid #86EFAC;">🏥 IN-PERSON VISIT</span>`
          }
          ${isPaid
            ? `<span style="background:#D1FAE5;color:#065F46;padding:6px 16px;border-radius:20px;font-size:12px;font-weight:700;border:1px solid #6EE7B7;">💳 PAID ₹${booking.amountPaid}</span>`
            : `<span style="background:#FEF3C7;color:#92400E;padding:6px 16px;border-radius:20px;font-size:12px;font-weight:700;border:1px solid #FCD34D;">⏳ UNPAID</span>`
          }
          <span style="background:#FEF3C7;color:#92400E;padding:6px 16px;border-radius:20px;font-size:12px;font-weight:700;border:1px solid #FCD34D;">🕐 PENDING CONFIRMATION</span>
        </div>
      </div>
      <div style="margin:20px 30px;background:#F9FAFB;border-radius:12px;overflow:hidden;border:1px solid #E5E7EB;">
        <div style="background:#F1F5F9;padding:14px 20px;border-bottom:1px solid #E5E7EB;">
          <h4 style="margin:0;color:#475569;font-size:14px;font-weight:700;">📋 PATIENT DETAILS</h4>
        </div>
        <table style="width:100%;border-collapse:collapse;">
          <tr><td style="padding:12px 20px;font-weight:600;color:#374151;border-bottom:1px solid #E5E7EB;width:140px;">👤 Name</td><td style="padding:12px 20px;color:#0F172A;border-bottom:1px solid #E5E7EB;font-weight:700;font-size:16px;">${booking.name}</td></tr>
          <tr><td style="padding:12px 20px;font-weight:600;color:#374151;border-bottom:1px solid #E5E7EB;">📧 Email</td><td style="padding:12px 20px;border-bottom:1px solid #E5E7EB;"><a href="mailto:${booking.email}" style="color:#2563EB;text-decoration:none;font-weight:600;">${booking.email}</a></td></tr>
          <tr><td style="padding:12px 20px;font-weight:600;color:#374151;border-bottom:1px solid #E5E7EB;">📱 Phone</td><td style="padding:12px 20px;border-bottom:1px solid #E5E7EB;"><a href="tel:${booking.phone}" style="color:#2563EB;text-decoration:none;font-weight:600;">${booking.phone}</a></td></tr>
          <tr><td style="padding:12px 20px;font-weight:600;color:#374151;border-bottom:1px solid #E5E7EB;">🏥 Department</td><td style="padding:12px 20px;color:#0F172A;border-bottom:1px solid #E5E7EB;font-weight:700;">${booking.department}</td></tr>
          ${booking.doctorName ? `<tr><td style="padding:12px 20px;font-weight:600;color:#374151;border-bottom:1px solid #E5E7EB;">👨‍⚕️ Doctor</td><td style="padding:12px 20px;color:#0F172A;border-bottom:1px solid #E5E7EB;font-weight:700;">Dr. ${booking.doctorName}</td></tr>` : ''}
          <tr><td style="padding:12px 20px;font-weight:600;color:#374151;border-bottom:1px solid #E5E7EB;">📅 Date</td><td style="padding:12px 20px;color:#0F172A;border-bottom:1px solid #E5E7EB;font-weight:700;">${booking.date}</td></tr>
          <tr><td style="padding:12px 20px;font-weight:600;color:#374151;border-bottom:1px solid #E5E7EB;">⏰ Time</td><td style="padding:12px 20px;color:#0F172A;border-bottom:1px solid #E5E7EB;font-weight:700;">${booking.time}</td></tr>
          <tr><td style="padding:12px 20px;font-weight:600;color:#374151;border-bottom:1px solid #E5E7EB;">📱 Type</td><td style="padding:12px 20px;color:#0F172A;border-bottom:1px solid #E5E7EB;">${booking.appointmentType}</td></tr>
          ${booking.message ? `<tr><td style="padding:12px 20px;font-weight:600;color:#374151;border-bottom:1px solid #E5E7EB;">💬 Concern</td><td style="padding:12px 20px;color:#0F172A;border-bottom:1px solid #E5E7EB;">${booking.message}</td></tr>` : ''}
          ${isPaid
            ? `<tr><td style="padding:12px 20px;font-weight:600;color:#374151;border-bottom:1px solid #E5E7EB;">💳 Payment ID</td><td style="padding:12px 20px;color:#059669;border-bottom:1px solid #E5E7EB;font-family:monospace;font-weight:700;">${booking.paymentId}</td></tr>
               <tr><td style="padding:12px 20px;font-weight:600;color:#374151;">💰 Amount</td><td style="padding:12px 20px;color:#059669;font-weight:800;font-size:18px;">₹${booking.amountPaid}</td></tr>`
            : `<tr><td style="padding:12px 20px;font-weight:600;color:#374151;">💰 Payment</td><td style="padding:12px 20px;color:#DC2626;font-weight:700;">Not Paid (Offline Visit)</td></tr>`
          }
        </table>
      </div>
      ${booking.file ? `
      <div style="margin:0 30px 20px;padding:14px;background:#FFF7ED;border-radius:10px;border:1px solid #FDBA74;">
        <p style="margin:0;font-size:13px;color:#9A3412;font-weight:700;">📎 Medical Report Attached: <strong>${booking.file.name || 'File uploaded'}</strong></p>
        <p style="margin:4px 0 0;font-size:11px;color:#C2410C;">View in admin dashboard → Bookings section</p>
      </div>` : ''}
      <div style="margin:0 30px 20px;text-align:center;">
        <p style="margin:0 0 10px;font-size:13px;color:#6B7280;font-weight:600;">⚡ Action Required: Review and confirm this appointment</p>
        <a href="${process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'}/admin/dashboard" target="_blank"
           style="display:inline-block;background:linear-gradient(135deg,#059669,#047857);color:#ffffff;text-decoration:none;padding:14px 40px;border-radius:12px;font-weight:700;font-size:16px;box-shadow:0 4px 15px rgba(5,150,105,0.4);">
          🔗 Open Admin Dashboard
        </a>
      </div>
      <div style="background:#F9FAFB;padding:20px;text-align:center;border-top:1px solid #E5E7EB;">
        <p style="color:#9CA3AF;font-size:11px;margin:0;">Auto-generated | ${new Date().toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' })}</p>
      </div>
    </div>
  `;
}

function doctorNewBookingHTML(booking) {
  const isOnline = booking.appointmentType === 'Online';
  const isPaid = booking.paymentStatus === 'PAID';

  return `
    <div style="font-family:'Segoe UI',Arial,sans-serif;max-width:650px;margin:auto;border:1px solid #e5e7eb;border-radius:16px;overflow:hidden;box-shadow:0 4px 12px rgba(0,0,0,0.08);">
      <div style="background:linear-gradient(135deg,#0F766E,#14B8A6);padding:30px;text-align:center;">
        <h1 style="color:#ffffff;margin:0;font-size:24px;font-weight:800;">👨‍⚕️ New Patient Appointment</h1>
        <p style="color:#A7F3D0;margin:8px 0 0;font-size:13px;">Aadhunika Hospital — Doctor Notification</p>
      </div>
      <div style="text-align:center;padding:20px 30px 10px;">
        <div style="display:inline-flex;gap:8px;flex-wrap:wrap;justify-content:center;">
          ${isOnline
            ? `<span style="background:#DBEAFE;color:#1E40AF;padding:6px 16px;border-radius:20px;font-size:12px;font-weight:700;border:1px solid #93C5FD;">📹 ONLINE CONSULTATION</span>`
            : `<span style="background:#F0FDF4;color:#166534;padding:6px 16px;border-radius:20px;font-size:12px;font-weight:700;border:1px solid #86EFAC;">🏥 IN-PERSON VISIT</span>`
          }
          ${isPaid
            ? `<span style="background:#D1FAE5;color:#065F46;padding:6px 16px;border-radius:20px;font-size:12px;font-weight:700;border:1px solid #6EE7B7;">💳 PAID ₹${booking.amountPaid}</span>`
            : `<span style="background:#FEF3C7;color:#92400E;padding:6px 16px;border-radius:20px;font-size:12px;font-weight:700;border:1px solid #FCD34D;">⏳ UNPAID</span>`
          }
          <span style="background:#FEF3C7;color:#92400E;padding:6px 16px;border-radius:20px;font-size:12px;font-weight:700;border:1px solid #FCD34D;">🕐 AWAITING CONFIRMATION</span>
        </div>
      </div>
      <div style="margin:20px 30px;background:#F9FAFB;border-radius:12px;overflow:hidden;border:1px solid #E5E7EB;">
        <div style="background:#F1F5F9;padding:14px 20px;border-bottom:1px solid #E5E7EB;">
          <h4 style="margin:0;color:#475569;font-size:14px;font-weight:700;">📋 PATIENT DETAILS</h4>
        </div>
        <table style="width:100%;border-collapse:collapse;">
          <tr><td style="padding:12px 20px;font-weight:600;color:#374151;border-bottom:1px solid #E5E7EB;width:140px;">👤 Name</td><td style="padding:12px 20px;color:#0F172A;border-bottom:1px solid #E5E7EB;font-weight:700;font-size:16px;">${booking.name}</td></tr>
          <tr><td style="padding:12px 20px;font-weight:600;color:#374151;border-bottom:1px solid #E5E7EB;">📧 Email</td><td style="padding:12px 20px;border-bottom:1px solid #E5E7EB;"><a href="mailto:${booking.email}" style="color:#2563EB;text-decoration:none;font-weight:600;">${booking.email}</a></td></tr>
          <tr><td style="padding:12px 20px;font-weight:600;color:#374151;border-bottom:1px solid #E5E7EB;">📱 Phone</td><td style="padding:12px 20px;border-bottom:1px solid #E5E7EB;"><a href="tel:${booking.phone}" style="color:#2563EB;text-decoration:none;font-weight:600;">${booking.phone}</a></td></tr>
          <tr><td style="padding:12px 20px;font-weight:600;color:#374151;border-bottom:1px solid #E5E7EB;">🏥 Department</td><td style="padding:12px 20px;color:#0F172A;border-bottom:1px solid #E5E7EB;font-weight:700;">${booking.department}</td></tr>
          <tr><td style="padding:12px 20px;font-weight:600;color:#374151;border-bottom:1px solid #E5E7EB;">📅 Date</td><td style="padding:12px 20px;color:#0F172A;border-bottom:1px solid #E5E7EB;font-weight:700;">${booking.date}</td></tr>
          <tr><td style="padding:12px 20px;font-weight:600;color:#374151;border-bottom:1px solid #E5E7EB;">⏰ Time</td><td style="padding:12px 20px;color:#0F172A;border-bottom:1px solid #E5E7EB;font-weight:700;">${booking.time}</td></tr>
          <tr><td style="padding:12px 20px;font-weight:600;color:#374151;border-bottom:1px solid #E5E7EB;">📱 Type</td><td style="padding:12px 20px;color:#0F172A;border-bottom:1px solid #E5E7EB;">${booking.appointmentType}</td></tr>
          ${booking.message ? `<tr><td style="padding:12px 20px;font-weight:600;color:#374151;border-bottom:1px solid #E5E7EB;">💬 Concern</td><td style="padding:12px 20px;color:#0F172A;border-bottom:1px solid #E5E7EB;">${booking.message}</td></tr>` : ''}
          ${isPaid
            ? `<tr><td style="padding:12px 20px;font-weight:600;color:#374151;">💰 Amount</td><td style="padding:12px 20px;color:#059669;font-weight:800;font-size:18px;">₹${booking.amountPaid}</td></tr>`
            : `<tr><td style="padding:12px 20px;font-weight:600;color:#374151;">💰 Payment</td><td style="padding:12px 20px;color:#DC2626;font-weight:700;">Not Paid (Offline Visit)</td></tr>`
          }
        </table>
      </div>
      ${booking.file ? `
      <div style="margin:0 30px 20px;padding:14px;background:#FFF7ED;border-radius:10px;border:1px solid #FDBA74;">
        <p style="margin:0;font-size:13px;color:#9A3412;font-weight:700;">📎 Medical Report Attached: <strong>${booking.file.name || 'File uploaded'}</strong></p>
      </div>` : ''}
      <div style="margin:0 30px 20px;text-align:center;">
        <a href="${process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'}/doctor/dashboard" target="_blank"
           style="display:inline-block;background:linear-gradient(135deg,#0F766E,#14B8A6);color:#ffffff;text-decoration:none;padding:14px 40px;border-radius:12px;font-weight:700;font-size:16px;box-shadow:0 4px 15px rgba(15,118,110,0.4);">
          🔗 Open Doctor Dashboard
        </a>
      </div>
      <div style="background:#F9FAFB;padding:20px;text-align:center;border-top:1px solid #E5E7EB;">
        <p style="color:#9CA3AF;font-size:11px;margin:0;">Auto-generated | ${new Date().toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' })}</p>
      </div>
    </div>
  `;
}

function patientStatusHTML(booking, newStatus, nextSlot = null, meetingLink = null) {
  const statusConfig = {
    confirmed: {
      color: '#059669', bgColor: '#D1FAE5', icon: '✅',
      title: meetingLink ? 'Online Consultation Confirmed!' : 'Appointment Confirmed!',
      message: meetingLink
        ? 'Your Zoom meeting link is ready below. Join at your scheduled time.'
        : 'Please visit the hospital at your scheduled time.',
      badge: meetingLink ? '📹 ZOOM MEETING READY' : 'CONFIRMED',
    },
    rescheduled: {
      color: '#D97706', bgColor: '#FEF3C7', icon: '🔄',
      title: 'Appointment Rescheduled',
      message: meetingLink
        ? 'Your appointment has been rescheduled. Here is your new Zoom link and time.'
        : 'Your appointment has been rescheduled. Please see your new time below.',
      badge: 'RESCHEDULED',
    },
    cancelled: {
      color: '#DC2626', bgColor: '#FEE2E2', icon: '❌',
      title: 'Appointment Cancelled',
      message: nextSlot
        ? 'Your appointment was postponed. See next available slot below.'
        : 'Your appointment was cancelled. Contact us for rescheduling.',
      badge: nextSlot ? 'POSTPONED' : 'CANCELLED',
    },
    completed: {
      color: '#2563EB', bgColor: '#DBEAFE', icon: '🎉',
      title: 'Appointment Completed',
      message: 'Thank you for choosing Aadhunika Hospital!',
      badge: 'COMPLETED',
    },
  };

  const config = statusConfig[newStatus];
  if (!config) return null;

  let zoomLinkHTML = '';
  if ((newStatus === 'confirmed' || newStatus === 'rescheduled') && meetingLink) {
    const pwd = booking.meetingPassword || '';
    zoomLinkHTML = `
      <div style="margin:25px 30px;background:linear-gradient(135deg,#EFF6FF,#DBEAFE);border:3px solid #2563EB;border-radius:16px;padding:30px;text-align:center;box-shadow:0 4px 15px rgba(37,99,235,0.2);">
        <div style="margin-bottom:15px;">
          <span style="display:inline-block;background:#2D8CFF;color:#ffffff;padding:10px 24px;border-radius:20px;font-size:13px;font-weight:800;letter-spacing:1.2px;">📹 ZOOM VIDEO CONSULTATION</span>
        </div>
        <h3 style="margin:0 0 12px;color:#1E40AF;font-size:24px;font-weight:900;">Your Zoom Meeting Details</h3>
        <p style="margin:0 0 25px;color:#3B82F6;font-size:14px;font-weight:600;">Click below to join your consultation</p>
        <a href="${meetingLink}" target="_blank" style="display:inline-block;background:linear-gradient(135deg,#2563EB,#1D4ED8);color:#ffffff;text-decoration:none;padding:20px 60px;border-radius:14px;font-weight:900;font-size:22px;box-shadow:0 8px 25px rgba(37,99,235,0.5);margin:10px 0;text-transform:uppercase;letter-spacing:1px;">
          🎥 JOIN ZOOM MEETING
        </a>
        <div style="margin-top:25px;background:#ffffff;border-radius:12px;padding:20px;border:2px solid #BFDBFE;text-align:left;">
          <p style="margin:0 0 12px;font-size:12px;color:#6B7280;font-weight:700;text-transform:uppercase;">📋 Meeting Details</p>
          <div style="margin-bottom:10px;">
            <p style="margin:0 0 4px;font-size:11px;color:#9CA3AF;">MEETING LINK:</p>
            <a href="${meetingLink}" style="color:#2563EB;font-size:13px;word-break:break-all;font-weight:600;text-decoration:none;">${meetingLink}</a>
          </div>
          ${pwd ? `
          <div style="margin-bottom:10px;padding:12px;background:#FEF3C7;border-radius:8px;border:1px solid #FCD34D;">
            <p style="margin:0 0 4px;font-size:11px;color:#92400E;font-weight:700;">🔐 MEETING PASSWORD:</p>
            <p style="margin:0;font-size:18px;color:#B45309;font-weight:900;font-family:monospace;letter-spacing:2px;">${pwd}</p>
          </div>` : ''}
          <div>
            <p style="margin:0 0 4px;font-size:11px;color:#9CA3AF;">📅 SCHEDULED TIME:</p>
            <p style="margin:0;font-size:14px;color:#374151;font-weight:700;">${booking.date} at ${booking.time}</p>
          </div>
        </div>
        <div style="margin-top:20px;padding:16px;background:#FEF3C7;border-radius:10px;border:2px solid #FCD34D;">
          <p style="margin:0 0 8px;font-size:13px;color:#92400E;font-weight:800;">⚠️ IMPORTANT:</p>
          <ul style="margin:0;padding-left:20px;font-size:12px;color:#B45309;line-height:1.8;text-align:left;">
            <li>Join <strong>5 minutes before</strong> scheduled time</li>
            <li>Ensure stable internet connection</li>
            <li>Test camera and microphone beforehand</li>
            <li>Keep medical reports ready</li>
          </ul>
        </div>
      </div>
    `;
  }

  let paymentReceiptHTML = '';
  if (booking.paymentId && booking.amountPaid > 0 && newStatus !== 'cancelled') {
    const receiptDate = new Date(booking.createdAt || new Date()).toLocaleString('en-IN', {
      dateStyle: 'medium', timeStyle: 'short', timeZone: 'Asia/Kolkata',
    });
    paymentReceiptHTML = `
      <div style="margin:25px 30px;background:#FFFFFF;border-radius:16px;overflow:hidden;border:2px solid #10B981;">
        <div style="background:linear-gradient(135deg,#059669,#10B981);padding:20px;text-align:center;">
          <h2 style="color:#ffffff;margin:0;font-size:24px;font-weight:800;">💳 PAYMENT RECEIPT</h2>
        </div>
        <div style="padding:25px;">
          <table style="width:100%;border-collapse:collapse;margin-bottom:20px;">
            <tr style="border-bottom:1px solid #E5E7EB;">
              <td style="padding:12px 0;color:#6B7280;font-size:13px;font-weight:600;">Transaction ID</td>
              <td style="padding:12px 0;color:#065F46;font-size:13px;text-align:right;font-family:monospace;font-weight:700;">${booking.paymentId}</td>
            </tr>
            <tr style="border-bottom:1px solid #E5E7EB;">
              <td style="padding:12px 0;color:#6B7280;font-size:13px;font-weight:600;">Date</td>
              <td style="padding:12px 0;color:#374151;font-size:13px;text-align:right;">${receiptDate}</td>
            </tr>
            <tr style="border-bottom:1px solid #E5E7EB;">
              <td style="padding:12px 0;color:#6B7280;font-size:13px;font-weight:600;">Service</td>
              <td style="padding:12px 0;color:#374151;font-size:13px;text-align:right;">${booking.department}</td>
            </tr>
          </table>
          <div style="background:linear-gradient(135deg,#ECFDF5,#D1FAE5);border-radius:12px;padding:20px;text-align:center;border:2px solid #10B981;">
            <p style="margin:0 0 5px;font-size:12px;color:#065F46;font-weight:600;">Total Amount Paid</p>
            <p style="margin:0;font-size:36px;color:#047857;font-weight:900;">₹${booking.amountPaid}</p>
          </div>
        </div>
      </div>
    `;
  }

  let nextSlotHTML = '';
  if (newStatus === 'cancelled' && nextSlot) {
    nextSlotHTML = `
      <div style="margin:0 30px 20px;background:#F0FDF4;border-radius:12px;overflow:hidden;border:2px solid #86EFAC;">
        <div style="background:#16A34A;padding:14px 20px;">
          <h3 style="color:#ffffff;margin:0;font-size:16px;">🔄 Next Available Slot</h3>
        </div>
        <table style="width:100%;border-collapse:collapse;">
          <tr>
            <td style="padding:14px 20px;font-weight:600;color:#374151;">New Date & Time</td>
            <td style="padding:14px 20px;color:#16A34A;font-weight:700;font-size:16px;">${nextSlot.date} at ${nextSlot.time}</td>
          </tr>
        </table>
      </div>
    `;
  }

  return `
    <div style="font-family:'Segoe UI',Arial,sans-serif;max-width:650px;margin:auto;border:1px solid #e5e7eb;border-radius:16px;overflow:hidden;box-shadow:0 4px 12px rgba(0,0,0,0.08);">
      <div style="background:linear-gradient(135deg,#0F766E,#14B8A6);padding:35px;text-align:center;">
        <h1 style="color:#ffffff;margin:0;font-size:26px;font-weight:800;">🏥 Aadhunika Hospital</h1>
        <p style="color:#A7F3D0;margin:8px 0 0;font-size:14px;font-weight:600;">Multispeciality Healthcare</p>
      </div>
      <div style="text-align:center;padding:25px 30px 10px;">
        <div style="display:inline-block;background:${config.bgColor};color:${config.color};padding:12px 32px;border-radius:30px;font-size:15px;font-weight:700;letter-spacing:1.2px;border:2px solid ${config.color};">
          ${config.icon} ${config.badge}
        </div>
      </div>
      <div style="text-align:center;padding:10px 30px 5px;">
        <h2 style="color:#0F172A;margin:0;font-size:24px;font-weight:800;">${config.title}</h2>
        <p style="color:#374151;font-size:14px;margin:10px 0 0;line-height:1.6;">${config.message}</p>
        ${booking.cancelReason ? `<p style="color:#DC2626;font-size:14px;margin:10px 0 0;"><strong>Note:</strong> ${booking.cancelReason}</p>` : ''}
      </div>
      ${zoomLinkHTML}
      ${paymentReceiptHTML}
      <div style="margin:20px 30px;background:#F9FAFB;border-radius:12px;overflow:hidden;border:1px solid #E5E7EB;">
        <div style="background:#F1F5F9;padding:14px 20px;border-bottom:1px solid #E5E7EB;">
          <h4 style="margin:0;color:#475569;font-size:14px;font-weight:700;">📋 APPOINTMENT DETAILS</h4>
        </div>
        <table style="width:100%;border-collapse:collapse;">
          <tr><td style="padding:14px 20px;font-weight:600;color:#374151;border-bottom:1px solid #E5E7EB;">👤 Patient</td><td style="padding:14px 20px;color:#0F172A;border-bottom:1px solid #E5E7EB;font-weight:700;">${booking.name}</td></tr>
          <tr><td style="padding:14px 20px;font-weight:600;color:#374151;border-bottom:1px solid #E5E7EB;">🏥 Department</td><td style="padding:14px 20px;color:#0F172A;border-bottom:1px solid #E5E7EB;">${booking.department}</td></tr>
          <tr><td style="padding:14px 20px;font-weight:600;color:#374151;border-bottom:1px solid #E5E7EB;">📅 Date</td><td style="padding:14px 20px;color:#0F172A;border-bottom:1px solid #E5E7EB;font-weight:700;">${booking.date}</td></tr>
          <tr><td style="padding:14px 20px;font-weight:600;color:#374151;">⏰ Time</td><td style="padding:14px 20px;color:#0F172A;font-weight:700;">${booking.time}</td></tr>
        </table>
      </div>
      ${nextSlotHTML}
      <div style="margin:20px 30px;background:#F0FDF4;border-radius:10px;padding:18px 22px;border:1px solid #BBF7D0;">
        <p style="margin:0 0 10px;font-size:14px;color:#166534;font-weight:700;">📞 Need Help?</p>
        <p style="margin:0;font-size:13px;color:#15803D;">
          Call: <strong>+91 XXXXXXXXXX</strong><br>
          Email: <strong>support@aadhunikahospital.com</strong>
        </p>
      </div>
      <div style="background:#F9FAFB;padding:25px 20px;text-align:center;border-top:1px solid #E5E7EB;">
        <p style="color:#9CA3AF;font-size:11px;margin:0;">© ${new Date().getFullYear()} Aadhunika Hospital</p>
      </div>
    </div>
  `;
}

function adminStatusHTML(booking, newStatus, meetingLink) {
  const statusEmoji = { confirmed: '✅', cancelled: '❌', completed: '🎉', rescheduled: '🔄' };

  return `
    <div style="font-family:'Segoe UI',Arial,sans-serif;max-width:600px;margin:auto;border:1px solid #e5e7eb;border-radius:16px;overflow:hidden;">
      <div style="background:linear-gradient(135deg,#1E40AF,#3B82F6);padding:25px;text-align:center;">
        <h1 style="color:#ffffff;margin:0;font-size:20px;">${statusEmoji[newStatus] || '📋'} Booking ${newStatus.toUpperCase()}</h1>
      </div>
      <div style="padding:20px 30px;">
        <table style="width:100%;border-collapse:collapse;">
          <tr><td style="padding:10px 0;font-weight:600;color:#374151;">Patient</td><td style="padding:10px 0;color:#0F172A;font-weight:700;">${booking.name}</td></tr>
          <tr><td style="padding:10px 0;font-weight:600;color:#374151;">Department</td><td style="padding:10px 0;color:#0F172A;">${booking.department}</td></tr>
          <tr><td style="padding:10px 0;font-weight:600;color:#374151;">Date & Time</td><td style="padding:10px 0;color:#0F172A;font-weight:700;">${booking.date} at ${booking.time}</td></tr>
          ${meetingLink ? `<tr><td style="padding:10px 0;font-weight:600;color:#374151;">Zoom Link</td><td style="padding:10px 0;"><a href="${meetingLink}" style="color:#2563EB;font-weight:600;word-break:break-all;">${meetingLink}</a></td></tr>` : ''}
        </table>
      </div>
      <div style="background:#F9FAFB;padding:15px;text-align:center;border-top:1px solid #E5E7EB;">
        <p style="color:#9CA3AF;font-size:11px;margin:0;">Aadhunika Hospital Admin</p>
      </div>
    </div>
  `;
}

function doctorStatusHTML(booking, newStatus, meetingLink) {
  const statusEmoji = { confirmed: '✅', cancelled: '❌', completed: '🎉', rescheduled: '🔄' };
  const statusMessages = {
    confirmed: 'Your appointment with this patient has been confirmed.',
    cancelled: 'The appointment with this patient has been cancelled.',
    completed: 'The appointment with this patient is marked as completed.',
    rescheduled: 'The appointment with this patient has been rescheduled.',
  };

  return `
    <div style="font-family:'Segoe UI',Arial,sans-serif;max-width:600px;margin:auto;border:1px solid #e5e7eb;border-radius:16px;overflow:hidden;">
      <div style="background:linear-gradient(135deg,#0F766E,#14B8A6);padding:25px;text-align:center;">
        <h1 style="color:#ffffff;margin:0;font-size:20px;">${statusEmoji[newStatus] || '📋'} Appointment ${newStatus.toUpperCase()}</h1>
        <p style="color:#A7F3D0;margin:8px 0 0;font-size:13px;">Doctor Notification — Aadhunika Hospital</p>
      </div>
      <div style="padding:20px 30px;">
        <p style="margin:0 0 16px;font-size:14px;color:#374151;">${statusMessages[newStatus] || 'Appointment status updated.'}</p>
        <table style="width:100%;border-collapse:collapse;">
          <tr><td style="padding:10px 0;font-weight:600;color:#374151;border-bottom:1px solid #F1F5F9;">👤 Patient</td><td style="padding:10px 0;color:#0F172A;font-weight:700;border-bottom:1px solid #F1F5F9;">${booking.name}</td></tr>
          <tr><td style="padding:10px 0;font-weight:600;color:#374151;border-bottom:1px solid #F1F5F9;">📧 Email</td><td style="padding:10px 0;border-bottom:1px solid #F1F5F9;"><a href="mailto:${booking.email}" style="color:#2563EB;font-weight:600;">${booking.email}</a></td></tr>
          <tr><td style="padding:10px 0;font-weight:600;color:#374151;border-bottom:1px solid #F1F5F9;">📱 Phone</td><td style="padding:10px 0;border-bottom:1px solid #F1F5F9;"><a href="tel:${booking.phone}" style="color:#2563EB;font-weight:600;">${booking.phone}</a></td></tr>
          <tr><td style="padding:10px 0;font-weight:600;color:#374151;border-bottom:1px solid #F1F5F9;">🏥 Department</td><td style="padding:10px 0;color:#0F172A;border-bottom:1px solid #F1F5F9;">${booking.department}</td></tr>
          <tr><td style="padding:10px 0;font-weight:600;color:#374151;border-bottom:1px solid #F1F5F9;">📅 Date & Time</td><td style="padding:10px 0;color:#0F172A;font-weight:700;border-bottom:1px solid #F1F5F9;">${booking.date} at ${booking.time}</td></tr>
          ${meetingLink ? `
          <tr>
            <td style="padding:10px 0;font-weight:600;color:#374151;border-bottom:1px solid #F1F5F9;">📹 Zoom (Host)</td>
            <td style="padding:10px 0;border-bottom:1px solid #F1F5F9;">
              <a href="${booking.hostLink || meetingLink}" style="color:#059669;font-weight:700;word-break:break-all;">${booking.hostLink ? '🎥 Start as Host' : meetingLink}</a>
            </td>
          </tr>` : ''}
          ${booking.meetingPassword ? `
          <tr>
            <td style="padding:10px 0;font-weight:600;color:#374151;">🔐 Password</td>
            <td style="padding:10px 0;color:#B45309;font-family:monospace;font-weight:700;font-size:16px;">${booking.meetingPassword}</td>
          </tr>` : ''}
        </table>
      </div>
      <div style="margin:0 20px 20px;text-align:center;">
        <a href="${process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'}/doctor/dashboard" target="_blank"
           style="display:inline-block;background:linear-gradient(135deg,#0F766E,#14B8A6);color:#ffffff;text-decoration:none;padding:12px 32px;border-radius:12px;font-weight:700;font-size:15px;">
          🔗 Open Doctor Dashboard
        </a>
      </div>
      <div style="background:#F9FAFB;padding:15px;text-align:center;border-top:1px solid #E5E7EB;">
        <p style="color:#9CA3AF;font-size:11px;margin:0;">Aadhunika Hospital — Doctor Portal</p>
      </div>
    </div>
  `;
}

// =============================================
// EXPORTED SEND FUNCTIONS
// =============================================

export async function sendPatientBookingEmail(booking) {
  try {
    const transporter = getTransporter();
    await transporter.sendMail({
      from: `"Aadhunika Hospital" <${process.env.EMAIL_USER}>`,
      to: booking.email,
      subject: booking.paymentId
        ? `✅ Payment ₹${booking.amountPaid} Received - Awaiting Confirmation`
        : `📋 Appointment Request Received - ${booking.department}`,
      html: patientBookingHTML(booking),
    });
    console.log(`✅ Patient booking email sent to ${booking.email}`);
  } catch (err) {
    console.error('⚠️ Patient booking email failed:', err.message);
  }
}

export async function sendAdminNewBookingEmail(booking, adminEmail) {
  try {
    const transporter = getTransporter();
    await transporter.sendMail({
      from: `"Aadhunika Hospital Booking" <${process.env.EMAIL_USER}>`,
      to: adminEmail,
      subject: booking.paymentId
        ? `🔔 New PAID Booking | ${booking.name} | ${booking.department} | ₹${booking.amountPaid}`
        : `🔔 New Booking | ${booking.name} | ${booking.department} | ${booking.date}`,
      html: adminNewBookingHTML(booking),
    });
    console.log(`✅ Admin new booking email sent to ${adminEmail}`);
  } catch (err) {
    console.error('⚠️ Admin new booking email failed:', err.message);
  }
}

export async function sendDoctorNewBookingEmail(booking, doctorEmail) {
  try {
    const transporter = getTransporter();
    await transporter.sendMail({
      from: `"Aadhunika Hospital" <${process.env.EMAIL_USER}>`,
      to: doctorEmail,
      subject: booking.paymentId
        ? `👨‍⚕️ New PAID Patient | ${booking.name} | ${booking.department} | ₹${booking.amountPaid}`
        : `👨‍⚕️ New Patient Booked | ${booking.name} | ${booking.department} | ${booking.date}`,
      html: doctorNewBookingHTML(booking),
    });
    console.log(`✅ Doctor new booking email sent to ${doctorEmail}`);
  } catch (err) {
    console.error('⚠️ Doctor new booking email failed:', err.message);
  }
}

export async function sendPatientStatusEmail(booking, status, nextSlot, meetingLink) {
  try {
    const subjects = {
      confirmed: meetingLink
        ? `✅ Confirmed | Zoom Meeting Link - ${booking.department}`
        : `✅ Appointment Confirmed - ${booking.department}`,
      rescheduled: `🔄 Appointment Rescheduled - ${booking.department}`,
      cancelled: `❌ Appointment Cancelled - ${booking.department}`,
      completed: `🎉 Thank You - ${booking.department}`,
    };

    const html = patientStatusHTML(booking, status, nextSlot, meetingLink);
    if (!html) return;

    const transporter = getTransporter();
    await transporter.sendMail({
      from: `"Aadhunika Hospital" <${process.env.EMAIL_USER}>`,
      to: booking.email,
      subject: subjects[status] || 'Appointment Update',
      html,
    });
    console.log(`✅ Patient status email (${status}) sent to ${booking.email}`);
  } catch (err) {
    console.error('⚠️ Patient status email failed:', err.message);
  }
}

export async function sendAdminStatusEmail(booking, status, meetingLink, adminEmail) {
  try {
    const subjects = {
      confirmed: `✅ Confirmed: ${booking.name} | ${booking.department}`,
      rescheduled: `🔄 Rescheduled: ${booking.name} | ${booking.department}`,
      cancelled: `❌ Cancelled: ${booking.name} | ${booking.department}`,
      completed: `🎉 Completed: ${booking.name} | ${booking.department}`,
    };

    const transporter = getTransporter();
    await transporter.sendMail({
      from: `"Aadhunika Hospital" <${process.env.EMAIL_USER}>`,
      to: adminEmail,
      subject: subjects[status] || `Booking Update: ${booking.name}`,
      html: adminStatusHTML(booking, status, meetingLink),
    });
    console.log(`✅ Admin status email (${status}) sent to ${adminEmail}`);
  } catch (err) {
    console.error('⚠️ Admin status email failed:', err.message);
  }
}

export async function sendDoctorStatusEmail(booking, status, meetingLink, doctorEmail) {
  try {
    const subjects = {
      confirmed: `✅ Confirmed: ${booking.name} | ${booking.department}`,
      rescheduled: `🔄 Rescheduled: ${booking.name} | ${booking.department}`,
      cancelled: `❌ Cancelled: ${booking.name} | ${booking.department}`,
      completed: `🎉 Completed: ${booking.name} | ${booking.department}`,
    };

    const transporter = getTransporter();
    await transporter.sendMail({
      from: `"Aadhunika Hospital" <${process.env.EMAIL_USER}>`,
      to: doctorEmail,
      subject: subjects[status] || `Appointment Update: ${booking.name}`,
      html: doctorStatusHTML(booking, status, meetingLink),
    });
    console.log(`✅ Doctor status email (${status}) sent to ${doctorEmail}`);
  } catch (err) {
    console.error('⚠️ Doctor status email failed:', err.message);
  }
}
