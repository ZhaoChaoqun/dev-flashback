import { Composition } from 'remotion';
import { YearlyReview } from './YearlyReview';
import type { YearlyStats } from '@/types'; // eslint-disable-line @typescript-eslint/no-unused-vars

// Video orientation types
export type VideoOrientation = 'landscape' | 'portrait';

// Video dimensions based on orientation
export const VIDEO_DIMENSIONS = {
  landscape: { width: 1920, height: 1080 },
  portrait: { width: 1080, height: 1920 },
};

// Legacy exports for backward compatibility
export const VIDEO_WIDTH = 1920;
export const VIDEO_HEIGHT = 1080;
export const VIDEO_FPS = 30;

// Duration for each scene in frames
export const SCENE_DURATIONS = {
  intro: 90, // 3 seconds
  profile: 120, // 4 seconds
  contributions: 150, // 5 seconds
  languages: 120, // 4 seconds
  repositories: 150, // 5 seconds
  activity: 120, // 4 seconds
  streaks: 90, // 3 seconds
  summary: 120, // 4 seconds
  outro: 90, // 3 seconds
};

export const TOTAL_DURATION = Object.values(SCENE_DURATIONS).reduce((a, b) => a + b, 0);

// Default props for Remotion Studio preview
export const defaultStats: YearlyStats = {
  user: {
    login: 'demo-user',
    name: 'Demo User',
    avatarUrl: 'https://avatars.githubusercontent.com/u/0?v=4',
    bio: 'Full-stack developer | Open source enthusiast',
    company: 'Tech Company',
    location: 'San Francisco, CA',
    followers: 1234,
    following: 567,
    createdAt: '2018-01-01T00:00:00Z',
  },
  year: 2024,
  contributions: {
    totalContributions: 2847,
    weeks: Array.from({ length: 52 }, (_, weekIndex) => ({
      contributionDays: Array.from({ length: 7 }, (_, dayIndex) => ({
        date: `2024-${String(Math.floor(weekIndex / 4) + 1).padStart(2, '0')}-${String((dayIndex + 1) * 4).padStart(2, '0')}`,
        contributionCount: Math.floor(Math.random() * 15),
        contributionLevel: ['NONE', 'FIRST_QUARTILE', 'SECOND_QUARTILE', 'THIRD_QUARTILE', 'FOURTH_QUARTILE'][
          Math.floor(Math.random() * 5)
        ] as 'NONE' | 'FIRST_QUARTILE' | 'SECOND_QUARTILE' | 'THIRD_QUARTILE' | 'FOURTH_QUARTILE',
      })),
    })),
  },
  topRepositories: [
    {
      name: 'awesome-project',
      description: 'A really awesome project that does amazing things',
      url: 'https://github.com/demo-user/awesome-project',
      primaryLanguage: { name: 'TypeScript', color: '#3178c6' },
      stargazerCount: 1234,
      forkCount: 256,
      isPrivate: false,
      createdAt: '2024-01-15T00:00:00Z',
      updatedAt: '2024-12-20T00:00:00Z',
    },
    {
      name: 'cool-library',
      description: 'A cool library for cool developers',
      url: 'https://github.com/demo-user/cool-library',
      primaryLanguage: { name: 'Rust', color: '#dea584' },
      stargazerCount: 567,
      forkCount: 89,
      isPrivate: false,
      createdAt: '2024-03-10T00:00:00Z',
      updatedAt: '2024-12-15T00:00:00Z',
    },
    {
      name: 'web-app',
      description: 'Modern web application',
      url: 'https://github.com/demo-user/web-app',
      primaryLanguage: { name: 'JavaScript', color: '#f1e05a' },
      stargazerCount: 234,
      forkCount: 45,
      isPrivate: false,
      createdAt: '2024-05-20T00:00:00Z',
      updatedAt: '2024-12-01T00:00:00Z',
    },
  ],
  languageStats: [
    { name: 'TypeScript', color: '#3178c6', size: 450000, percentage: 35 },
    { name: 'JavaScript', color: '#f1e05a', size: 320000, percentage: 25 },
    { name: 'Python', color: '#3572A5', size: 200000, percentage: 15.5 },
    { name: 'Rust', color: '#dea584', size: 150000, percentage: 11.5 },
    { name: 'Go', color: '#00ADD8', size: 100000, percentage: 8 },
    { name: 'CSS', color: '#563d7c', size: 65000, percentage: 5 },
  ],
  commitStats: {
    totalCommits: 1847,
    additions: 125000,
    deletions: 45000,
  },
  pullRequestStats: {
    totalPRs: 156,
    merged: 142,
    open: 8,
    closed: 6,
  },
  issueStats: {
    totalIssues: 89,
    open: 12,
    closed: 77,
  },
  activeHours: Array.from({ length: 24 }, (_, i) => ({
    hour: i,
    count: Math.floor(Math.random() * 100) + (i >= 9 && i <= 18 ? 50 : 0),
  })),
  activeDays: [
    { day: 'Sunday', count: 120 },
    { day: 'Monday', count: 450 },
    { day: 'Tuesday', count: 520 },
    { day: 'Wednesday', count: 480 },
    { day: 'Thursday', count: 510 },
    { day: 'Friday', count: 430 },
    { day: 'Saturday', count: 180 },
  ],
  longestStreak: 47,
  currentStreak: 12,
  mostProductiveDay: {
    date: '2024-08-15',
    contributionCount: 32,
    contributionLevel: 'FOURTH_QUARTILE',
  },
  firstContribution: {
    date: '2024-01-02',
    contributionCount: 5,
    contributionLevel: 'SECOND_QUARTILE',
  },
};

export const RemotionRoot: React.FC = () => {
  return (
    <>
      <Composition
        id="YearlyReview"
        // @ts-expect-error Remotion type inference issue with custom props
        component={YearlyReview}
        durationInFrames={TOTAL_DURATION}
        fps={VIDEO_FPS}
        width={VIDEO_WIDTH}
        height={VIDEO_HEIGHT}
        defaultProps={{
          stats: defaultStats,
          backgroundMusic: undefined,
        }}
      />
    </>
  );
};
