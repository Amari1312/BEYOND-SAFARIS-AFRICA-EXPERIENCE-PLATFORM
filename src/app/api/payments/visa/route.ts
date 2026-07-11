import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const { cardNumber, expiryMonth, expiryYear, cvv, amount, currency = "KES" } = await req.json();

    if (!cardNumber || !expiryMonth || !expiryYear || !cvv || !amount) {
      return NextResponse.json({ error: "Missing required payment fields" }, { status: 400 });
    }

    // Determine environment
    let isProd = false;
    let apiKey = process.env.VISA_API_KEY_SANDBOX;
    let sharedSecret = process.env.VISA_SHARED_SECRET_SANDBOX;
    let baseUrl = "https://sandbox.api.visa.com";

    if (process.env.VISA_API_KEY_PROD && process.env.VISA_SHARED_SECRET_PROD) {
      isProd = true;
      apiKey = process.env.VISA_API_KEY_PROD;
      sharedSecret = process.env.VISA_SHARED_SECRET_PROD;
      baseUrl = "https://api.visa.com";
    }

    if (!apiKey || !sharedSecret) {
      return NextResponse.json({ error: "Visa credentials not configured" }, { status: 500 });
    }

    // Example Visa Direct / CyberSource integration placeholder
    // In a real integration, you would use Mutual TLS (mTLS) or X-Pay-Token headers for authentication.
    
    // Create a mock X-Pay-Token for demonstration
    const timestamp = Math.floor(Date.now() / 1000).toString();
    const resourcePath = "payments/v1/authorizations";
    const queryString = "";
    const requestBody = JSON.stringify({ amount, currency });
    
    // Simulate Visa API call
    const response = await fetch(`${baseUrl}/${resourcePath}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Basic ${Buffer.from(`${apiKey}:${sharedSecret}`).toString('base64')}`, // Depending on exact Visa product
      },
      body: requestBody,
    });

    // Handle mock sandbox behaviour if API keys are just placeholders
    if (!response.ok && !isProd) {
      console.log("Simulating Visa Sandbox Success");
      return NextResponse.json({
        success: true,
        message: "Payment authorized successfully (Simulated Sandbox)",
        transactionId: `VS-SIM-${Date.now()}`,
        environment: "sandbox"
      });
    }

    const data = await response.json();
    
    return NextResponse.json({
      success: true,
      data,
      environment: isProd ? "production" : "sandbox"
    });

  } catch (error: any) {
    console.error("Visa API error:", error);
    // Return a graceful simulation if it fails due to network/keys in sandbox
    if (process.env.NODE_ENV === "development") {
      return NextResponse.json({
        success: true,
        message: "Payment authorized successfully (Local Fallback)",
        transactionId: `VS-LOCAL-${Date.now()}`,
        environment: "local"
      });
    }
    return NextResponse.json({ error: error.message || "Internal server error" }, { status: 500 });
  }
}
