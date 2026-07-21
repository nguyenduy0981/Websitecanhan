"use client";

import { Crown, Medal, Palette, Shirt, Sparkles as SparklesIcon, Star, Target, Trophy } from "lucide-react";
import { useState } from "react";
import { activities } from "@/vo-tri/explore/activities";
import { voTriFontVariables } from "@/vo-tri/fonts";
import {
  ExitConfirmDialog,
  GameHeader,
  GameNotReadyState,
  PreGameScreen,
  ResultScreen,
} from "@/vo-tri/game";
import {
  LeaderboardHero,
  LeaderboardList,
  MyPositionCard,
  RankChangeIcon,
  TopThreePodium,
  type LeaderboardPlayer,
} from "@/vo-tri/leaderboard";
import {
  ActivityFeed,
  CommentSection,
  FollowButton,
  NotificationCenter,
  ReactionBar,
  ShareSheet,
  SocialCard,
  UserPreviewCard,
  type CommentData,
  type FeedItem,
  type NotificationItem,
  type ReactionCounts,
} from "@/vo-tri/social";
import {
  AchievementSection,
  BadgeCollection,
  CollectionShowcase,
  EditProfileSheet,
  JourneyTimeline,
  LevelCard,
  ProfileHero,
  ShareProfile,
  StatCards,
  type Achievement,
  type CollectionItem,
  type JourneyEvent,
  type ProfileBadge,
} from "@/vo-tri/profile";
import {
  Badge,
  BottomSheet,
  BottomSheetContent,
  BottomSheetDescription,
  BottomSheetTitle,
  BottomSheetTrigger,
  Button,
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  EmptyState,
  ErrorState,
  Field,
  Input,
  LoadingState,
  Mascot,
  type MascotMood,
  Skeleton,
  SuccessState,
  toast,
  Toaster,
} from "@/vo-tri/ui";

const MOODS: MascotMood[] = ["idle", "happy", "laughing", "thinking", "sleepy", "mindblown", "celebrating"];

// Fixture data for the Profile Preview section below — component
// reference fixtures (same role as every other example on this page),
// not real user data. The actual /profile route never renders these;
// it shows the honest logged-out state until real auth exists.
const DEMO_IDENTITY = {
  displayName: "Bé Vô Tri",
  username: "bevotri",
  tagline: "Chuyên gia làm việc không đâu vào đâu.",
  joinedAt: new Date("2026-03-14"),
  online: true,
};
const DEMO_ACHIEVEMENTS: Achievement[] = [
  { id: "a1", name: "Tân Binh Vô Tri", description: "Hoàn thành hoạt động đầu tiên", icon: Star, unlockedAt: new Date() },
  { id: "a2", name: "Chuỗi 7 Ngày", description: "Điểm danh 7 ngày liên tiếp", icon: Medal, unlockedAt: new Date() },
];
const DEMO_BADGES: ProfileBadge[] = [
  { id: "b1", name: "Khởi Đầu", description: "Badge đầu tiên", icon: Star, rarity: "common", unlocked: true },
  { id: "b2", name: "May Mắn", description: "Trúng thưởng lớn", icon: Trophy, rarity: "rare", unlocked: true },
  { id: "b3", name: "Huyền Thoại", description: "Badge cực hiếm", icon: Crown, rarity: "special", unlocked: true },
  { id: "b4", name: "Bí Ẩn", description: "Chưa mở khóa", icon: Target, rarity: "rare", unlocked: false },
];
const DEMO_JOURNEY: JourneyEvent[] = [
  { id: "j1", type: "joined", label: "Gia nhập VÔ TRI", date: new Date("2026-03-14") },
  { id: "j2", type: "level-up", label: "Lên Level 2", date: new Date("2026-03-16") },
  { id: "j3", type: "achievement", label: "Mở khóa \"Chuỗi 7 Ngày\"", date: new Date("2026-03-21") },
  { id: "j4", type: "reward", label: "Nhận phần thưởng Vòng Quay", date: new Date("2026-03-22") },
];
const DEMO_COLLECTION: CollectionItem[] = [
  { id: "c1", name: "Áo Vô Tri", kind: "skin", icon: Shirt, unlocked: true },
  { id: "c2", name: "Người Vô Tri Nhất", kind: "title", icon: SparklesIcon, unlocked: true },
  { id: "c3", name: "Bảng Màu Bí Ẩn", kind: "item", icon: Palette, unlocked: false },
];

// Fixture data for the Leaderboard Preview section — same fixture
// convention as Profile above, not a real ranked player list.
const DEMO_PLAYERS: LeaderboardPlayer[] = [
  { id: "p1", rank: 1, previousRank: 2, name: "Bé Vô Tri", level: 12, points: 4820, badgeLabel: "Huyền thoại" },
  { id: "p2", rank: 2, previousRank: 1, name: "Ông Kẹ", level: 11, points: 4510 },
  { id: "p3", rank: 3, previousRank: 3, name: "Chị Đại", level: 10, points: 4200 },
  { id: "p4", rank: 4, previousRank: 6, name: "Người Vô Danh", level: 9, points: 3890 },
  { id: "p5", rank: 5, name: "Tân Binh Vui Vẻ", level: 8, points: 3650 },
];

// Fixture data for the Social Foundation section — same fixture
// convention as everywhere else on this page, not real social data.
const DEMO_COMMENTS: CommentData[] = [
  {
    id: "c1",
    author: { name: "Ông Kẹ" },
    text: "Cái này vô tri thật sự đó =))",
    createdAt: new Date(Date.now() - 25 * 60_000),
    replies: [{ id: "c1-r1", author: { name: "Bé Vô Tri" }, text: "Chuẩn không cần chỉnh.", createdAt: new Date(Date.now() - 10 * 60_000) }],
  },
  { id: "c2", author: { name: "Chị Đại" }, text: "Làm sao để vô tri giỏi như vậy ạ", createdAt: new Date(Date.now() - 3 * 3_600_000) },
];
const DEMO_REACTION_COUNTS: ReactionCounts = { thich: 12, "cuoi-xiu": 5, "vo-tri": 3 };
const DEMO_FEED: FeedItem[] = [
  { id: "f1", actor: { name: "Bé Vô Tri" }, text: "vừa mở khóa huy hiệu Tân Binh Vô Tri", createdAt: new Date(Date.now() - 40 * 60_000), cardState: "featured" },
  { id: "f2", actor: { name: "Ông Kẹ" }, text: "vừa lên Level 11", createdAt: new Date(Date.now() - 2 * 3_600_000) },
];
const DEMO_NOTIFICATIONS: NotificationItem[] = [
  { id: "n1", type: "achievement", title: "Mở khóa huy hiệu mới", description: "Bạn vừa mở khóa \"Chuỗi 7 Ngày\"", createdAt: new Date(Date.now() - 30 * 60_000), read: false },
  { id: "n2", type: "reward", title: "Nhận thưởng", description: "+30 điểm từ Vòng Quay Vô Tri", createdAt: new Date(Date.now() - 90 * 60_000), read: false },
  { id: "n3", type: "friend", title: "Người theo dõi mới", description: "Chị Đại vừa theo dõi bạn", createdAt: new Date(Date.now() - 5 * 3_600_000), read: true },
  { id: "n4", type: "system", title: "Cập nhật hệ thống", description: "VÔ TRI vừa có vài trò chơi mới", createdAt: new Date(Date.now() - 24 * 3_600_000), read: true },
];

const COLOR_SWATCHES: { name: string; className: string }[] = [
  { name: "bg", className: "bg-vt-bg" },
  { name: "surface", className: "bg-vt-surface" },
  { name: "card", className: "bg-vt-card" },
  { name: "border", className: "bg-vt-border" },
  { name: "primary", className: "bg-vt-primary" },
  { name: "secondary", className: "bg-vt-secondary" },
  { name: "success", className: "bg-vt-success" },
  { name: "warning", className: "bg-vt-warning" },
  { name: "danger", className: "bg-vt-danger" },
  { name: "info", className: "bg-vt-info" },
  { name: "reward", className: "bg-vt-reward" },
  { name: "vip", className: "bg-vt-vip" },
];

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="flex flex-col gap-4 border-b border-vt-divider py-10">
      <h2 className="font-vt-display text-xl font-bold text-vt-text-primary">{title}</h2>
      {children}
    </section>
  );
}

export default function VoTriStyleGuidePage() {
  const [inputValue, setInputValue] = useState("");
  const [loading, setLoading] = useState(false);
  const [editOpen, setEditOpen] = useState(false);
  const [gameExitOpen, setGameExitOpen] = useState(false);
  const demoActivity = activities[0]!;
  const [demoReaction, setDemoReaction] = useState<string | undefined>("thich");
  const [demoFollowing, setDemoFollowing] = useState(false);
  const [demoComments, setDemoComments] = useState(DEMO_COMMENTS);

  return (
    <div className={`${voTriFontVariables} min-h-screen bg-vt-bg font-vt-body text-vt-text-primary`}>
      <div className="mx-auto max-w-3xl px-6 py-16">
        <header className="mb-4 flex items-center gap-4">
          <Mascot mood="happy" size="lg" />
          <div>
            <h1 className="font-vt-display text-3xl font-extrabold">VÔ TRI Style Guide</h1>
            <p className="text-vt-text-secondary">Nội bộ — không index. Nền tảng thiết kế cho các prompt tiếp theo.</p>
          </div>
        </header>

        <Section title="Color">
          <div className="grid grid-cols-3 gap-3 sm:grid-cols-4">
            {COLOR_SWATCHES.map((c) => (
              <div key={c.name} className="flex flex-col gap-2">
                <div className={`h-16 rounded-vt-lg border border-vt-border ${c.className}`} />
                <span className="text-xs text-vt-text-secondary">{c.name}</span>
              </div>
            ))}
          </div>
        </Section>

        <Section title="Typography">
          <p className="font-vt-display text-4xl font-extrabold">Aa Vô Tri Đậm Đà</p>
          <p className="font-vt-display text-2xl font-semibold">Heading — Unbounded 600</p>
          <p className="text-base text-vt-text-primary">
            Body — Be Vietnam Pro. Rõ ràng, dễ đọc lâu, đầy đủ dấu tiếng Việt: à á ả ã ạ ă ằ ắ ẳ ẵ ặ â ầ ấ ẩ ẫ ậ.
          </p>
          <p className="text-sm text-vt-text-secondary">Secondary text — dùng cho phụ đề, mô tả.</p>
        </Section>

        <Section title="Mascot">
          <div className="grid grid-cols-4 gap-4 sm:grid-cols-7">
            {MOODS.map((mood) => (
              <div key={mood} className="flex flex-col items-center gap-1">
                <Mascot mood={mood} size="md" />
                <span className="text-[10px] text-vt-text-secondary">{mood}</span>
              </div>
            ))}
          </div>
        </Section>

        <Section title="Buttons">
          <div className="flex flex-wrap gap-3">
            <Button variant="primary">Primary</Button>
            <Button variant="secondary">Secondary</Button>
            <Button variant="outline">Outline</Button>
            <Button variant="ghost">Ghost</Button>
            <Button variant="danger">Danger</Button>
            <Button variant="primary" disabled>
              Disabled
            </Button>
            <Button
              variant="primary"
              loading={loading}
              loadingLabel="Đang xử lý..."
              onClick={() => {
                setLoading(true);
                setTimeout(() => setLoading(false), 1800);
              }}
            >
              Bấm để loading
            </Button>
          </div>
          <div className="flex flex-wrap items-center gap-3">
            <Button size="sm">Small</Button>
            <Button size="md">Medium</Button>
            <Button size="lg">Large</Button>
          </div>
        </Section>

        <Section title="Badges">
          <div className="flex flex-wrap gap-2">
            <Badge variant="neutral">Neutral</Badge>
            <Badge variant="primary">Primary</Badge>
            <Badge variant="secondary">Secondary</Badge>
            <Badge variant="success">Success</Badge>
            <Badge variant="warning">Warning</Badge>
            <Badge variant="danger">Danger</Badge>
            <Badge variant="info">Info</Badge>
            <Badge variant="reward">+50 điểm</Badge>
            <Badge variant="xp">+120 XP</Badge>
            <Badge variant="vip">VIP</Badge>
          </div>
        </Section>

        <Section title="Cards">
          <div className="grid gap-4 sm:grid-cols-2">
            <Card variant="default">
              <CardHeader>
                <CardTitle>Card mặc định</CardTitle>
                <CardDescription>Viền + bóng nhẹ, đứng yên.</CardDescription>
              </CardHeader>
              <CardContent>Nội dung ở đây.</CardContent>
            </Card>
            <Card variant="elevated">
              <CardHeader>
                <CardTitle>Card nổi (hover thử xem)</CardTitle>
                <CardDescription>Nhấc lên khi hover/press.</CardDescription>
              </CardHeader>
              <CardContent>Di chuột vào để xem hiệu ứng.</CardContent>
              <CardFooter>
                <Button size="sm">Hành động</Button>
              </CardFooter>
            </Card>
          </div>
        </Section>

        <Section title="Input">
          <div className="max-w-sm">
            <Field label="Biệt danh" helper="Cái tên bạn muốn cả cộng đồng gọi." required>
              {(fieldProps) => (
                <Input {...fieldProps} value={inputValue} onChange={(e) => setInputValue(e.target.value)} placeholder="Nhập gì đó..." />
              )}
            </Field>
          </div>
          <div className="max-w-sm">
            <Field label="Trường lỗi" error="Ơ, cái này chưa ổn lắm...">
              {(fieldProps) => <Input {...fieldProps} placeholder="Thử để trống rồi submit" />}
            </Field>
          </div>
        </Section>

        <Section title="Toast">
          <div className="flex flex-wrap gap-3">
            <Button variant="secondary" onClick={() => toast({ variant: "success", title: "Ngon lành!", description: "Đã lưu xong xuôi." })}>
              Trigger success
            </Button>
            <Button variant="danger" onClick={() => toast({ variant: "danger", title: "Toang rồi...", description: "Có gì đó vừa vỡ." })}>
              Trigger danger
            </Button>
            <Button variant="outline" onClick={() => toast({ variant: "info", title: "Nhân tiện...", description: "Đây là một thông báo." })}>
              Trigger info
            </Button>
          </div>
        </Section>

        <Section title="Dialog & Bottom Sheet">
          <div className="flex flex-wrap gap-3">
            <Dialog>
              <DialogTrigger asChild>
                <Button variant="outline">Mở Dialog</Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Chắc chưa đấy?</DialogTitle>
                  <DialogDescription>Hành động này không thể hoàn tác đâu nha.</DialogDescription>
                </DialogHeader>
                <DialogFooter>
                  <Button variant="ghost">Thôi, để sau</Button>
                  <Button variant="danger">Chốt luôn</Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>

            <BottomSheet>
              <BottomSheetTrigger asChild>
                <Button variant="outline">Mở Bottom Sheet</Button>
              </BottomSheetTrigger>
              <BottomSheetContent>
                <BottomSheetTitle>Bottom Sheet</BottomSheetTitle>
                <BottomSheetDescription>Kéo xuống để đóng — thử trên điện thoại xem.</BottomSheetDescription>
              </BottomSheetContent>
            </BottomSheet>
          </div>
        </Section>

        <Section title="Skeleton">
          <div className="flex max-w-sm flex-col gap-2">
            <Skeleton className="h-6 w-1/2" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-5/6" />
          </div>
        </Section>

        <Section title="Loading / Empty / Error / Success">
          <div className="grid gap-4 sm:grid-cols-2">
            <Card padding="none" className="overflow-hidden">
              <LoadingState />
            </Card>
            <Card padding="none" className="overflow-hidden">
              <EmptyState action={<Button size="sm">Tạo cái gì đó</Button>} />
            </Card>
            <Card padding="none" className="overflow-hidden">
              <ErrorState action={<Button size="sm" variant="outline">Thử lại xem</Button>} />
            </Card>
            <Card padding="none" className="overflow-hidden">
              <SuccessState />
            </Card>
          </div>
        </Section>

        <Section title="Profile (Prompt 05 — fixture data, not a real account)">
          <div className="flex flex-col gap-6">
            <ProfileHero identity={DEMO_IDENTITY} level={7} editable onEditAvatar={() => setEditOpen(true)} />
            <Button variant="outline" size="sm" className="w-fit" onClick={() => setEditOpen(true)}>
              Chỉnh sửa hồ sơ (Bottom Sheet trên mobile / Dialog trên desktop)
            </Button>
            <StatCards stats={{ points: 1240, level: 7, xp: 320, streakDays: 5, activeDays: 18, activitiesPlayed: 42 }} />
            <LevelCard progress={{ level: 7, xp: 320, xpToNext: 500 }} />
            <AchievementSection achievements={DEMO_ACHIEVEMENTS} />
            <AchievementSection achievements={[]} />
            <BadgeCollection badges={DEMO_BADGES} />
            <JourneyTimeline events={DEMO_JOURNEY} />
            <JourneyTimeline events={[]} />
            <CollectionShowcase items={DEMO_COLLECTION} />
            <ShareProfile profileUrl="https://vo-tri.example/u/bevotri" />
          </div>
        </Section>

        <Section title="Leaderboard (Prompt 06 — fixture data, not a real ranking)">
          <div className="flex flex-col gap-6">
            <LeaderboardHero myPosition={{ rank: 14, points: 2100, gapToNext: 340 }} />
            <TopThreePodium players={DEMO_PLAYERS} />
            <LeaderboardList players={DEMO_PLAYERS} />
            <LeaderboardList players={[]} />
            <div className="flex flex-wrap items-center gap-4 rounded-vt-lg border border-vt-border bg-vt-card p-4 text-sm text-vt-text-secondary">
              <span className="flex items-center gap-1.5">
                <RankChangeIcon change="up" /> Tăng hạng
              </span>
              <span className="flex items-center gap-1.5">
                <RankChangeIcon change="down" /> Giảm hạng
              </span>
              <span className="flex items-center gap-1.5">
                <RankChangeIcon change="same" /> Giữ nguyên
              </span>
              <span className="flex items-center gap-1.5">
                <RankChangeIcon change="new" /> Mới lên bảng
              </span>
            </div>
            <MyPositionCard myPosition={{ rank: 14, points: 2100, gapToNext: 340 }} />
          </div>
        </Section>

        <Section title="Gameplay Framework (Prompt 08 — fixture data, real flow at /play/[activityId])">
          <div className="flex flex-col gap-6">
            <Card padding="none" className="overflow-hidden p-6">
              <PreGameScreen activity={demoActivity} onStart={() => toast({ variant: "info", title: "Đây là bản demo — xem thật tại /play" })} />
            </Card>

            <Card padding="none" className="overflow-hidden p-4">
              <GameHeader
                title={demoActivity.name}
                paused={false}
                onPause={() => {}}
                onResume={() => {}}
                onExit={() => setGameExitOpen(true)}
                elapsedSeconds={47}
                score={60}
                progress={60}
              />
            </Card>
            <Button variant="outline" size="sm" className="w-fit" onClick={() => setGameExitOpen(true)}>
              Mở Exit Confirm Dialog
            </Button>

            <Card padding="none" className="overflow-hidden p-6">
              <ResultScreen
                activityName={demoActivity.name}
                outcome={{
                  points: demoActivity.reward,
                  xp: demoActivity.xp,
                  coins: 5,
                  questCompleted: { name: "Chơi 3 hoạt động trong ngày" },
                  leveledUp: { newLevel: 8 },
                  achievementUnlocked: { name: "Tân Binh Vô Tri", description: "Hoàn thành hoạt động đầu tiên", icon: Star, rarity: "rare" },
                }}
                onPlayAgain={() => {}}
                onExit={() => {}}
              />
            </Card>

            <Card padding="none" className="overflow-hidden">
              <GameNotReadyState activityName="Đấu Trường Vô Tri" />
            </Card>
          </div>
        </Section>

        <Section title="Social Foundation (Prompt 09 — fixture data, UI/architecture only)">
          <div className="flex flex-col gap-6">
            <div>
              <p className="mb-2 text-sm font-medium text-vt-text-secondary">Social Card — normal / featured / pinned / saved</p>
              <div className="grid gap-3 sm:grid-cols-2">
                <SocialCard state="normal">
                  <p className="text-sm text-vt-text-primary">Card bình thường.</p>
                </SocialCard>
                <SocialCard state="featured">
                  <p className="text-sm text-vt-text-primary">Card nổi bật — có badge + glow.</p>
                </SocialCard>
                <SocialCard state="pinned">
                  <p className="text-sm text-vt-text-primary">Card đã ghim — có icon pin.</p>
                </SocialCard>
                <SocialCard state="saved">
                  <p className="text-sm text-vt-text-primary">Card đã lưu — có icon bookmark.</p>
                </SocialCard>
              </div>
            </div>

            <div>
              <p className="mb-2 text-sm font-medium text-vt-text-secondary">Reaction Bar</p>
              <ReactionBar counts={DEMO_REACTION_COUNTS} activeReactionId={demoReaction} onReact={(id) => setDemoReaction(id === demoReaction ? undefined : id)} />
            </div>

            <div>
              <p className="mb-2 text-sm font-medium text-vt-text-secondary">Comment Experience</p>
              <div className="grid gap-4 sm:grid-cols-3">
                <Card padding="sm">
                  <CommentSection
                    status="ready"
                    comments={demoComments}
                    onSubmitComment={(text, replyingTo) => {
                      const newComment: CommentData = { id: crypto.randomUUID(), author: { name: "Bạn" }, text, createdAt: new Date() };
                      if (replyingTo) {
                        setDemoComments((prev) => prev.map((c) => (c.id === replyingTo.id ? { ...c, replies: [...(c.replies ?? []), newComment] } : c)));
                      } else {
                        setDemoComments((prev) => [...prev, newComment]);
                      }
                    }}
                  />
                </Card>
                <Card padding="sm">
                  <CommentSection status="loading" comments={[]} onSubmitComment={() => {}} />
                </Card>
                <Card padding="sm">
                  <CommentSection status="error" comments={[]} onSubmitComment={() => {}} onRetry={() => toast({ variant: "info", title: "Đang thử lại..." })} />
                </Card>
              </div>
            </div>

            <div>
              <p className="mb-2 text-sm font-medium text-vt-text-secondary">Share, User Preview & Follow</p>
              <div className="flex flex-col gap-3">
                <ShareSheet title="Chia sẻ hoạt động này" description="Rủ bạn bè cùng vô tri." url="https://vo-tri.example/explore/vong-quay-vo-tri" />
                <UserPreviewCard
                  user={{ name: "Bé Vô Tri", username: "bevotri", level: 7, badgeLabel: "Kỳ Cựu" }}
                  cta={<FollowButton following={demoFollowing} onToggle={() => setDemoFollowing((v) => !v)} />}
                />
              </div>
            </div>

            <div>
              <p className="mb-2 text-sm font-medium text-vt-text-secondary">Activity Feed — with data / honest empty</p>
              <div className="flex flex-col gap-4">
                <ActivityFeed items={DEMO_FEED} />
                <ActivityFeed items={[]} />
              </div>
            </div>

            <div>
              <p className="mb-2 text-sm font-medium text-vt-text-secondary">Notification Center — with data / honest empty</p>
              <div className="grid gap-4 sm:grid-cols-2">
                <Card padding="sm">
                  <NotificationCenter items={DEMO_NOTIFICATIONS} />
                </Card>
                <Card padding="sm">
                  <NotificationCenter items={[]} />
                </Card>
              </div>
            </div>
          </div>
        </Section>
      </div>
      <Toaster />
      <EditProfileSheet
        open={editOpen}
        onOpenChange={setEditOpen}
        initial={{ displayName: DEMO_IDENTITY.displayName, tagline: DEMO_IDENTITY.tagline }}
      />
      <ExitConfirmDialog open={gameExitOpen} onOpenChange={setGameExitOpen} onConfirmExit={() => setGameExitOpen(false)} />
    </div>
  );
}
