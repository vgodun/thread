"use client";

import { useState, useEffect, useRef } from 'react';
import Image from 'next/image';

interface User {
  id: string;
  username: string;
  name: string;
  image: string;
}

interface MentionAutocompleteProps {
  query: string;
  onSelect: (username: string) => void;
  position: { top: number; left: number };
}

const MentionAutocomplete = ({ query, onSelect, position }: MentionAutocompleteProps) => {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(false);
  const autocompleteRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const fetchUsers = async () => {
      // Show all users when just @ is typed (empty query)
      setLoading(true);
      try {
        const response = await fetch(`/api/users/search?query=${query}`);
        const data = await response.json();
        
        // Ensure we only keep the necessary properties to avoid circular references
        const sanitizedUsers = data.map((user: any) => ({
          id: user.id,
          username: user.username,
          name: user.name,
          image: user.image || '/assets/profile.svg'
        }));
        
        setUsers(sanitizedUsers);
      } catch (error) {
        console.error('Error fetching users:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchUsers();
  }, [query]);

  // Close the autocomplete when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (autocompleteRef.current && !autocompleteRef.current.contains(event.target as Node)) {
        setUsers([]);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  if (users.length === 0 && !loading) return null;

  return (
    <div 
      ref={autocompleteRef}
      className="fixed bg-dark-3 rounded-lg shadow-lg z-50 max-h-60 overflow-y-auto"
      style={{ 
        top: `${position.top}px`, 
        left: `${position.left}px`,
        minWidth: '200px'
      }}
    >
      {loading ? (
        <div className="p-3 text-light-3">Loading...</div>
      ) : (
        <ul className="py-2">
          {users.map((user) => (
            <li 
              key={user.id}
              className="px-4 py-2 hover:bg-dark-4 cursor-pointer flex items-center gap-2"
              onClick={() => onSelect(user.username)}
            >
              <div className="relative h-6 w-6">
                <Image
                  src={user.image || '/assets/profile.svg'}
                  alt={user.name}
                  fill
                  className="rounded-full object-cover"
                />
              </div>
              <div>
                <p className="text-light-1 text-sm font-medium">{user.name}</p>
                <p className="text-light-3 text-xs">@{user.username}</p>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default MentionAutocomplete;
