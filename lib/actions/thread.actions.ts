"use server";

import mongoose from "mongoose";
import { connectToDB } from "@/lib/mongoose";
import Thread from "@/lib/models/thread.model";
import User from "@/lib/models/user.model";
import { revalidatePath } from "next/cache";
import { createNotification } from "./notification.actions";
import { findUsersByUsername } from "./user.actions";
import { sanitizeDocument, sanitizeDocuments } from "../utils/sanitize";

interface ThreadParams {
  text: string;
  author: string;
  path: string;
  imgPosts: string;
}

// Helper function to extract mentions from text
async function extractMentions(text: string) {
  if (!text) return [];

  // Match @username pattern
  const mentionRegex = /@(\w+)/g;
  const matches = text.match(mentionRegex);

  if (!matches) return [];

  // Extract usernames without the @ symbol
  const usernames = matches.map((match) => match.substring(1));
  console.log("Extracted usernames from text:", usernames);
  return usernames;
}

export async function createThread({
  text,
  author,
  path,
  imgPosts,
}: ThreadParams) {
  try {
    connectToDB();

    // Extract mentions from the text
    const mentions = await extractMentions(text);
    console.log("Extracted mentions:", mentions);

    // Find users by their usernames
    const mentionedUsers = await findUsersByUsername(mentions);
    console.log(
      "Found mentioned users:",
      mentionedUsers.map((u) => ({ username: u.username, id: u.id }))
    );

    // Get the Clerk user IDs of mentioned users - ensure we only use the ID strings
    const tags = mentionedUsers.map((user) => user.id.toString());
    console.log("Tags to save:", tags);

    // Create the thread with tags only if there are mentions
    const threadData = {
      text,
      author,
      imgPosts,
      ...(tags.length > 0 ? { tags } : {}), // Only include tags field if there are mentions
    };

    console.log(
      "Creating thread with data:",
      JSON.stringify({
        ...threadData,
        text: threadData.text.substring(0, 30) + "...",
      })
    );

    const createdThread = await Thread.create(threadData);

    console.log("Created thread with ID:", createdThread._id);
    console.log("Thread tags:", createdThread.tags || "No tags");

    // Update user model
    await User.findByIdAndUpdate(author, {
      $push: { threads: createdThread._id },
    });

    // Create notifications for mentioned users
    if (tags.length > 0) {
      console.log("Creating notifications for tagged users");
      for (const taggedUserId of tags) {
        try {
          const notification = await createNotification({
            recipientId: taggedUserId,
            senderId: author,
            type: "mention",
            threadId: createdThread._id.toString(),
          });
          console.log(
            `Created notification for user ${taggedUserId}:`,
            notification?._id || "No notification created"
          );
        } catch (notifError) {
          console.error("Error creating notification:", notifError);
        }
      }
    }

    revalidatePath(path);

    // Return a plain object with only the necessary properties to avoid circular references
    return {
      _id: createdThread._id.toString(),
      text: createdThread.text,
      author: createdThread.author.toString(),
      createdAt: createdThread.createdAt,
      tags: createdThread.tags || [],
    };
  } catch (error: any) {
    console.error("Error in createThread:", error);
    throw new Error(`Failed to create thread: ${error.message}`);
  }
}

interface CommentParams {
  threadId: string;
  commentText: string;
  userId: string;
  path: string;
  imgPosts: string;
}

export async function addCommentToThread({
  threadId,
  commentText,
  userId,
  path,
  imgPosts,
}: CommentParams) {
  try {
    connectToDB();

    console.log(`Attempting to add comment to thread with ID: ${threadId}`);
    console.log(`User ID: ${userId}`);

    // Validate thread ID - more permissive validation
    if (!threadId) {
      throw new Error("Invalid thread ID - ID is missing");
    }

    // Find the original thread by ID
    let originalThread;
    try {
      originalThread = await Thread.findById(threadId);
    } catch (error) {
      console.error(`Error finding thread with ID ${threadId}:`, error);
      throw new Error("Invalid thread ID format");
    }

    if (!originalThread) {
      console.error(`Thread with ID ${threadId} not found`);
      throw new Error("Thread not found");
    }

    console.log(`Found original thread with ID: ${originalThread._id}, author: ${originalThread.author}`);

    // Extract mentions from the comment text
    const mentions = await extractMentions(commentText);
    console.log("Extracted mentions from comment:", mentions);

    // Find users by their usernames
    const mentionedUsers = await findUsersByUsername(mentions);
    console.log(
      "Found mentioned users in comment:",
      mentionedUsers.map((u) => u.username)
    );

    // Get the Clerk user IDs of mentioned users - ensure we only use the ID strings
    const tags = mentionedUsers.map((user) => user.id.toString());
    console.log("Comment tags to save:", tags);

    // Create a new thread as a comment
    const commentThreadData = {
      text: commentText,
      author: userId,
      parentId: threadId,
      imgPosts: imgPosts || "",
      ...(tags.length > 0 ? { tags } : {}), // Only include tags if there are mentions
    };

    console.log(
      "Creating comment thread with data:",
      JSON.stringify({
        ...commentThreadData,
        text: commentThreadData.text.substring(0, 30) + "...",
      })
    );

    const commentThread = await Thread.create(commentThreadData);

    console.log("Created comment thread with ID:", commentThread._id);
    console.log("Comment thread tags:", commentThread.tags || "No tags");

    // Update the original thread to include the new comment
    originalThread.children.push(commentThread._id);
    await originalThread.save();

    // Create notifications for mentioned users
    if (tags.length > 0) {
      console.log("Creating notifications for tagged users in comment");
      for (const taggedUserId of tags) {
        try {
          await createNotification({
            recipientId: taggedUserId,
            senderId: userId,
            type: "mention",
            threadId: commentThread._id.toString(),
          });
        } catch (notifError) {
          console.error(
            "Error creating notification for comment mention:",
            notifError
          );
        }
      }
    }

    // Also create a notification for the original thread author
    // (but only if the commenter is not the original author)
    const threadAuthorId = originalThread.author.toString();
    if (threadAuthorId !== userId) {
      try {
        await createNotification({
          recipientId: threadAuthorId,
          senderId: userId,
          type: "comment",
          threadId: originalThread._id.toString(),
        });
      } catch (notifError) {
        console.error(
          "Error creating notification for thread author:",
          notifError
        );
      }
    }

    revalidatePath(path);

    // Return a plain object with only the necessary properties to avoid circular references
    const result = {
      _id: commentThread._id.toString(),
      text: commentThread.text,
      author: commentThread.author.toString(),
      parentId: commentThread.parentId,
      createdAt: commentThread.createdAt,
      tags: commentThread.tags || [],
    };
    
    return sanitizeDocuments(result);
  } catch (error: any) {
    console.error("Error in addCommentToThread:", error);
    throw new Error(`Failed to add comment: ${error.message}`);
  }
}

interface Params {
  id: string;
  text: string;
  imgPosts: string;
  path: string;
}

export async function updateThread({ id, text, imgPosts, path }: Params) {
  connectToDB();
  try {
    await Thread.findByIdAndUpdate(
      { _id: id },
      {
        text: text,
        imgPosts: imgPosts,
      }
    );

    if (path === `/thread/edit/${id}`) {
      revalidatePath(path);
    }
  } catch (error: any) {
    throw new Error(`Failed to fetch user: ${error.message}`);
  }
}
export async function deleteImgPosts(
  threadId: string,
  imgPosts: string
): Promise<void> {
  connectToDB();
  console.log("imgPosts:", imgPosts);

  try {
    await Thread.findByIdAndUpdate(threadId, { $unset: { imgPosts: "" } });
    console.log(
      `Image posts field removed successfully from thread: ${threadId}`
    );
  } catch (error) {
    console.error(
      `There was an error removing the image posts field from the thread: ${threadId}`,
      error
    );
  }
}

export async function fetchPosts(pageNumber = 1, pageSize = 20) {
  connectToDB();

  // Calculate the number of posts to skip based on the page number and page size.
  const skipAmount = (pageNumber - 1) * pageSize;

  // Create a query to fetch the posts that have no parent (top-level threads) (a thread that is not a comment/reply).
  const postsQuery = Thread.find({ parentId: { $in: [null, undefined] } })
    .sort({ createdAt: "desc" })
    .skip(skipAmount)
    .limit(pageSize)
    .populate({
      path: "author",
      model: User,
    })
    .populate({
      path: "children", // Populate the children field
      populate: {
        path: "author", // Populate the author field within children
        model: User,
        select: "_id name parentId image", // Select only _id and username fields of the author
      },
    });

  // Count the total number of top-level posts (threads) i.e., threads that are not comments.
  const totalPostsCount = await Thread.countDocuments({
    parentId: { $in: [null, undefined] },
  }); // Get the total count of posts

  const posts = await postsQuery.exec();

  // Sanitize the posts to prevent circular references
  const sanitizedPosts = sanitizeDocuments(posts);

  const isNext = totalPostsCount > skipAmount + posts.length;

  return { posts: sanitizedPosts, isNext };
}

export async function fetchThreadById(id: string) {
  connectToDB();

  try {
    const thread = await Thread.findById(id)
      .populate({
        path: "author",
        model: User,
        select: "_id id name image ",
      })
      .populate({
        path: "children",
        populate: [
          {
            path: "author",
            model: User,
            select: "_id id name parentId image ",
          },
          {
            path: "children",
            model: Thread,
            populate: {
              path: "author",
              model: User,
              select: "_id id name parentId image ",
            },
          },
        ],
      })
      .exec();

    // Sanitize the thread to prevent circular references
    return sanitizeDocument(thread);
  } catch (error: any) {
    throw new Error(`Failed to fetch thread: ${error.message}`);
  }
}

interface CommentParams {
  threadId: string;
  commentText: string;
  userId: string;
  path: string;
  imgPosts: string;
}

export async function likePost(
  postId: string,
  userId: string,
  path: string,
  name: any,
  username: any,
  image: any
) {
  connectToDB();

  const getInfoLikes = {
    id: userId,
    name: name,
    username: username,
    image: image,
  };

  try {
    // Find the thread by its ID
    const thread = await Thread.findById(postId);

    if (!thread) {
      throw new Error("Thread not found");
    }

    // Check if the user has already liked the post
    if (userId && userId.trim() !== "") {
      // If the user has already liked the post, remove the like
      if (thread.likes.some((like: any) => like.id === getInfoLikes.id)) {
        // Remove the like from the array
        thread.likes = thread.likes.filter(
          (existingLike: any) => existingLike.id !== userId
        );
      } else {
        // If the user has not liked the post, add the like
        thread.likes.push(getInfoLikes);
      }
    }

    // Save the thread
    const updatedThread = await thread.save();

    revalidatePath(path);

    // Determine if the user has liked the post after the update
    // const isLiked = thread.likes.some((like:any) => like.id === userId);

    // return { likes: updatedThread.likes, isLiked };
    return updatedThread.likes;
  } catch (error: any) {
    throw new Error(`Failed to add or remove like from the post: ${error.message}`);
  }
}

async function fetchAllChildThreads(threadId: string): Promise<any[]> {
  const childThreads = await Thread.find({ parentId: threadId });

  const descendantThreads = [];
  for (const childThread of childThreads) {
    const descendants = await fetchAllChildThreads(childThread._id);
    descendantThreads.push(childThread, ...descendants);
  }

  return descendantThreads;
}

export async function deleteThread(id: string, path: string): Promise<void> {
  try {
    connectToDB();

    // Check if id is valid
    if (!id || typeof id !== 'string') {
      throw new Error("Invalid thread ID");
    }

    console.log(`Attempting to delete thread with ID: ${id}`);

    // Find the thread to be deleted (the main thread)
    const mainThread = await Thread.findById(id);

    if (!mainThread) {
      console.log(`Thread with ID ${id} not found`);
      // If the thread doesn't exist, we can consider the deletion "successful"
      // since the end result is the same - the thread doesn't exist anymore
      revalidatePath(path);
      return;
    }

    console.log(`Found thread with ID ${id}, author: ${mainThread.author}`);

    // Fetch all child threads and their descendants recursively
    const descendantThreads = await fetchAllChildThreads(id);
    console.log(`Found ${descendantThreads.length} descendant threads`);

    // Get all descendant thread IDs including the main thread ID and child thread IDs
    const descendantThreadIds = [
      id,
      ...descendantThreads.map((thread) => thread._id.toString()),
    ];

    // Extract the authorIds to update User models
    const authorIds = [];
    
    // Add the main thread's author if it exists
    if (mainThread.author) {
      authorIds.push(mainThread.author.toString());
    }
    
    // Add descendant threads' authors if they exist
    descendantThreads.forEach(thread => {
      if (thread.author) {
        authorIds.push(thread.author.toString());
      }
    });
    
    // Create a Set to get unique author IDs
    const uniqueAuthorIds = new Set(authorIds.filter(Boolean));
    
    console.log(`Found ${uniqueAuthorIds.size} unique authors`);

    // Recursively delete child threads and their descendants
    const deleteResult = await Thread.deleteMany({ _id: { $in: descendantThreadIds } });
    console.log(`Deleted ${deleteResult.deletedCount} threads`);

    // Update User model only if there are authors to update
    if (uniqueAuthorIds.size > 0) {
      const updateResult = await User.updateMany(
        { _id: { $in: Array.from(uniqueAuthorIds) } },
        { $pull: { threads: { $in: descendantThreadIds } } }
      );
      console.log(`Updated ${updateResult.modifiedCount} user documents`);
    }

    // Also delete any notifications related to this thread
    const notificationDeleteResult = await mongoose.models.Notification?.deleteMany({
      $or: [
        { threadId: { $in: descendantThreadIds } },
        { "threadId._id": { $in: descendantThreadIds } }
      ]
    });
    
    if (notificationDeleteResult) {
      console.log(`Deleted ${notificationDeleteResult.deletedCount} notifications`);
    }

    revalidatePath(path);
  } catch (error: any) {
    console.error(`Error deleting thread: ${error.message}`);
    throw new Error(`Failed to delete thread: ${error.message}`);
  }
}