"use client";

import Image from "next/image";
import Link from "next/link";
import { formatDistanceToNow } from "date-fns";
import { useEffect, useState } from "react";

interface ActivityTabProps {
  currentUserId: string;
  accountId: string;
  accountType: string;
}

interface Activity {
  type: string;
  date: Date;
  threadId: string;
  content: string;
  author: {
    id: string;
    name: string;
    image: string;
    username: string;
  };
  parentThread?: {
    id: string;
    author?: {
      id: string;
      name: string;
      image: string;
      username: string;
    };
  };
  likedBy?: {
    id: string;
    name: string;
    image: string;
    username: string;
  };
}

const ActivityTab = ({
  currentUserId,
  accountId,
  accountType,
}: ActivityTabProps) => {
  const [activities, setActivities] = useState<Activity[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchActivities = async () => {
      try {
        setIsLoading(true);
        setError("");
        
        // Fetch activities from the API endpoint instead of importing the server action directly
        const response = await fetch(`/api/activity?userId=${accountId}`, {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
          },
        });
        
        if (!response.ok) {
          throw new Error("Failed to fetch activities");
        }
        
        const data = await response.json();
        setActivities(data);
      } catch (error) {
        console.error("Error fetching activities:", error);
        setError("Failed to load activities. Please try again later.");
      } finally {
        setIsLoading(false);
      }
    };

    fetchActivities();
  }, [accountId]);

  if (isLoading) {
    return (
      <section className="mt-9 flex flex-col gap-10">
        <p className="!text-base-regular text-light-3">Loading activities...</p>
      </section>
    );
  }

  if (error) {
    return (
      <section className="mt-9 flex flex-col gap-10">
        <p className="!text-base-regular text-light-3">{error}</p>
      </section>
    );
  }

  return (
    <section className="mt-9 flex flex-col gap-10">
      {activities && activities.length > 0 ? (
        <>
          {activities.map((activity, index) => (
            <div key={index} className="activity-card">
              {renderActivityContent(activity, currentUserId)}
            </div>
          ))}
        </>
      ) : (
        <p className="!text-base-regular text-light-3">No activity found</p>
      )}
    </section>
  );
};

// Helper function to render different activity types
function renderActivityContent(activity: Activity, currentUserId: string) {
  const timeAgo = activity.date ? formatDistanceToNow(new Date(activity.date), { addSuffix: true }) : "";
  
  switch (activity.type) {
    case "created_thread":
      return (
        <Link href={`/thread/${activity.threadId}`} className="flex flex-col">
          <div className="flex items-center gap-2">
            <Image src={activity.author.image} alt={activity.author.name} width={20} height={20} className="rounded-full" />
            <p className="!text-small-regular text-light-1">
              <span className="text-primary-500">You</span> created a new thread
            </p>
            <span className="text-gray-1 text-small-medium">{timeAgo}</span>
          </div>
          <p className="ml-6 text-subtle-medium text-gray-1 line-clamp-1">{activity.content}</p>
        </Link>
      );
      
    case "liked_thread":
      return (
        <Link href={`/thread/${activity.threadId}`} className="flex flex-col">
          <div className="flex items-center gap-2">
            <Image src={activity.author.image} alt={activity.author.name} width={20} height={20} className="rounded-full" />
            <p className="!text-small-regular text-light-1">
              <span className="text-primary-500">You</span> liked a thread
            </p>
            <span className="text-gray-1 text-small-medium">{timeAgo}</span>
          </div>
          <p className="ml-6 text-subtle-medium text-gray-1 line-clamp-1">{activity.content}</p>
        </Link>
      );
      
    case "received_like":
      return (
        <Link href={`/thread/${activity.threadId}`} className="flex flex-col">
          <div className="flex items-center gap-2">
            <Image src={activity.likedBy?.image || "/assets/user.svg"} alt={activity.likedBy?.name || "User"} width={20} height={20} className="rounded-full" />
            <p className="!text-small-regular text-light-1">
              <span className="text-primary-500">{activity.likedBy?.name}</span> liked your thread
            </p>
            <span className="text-gray-1 text-small-medium">{timeAgo}</span>
          </div>
          <p className="ml-6 text-subtle-medium text-gray-1 line-clamp-1">{activity.content}</p>
        </Link>
      );
      
    case "created_comment":
      return (
        <Link href={`/thread/${activity.parentThread?.id || activity.threadId}`} className="flex flex-col">
          <div className="flex items-center gap-2">
            <Image src={activity.author.image} alt={activity.author.name} width={20} height={20} className="rounded-full" />
            <p className="!text-small-regular text-light-1">
              <span className="text-primary-500">You</span> commented on a thread
            </p>
            <span className="text-gray-1 text-small-medium">{timeAgo}</span>
          </div>
          <p className="ml-6 text-subtle-medium text-gray-1 line-clamp-1">{activity.content}</p>
        </Link>
      );
      
    case "received_comment":
      return (
        <Link href={`/thread/${activity.threadId}`} className="flex flex-col">
          <div className="flex items-center gap-2">
            <Image src={activity.author.image} alt={activity.author.name} width={20} height={20} className="rounded-full" />
            <p className="!text-small-regular text-light-1">
              <span className="text-primary-500">{activity.author.name}</span> commented on your thread
            </p>
            <span className="text-gray-1 text-small-medium">{timeAgo}</span>
          </div>
          <p className="ml-6 text-subtle-medium text-gray-1 line-clamp-1">{activity.content}</p>
        </Link>
      );
      
    case "mention":
      return (
        <Link href={`/thread/${activity.threadId}`} className="flex flex-col">
          <div className="flex items-center gap-2">
            <Image src={activity.author.image} alt={activity.author.name} width={20} height={20} className="rounded-full" />
            <p className="!text-small-regular text-light-1">
              <span className="text-primary-500">{activity.author.name}</span> mentioned you in a thread
            </p>
            <span className="text-gray-1 text-small-medium">{timeAgo}</span>
          </div>
          <p className="ml-6 text-subtle-medium text-gray-1 line-clamp-1">{activity.content}</p>
        </Link>
      );
      
    default:
      return (
        <div className="flex items-center gap-2">
          <p className="!text-small-regular text-light-1">Unknown activity type</p>
        </div>
      );
  }
}

export default ActivityTab;
