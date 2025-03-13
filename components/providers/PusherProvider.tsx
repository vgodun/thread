"use client";

import { createContext, useContext, useEffect, useState } from "react";
import { EVENTS } from "@/lib/pusher";

// Define the channels we'll use
const LIKES_CHANNEL = "thread-likes";
const COMMENTS_CHANNEL = "thread-comments";

// Create a context for real-time updates
const RealtimeContext = createContext<{
  subscribe: (channelName: string, eventName: string, callback: (data: any) => void) => void;
  unsubscribe: (channelName: string, eventName: string, callback: (data: any) => void) => void;
  publishEvent: (channelName: string, eventName: string, data: any) => void;
}>({
  subscribe: () => {},
  unsubscribe: () => {},
  publishEvent: () => {},
});

// Custom storage key for real-time events
const REALTIME_STORAGE_KEY = 'thread_realtime_events';

// Type for stored events
interface StoredEvent {
  id: string;
  channel: string;
  event: string;
  data: any;
  timestamp: number;
}

export function RealtimeProvider({ children }: { children: React.ReactNode }) {
  // Store all event listeners
  const [listeners, setListeners] = useState<{
    [key: string]: Array<(data: any) => void>;
  }>({});

  // Function to generate a unique event key
  const getEventKey = (channelName: string, eventName: string) => {
    return `${channelName}:${eventName}`;
  };

  // Subscribe to an event
  const subscribe = (channelName: string, eventName: string, callback: (data: any) => void) => {
    const eventKey = getEventKey(channelName, eventName);
    
    setListeners(prev => {
      const existingListeners = prev[eventKey] || [];
      return {
        ...prev,
        [eventKey]: [...existingListeners, callback]
      };
    });
  };

  // Unsubscribe from an event
  const unsubscribe = (channelName: string, eventName: string, callback: (data: any) => void) => {
    const eventKey = getEventKey(channelName, eventName);
    
    setListeners(prev => {
      const existingListeners = prev[eventKey] || [];
      return {
        ...prev,
        [eventKey]: existingListeners.filter(cb => cb !== callback)
      };
    });
  };

  // Publish an event (client-side)
  const publishEvent = async (channelName: string, eventName: string, data: any) => {
    try {
      // Store the event in localStorage (for demonstration purposes)
      const eventId = `${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
      const newEvent: StoredEvent = {
        id: eventId,
        channel: channelName,
        event: eventName,
        data,
        timestamp: Date.now()
      };

      // In a real implementation, this would be an API call to your server
      const response = await fetch(`/api/realtime/${channelName.split('-')[0]}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          channelName,
          eventName,
          data
        }),
      });
      
      if (!response.ok) {
        console.error('Failed to publish event to server');
      }
      
      // For local testing, we'll also store in localStorage
      // This allows us to simulate real-time updates across browser tabs
      storeEvent(newEvent);
      
      // Notify all listeners for this event
      const eventKey = getEventKey(channelName, eventName);
      const eventListeners = listeners[eventKey] || [];
      eventListeners.forEach(listener => listener(data));
      
      return true;
    } catch (error) {
      console.error("Error publishing event:", error);
      return false;
    }
  };

  // Store an event in localStorage
  const storeEvent = (event: StoredEvent) => {
    try {
      // Get existing events
      const existingEventsJson = localStorage.getItem(REALTIME_STORAGE_KEY);
      const existingEvents: StoredEvent[] = existingEventsJson ? JSON.parse(existingEventsJson) : [];
      
      // Add new event
      const updatedEvents = [...existingEvents, event];
      
      // Only keep recent events (last 100)
      const recentEvents = updatedEvents.slice(-100);
      
      // Save back to localStorage
      localStorage.setItem(REALTIME_STORAGE_KEY, JSON.stringify(recentEvents));
    } catch (error) {
      console.error("Error storing event in localStorage:", error);
    }
  };

  // Check for new events (polling)
  useEffect(() => {
    // Track the last event timestamp we've processed
    let lastProcessedTimestamp = Date.now();
    
    // Function to check for new events
    const checkForNewEvents = () => {
      try {
        const eventsJson = localStorage.getItem(REALTIME_STORAGE_KEY);
        if (!eventsJson) return;
        
        const events: StoredEvent[] = JSON.parse(eventsJson);
        
        // Find events newer than our last processed timestamp
        const newEvents = events.filter(event => event.timestamp > lastProcessedTimestamp);
        
        if (newEvents.length > 0) {
          // Update our timestamp to the newest event
          lastProcessedTimestamp = Math.max(...newEvents.map(e => e.timestamp));
          
          // Process each new event
          newEvents.forEach(event => {
            const eventKey = getEventKey(event.channel, event.event);
            const eventListeners = listeners[eventKey] || [];
            eventListeners.forEach(listener => listener(event.data));
          });
        }
      } catch (error) {
        console.error("Error checking for new events:", error);
      }
    };
    
    // Set up polling interval (every 2 seconds)
    const intervalId = setInterval(checkForNewEvents, 2000);
    
    // Clean up on unmount
    return () => {
      clearInterval(intervalId);
    };
  }, [listeners]);

  // Listen for storage events (for cross-tab communication)
  useEffect(() => {
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === REALTIME_STORAGE_KEY && e.newValue) {
        try {
          const events: StoredEvent[] = JSON.parse(e.newValue);
          const recentEvents = events.slice(-5); // Only process the 5 most recent events
          
          recentEvents.forEach(event => {
            const eventKey = getEventKey(event.channel, event.event);
            const eventListeners = listeners[eventKey] || [];
            eventListeners.forEach(listener => listener(event.data));
          });
        } catch (error) {
          console.error("Error processing storage event:", error);
        }
      }
    };
    
    // Add event listener
    window.addEventListener('storage', handleStorageChange);
    
    // Clean up
    return () => {
      window.removeEventListener('storage', handleStorageChange);
    };
  }, [listeners]);

  return (
    <RealtimeContext.Provider value={{ subscribe, unsubscribe, publishEvent }}>
      {children}
    </RealtimeContext.Provider>
  );
}

// Custom hook to use the realtime context
export function useRealtime() {
  return useContext(RealtimeContext);
}

// Hooks for specific features
export function useLikesChannel(threadId: string, callback: (data: any) => void) {
  const { subscribe, unsubscribe } = useRealtime();
  const channelName = `${LIKES_CHANNEL}-${threadId}`;

  useEffect(() => {
    // Subscribe to like events
    subscribe(channelName, EVENTS.LIKE_ADDED, callback);
    subscribe(channelName, EVENTS.LIKE_REMOVED, callback);

    return () => {
      // Unsubscribe when component unmounts
      unsubscribe(channelName, EVENTS.LIKE_ADDED, callback);
      unsubscribe(channelName, EVENTS.LIKE_REMOVED, callback);
    };
  }, [threadId, subscribe, unsubscribe, callback, channelName]);
}

export function useCommentsChannel(threadId: string, callback: (data: any) => void) {
  const { subscribe, unsubscribe } = useRealtime();
  const channelName = `${COMMENTS_CHANNEL}-${threadId}`;

  useEffect(() => {
    // Subscribe to comment events
    subscribe(channelName, EVENTS.COMMENT_ADDED, callback);

    return () => {
      // Unsubscribe when component unmounts
      unsubscribe(channelName, EVENTS.COMMENT_ADDED, callback);
    };
  }, [threadId, subscribe, unsubscribe, callback, channelName]);
}

// Export the event types
export { EVENTS };
