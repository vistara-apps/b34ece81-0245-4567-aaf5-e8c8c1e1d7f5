'use client';

import { UserAvatar } from './UserAvatar';
import { Star } from 'lucide-react';
import type { User } from '../lib/types';

interface UserProfileProps {
  user: User;
  className?: string;
}

export function UserProfile({ user, className }: UserProfileProps) {
  return (
    <div className={`flex items-center gap-3 ${className}`}>
      <UserAvatar src={user.profilePicUrl} alt={user.displayName} size="md" />
      <div>
        <p className="font-medium text-text-primary">{user.displayName}</p>
        <div className="flex items-center gap-1">
          <Star className="w-4 h-4 text-yellow-500 fill-current" />
          <span className="text-sm text-text-secondary">{user.rating}</span>
        </div>
      </div>
    </div>
  );
}
