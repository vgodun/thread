import { connectToDB } from "@/lib/mongoose";
import Thread from "@/lib/models/thread.model";
import User from "@/lib/models/user.model";
import { NextRequest, NextResponse } from "next/server";

// Force dynamic rendering for this API route
export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  try {
    const url = new URL(req.url);
    const userId = url.searchParams.get("userId");

    if (!userId) {
      return NextResponse.json(
        { error: "User ID is required" },
        { status: 400 }
      );
    }

    await connectToDB();

    // Find the user to get their username
    const user = await User.findOne({ id: userId });
    if (!user) {
      return NextResponse.json(
        { error: "User not found" },
        { status: 404 }
      );
    }

    // Find threads that mention the user by username
    // Using a regex pattern to match @username in the text
    const mentionPattern = new RegExp(`@${user.username}\\b`, 'i');
    
    // Simple query to find threads that mention the user
    const threads = await Thread.find({
      text: mentionPattern
    })
    .populate({
      path: "author",
      model: User,
      select: "_id id name image username"
    })
    .sort({ createdAt: -1 });

    // Simplify the thread objects to avoid circular references
    const simplifiedThreads = threads.map(thread => ({
      _id: thread._id.toString(),
      text: thread.text,
      createdAt: thread.createdAt,
      parentId: thread.parentId,
      imgPosts: thread.imgPosts,
      author: {
        id: thread.author.id,
        name: thread.author.name,
        image: thread.author.image,
        username: thread.author.username
      },
      likes: thread.likes || []
    }));

    return NextResponse.json(simplifiedThreads);
  } catch (error) {
    console.error("Error fetching tagged threads:", error);
    return NextResponse.json(
      { error: "Failed to fetch tagged threads" },
      { status: 500 }
    );
  }
}
