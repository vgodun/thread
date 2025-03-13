import { NextRequest, NextResponse } from "next/server";
import { triggerNotification } from "@/lib/pusher";

// Force dynamic rendering for this API route
export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest) {
  try {
    // Parse the request body
    const body = await req.json();
    const { channelName, eventName, data } = body;
    
    // Validate required fields
    if (!channelName || !eventName || !data) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    // Log the event (in a real implementation, this would be stored in a database)
    console.log(`[API] Received comment event: ${eventName} on channel ${channelName}`, data);
    
    // In a production environment, you would use a real-time service like Pusher
    // or a database with change streams to propagate this event to other clients
    
    // For now, we'll just log it and return success
    // The client-side code will handle the real-time updates using localStorage

    // Return success response
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error in realtime comments API:", error);
    return NextResponse.json(
      { error: "Failed to process request" },
      { status: 500 }
    );
  }
}
