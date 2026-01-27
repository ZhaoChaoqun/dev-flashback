import { AbsoluteFill, Sequence, Audio, staticFile } from 'remotion';
import type { YearlyStats } from '@/types';
import { SCENE_DURATIONS } from './Root';
import { IntroScene } from './scenes/IntroScene';
import { ProfileScene } from './scenes/ProfileScene';
import { ContributionsScene } from './scenes/ContributionsScene';
import { LanguagesScene } from './scenes/LanguagesScene';
import { RepositoriesScene } from './scenes/RepositoriesScene';
import { ActivityScene } from './scenes/ActivityScene';
import { StreaksScene } from './scenes/StreaksScene';
import { SummaryScene } from './scenes/SummaryScene';
import { OutroScene } from './scenes/OutroScene';

interface YearlyReviewProps {
  stats: YearlyStats;
  backgroundMusic?: string; // Optional path to background music file
}

export const YearlyReview: React.FC<YearlyReviewProps> = ({ stats, backgroundMusic }) => {
  let currentFrame = 0;

  const getStartFrame = (duration: number) => {
    const start = currentFrame;
    currentFrame += duration;
    return start;
  };

  return (
    <AbsoluteFill
      style={{
        backgroundColor: '#0d1117',
        fontFamily: 'system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
      }}
    >
      {/* Background Music */}
      {backgroundMusic && <Audio src={staticFile(backgroundMusic)} volume={0.3} />}

      <Sequence from={getStartFrame(SCENE_DURATIONS.intro)} durationInFrames={SCENE_DURATIONS.intro}>
        <IntroScene year={stats.year} username={stats.user.login} />
      </Sequence>

      <Sequence from={getStartFrame(SCENE_DURATIONS.profile)} durationInFrames={SCENE_DURATIONS.profile}>
        <ProfileScene user={stats.user} />
      </Sequence>

      <Sequence from={getStartFrame(SCENE_DURATIONS.contributions)} durationInFrames={SCENE_DURATIONS.contributions}>
        <ContributionsScene contributions={stats.contributions} year={stats.year} />
      </Sequence>

      <Sequence from={getStartFrame(SCENE_DURATIONS.languages)} durationInFrames={SCENE_DURATIONS.languages}>
        <LanguagesScene languages={stats.languageStats} />
      </Sequence>

      <Sequence from={getStartFrame(SCENE_DURATIONS.repositories)} durationInFrames={SCENE_DURATIONS.repositories}>
        <RepositoriesScene repositories={stats.topRepositories} />
      </Sequence>

      <Sequence from={getStartFrame(SCENE_DURATIONS.activity)} durationInFrames={SCENE_DURATIONS.activity}>
        <ActivityScene activeDays={stats.activeDays} activeHours={stats.activeHours} />
      </Sequence>

      <Sequence from={getStartFrame(SCENE_DURATIONS.streaks)} durationInFrames={SCENE_DURATIONS.streaks}>
        <StreaksScene
          longestStreak={stats.longestStreak}
          currentStreak={stats.currentStreak}
          mostProductiveDay={stats.mostProductiveDay}
        />
      </Sequence>

      <Sequence from={getStartFrame(SCENE_DURATIONS.summary)} durationInFrames={SCENE_DURATIONS.summary}>
        <SummaryScene stats={stats} />
      </Sequence>

      <Sequence from={getStartFrame(SCENE_DURATIONS.outro)} durationInFrames={SCENE_DURATIONS.outro}>
        <OutroScene year={stats.year} username={stats.user.login} />
      </Sequence>
    </AbsoluteFill>
  );
};
