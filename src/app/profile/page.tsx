import type { Metadata } from "next";
import { Container } from "@/vo-tri/shell";
import { Button, Mascot } from "@/vo-tri/ui";

export const metadata: Metadata = {
  title: "Hồ Sơ — VÔ TRI",
  description: "Danh tính số của bạn trong thế giới VÔ TRI.",
};

// No auth/session system exists yet — Profile is inherently per-user data
// (avatar, level, achievements, timeline), so unlike Home/Explore there is
// no honest "browse as guest" version of this page. Every component that
// will render here (ProfileHero, LevelCard, AchievementSection,
// BadgeCollection, JourneyTimeline, CollectionShowcase, EditProfileSheet,
// ShareProfile — all in src/vo-tri/profile/) is fully built and shown live
// with fixture data on /vo-tri-styleguide; this route stays the honest
// logged-out state until real auth exists, per CLAUDE.md's no-fabricated-
// data rule — swap this file's body for a real session lookup then.
export default function ProfilePage() {
  return (
    <Container className="flex min-h-[70vh] flex-col items-center justify-center gap-4 py-12 text-center">
      <Mascot mood="thinking" size="xl" />
      <div>
        <h1 className="font-vt-display text-xl font-bold text-vt-text-primary">Bạn chưa có danh tính ở đây</h1>
        <p className="mt-2 max-w-sm text-sm text-vt-text-secondary">
          Đăng nhập để có avatar, level, huy hiệu và cả một hành trình vô tri của riêng bạn.
        </p>
      </div>
      <Button variant="primary" size="lg">
        Đăng nhập
      </Button>
    </Container>
  );
}
