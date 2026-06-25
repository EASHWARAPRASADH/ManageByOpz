import React from 'react';
import { cn } from '@managemyopz/platform-utils';

export interface AvatarProps {
  name?: string;
  src?: string;
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  shape?: 'circle' | 'square';
  className?: string;
}

function getInitials(name?: string): string {
  if (!name) return '?';
  const parts = name.trim().split(/\s+/);
  let result = '';
  if (parts[0]) result += parts[0][0];
  if (parts[1]) result += parts[1][0];
  return (result || name.slice(0, 2)).toUpperCase();
}

// Deterministic color from string
const AVATAR_COLORS = [
  'from-indigo-500 to-blue-500',
  'from-violet-500 to-purple-500',
  'from-teal-500 to-emerald-500',
  'from-rose-500 to-pink-500',
  'from-amber-500 to-orange-500',
  'from-sky-500 to-cyan-500',
];

function getColorIndex(name?: string): number {
  if (!name) return 0;
  let hash = 0;
  for (let i = 0; i < name.length; i++) {
    hash = name.charCodeAt(i) + ((hash << 5) - hash);
  }
  return Math.abs(hash) % AVATAR_COLORS.length;
}

export function Avatar({ name, src, size = 'md', shape = 'circle', className }: AvatarProps) {
  const colorClass = AVATAR_COLORS[getColorIndex(name)];
  const initials = getInitials(name);

  return (
    <div
      className={cn(
        'inline-flex items-center justify-center bg-gradient-to-tr text-white font-bold shrink-0 overflow-hidden',
        colorClass,
        shape === 'circle' ? 'rounded-full' : 'rounded-lg',
        size === 'xs' && 'w-6 h-6 text-[8px]',
        size === 'sm' && 'w-8 h-8 text-xs',
        size === 'md' && 'w-10 h-10 text-sm',
        size === 'lg' && 'w-12 h-12 text-base',
        size === 'xl' && 'w-16 h-16 text-lg',
        className
      )}
    >
      {src ? (
        <img src={src} alt={name || 'Avatar'} className="w-full h-full object-cover" />
      ) : (
        <span>{initials}</span>
      )}
    </div>
  );
}
