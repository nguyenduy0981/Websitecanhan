import type { Metadata } from "next";
import { Container, LoginButton } from "@/vo-tri/shell";
import { Mascot } from "@/vo-tri/ui";
import {
  AchievementSection,
  BadgeCollection,
  CollectionShowcase,
  JourneyTimeline,
  LevelCard,
  ProfileHero,
  ShareProfile,
  StatCards,
} from "@/vo-tri/profile";
import { StreakTracker } from "@/vo-tri/retention";
import { SITE_URL } from "@/vo-tri/lib/site";
import { getOptionalSession } from "@/vo-tri/server/session";
import * as profileService from "@/vo-tri/server/services/profile-service";

export const metadata: Metadata = {
  title: "Hồ Sơ — VÔ TRI",
  description: "Danh tính số của bạn trong thế giới VÔ TRI.",
};

// Achievement/Badge/Journey/Collection have no backend yet (see
// docs/BACKEND_ARCHITECTURE.md §10) — real logged-in users still see this
// page, but those four sections render their own honest empty state via
// `[]`, exactly the fixture-empty demo already shown on /vo-tri-styleguide.
// Identity/Stats/Level/Streak DO have real services (profile-service.ts),
// so those render real data once a session exists.
export default async function ProfilePage() {
  const session = await getOptionalSession();

  if (!session) {
    return (
      <Container className="flex min-h-[70vh] flex-col items-center justify-center gap-4 py-12 text-center">
        <Mascot mood="thinking" size="xl" />
        <div>
          <h1 className="font-vt-display text-xl font-bold text-vt-text-primary">Bạn chưa có danh tính ở đây</h1>
          <p className="mt-2 max-w-sm text-sm text-vt-text-secondary">
            Đăng nhập để có avatar, level, huy hiệu và cả một hành trình vô tri của riêng bạn.
          </p>
        </div>
        <LoginButton size="lg" />
      </Container>
    );
  }

  const [identityResult, statsResult, levelResult, streakResult] = await Promise.all([
    profileService.getProfileIdentity(session.client, session.userId),
    profileService.getProfileStats(session.client, session.userId),
    profileService.getLevelProgress(session.client, session.userId),
    profileService.getStreakData(session.client, session.userId),
  ]);

  if (!identityResult.ok || !statsResult.ok || !levelResult.ok || !streakResult.ok) {
    return (
      <Container className="flex min-h-[70vh] flex-col items-center justify-center gap-4 py-12 text-center">
        <Mascot mood="sleepy" size="xl" />
        <div>
          <h1 className="font-vt-display text-xl font-bold text-vt-text-primary">Chưa tải được hồ sơ</h1>
          <p className="mt-2 max-w-sm text-sm text-vt-text-secondary">Thử tải lại trang xem sao.</p>
        </div>
      </Container>
    );
  }

  const identity = identityResult.data;
  const stats = statsResult.data;

  return (
    <Container className="flex flex-col gap-6 py-8">
      <ProfileHero identity={identity} level={stats.level} />
      <StatCards stats={stats} />
      <div className="grid gap-6 md:grid-cols-2">
        <LevelCard progress={levelResult.data} />
        <StreakTracker streak={streakResult.data} />
      </div>
      <AchievementSection achievements={[]} />
      <BadgeCollection badges={[]} />
      <JourneyTimeline events={[]} />
      <CollectionShowcase items={[]} />
      <ShareProfile profileUrl={`${SITE_URL}/u/${identity.username}`} />
    </Container>
  );
}
