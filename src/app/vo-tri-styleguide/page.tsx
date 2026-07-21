"use client";

import { Crown, Medal, Palette, Shirt, Sparkles as SparklesIcon, Star, Target, Trophy } from "lucide-react";
import { useState } from "react";
import { voTriFontVariables } from "@/vo-tri/fonts";
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
      </div>
      <Toaster />
      <EditProfileSheet
        open={editOpen}
        onOpenChange={setEditOpen}
        initial={{ displayName: DEMO_IDENTITY.displayName, tagline: DEMO_IDENTITY.tagline }}
      />
    </div>
  );
}
