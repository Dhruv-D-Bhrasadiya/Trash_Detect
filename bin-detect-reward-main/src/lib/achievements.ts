// Achievement definitions with titles and thresholds
export interface Achievement {
  id: string;
  title: string;
  description: string;
  pointThreshold: number;
  icon?: string;
}

// List of achievements ordered by point threshold
export const achievements: Achievement[] = [
  {
    id: 'beginner',
    title: 'Eco Beginner',
    description: 'Started your journey to save the planet',
    pointThreshold: 0,
    icon: '🌱'
  },
  {
    id: 'contributor',
    title: 'Green Contributor',
    description: 'Making a difference with your contributions',
    pointThreshold: 50,
    icon: '🌿'
  },
  {
    id: 'recycler',
    title: 'Dedicated Recycler',
    description: 'Consistently identifying and recycling waste',
    pointThreshold: 100,
    icon: '♻️'
  },
  {
    id: 'eco_warrior',
    title: 'Eco Warrior',
    description: 'Fighting pollution one detection at a time',
    pointThreshold: 200,
    icon: '🛡️'
  },
  {
    id: 'earth_guardian',
    title: 'Earth Guardian',
    description: 'A true protector of our environment',
    pointThreshold: 500,
    icon: '🌍'
  },
  {
    id: 'sustainability_champion',
    title: 'Sustainability Champion',
    description: 'Leading the way in environmental conservation',
    pointThreshold: 1000,
    icon: '🏆'
  },
  {
    id: 'planet_savior',
    title: 'Planet Savior',
    description: 'Your efforts are making a global impact',
    pointThreshold: 2000,
    icon: '⭐'
  }
];

/**
 * Get the current achievement based on points
 * @param points User's current points
 * @returns The highest achievement unlocked
 */
export function getCurrentAchievement(points: number): Achievement {
  // Find the highest achievement that the user has reached
  const currentAchievement = [...achievements]
    .reverse()
    .find(achievement => points >= achievement.pointThreshold);
  
  // Default to the first achievement if none found (should never happen)
  return currentAchievement || achievements[0];
}

/**
 * Get the next achievement to unlock
 * @param points User's current points
 * @returns The next achievement to unlock or undefined if all are unlocked
 */
export function getNextAchievement(points: number): Achievement | undefined {
  return achievements.find(achievement => points < achievement.pointThreshold);
}

/**
 * Get all unlocked achievements
 * @param points User's current points
 * @returns Array of unlocked achievements
 */
export function getUnlockedAchievements(points: number): Achievement[] {
  return achievements.filter(achievement => points >= achievement.pointThreshold);
}

/**
 * Calculate progress to next achievement
 * @param points User's current points
 * @returns Progress percentage to next achievement (0-100)
 */
export function getProgressToNextAchievement(points: number): number {
  const current = getCurrentAchievement(points);
  const next = getNextAchievement(points);
  
  if (!next) {
    return 100; // All achievements unlocked
  }
  
  const progressPoints = points - current.pointThreshold;
  const requiredPoints = next.pointThreshold - current.pointThreshold;
  
  return Math.min(Math.floor((progressPoints / requiredPoints) * 100), 100);
}