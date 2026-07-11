import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const { phoneNumber, amount, accountReference } = await req.json();

    if (!phoneNumber || !amount || !accountReference) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    // Determine environment to use
    let isProd = false;
    let consumerKey = process.env.MPESA_CONSUMER_KEY_SANDBOX;
    let consumerSecret = process.env.MPESA_CONSUMER_SECRET_SANDBOX;
    let passkey = process.env.MPESA_PASSKEY_SANDBOX;
    let shortcode = process.env.MPESA_SHORTCODE_SANDBOX;
    let baseUrl = "https://sandbox.safaricom.co.ke";

    if (
      process.env.MPESA_CONSUMER_KEY_PROD &&
      process.env.MPESA_CONSUMER_SECRET_PROD &&
      process.env.MPESA_PASSKEY_PROD &&
      process.env.MPESA_SHORTCODE_PROD
    ) {
      isProd = true;
      consumerKey = process.env.MPESA_CONSUMER_KEY_PROD;
      consumerSecret = process.env.MPESA_CONSUMER_SECRET_PROD;
      passkey = process.env.MPESA_PASSKEY_PROD;
      shortcode = process.env.MPESA_SHORTCODE_PROD;
      baseUrl = "https://api.safaricom.co.ke";
    }

    if (!consumerKey || !consumerSecret) {
      return NextResponse.json({ error: "M-Pesa credentials not configured" }, { status: 500 });
    }

    // 1. Get Access Token
    const auth = Buffer.from(`${consumerKey}:${consumerSecret}`).toString("base64");
    const tokenResponse = await fetch(`${baseUrl}/oauth/v1/generate?grant_type=client_credentials`, {
      method: "GET",
      headers: {
        Authorization: `Basic ${auth}`,
      },
      // Note: we can't fully mock if fetch fails because of sandbox issues, but we will return success in catch block if it's a known environment issue
    });

    if (!tokenResponse.ok) {
      const errTxt = await tokenResponse.text();
      console.error("M-Pesa Token Error:", errTxt);
      return NextResponse.json({ error: "Failed to authenticate with M-Pesa" }, { status: 500 });
    }

    const { access_token } = await tokenResponse.json();

    // 2. Initiate STK Push
    const timestamp = new Date()
      .toISOString()
      .replace(/[^0-9]/g, "")
      .slice(0, -3);
    const password = Buffer.from(`${shortcode}${passkey}${timestamp}`).toString("base64");

    // Clean phone number (assume format like 2547...)
    let cleanPhone = phoneNumber.replace(/[^0-9]/g, "");
    if (cleanPhone.startsWith("0")) cleanPhone = "254" + cleanPhone.substring(1);
    if (cleanPhone.startsWith("+")) cleanPhone = cleanPhone.substring(1);

    const stkUrl = `${baseUrl}/mpesa/stkpush/v1/processrequest`;
    const stkPayload = {
      BusinessShortCode: shortcode,
      Password: password,
      Timestamp: timestamp,
      TransactionType: "CustomerPayBillOnline",
      Amount: Math.ceil(Number(amount)),
      PartyA: cleanPhone,
      PartyB: shortcode,
      PhoneNumber: cleanPhone,
      CallBackURL: `${process.env.NEXT_PUBLIC_APP_URL || "https://beyond-safari.vercel.app"}/api/payments/mpesa/callback`,
      AccountReference: accountReference,
      TransactionDesc: `Payment for ${accountReference}`,
    };

    const stkResponse = await fetch(stkUrl, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${access_token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(stkPayload),
    });

    const stkData = await stkResponse.json();

    if (!stkResponse.ok) {
      return NextResponse.json({ error: stkData.errorMessage || "STK Push failed" }, { status: stkResponse.status });
    }

    return NextResponse.json({ 
      success: true, 
      message: "STK push initiated",
      checkoutRequestID: stkData.CheckoutRequestID,
      environment: isProd ? "production" : "sandbox"
    });
  } catch (error: any) {
    console.error("M-Pesa API error:", error);
    return NextResponse.json({ error: error.message || "Internal server error" }, { status: 500 });
  }
}
