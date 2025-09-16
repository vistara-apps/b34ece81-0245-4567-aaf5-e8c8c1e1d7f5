'use client';

import Image from 'next/image';
import { User } from 'lucide-react';

interface UserAvatarProps {
  src?: string;
  alt?: string;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

export function UserAvatar({ src, alt = 'User avatar', size = 'md', className }: UserAvatarProps) {
  const sizeClasses = {
    sm: 'w-8 h-8',
    md: 'w-10 h-10',
    lg: 'w-16 h-16'
  };

  const iconSizes = {
    sm: 'w-4 h-4',
    md: 'w-5 h-5',
    lg: 'w-8 h-8'
  };

  return (
    <div className={`${sizeClasses[size]} rounded-full overflow-hidden bg-gray-200 flex items-center justify-center ${className}`}>
      {src ? (
        <Image
          src={src}
          alt={alt}
          width={size === 'lg' ? 64 : size === 'md' ? 40 : 32}
          height={size === 'lg' ? 64 : size === 'md' ? 40 : 32}
          className="w-full h-full object-cover"
        />
      ) : (
        <User className={`${iconSizes[size]} text-text-secondary`} />
      )}
    </div>
  );
}
