import { NextRequest, NextResponse } from "next/server";
import { getUserActivity } from "@/lib/actions/activity.actions";
import { connectToDB } from "@/lib/mongoose";
import Notification from "@/lib/models/notification.model";
import User from "@/lib/models/user.model";
import Thread from "@/lib/models/thread.model";
import { sanitizeDocuments } from "@/lib/utils/sanitize";

// Force dynamic rendering for this API route
export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    // Get the userId from the query parameters
    const url = new URL(request.url);
    const userId = url.searchParams.get("userId");

    if (!userId) {
      return NextResponse.json(
        { error: "User ID is required" },
        { status: 400 }
      );
    }

    // Connect to the database
    await connectToDB();

    // Get the user's MongoDB _id
    const user = await User.findOne({ id: userId });
    if (!user) {
      return NextResponse.json(
        { error: "User not found" },
        { status: 404 }
      );
    }

    // Call the server action to get user activity
    const activities = await getUserActivity(userId);

    // Get mention notifications
    const mentionNotifications = await Notification.find({
      recipient: user._id,
      type: "mention"
    })
    .sort({ createdAt: -1 })
    .populate({
      path: "sender",
      model: User,
      select: "name username image _id id"
    })
    .populate({
      path: "threadId",
      model: Thread,
      select: "text _id createdAt"
    });

    // Convert notifications to activity format
    const mentionActivities = mentionNotifications.map(notification => ({
      type: "mention",
      date: notification.createdAt,
      threadId: notification.threadId?._id.toString(),
      content: notification.threadId?.text || "",
      author: notification.sender,
      isRead: notification.isRead
    }));

    // Combine all activities and sort by date (newest first)
    const allActivities = [...activities, ...mentionActivities].sort((a, b) => {
      return new Date(b.date).getTime() - new Date(a.date).getTime();
    });

    // Sanitize the data to prevent circular references
    const sanitizedActivities = sanitizeDocuments(allActivities);

    // Return the activities as JSON
    return NextResponse.json(sanitizedActivities);
  } catch (error) {
    console.error("Error in activity API route:", error);
    return NextResponse.json(
      { error: "Failed to fetch activities" },
      { status: 500 }
    );
  }
}
