"use client";

import React from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import Image from "next/image";
import { profileTabs } from "@/constants";
import ThreadsTab from "./UserThreadsTab";
import RepliesTab from "./UserRepliesTab";
import TaggedTab from "./TaggedTab";
import ActivityTab from "./ActivityTab";
import NotificationsTab from "./NotificationsTab";

interface ProfileTabsProps {
  userInfo: any;
  userId: string;
  unreadCount: number;
}

const ProfileTabs = ({ userInfo, userId, unreadCount }: ProfileTabsProps) => {
  // Function to prevent tab clicks from navigating to posts
  const handleTabClick = (e: React.MouseEvent) => {
    e.stopPropagation();
  };

  return (
    <div className="mt-9">
      <Tabs defaultValue="threads" className="w-full">
        <TabsList className="tab" onClick={handleTabClick}>
          {profileTabs.map((tab) => (
            <TabsTrigger 
              key={tab.value} 
              value={tab.value} 
              className="tab"
            >
              <Image
                src={tab.icon}
                alt={tab.label}
                width={24}
                height={24}
                className="object-contain"
              />
              <p className="max-sm:hidden">{tab.label}</p>

              {tab.value === "notifications" && userInfo.id === userId && unreadCount > 0 && (
                <p className="ml-1 rounded-sm bg-primary-500 px-2 py-1 !text-tiny-medium text-light-2">
                  {unreadCount}
                </p>
              )}
              
              {tab.value === "threads" && (
                <p className="ml-1 rounded-sm bg-light-4 px-2 py-1 !text-tiny-medium text-light-2">
                  {userInfo.threads.length}
                </p>
              )}
            </TabsTrigger>
          ))}
        </TabsList>

        <TabsContent value="threads" className="w-full text-light-1">
          <ThreadsTab
            currentUserId={userId}
            accountId={userInfo.id}
            accountType="User"
            name={userInfo.name}
            username={userInfo.username}
            imgUrl={userInfo.image}
          />
        </TabsContent>

        <TabsContent value="replies" className="w-full text-light-1">
          <RepliesTab
            currentUserId={userId}
            accountId={userInfo.id}
            accountType="User"
            name={userInfo.name}
            username={userInfo.username}
            imgUrl={userInfo.image}
          />
        </TabsContent>

        <TabsContent value="tagged" className="w-full text-light-1">
          <TaggedTab
            currentUserId={userId}
            accountId={userInfo.id}
            accountType="User"
            name={userInfo.name}
            username={userInfo.username}
            imgUrl={userInfo.image}
          />
        </TabsContent>

        <TabsContent value="activity" className="w-full text-light-1">
          <ActivityTab
            currentUserId={userId}
            accountId={userInfo.id}
            accountType="User"
          />
        </TabsContent>

        <TabsContent value="notifications" className="w-full text-light-1">
          <NotificationsTab
            currentUserId={userId}
            accountId={userInfo.id}
          />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default ProfileTabs;
