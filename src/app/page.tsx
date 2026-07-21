import Link from "next/link";
import { getDailyMessage } from "@/vo-tri/copy/daily-messages";
import { ActivitySpotlight } from "@/vo-tri/home/ActivitySpotlight";
import { CommunityPulse } from "@/vo-tri/home/CommunityPulse";
import { HeroScene } from "@/vo-tri/home/HeroScene";
import { QuickAccess } from "@/vo-tri/home/QuickAccess";
import { TodayCard, type TodayStats } from "@/vo-tri/home/TodayCard";
import { Container } from "@/vo-tri/shell";
import type { VoTriUser } from "@/vo-tri/shell/types";
import { Badge, Button, Mascot, SmoothAnchorLink } from "@/vo-tri/ui";

// No session yet — Home always renders the logged-out path (no TodayCard).
// Swap this for a real session lookup once auth exists; nothing else here
// needs to change since TodayCard/ActivitySpotlight/CommunityPulse already
// accept real data as an optional prop.
const currentUser: { user: VoTriUser; stats: TodayStats } | undefined = undefined;

export default function HomePage() {
  const dailyMessage = getDailyMessage();

  return (
    <>
      <Container className="flex min-h-[calc(100vh-5rem)] flex-col items-center justify-center gap-8 py-12 text-center">
        <HeroScene>
          <div className="flex flex-col items-center gap-6">
            <Mascot mood="celebrating" size="xl" className="h-32 w-32 sm:h-40 sm:w-40" />

            <Badge variant="secondary" className="vt-fade-up">
              Hôm nay: {dailyMessage}
            </Badge>

            <h1 className="vt-fade-up max-w-2xl font-vt-display text-4xl font-extrabold leading-tight text-vt-text-primary sm:text-5xl">
              Ở đây, vô tri là một kỹ năng.
            </h1>
            <p className="vt-fade-up max-w-md text-balance text-base text-vt-text-secondary" style={{ animationDelay: "80ms" }}>
              Không deadline. Không nghiêm túc. Chỉ có bạn, vài trò vui, và một con mascot hơi lầy.
            </p>

            <div className="vt-fade-up flex flex-wrap items-center justify-center gap-3" style={{ animationDelay: "160ms" }}>
              <Button asChild size="lg" variant="primary">
                <SmoothAnchorLink href="#quick-access">Bắt đầu vô tri</SmoothAnchorLink>
              </Button>
              <Button asChild size="lg" variant="outline">
                <Link href="/explore">Xem có gì đang hot</Link>
              </Button>
            </div>
          </div>
        </HeroScene>
      </Container>

      <Container className="flex flex-col gap-10 pb-16">
        <QuickAccess />

        {currentUser && <TodayCard stats={currentUser.stats} />}

        <section className="flex flex-col gap-3">
          <h2 className="px-1 font-vt-display text-sm font-semibold uppercase tracking-wide text-vt-text-secondary">
            Đang diễn ra
          </h2>
          <ActivitySpotlight />
        </section>

        <CommunityPulse />
      </Container>
    </>
  );
}
