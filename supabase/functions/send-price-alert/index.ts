import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

interface PriceAlert {
  userId: string;
  cropName: string;
  cropEmoji: string;
  district: string;
  oldPrice: number;
  newPrice: number;
  changePercent: number;
}

const sendSMS = async (phone: string, message: string): Promise<boolean> => {
  const accountSid = Deno.env.get("TWILIO_ACCOUNT_SID");
  const authToken = Deno.env.get("TWILIO_AUTH_TOKEN");
  const messagingServiceSid = Deno.env.get("TWILIO_MESSAGING_SERVICE_SID");

  if (!accountSid || !authToken || !messagingServiceSid) {
    console.error("Twilio credentials not configured");
    return false;
  }

  try {
    const response = await fetch(
      `https://api.twilio.com/2010-04-01/Accounts/${accountSid}/Messages.json`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
          Authorization: `Basic ${btoa(`${accountSid}:${authToken}`)}`,
        },
        body: new URLSearchParams({
          MessagingServiceSid: messagingServiceSid,
          To: phone,
          Body: message,
        }),
      }
    );

    if (!response.ok) {
      const error = await response.text();
      console.error("Twilio error:", error);
      return false;
    }

    console.log("SMS sent successfully to:", phone);
    return true;
  } catch (error) {
    console.error("Error sending SMS:", error);
    return false;
  }
};

const sendEmail = async (
  email: string,
  subject: string,
  htmlContent: string
): Promise<boolean> => {
  const resendApiKey = Deno.env.get("RESEND_API_KEY");

  if (!resendApiKey) {
    console.error("Resend API key not configured");
    return false;
  }

  try {
    const response = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${resendApiKey}`,
      },
      body: JSON.stringify({
        from: "Karnataka Krishi Mandi <onboarding@resend.dev>",
        to: [email],
        subject: subject,
        html: htmlContent,
      }),
    });

    if (!response.ok) {
      const error = await response.text();
      console.error("Resend error:", error);
      return false;
    }

    console.log("Email sent successfully to:", email);
    return true;
  } catch (error) {
    console.error("Error sending email:", error);
    return false;
  }
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    const { alerts }: { alerts: PriceAlert[] } = await req.json();

    if (!alerts || alerts.length === 0) {
      return new Response(
        JSON.stringify({ success: true, message: "No alerts to send" }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const results = {
      sms: { sent: 0, failed: 0 },
      email: { sent: 0, failed: 0 },
    };

    // Group alerts by user
    const alertsByUser = alerts.reduce((acc, alert) => {
      if (!acc[alert.userId]) {
        acc[alert.userId] = [];
      }
      acc[alert.userId].push(alert);
      return acc;
    }, {} as Record<string, PriceAlert[]>);

    for (const [userId, userAlerts] of Object.entries(alertsByUser)) {
      // Get user preferences
      const { data: profile, error: profileError } = await supabase
        .from("profiles")
        .select(
          "phone, notification_email, sms_notifications_enabled, email_notifications_enabled"
        )
        .eq("user_id", userId)
        .maybeSingle();

      if (profileError || !profile) {
        console.error("Error fetching profile for user:", userId, profileError);
        continue;
      }

      // Build notification content
      const alertSummary = userAlerts
        .map(
          (a) =>
            `${a.cropEmoji} ${a.cropName} (${a.district}): ₹${a.oldPrice.toLocaleString()} → ₹${a.newPrice.toLocaleString()} (+${a.changePercent.toFixed(1)}%)`
        )
        .join("\n");

      // Send SMS if enabled
      if (profile.sms_notifications_enabled && profile.phone) {
        const smsMessage = `🌾 Karnataka Krishi Mandi Price Alert!\n\n${alertSummary}\n\nCheck app for details.`;

        const smsSent = await sendSMS(profile.phone, smsMessage);
        if (smsSent) {
          results.sms.sent++;
        } else {
          results.sms.failed++;
        }
      }

      // Send email if enabled
      if (profile.email_notifications_enabled && profile.notification_email) {
        const emailSubject = `🌾 Price Alert: ${userAlerts.length} crop${userAlerts.length > 1 ? "s" : ""} with price increases!`;

        const emailHtml = `
          <!DOCTYPE html>
          <html>
          <head>
            <style>
              body { font-family: Arial, sans-serif; background: #f5f5f5; padding: 20px; }
              .container { max-width: 600px; margin: 0 auto; background: white; border-radius: 12px; padding: 24px; }
              .header { text-align: center; margin-bottom: 24px; }
              .header h1 { color: #16a34a; margin: 0; }
              .alert-card { background: #f0fdf4; border: 1px solid #bbf7d0; border-radius: 8px; padding: 16px; margin-bottom: 12px; }
              .crop-name { font-weight: bold; font-size: 18px; }
              .price-change { color: #16a34a; font-weight: bold; }
              .district { color: #666; font-size: 14px; }
              .footer { text-align: center; margin-top: 24px; color: #666; font-size: 12px; }
            </style>
          </head>
          <body>
            <div class="container">
              <div class="header">
                <h1>🌾 Karnataka Krishi Mandi</h1>
                <p>Price Alert Notification</p>
              </div>
              
              <p>Good news! The following crops have seen significant price increases:</p>
              
              ${userAlerts
                .map(
                  (a) => `
                <div class="alert-card">
                  <div class="crop-name">${a.cropEmoji} ${a.cropName}</div>
                  <div class="district">${a.district}</div>
                  <div style="margin-top: 8px;">
                    <span style="color: #666;">₹${a.oldPrice.toLocaleString()}</span>
                    <span style="margin: 0 8px;">→</span>
                    <span class="price-change">₹${a.newPrice.toLocaleString()} (+${a.changePercent.toFixed(1)}%)</span>
                  </div>
                </div>
              `
                )
                .join("")}
              
              <div class="footer">
                <p>Karnataka Agricultural Market Price Information System</p>
                <p>You received this because you enabled price alerts.</p>
              </div>
            </div>
          </body>
          </html>
        `;

        const emailSent = await sendEmail(
          profile.notification_email,
          emailSubject,
          emailHtml
        );
        if (emailSent) {
          results.email.sent++;
        } else {
          results.email.failed++;
        }
      }
    }

    return new Response(
      JSON.stringify({
        success: true,
        results,
      }),
      {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  } catch (error) {
    console.error("Error in send-price-alert:", error);
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    return new Response(JSON.stringify({ success: false, error: errorMessage }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
