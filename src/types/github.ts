export interface GitHubUser {
  login: string;
  name: string | null;
  avatarUrl: string;
  bio: string | null;
  company: string | null;
  location: string | null;
  followers: number;
  following: number;
  createdAt: string;
}

export interface Repository {
  name: string;
  description: string | null;
  url: string;
  primaryLanguage: {
    name: string;
    color: string;
  } | null;
  stargazerCount: number;
  forkCount: number;
  isPrivate: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface LanguageStats {
  name: string;
  color: string;
  size: number;
  percentage: number;
}

export interface ContributionDay {
  date: string;
  contributionCount: number;
  contributionLevel: 'NONE' | 'FIRST_QUARTILE' | 'SECOND_QUARTILE' | 'THIRD_QUARTILE' | 'FOURTH_QUARTILE';
}

export interface ContributionWeek {
  contributionDays: ContributionDay[];
}

export interface ContributionCalendar {
  totalContributions: number;
  weeks: ContributionWeek[];
}

export interface CommitStats {
  totalCommits: number;
  additions: number;
  deletions: number;
}

export interface PullRequestStats {
  totalPRs: number;
  merged: number;
  open: number;
  closed: number;
}

export interface IssueStats {
  totalIssues: number;
  open: number;
  closed: number;
}

export interface ActiveHour {
  hour: number;
  count: number;
}

export interface ActiveDay {
  day: string;
  count: number;
}

export interface YearlyStats {
  user: GitHubUser;
  year: number;
  contributions: ContributionCalendar;
  topRepositories: Repository[];
  languageStats: LanguageStats[];
  commitStats: CommitStats;
  pullRequestStats: PullRequestStats;
  issueStats: IssueStats;
  activeHours: ActiveHour[];
  activeDays: ActiveDay[];
  longestStreak: number;
  currentStreak: number;
  mostProductiveDay: ContributionDay | null;
  firstContribution: ContributionDay | null;
}
