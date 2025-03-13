"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

interface ThreadContentProps {
  content: string;
}

const ThreadContent = ({ content }: ThreadContentProps) => {
  const [formattedContent, setFormattedContent] = useState<React.ReactNode[]>([]);
  const [userMap, setUserMap] = useState<Record<string, string>>({});

  // Fetch user IDs for mentioned usernames
  useEffect(() => {
    const fetchUserIds = async (usernames: string[]) => {
      if (usernames.length === 0) return;
      
      try {
        // Create a unique list of usernames
        const uniqueUsernames = Array.from(new Set(usernames));
        
        // Fetch user data for all mentioned usernames
        const promises = uniqueUsernames.map(async (username) => {
          const response = await fetch(`/api/users/search?query=${username}`);
          if (!response.ok) return null;
          
          const users = await response.json();
          // Find exact username match
          const user = users.find((u: any) => 
            u.username.toLowerCase() === username.toLowerCase()
          );
          
          return user ? { username, id: user.id } : null;
        });
        
        const results = await Promise.all(promises);
        
        // Create a map of username -> userId
        const newUserMap: Record<string, string> = {};
        results.forEach((result) => {
          if (result) {
            newUserMap[result.username.toLowerCase()] = result.id;
          }
        });
        
        setUserMap(newUserMap);
      } catch (error) {
        console.error("Error fetching user IDs:", error);
      }
    };

    if (!content) return;
    
    // Extract all usernames from the content
    const mentionRegex = /@(\w+)/g;
    const matches = content.match(mentionRegex) || [];
    const usernames = matches.map(match => match.substring(1));
    
    if (usernames.length > 0) {
      fetchUserIds(usernames);
    }
  }, [content]);

  // Format content with clickable mentions
  useEffect(() => {
    if (!content) return;

    // Regular expression to match @username mentions
    const mentionRegex = /(@\w+)/g;
    
    // Split the content by mentions
    const parts = content.split(mentionRegex);
    
    // Process each part to make mentions clickable
    const processedParts = parts.map((part, index) => {
      // Check if this part is a mention
      if (part.match(mentionRegex)) {
        // Extract username without @ symbol
        const username = part.substring(1).toLowerCase();
        const userId = userMap[username];
        
        // If we have the user ID, link to their profile
        if (userId) {
          return (
            <Link 
              key={index}
              href={`/profile/${userId}`} 
              className="text-primary-500 hover:underline font-medium"
            >
              {part}
            </Link>
          );
        }
        
        // If no user ID found, just highlight the mention without a link
        return <span key={index} className="text-primary-500">{part}</span>;
      }
      
      // Regular text
      return <span key={index}>{part}</span>;
    });
    
    setFormattedContent(processedParts);
  }, [content, userMap]);

  return <div className="mt-2 text-small-regular text-light-2">{formattedContent}</div>;
};

export default ThreadContent;
