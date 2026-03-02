import { NextRequest, NextResponse } from 'next/server';
import { Resend } from 'resend';
import { createClient } from '@/lib/supabase/server';

export async function POST(request: NextRequest) {
  try {
    const apiKey = process.env.RESEND_API_KEY;
    if (!apiKey) {
      return NextResponse.json({ error: 'RESEND_API_KEY not configured' }, { status: 500 });
    }
    const resend = new Resend(apiKey);
    const { leaveRequestId } = await request.json();
    const hrEmail = process.env.HR_EMAIL;

    if (!hrEmail) {
      return NextResponse.json({ error: 'HR email not configured' }, { status: 500 });
    }

    const supabase = await createClient();

    const { data: lr, error } = await supabase
      .from('leave_requests')
      .select('*')
      .eq('id', leaveRequestId)
      .single();

    if (error || !lr) {
      return NextResponse.json({ error: 'Leave request not found' }, { status: 404 });
    }

    const { error: emailError } = await resend.emails.send({
      from: process.env.RESEND_FROM_EMAIL || 'onboarding@resend.dev',
      to: hrEmail,
      subject: `Leave Approved — ${lr.employee_name} — For Filing`,
      html: `
        <h2>Approved Leave Application — For Filing</h2>
        <p>The following leave application has been <strong>approved by management</strong> and is ready for filing:</p>
        <table style="border-collapse:collapse; margin:16px 0;">
          <tr><td style="padding:4px 12px; font-weight:bold;">Employee:</td><td style="padding:4px 12px;">${lr.employee_name}</td></tr>
          <tr><td style="padding:4px 12px; font-weight:bold;">Leave Type:</td><td style="padding:4px 12px;">${lr.leave_type}</td></tr>
          <tr><td style="padding:4px 12px; font-weight:bold;">From:</td><td style="padding:4px 12px;">${lr.start_date}</td></tr>
          <tr><td style="padding:4px 12px; font-weight:bold;">To:</td><td style="padding:4px 12px;">${lr.end_date}</td></tr>
          <tr><td style="padding:4px 12px; font-weight:bold;">Reason:</td><td style="padding:4px 12px;">${lr.reason || 'N/A'}</td></tr>
          <tr><td style="padding:4px 12px; font-weight:bold;">Approved By:</td><td style="padding:4px 12px;">${lr.approved_by || 'N/A'}</td></tr>
          <tr><td style="padding:4px 12px; font-weight:bold;">Approved Date:</td><td style="padding:4px 12px;">${lr.approved_date || 'N/A'}</td></tr>
        </table>
        <p style="color:#666; font-size:13px;">This is an automated notification from the Thornton OH&amp;S Management System.</p>
      `,
    });

    if (emailError) {
      console.error('[api/leave/notify-hr] Email error:', emailError);
      return NextResponse.json({ error: 'Failed to send email' }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error('[api/leave/notify-hr] Error:', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
