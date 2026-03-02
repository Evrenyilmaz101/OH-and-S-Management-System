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
    const supabase = await createClient();

    const { data: lr, error: lrError } = await supabase
      .from('leave_requests')
      .select('*')
      .eq('id', leaveRequestId)
      .single();

    if (lrError || !lr) {
      return NextResponse.json({ error: 'Leave request not found' }, { status: 404 });
    }

    const { data: manager } = await supabase
      .from('employees')
      .select('first_name, last_name, email')
      .eq('id', lr.manager_id)
      .single();

    if (!manager?.email) {
      return NextResponse.json({ error: 'Manager not found or has no email' }, { status: 400 });
    }

    const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
    const approvalUrl = `${appUrl}/leave/approve?token=${lr.approval_token}`;

    const { error: emailError } = await resend.emails.send({
      from: process.env.RESEND_FROM_EMAIL || 'onboarding@resend.dev',
      to: manager.email,
      subject: `Leave Application — ${lr.employee_name}`,
      html: `
        <h2>Leave Application Requires Your Approval</h2>
        <p><strong>${lr.employee_name}</strong> has submitted a leave application:</p>
        <table style="border-collapse:collapse; margin:16px 0;">
          <tr><td style="padding:4px 12px; font-weight:bold;">Leave Type:</td><td style="padding:4px 12px;">${lr.leave_type}</td></tr>
          <tr><td style="padding:4px 12px; font-weight:bold;">From:</td><td style="padding:4px 12px;">${lr.start_date}</td></tr>
          <tr><td style="padding:4px 12px; font-weight:bold;">To:</td><td style="padding:4px 12px;">${lr.end_date}</td></tr>
          <tr><td style="padding:4px 12px; font-weight:bold;">Reason:</td><td style="padding:4px 12px;">${lr.reason || 'N/A'}</td></tr>
        </table>
        <p>Please review and action this request:</p>
        <a href="${approvalUrl}" style="display:inline-block; padding:12px 24px; background:#f59e0b; color:#000; text-decoration:none; border-radius:6px; font-weight:bold;">
          Review &amp; Approve
        </a>
        <p style="margin-top:16px; color:#666; font-size:13px;">Or copy this link: ${approvalUrl}</p>
      `,
    });

    if (emailError) {
      console.error('[api/leave/notify-manager] Email error:', emailError);
      return NextResponse.json({ error: 'Failed to send email' }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error('[api/leave/notify-manager] Error:', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
