// Activity types for the recent activity section
export interface Activity {
  id: string;
  type: 'upload' | 'detection' | 'reward' | 'achievement';
  description: string;
  timestamp: Date;
  points?: number;
  icon?: string;
}

// Sample recent activities (in a real app, these would come from the database)
export const recentActivities: Activity[] = [
  {
    id: '1',
    type: 'detection',
    description: 'Successfully detected trash in image',
    timestamp: new Date(Date.now() - 1000 * 60 * 30), // 30 minutes ago
    points: 10,
    icon: '🔍'
  },
  {
    id: '2',
    type: 'upload',
    description: 'Uploaded a new image',
    timestamp: new Date(Date.now() - 1000 * 60 * 60 * 2), // 2 hours ago
    icon: '📤'
  },
  {
    id: '3',
    type: 'upload',
    description: 'Uploaded a new image',
    timestamp: new Date(Date.now() - 1000 * 60 * 60 * 24), // 1 day ago
    icon: '📤'
  },
  {
    id: '4',
    type: 'achievement',
    description: 'Earned "Green Contributor" title',
    timestamp: new Date(Date.now() - 1000 * 60 * 60 * 24 * 2), // 2 days ago
    icon: '🏆'
  },
  {
    id: '5',
    type: 'detection',
    description: 'Successfully detected trash in image',
    timestamp: new Date(Date.now() - 1000 * 60 * 60 * 24 * 3), // 3 days ago
    points: 10,
    icon: '🔍'
  }
];

/**
 * Format a timestamp relative to current time
 */
export function formatRelativeTime(date: Date): string {
  const now = new Date();
  const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);
  
  if (diffInSeconds < 60) {
    return 'just now';
  }
  
  const diffInMinutes = Math.floor(diffInSeconds / 60);
  if (diffInMinutes < 60) {
    return `${diffInMinutes} minute${diffInMinutes > 1 ? 's' : ''} ago`;
  }
  
  const diffInHours = Math.floor(diffInMinutes / 60);
  if (diffInHours < 24) {
    return `${diffInHours} hour${diffInHours > 1 ? 's' : ''} ago`;
  }
  
  const diffInDays = Math.floor(diffInHours / 24);
  if (diffInDays < 7) {
    return `${diffInDays} day${diffInDays > 1 ? 's' : ''} ago`;
  }
  
  return date.toLocaleDateString();
}