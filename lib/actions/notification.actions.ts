"use server";

import { connectToDB } from "../mongoose";
import Notification from "../models/notification.model";
import User from "../models/user.model";
import Thread from "../models/thread.model";
import { sanitizeDocuments } from "../utils/sanitize";

type CreateNotificationParams = {
  recipientId: string;
  senderId: string;
  type: "mention" | "like" | "comment" | "follow";
  threadId?: string;
};

// Create a notification
export async function createNotification({
  recipientId,
  senderId,
  type,
  threadId,
}: CreateNotificationParams) {
  try {
    connectToDB();

    console.log("Creating notification:", {
      recipientId,
      senderId,
      type,
      threadId,
    });

    // Don't create notifications if sender is recipient
    if (recipientId === senderId) {
      console.log("Skipping self-notification");
      return null;
    }

    // Check if a similar notification already exists to prevent duplicates
    const existingNotification = await Notification.findOne({
      recipient: recipientId,
      sender: senderId,
      type,
      threadId,
      read: false,
      createdAt: { $gte: new Date(Date.now() - 60000) }, // Created in the last minute
    });

    if (existingNotification) {
      console.log(
        "Duplicate notification prevented:",
        existingNotification._id
      );
      return existingNotification;
    }

    const notification = new Notification({
      recipient: recipientId,
      sender: senderId,
      type,
      threadId,
      read: false,
    });

    const savedNotification = await notification.save();
    console.log("Created notification with ID:", savedNotification._id);

    return savedNotification;
  } catch (error: any) {
    console.error("Error creating notification:", error);
    throw new Error(`Failed to create notification: ${error.message}`);
  }
}

export async function getNotifications(userId: string) {
  try {
    connectToDB();

    const notifications = await Notification.find({ recipient: userId })
      .sort({ createdAt: -1 })
      .populate({
        path: "sender",
        model: User,
        select: "name username image _id",
      })
      .populate({
        path: "threadId",
        model: Thread,
        select: "text _id",
      });

    // Sanitize the notifications to prevent circular references
    return sanitizeDocuments(notifications);
  } catch (error) {
    console.error("Error fetching notifications:", error);
    throw error;
  }
}

export async function markNotificationAsRead(notificationId: string) {
  try {
    connectToDB();

    const notification = await Notification.findByIdAndUpdate(
      notificationId,
      { read: true },
      { new: true }
    );

    return notification;
  } catch (error) {
    console.error("Error marking notification as read:", error);
    throw error;
  }
}

export async function getUnreadNotificationsCount(userId: string) {
  try {
    connectToDB();

    const count = await Notification.countDocuments({
      recipient: userId,
      read: false,
    });

    return count;
  } catch (error) {
    console.error("Error counting unread notifications:", error);
    throw error;
  }
}
