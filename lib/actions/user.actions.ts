'use server';

import {connectToDB} from "@/lib/mongoose";
import User from "@/lib/models/user.model";
import {revalidatePath} from "next/cache";
import Thread from "../models/thread.model";
import { getJsPageSizeInKb } from "next/dist/build/utils";
import { FilterQuery, SortOrder } from "mongoose";
import { sanitizeDocument, sanitizeDocuments } from "../utils/sanitize";

interface Params{
    userId:string,
    username:string,
    name:string,
    bio:string,
    image:string,
    path:string;
}
export async function updateUser({
        userId,
        bio,
        name,
        path,
        username,
        image,
    }:Params):Promise<void>{
    connectToDB();
    try {
        await User.findOneAndUpdate(
            {id:userId},
            {
                username:username.toLowerCase(),
                name,
                bio,
                image,
                onboarded:true,
            },
            {
                upsert:true
            }
        );

        if(path === '/profile/edit'){
            revalidatePath(path)
        }
    }
    catch (error: any) {
        throw new Error(`Failed to fetch user: ${error.message}`);
    }
}

export async function fetchUser(userId: string) {
    try {
        connectToDB();

        return await User.findOne({ id: userId })
}
catch (error: any) {
    throw new Error(`Failed to fetch user: ${error.message}`);
}
}

export async function fetchUserPosts(userId:string){
    try {
        connectToDB();

        //Find all threads author by user with the giver UserId

        const threads = await User.findOne({ id: userId })
        .populate({
            path: "threads",
            model: Thread,
            populate: [
              {
                path: "children",
                model: Thread,
                populate: {
                  path: "author",
                  model: User,
                  select: "name image id", // Select the "name" and "_id" fields from the "User" model
                },
              },
            ],
          });
          
          // Sanitize the threads to prevent circular references
          return sanitizeDocument(threads);
    } catch (error:any) {
        throw new Error(`Failed to fetch user posts: ${error.message}`);
    }
}

export async function fetchUsers({
    userId,
    searchString='',
    pageNumber=1,
    pageSize=20,
    sortBy='desc'
}:{
    userId:string,
    searchString?:string,
    pageNumber?:number,
    pageSize?:number,
    sortBy?:SortOrder;
}){
    try {
        connectToDB();

        const skipAmount = (pageNumber - 1) * pageSize;

        const regex = new RegExp(searchString, "i");

        const query:FilterQuery<typeof User>={
            id:{$ne:userId},
            
        }
        if(searchString.trim() !== ''){
            query.$or=[
                {name:{$regex:regex}},
                {username:{$regex:regex}}
            ]
        }
        const sortOptions={createdAt:sortBy};
        const userQuery = User.find(query)
        .sort(sortOptions)
        .skip(skipAmount)
        .limit(pageSize);

        const totaluserCount= await User.countDocuments(query);

        const users= await userQuery.exec();

        const isNext= totaluserCount > skipAmount + users.length;

        return {users,isNext}
    } catch (error:any) {
        throw new Error(`Failed to fetch users: ${error.message}`);
    }
}


export async function getActivity(userId: string) {
    connectToDB();
    try {
      
  
      // Find all threads created by the user
      const userThreads = await Thread.find({ author: userId });
  
      // Collect all the child thread ids (replies) from the 'children' field of each user thread
      const childThreadIds = userThreads.reduce((acc, userThread) => {
        return acc.concat(userThread.children);
      }, []);
  
      // Find and return the child threads (replies) excluding the ones created by the same user
      const replies = await Thread.find({
        _id: { $in: childThreadIds },
        author: { $ne: userId }, // Exclude threads authored by the same user
      }).populate({
        path: "author",
        model: User,
        select: "name image _id",
      });
  
      return replies;
    } catch (error) {
      console.error("Error fetching replies: ", error);
      throw error;
    }
  }

export async function getUserReplies(userId: string) {
  connectToDB();
  try {
    // First, get the user's MongoDB _id from their Clerk id
    const user = await User.findOne({ id: userId });
    
    if (!user) {
      throw new Error("User not found");
    }

    // Find all threads where the user is the author and has a parentId (meaning it's a reply)
    const userReplies = await Thread.find({
      author: user._id, // Use the MongoDB _id instead of Clerk id
      parentId: { $exists: true, $ne: null } // Only get threads that are replies (have a parentId)
    }).populate({
      path: "author",
      model: User,
      select: "name image id"
    }).populate({
      // Populate the parent thread to show what they replied to
      path: "parentId",
      model: Thread,
      populate: {
        path: "author",
        model: User,
        select: "name image id"
      }
    });

    return userReplies;
  } catch (error: any) {
    console.error("Error fetching user replies: ", error);
    throw new Error(`Failed to fetch user replies: ${error.message}`);
  }
}

// Fetch threads where user is tagged
export async function fetchUserTaggedThreads(userId: string) {
  try {
    connectToDB();

    console.log("Fetching tagged threads for user ID:", userId);

    // First check if the user exists
    const user = await User.findOne({ id: userId });
    if (!user) {
      console.error("User not found with ID:", userId);
      return [];
    }
    
    console.log("Found user:", user.username);

    // Create a regex pattern to match @username in the text
    const mentionRegex = new RegExp(`@${user.username}\\b`, 'i');
    
    // Find threads that contain the mention pattern directly in the database
    // Only select necessary fields and avoid nested population
    const taggedThreads = await Thread.find({
      text: mentionRegex
    })
    .select('_id text createdAt parentId imgPosts') // Only select necessary fields
    .populate({
      path: 'author',
      model: User,
      select: '_id id name image username' // Only select necessary user fields
    })
    .sort({ createdAt: -1 });
    
    console.log(`Found ${taggedThreads.length} threads where user is mentioned`);
    
    // Use the sanitization utility to prevent circular references
    return sanitizeDocuments(taggedThreads);
  } catch (error: any) {
    console.error("Error fetching tagged threads:", error);
    throw new Error(`Failed to fetch tagged threads: ${error.message}`);
  }
}

// Function to tag users in a thread
export async function tagUsersInThread(threadId: string, taggedUserIds: string[]) {
  try {
    connectToDB();

    // Update the thread with the tagged users
    await Thread.findByIdAndUpdate(threadId, {
      $addToSet: { tags: { $each: taggedUserIds } }
    });

    return { success: true };
  } catch (error: any) {
    console.error("Error tagging users:", error);
    throw new Error(`Failed to tag users: ${error.message}`);
  }
}

// Function to extract mentions from text
export async function extractMentions(text: string) {
  const mentionRegex = /@(\w+)/g;
  const mentions = [];
  let match;
  
  while ((match = mentionRegex.exec(text)) !== null) {
    mentions.push(match[1]); // Push the username without the @ symbol
  }
  
  return mentions;
}

// Find users by username
export async function findUsersByUsername(usernames: string[]) {
  try {
    if (!usernames || usernames.length === 0) return [];
    
    connectToDB();
    
    console.log("Finding users by usernames:", usernames);
    
    const users = await User.find({
      username: { $in: usernames.map(u => u.toLowerCase()) }
    }).select('id username name image'); // Only select necessary fields
    
    // Ensure we're returning plain objects with only the necessary properties
    const sanitizedUsers = users.map(user => ({
      id: user.id,
      username: user.username,
      name: user.name,
      image: user.image
    }));
    
    console.log(`Found ${sanitizedUsers.length} users out of ${usernames.length} usernames`);
    
    return sanitizedUsers;
  } catch (error: any) {
    console.error("Error finding users by username:", error);
    return [];
  }
}