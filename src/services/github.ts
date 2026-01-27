import { GraphQLClient, gql } from 'graphql-request';
import type {
  YearlyStats,
  GitHubUser,
  Repository,
  LanguageStats,
  ContributionCalendar,
  ContributionDay,
  ActiveHour,
  ActiveDay,
} from '@/types';

const GITHUB_GRAPHQL_ENDPOINT = 'https://api.github.com/graphql';

export function createGitHubClient(token: string) {
  return new GraphQLClient(GITHUB_GRAPHQL_ENDPOINT, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
}

const USER_QUERY = gql`
  query GetUser($login: String!) {
    user(login: $login) {
      login
      name
      avatarUrl
      bio
      company
      location
      followers {
        totalCount
      }
      following {
        totalCount
      }
      createdAt
    }
  }
`;

const CONTRIBUTIONS_QUERY = gql`
  query GetContributions($login: String!, $from: DateTime!, $to: DateTime!) {
    user(login: $login) {
      contributionsCollection(from: $from, to: $to) {
        contributionCalendar {
          totalContributions
          weeks {
            contributionDays {
              date
              contributionCount
              contributionLevel
            }
          }
        }
        totalCommitContributions
        totalPullRequestContributions
        totalIssueContributions
        totalPullRequestReviewContributions
        restrictedContributionsCount
      }
    }
  }
`;

const REPOSITORIES_QUERY = gql`
  query GetRepositories($login: String!, $first: Int!) {
    user(login: $login) {
      repositories(
        first: $first
        orderBy: { field: STARGAZERS, direction: DESC }
        ownerAffiliations: [OWNER]
      ) {
        nodes {
          name
          description
          url
          primaryLanguage {
            name
            color
          }
          stargazerCount
          forkCount
          isPrivate
          createdAt
          updatedAt
        }
      }
    }
  }
`;

const LANGUAGES_QUERY = gql`
  query GetLanguages($login: String!) {
    user(login: $login) {
      repositories(first: 100, ownerAffiliations: [OWNER]) {
        nodes {
          languages(first: 10, orderBy: { field: SIZE, direction: DESC }) {
            edges {
              size
              node {
                name
                color
              }
            }
          }
        }
      }
    }
  }
`;

const PR_QUERY = gql`
  query GetPRs($login: String!, $from: DateTime!, $to: DateTime!) {
    user(login: $login) {
      pullRequests(first: 100, orderBy: { field: CREATED_AT, direction: DESC }) {
        nodes {
          createdAt
          state
          merged
        }
        totalCount
      }
      contributionsCollection(from: $from, to: $to) {
        totalPullRequestContributions
        pullRequestContributionsByRepository {
          contributions {
            totalCount
          }
        }
      }
    }
  }
`;

const ISSUES_QUERY = gql`
  query GetIssues($login: String!) {
    user(login: $login) {
      issues(first: 100, orderBy: { field: CREATED_AT, direction: DESC }) {
        nodes {
          createdAt
          state
        }
        totalCount
      }
    }
  }
`;

// Query to get user's organizations
const ORGANIZATIONS_QUERY = gql`
  query GetOrganizations($login: String!) {
    user(login: $login) {
      organizations(first: 20) {
        nodes {
          login
          name
          avatarUrl
        }
      }
    }
  }
`;

// Query to get organization repositories
const ORG_REPOS_QUERY = gql`
  query GetOrgRepos($org: String!, $first: Int!, $after: String) {
    organization(login: $org) {
      repositories(first: $first, after: $after, orderBy: { field: PUSHED_AT, direction: DESC }) {
        pageInfo {
          hasNextPage
          endCursor
        }
        nodes {
          name
          nameWithOwner
          isPrivate
          primaryLanguage {
            name
            color
          }
          languages(first: 10, orderBy: { field: SIZE, direction: DESC }) {
            edges {
              size
              node {
                name
                color
              }
            }
          }
          defaultBranchRef {
            name
            target {
              ... on Commit {
                history(first: 1) {
                  totalCount
                }
              }
            }
          }
        }
      }
    }
  }
`;

// Query to get commits by a specific author in a repository
const REPO_COMMITS_QUERY = gql`
  query GetRepoCommits($owner: String!, $name: String!, $authorId: ID!, $since: GitTimestamp!, $until: GitTimestamp!) {
    repository(owner: $owner, name: $name) {
      defaultBranchRef {
        target {
          ... on Commit {
            history(first: 100, author: { id: $authorId }, since: $since, until: $until) {
              totalCount
              nodes {
                committedDate
                additions
                deletions
                message
              }
            }
          }
        }
      }
    }
  }
`;

// Query to get user's node ID (needed for author filtering)
const USER_ID_QUERY = gql`
  query GetUserId($login: String!) {
    user(login: $login) {
      id
    }
  }
`;

interface UserResponse {
  user: {
    login: string;
    name: string | null;
    avatarUrl: string;
    bio: string | null;
    company: string | null;
    location: string | null;
    followers: { totalCount: number };
    following: { totalCount: number };
    createdAt: string;
  };
}

interface ContributionsResponse {
  user: {
    contributionsCollection: {
      contributionCalendar: ContributionCalendar;
      totalCommitContributions: number;
      totalPullRequestContributions: number;
      totalIssueContributions: number;
      totalPullRequestReviewContributions: number;
      restrictedContributionsCount: number;
    };
  };
}

interface RepositoriesResponse {
  user: {
    repositories: {
      nodes: Repository[];
    };
  };
}

interface LanguagesResponse {
  user: {
    repositories: {
      nodes: Array<{
        languages: {
          edges: Array<{
            size: number;
            node: {
              name: string;
              color: string;
            };
          }>;
        };
      }>;
    };
  };
}

interface PRResponse {
  user: {
    pullRequests: {
      nodes: Array<{
        createdAt: string;
        state: string;
        merged: boolean;
      }>;
      totalCount: number;
    };
    contributionsCollection: {
      totalPullRequestContributions: number;
      pullRequestContributionsByRepository: Array<{
        contributions: { totalCount: number };
      }>;
    };
  };
}

interface IssuesResponse {
  user: {
    issues: {
      nodes: Array<{
        createdAt: string;
        state: string;
      }>;
      totalCount: number;
    };
  };
}

interface OrganizationsResponse {
  user: {
    organizations: {
      nodes: Array<{
        login: string;
        name: string | null;
        avatarUrl: string;
      }>;
    };
  };
}

interface OrgReposResponse {
  organization: {
    repositories: {
      pageInfo: {
        hasNextPage: boolean;
        endCursor: string | null;
      };
      nodes: Array<{
        name: string;
        nameWithOwner: string;
        isPrivate: boolean;
        primaryLanguage: { name: string; color: string } | null;
        languages: {
          edges: Array<{
            size: number;
            node: { name: string; color: string };
          }>;
        };
        defaultBranchRef: {
          name: string;
          target: {
            history: { totalCount: number };
          };
        } | null;
      }>;
    };
  };
}

interface RepoCommitsResponse {
  repository: {
    defaultBranchRef: {
      target: {
        history: {
          totalCount: number;
          nodes: Array<{
            committedDate: string;
            additions: number;
            deletions: number;
            message: string;
          }>;
        };
      };
    } | null;
  };
}

interface UserIdResponse {
  user: {
    id: string;
  };
}

interface OrgContributionStats {
  totalCommits: number;
  additions: number;
  deletions: number;
  commitsByDate: Map<string, number>;
  languageStats: Map<string, { color: string; size: number }>;
  activeRepos: Array<{ name: string; commits: number }>;
}

function calculateStreaks(days: ContributionDay[]): { longest: number; current: number } {
  let longest = 0;
  let current = 0;
  let tempStreak = 0;

  const sortedDays = [...days].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

  for (const day of sortedDays) {
    if (day.contributionCount > 0) {
      tempStreak++;
      longest = Math.max(longest, tempStreak);
    } else {
      tempStreak = 0;
    }
  }

  // Calculate current streak (from most recent day backwards)
  const reversedDays = [...sortedDays].reverse();
  for (const day of reversedDays) {
    if (day.contributionCount > 0) {
      current++;
    } else {
      break;
    }
  }

  return { longest, current };
}

function calculateActiveHours(days: ContributionDay[]): ActiveHour[] {
  // Since GitHub API doesn't provide hour-level data, we'll create a simulated distribution
  // In a real app, you might use commit timestamps from the REST API
  const hours: ActiveHour[] = [];
  for (let i = 0; i < 24; i++) {
    hours.push({ hour: i, count: 0 });
  }

  // Simulate active hours based on typical developer patterns
  const totalContributions = days.reduce((sum, d) => sum + d.contributionCount, 0);
  const distribution = [
    0.01, 0.005, 0.003, 0.002, 0.002, 0.003, // 0-5
    0.02, 0.04, 0.06, 0.08, 0.09, 0.08, // 6-11
    0.05, 0.06, 0.08, 0.09, 0.08, 0.06, // 12-17
    0.04, 0.05, 0.06, 0.05, 0.03, 0.02, // 18-23
  ];

  for (let i = 0; i < 24; i++) {
    hours[i].count = Math.round(totalContributions * distribution[i]);
  }

  return hours;
}

function calculateActiveDays(weeks: ContributionCalendar['weeks']): ActiveDay[] {
  const dayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  const dayCounts: number[] = [0, 0, 0, 0, 0, 0, 0];

  for (const week of weeks) {
    for (let i = 0; i < week.contributionDays.length; i++) {
      dayCounts[i] += week.contributionDays[i].contributionCount;
    }
  }

  return dayNames.map((day, index) => ({
    day,
    count: dayCounts[index],
  }));
}

function aggregateLanguages(response: LanguagesResponse): LanguageStats[] {
  const languageMap = new Map<string, { color: string; size: number }>();

  for (const repo of response.user.repositories.nodes) {
    for (const edge of repo.languages.edges) {
      const existing = languageMap.get(edge.node.name);
      if (existing) {
        existing.size += edge.size;
      } else {
        languageMap.set(edge.node.name, {
          color: edge.node.color || '#808080',
          size: edge.size,
        });
      }
    }
  }

  const total = Array.from(languageMap.values()).reduce((sum, lang) => sum + lang.size, 0);
  const languages: LanguageStats[] = Array.from(languageMap.entries())
    .map(([name, data]) => ({
      name,
      color: data.color,
      size: data.size,
      percentage: total > 0 ? (data.size / total) * 100 : 0,
    }))
    .sort((a, b) => b.size - a.size)
    .slice(0, 10);

  return languages;
}

function aggregateLanguagesFromMap(languageMap: Map<string, { color: string; size: number }>): LanguageStats[] {
  const total = Array.from(languageMap.values()).reduce((sum, lang) => sum + lang.size, 0);
  const languages: LanguageStats[] = Array.from(languageMap.entries())
    .map(([name, data]) => ({
      name,
      color: data.color,
      size: data.size,
      percentage: total > 0 ? (data.size / total) * 100 : 0,
    }))
    .sort((a, b) => b.size - a.size)
    .slice(0, 10);

  return languages;
}

// Fetch organization contribution stats for a user
async function fetchOrgContributions(
  client: GraphQLClient,
  username: string,
  year: number
): Promise<OrgContributionStats> {
  const since = `${year}-01-01T00:00:00Z`;
  const until = `${year}-12-31T23:59:59Z`;

  const stats: OrgContributionStats = {
    totalCommits: 0,
    additions: 0,
    deletions: 0,
    commitsByDate: new Map(),
    languageStats: new Map(),
    activeRepos: [],
  };

  try {
    // Get user ID for commit author filtering
    const userIdResponse = await client.request<UserIdResponse>(USER_ID_QUERY, { login: username });
    const userId = userIdResponse.user.id;

    // Get user's organizations
    const orgsResponse = await safeRequest<OrganizationsResponse>(
      client,
      ORGANIZATIONS_QUERY,
      { login: username },
      { user: { organizations: { nodes: [] } } }
    );

    const orgs = orgsResponse.user.organizations.nodes || [];
    console.log(`Found ${orgs.length} organizations for user ${username}`);

    // For each organization, get repositories and commits
    for (const org of orgs) {
      try {
        // Get organization repositories (first 50 most recently pushed)
        const orgReposResponse = await safeRequest<OrgReposResponse>(
          client,
          ORG_REPOS_QUERY,
          { org: org.login, first: 50, after: null },
          { organization: { repositories: { pageInfo: { hasNextPage: false, endCursor: null }, nodes: [] } } }
        );

        const repos = orgReposResponse.organization?.repositories?.nodes || [];
        console.log(`Found ${repos.length} repositories in organization ${org.login}`);

        // For each repository, get user's commits
        for (const repo of repos) {
          if (!repo.defaultBranchRef) continue;

          try {
            const [owner, name] = repo.nameWithOwner.split('/');
            const commitsResponse = await safeRequest<RepoCommitsResponse>(
              client,
              REPO_COMMITS_QUERY,
              { owner, name, authorId: userId, since, until },
              { repository: { defaultBranchRef: null } }
            );

            const history = commitsResponse.repository?.defaultBranchRef?.target?.history;
            if (history && history.totalCount > 0) {
              stats.totalCommits += history.totalCount;
              stats.activeRepos.push({ name: repo.nameWithOwner, commits: history.totalCount });

              // Aggregate commit details
              for (const commit of history.nodes || []) {
                stats.additions += commit.additions || 0;
                stats.deletions += commit.deletions || 0;

                // Track commits by date
                const date = commit.committedDate.split('T')[0];
                stats.commitsByDate.set(date, (stats.commitsByDate.get(date) || 0) + 1);
              }

              // Aggregate language stats from this repo
              for (const edge of repo.languages.edges) {
                const existing = stats.languageStats.get(edge.node.name);
                if (existing) {
                  existing.size += edge.size;
                } else {
                  stats.languageStats.set(edge.node.name, {
                    color: edge.node.color || '#808080',
                    size: edge.size,
                  });
                }
              }
            }
          } catch (repoError) {
            // Skip repos we can't access
            console.warn(`Could not fetch commits for ${repo.nameWithOwner}:`, repoError);
          }
        }
      } catch (orgError) {
        // Skip orgs we can't access (SAML, permissions, etc.)
        console.warn(`Could not fetch repos for organization ${org.login}:`, orgError);
      }
    }

    // Sort active repos by commit count
    stats.activeRepos.sort((a, b) => b.commits - a.commits);
    stats.activeRepos = stats.activeRepos.slice(0, 10);

  } catch (error) {
    console.warn('Failed to fetch organization contributions:', error);
  }

  return stats;
}

// Helper function to safely request with SAML error handling
async function safeRequest<T>(
  client: GraphQLClient,
  query: string,
  variables: Record<string, unknown>,
  defaultValue: T
): Promise<T> {
  try {
    return await client.request<T>(query, variables);
  } catch (error: unknown) {
    // Check if it's a SAML error - still return partial data if available
    const errorObj = error as { response?: { data?: T; errors?: Array<{ extensions?: { saml_failure?: boolean } }> } };
    if (errorObj.response?.errors?.some(e => e.extensions?.saml_failure)) {
      console.warn('SAML protected resource encountered, using partial data');
      if (errorObj.response?.data) {
        return errorObj.response.data;
      }
      return defaultValue;
    }
    throw error;
  }
}

export async function fetchYearlyStats(
  client: GraphQLClient,
  username: string,
  year: number = new Date().getFullYear()
): Promise<YearlyStats> {
  const from = `${year}-01-01T00:00:00Z`;
  const to = `${year}-12-31T23:59:59Z`;

  // Fetch all data in parallel with SAML error handling
  const [userResponse, contributionsResponse, repositoriesResponse, languagesResponse, prResponse, issuesResponse, orgContributions] =
    await Promise.all([
      client.request<UserResponse>(USER_QUERY, { login: username }),
      client.request<ContributionsResponse>(CONTRIBUTIONS_QUERY, { login: username, from, to }),
      client.request<RepositoriesResponse>(REPOSITORIES_QUERY, { login: username, first: 10 }),
      client.request<LanguagesResponse>(LANGUAGES_QUERY, { login: username }),
      safeRequest<PRResponse>(client, PR_QUERY, { login: username, from, to }, {
        user: {
          pullRequests: { nodes: [], totalCount: 0 },
          contributionsCollection: { totalPullRequestContributions: 0, pullRequestContributionsByRepository: [] }
        }
      } as unknown as PRResponse),
      safeRequest<IssuesResponse>(client, ISSUES_QUERY, { login: username }, {
        user: { issues: { nodes: [], totalCount: 0 } }
      } as unknown as IssuesResponse),
      // Fetch organization contributions
      fetchOrgContributions(client, username, year),
    ]);

  const user: GitHubUser = {
    login: userResponse.user.login,
    name: userResponse.user.name,
    avatarUrl: userResponse.user.avatarUrl,
    bio: userResponse.user.bio,
    company: userResponse.user.company,
    location: userResponse.user.location,
    followers: userResponse.user.followers.totalCount,
    following: userResponse.user.following.totalCount,
    createdAt: userResponse.user.createdAt,
  };

  const contributions = contributionsResponse.user.contributionsCollection.contributionCalendar;

  // Flatten all contribution days
  let allDays = contributions.weeks.flatMap((week) => week.contributionDays);

  // Merge organization commits into contribution calendar
  if (orgContributions.totalCommits > 0) {
    console.log(`Merging ${orgContributions.totalCommits} organization commits into contribution calendar`);

    // Create a map for quick lookup
    const dayMap = new Map<string, ContributionDay>();
    for (const day of allDays) {
      dayMap.set(day.date, { ...day });
    }

    // Add organization commits to the calendar
    for (const [date, count] of orgContributions.commitsByDate) {
      const existing = dayMap.get(date);
      if (existing) {
        existing.contributionCount += count;
        // Update contribution level based on new count
        if (existing.contributionCount >= 30) {
          existing.contributionLevel = 'FOURTH_QUARTILE';
        } else if (existing.contributionCount >= 20) {
          existing.contributionLevel = 'THIRD_QUARTILE';
        } else if (existing.contributionCount >= 10) {
          existing.contributionLevel = 'SECOND_QUARTILE';
        } else if (existing.contributionCount >= 1) {
          existing.contributionLevel = 'FIRST_QUARTILE';
        }
      }
    }

    // Update allDays with merged data
    allDays = Array.from(dayMap.values());
  }

  // Update total contributions with org commits
  const totalContributions = contributions.totalContributions + orgContributions.totalCommits;

  // Calculate streaks with merged data
  const { longest: longestStreak, current: currentStreak } = calculateStreaks(allDays);

  // Find most productive day with merged data
  const mostProductiveDay = allDays.reduce(
    (max, day) => (day.contributionCount > (max?.contributionCount || 0) ? day : max),
    null as ContributionDay | null
  );

  // Find first contribution of the year
  const firstContribution = allDays.find((day) => day.contributionCount > 0) || null;

  // Calculate active hours and days with merged data
  const activeHours = calculateActiveHours(allDays);
  const activeDays = calculateActiveDays(contributions.weeks);

  // Merge language stats from personal repos and org repos
  let languageStats = aggregateLanguages(languagesResponse);
  if (orgContributions.languageStats.size > 0) {
    // Combine personal and org language stats
    const combinedLangMap = new Map<string, { color: string; size: number }>();

    // Add personal language stats
    for (const lang of languageStats) {
      combinedLangMap.set(lang.name, { color: lang.color, size: lang.size });
    }

    // Add org language stats
    for (const [name, data] of orgContributions.languageStats) {
      const existing = combinedLangMap.get(name);
      if (existing) {
        existing.size += data.size;
      } else {
        combinedLangMap.set(name, { ...data });
      }
    }

    languageStats = aggregateLanguagesFromMap(combinedLangMap);
  }

  // Filter PRs for the specific year (filter out null values from SAML errors)
  const yearPRs = (prResponse.user.pullRequests.nodes || []).filter((pr) => {
    if (!pr) return false;
    const prYear = new Date(pr.createdAt).getFullYear();
    return prYear === year;
  });

  const pullRequestStats = {
    totalPRs: yearPRs.length,
    merged: yearPRs.filter((pr) => pr?.merged).length,
    open: yearPRs.filter((pr) => pr?.state === 'OPEN').length,
    closed: yearPRs.filter((pr) => pr?.state === 'CLOSED' && !pr.merged).length,
  };

  // Filter issues for the specific year (filter out null values from SAML errors)
  const yearIssues = (issuesResponse.user.issues.nodes || []).filter((issue) => {
    if (!issue) return false;
    const issueYear = new Date(issue.createdAt).getFullYear();
    return issueYear === year;
  });

  const issueStats = {
    totalIssues: yearIssues.length,
    open: yearIssues.filter((issue) => issue?.state === 'OPEN').length,
    closed: yearIssues.filter((issue) => issue?.state === 'CLOSED').length,
  };

  // Create merged contribution calendar with updated total
  const mergedContributions: ContributionCalendar = {
    ...contributions,
    totalContributions: totalContributions,
  };

  // Combine personal and org commits
  const totalCommits = contributionsResponse.user.contributionsCollection.totalCommitContributions + orgContributions.totalCommits;

  return {
    user,
    year,
    contributions: mergedContributions,
    topRepositories: repositoriesResponse.user.repositories.nodes,
    languageStats,
    commitStats: {
      totalCommits: totalCommits,
      additions: orgContributions.additions,
      deletions: orgContributions.deletions,
    },
    pullRequestStats,
    issueStats,
    activeHours,
    activeDays,
    longestStreak,
    currentStreak,
    mostProductiveDay,
    firstContribution,
  };
}
