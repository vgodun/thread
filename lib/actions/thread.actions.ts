"use server";

import { revalidatePath } from "next/cache";

import { connectToDB } from "../mongoose";

import User from "../models/user.model";
import Thread from "../models/thread.model";

interface Params {
  text: string;
  author: string;
  path: string;
  imgPosts: string;
}

export async function createThread({
  text,
  author,
  path,
  imgPosts
}: Params) {
  try {
    connectToDB();

    // @ts-ignore
    const createdThread = await Thread.create({
      text,
      author,
      imgPosts: imgPosts
    });

    //Update user model
    await User.findByIdAndUpdate(author, {
      $push: { threads: createdThread._id },
    });

    revalidatePath(path);
  } catch (error: any) {
    throw new Error(`Failed to create thread: ${error.message}`);
  }
}
interface Params {
  id: string;
  text: string;
  imgPosts: string;
  path: string;
}

export async function updateThread({
  id,
  text,
  imgPosts,
  path
}: Params) {
  connectToDB();
  try {
    await Thread.findByIdAndUpdate(
      { _id: id },
      {
        text: text,
        imgPosts: imgPosts
      },
    );

    if (path === `/thread/edit/${id}`) {
      revalidatePath(path)
    }
  }
  catch (error: any) {
    throw new Error(`Failed to fetch user: ${error.message}`);
  }
}
export async function deleteImgPosts(threadId: string, imgPosts: string,):Promise<void>{
  connectToDB();
  console.log('imgPosts:', imgPosts);
  
  try{
    await Thread.findByIdAndUpdate(threadId, { $unset: { imgPosts: "" } });
    console.log(`Image posts field removed successfully from thread: ${threadId}`);
  } catch (error) {
    console.error(`There was an error removing the image posts field from the thread: ${threadId}`, error);
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

  const isNext = totalPostsCount > skipAmount + posts.length;

  return { posts, isNext };
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

    return thread;
  } catch (error: any) {
    throw new Error(`Failed to fetch thread: ${error.message}`);
  }
}

export async function addCommentToThread(
  threadId: string,
  commentText: string,
  userId: string,
  path: string
) {
  connectToDB();

  try {
    //Find the original thread by its ID

    const originalThread = await Thread.findById(threadId);

    if (!originalThread) {
      throw new Error("Thread not found");
    }
    //Create a new thread with the comment text

    const commentThread = new Thread({
      text: commentText,
      author: userId,
      parentId: threadId,
    });

    // Save the new thread

    const savedCommentThread = await commentThread.save();

    originalThread.children.push(savedCommentThread._id);

    // Save the original thread

    await originalThread.save();

    revalidatePath(path);
  } catch (error: any) {
    throw new Error(`Failed to adding comment to thread: ${error.message}`);
  }
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

    // Find the thread to be deleted (the main thread)
    const mainThread = await Thread.findById(id).populate("author");

    if (!mainThread) {
      throw new Error("Thread not found");
    }

    // Fetch all child threads and their descendants recursively
    const descendantThreads = await fetchAllChildThreads(id);

    // Get all descendant thread IDs including the main thread ID and child thread IDs
    const descendantThreadIds = [
      id,
      ...descendantThreads.map((thread) => thread._id),
    ];

    // Extract the authorIds and communityIds to update User and Community models respectively
    const uniqueAuthorIds = new Set(
      [
        ...descendantThreads.map((thread) => thread.author?._id?.toString()), // Use optional chaining to handle possible undefined values
        mainThread.author?._id?.toString(),
      ].filter((id) => id !== undefined)
    );

    // Recursively delete child threads and their descendants
    await Thread.deleteMany({ _id: { $in: descendantThreadIds } });

    // Update User model
    await User.updateMany(
      { _id: { $in: Array.from(uniqueAuthorIds) } },
      { $pull: { threads: { $in: descendantThreadIds } } }
    );

    revalidatePath(path);
  } catch (error: any) {
    throw new Error(`Failed to delete thread: ${error.message}`);
  }
}