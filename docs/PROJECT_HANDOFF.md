# VÔ TRI — Project Handoff Document

> **Mục đích tài liệu này:** đây là tài liệu bàn giao chính thức của dự án
> VÔ TRI. Nó được viết để một phiên Claude (hoặc bất kỳ kỹ sư nào) hoàn
> toàn mới — không có bất kỳ lịch sử hội thoại nào trước đó — có thể đọc
> một lần và hiểu đủ để tiếp tục phát triển dự án ngay, đúng kiến trúc,
> đúng triết lý sản phẩm, không cần hỏi lại những gì đã quyết định.
>
> Tài liệu này mô tả **trạng thái thực tế của codebase tại thời điểm viết**
> (đã được xác minh trực tiếp bằng cách đọc file, chạy `tsc`/`eslint`/
> `vitest`/`next build`, không suy diễn từ lịch sử chat). Nếu có mâu thuẫn
> giữa tài liệu này và code thật, **code luôn là nguồn sự thật** — hãy cập
> nhật lại tài liệu, không phải ngược lại.
>
> Các tài liệu liên quan khác trong repo:
> - [`CLAUDE.md`](../CLAUDE.md) — quy tắc bắt buộc + nhật ký quyết định
>   chi tiết theo từng prompt (nguồn chi tiết nhất, nhưng dài và theo thứ
>   tự thời gian; tài liệu này là bản tổng hợp theo chủ đề).
> - [`docs/VO_TRI_DESIGN_BIBLE.md`](./VO_TRI_DESIGN_BIBLE.md) — đặc tả đầy
>   đủ Design System (màu, chữ, motion, từng component).
> - [`docs/VO_TRI_ARCHITECTURE.md`](./VO_TRI_ARCHITECTURE.md) — bản đồ
>   kiến trúc, component inventory, routing table.
> - [`docs/VO_TRI_GAMEPLAY_ENGINE.md`](./VO_TRI_GAMEPLAY_ENGINE.md) —
>   lifecycle/state-flow chi tiết của Gameplay Engine + hướng dẫn thêm
>   Activity mới.
> - [`README.md`](../README.md) — hướng dẫn chạy dự án, verify commands.

---

## 1. Tổng quan dự án

### Mục tiêu sản phẩm

VÔ TRI là một sản phẩm **giải trí/cộng đồng tiếng Việt** — không phải một
dashboard doanh nghiệp, không phải landing page bán hàng. Người dùng mở
app để thư giãn, cười, làm vài trò vô nghĩa nhưng vui, sưu tập thành tích,
và gặp gỡ người thú vị. Giọng điệu bắt buộc: **hài hước, thông minh, châm
biếm nhẹ** — không bao giờ độc hại, không bao giờ chế giễu người dùng,
không bao giờ là "AI SaaS template" chung chung.

Tagline chính thức: **"Ở đây, vô tri là một kỹ năng."** — biến từ "vô tri"
(vốn là một từ lóng tiếng Việt mang nghĩa "ngáo, không suy nghĩ") thành
một *kỹ năng đáng tự hào*, gắn liền tự nhiên với hệ thống XP/leveling của
sản phẩm, thay vì chỉ là một câu đùa hoặc một tuyên ngôn về tâm trạng.

### Bối cảnh lịch sử quan trọng

Repo này **trước đây** chứa một sản phẩm hoàn toàn khác tên **LoveBox**
(app tặng quà). Theo yêu cầu rõ ràng của chủ dự án, toàn bộ code ứng
dụng, backend và tài liệu của LoveBox đã bị xóa (có thể khôi phục qua
git history nếu cần — xem commit `7f72b2f "Replace LoveBox with VÔ TRI"`).
**Repo hiện tại chỉ là VÔ TRI.** Không có gì trong codebase hiện tại nên
tham chiếu hay hồi sinh LoveBox. Nếu bạn thấy các milestone cũ (Milestone
9–14, "Admin & Moderation", "Analytics & Monitoring"...) trong `git log`,
đó là lịch sử LoveBox — **không áp dụng cho VÔ TRI**, chỉ còn giá trị
tham khảo lịch sử.

Ngoài ra, thư mục `archive/` ở root chứa 3 file HTML tĩnh
(`index.html`, `nduy.html`, `webd.html`) — đây là **trang portfolio cá
nhân của chủ dự án** (Nguyễn Đức Duy), có từ trước cả LoveBox lẫn VÔ TRI.
Nó đã được loại trừ khỏi build (`tsconfig.json` exclude, `eslint.config.mjs`
ignore) và không nằm trong `public/` nên Next.js không bao giờ serve nó.
**Đây không phải bug, đừng động vào.**

### Triết lý thiết kế

- **Dark-mode-first, không phải toggle.** Nền tím-nâu ấm sâu
  (`--vt-bg: #120E17`), không bao giờ đen tuyền, không bao giờ là màu
  xám-xanh lạnh lẽo kiểu "SaaS dashboard".
- **Hai màu thương hiệu:** Primary = hồng san hô "Riot" (`--vt-primary`,
  `#FF4D8D`), Secondary = xanh chanh acid "Zap" (`--vt-secondary`,
  `#C8FF4D`). Đây là lựa chọn **có chủ đích** để khác với tổ hợp
  tím/fuchsia mà LoveBox từng dùng — tổ hợp đó là "chữ ký" của mọi app
  "AI SaaS" chung chung mà brand này né tránh.
- **VIP violet (`--vt-vip`) chỉ dành riêng cho khoảnh khắc VIP/premium**
  — dùng ở nơi khác sẽ làm loãng giá trị khan hiếm của nó (ngoại lệ duy
  nhất, có chủ đích: badge rarity `"special"` cũng dùng glow VIP vì
  "special" đúng nghĩa là một tier premium).
- **Motion "tinh nghịch hơn SaaS thông thường"** — spring overshoot rõ
  rệt, có hẳn một hiệu ứng `wiggle` chữ ký — nhưng **mọi animation chỉ
  chạm `transform`/`opacity`(/`box-shadow` cho glow)**, không bao giờ
  đụng layout property, nên không thể gây CLS.
- **Không bao giờ bịa dữ liệu.** Không có online-user-count giả, không
  có activity feed giả, không có social proof giả. Nơi nào chưa có dữ
  liệu backend thật, hiển thị **empty/logged-out state trung thực** thay
  vì một con số placeholder trông như thật.
- **Không microcopy chung chung** ("Submit", "Loading", "Success", "No
  Data"...). Toàn bộ copy UI đi qua `src/vo-tri/copy/microcopy.ts` để
  giọng điệu thương hiệu không bị trôi dạt qua từng màn hình.

### Kiến trúc tổng thể

- **Next.js 15 (App Router)** + **TypeScript strict** + **Tailwind CSS
  3** + **React 19**.
- Toàn bộ code đặc thù VÔ TRI nằm dưới `src/vo-tri/` (design tokens,
  motion, fonts, copy, các domain UI) và được `src/app/*` (routes/layout)
  tiêu thụ.
- **Chưa có backend** (không DB, không auth, không API route thật). Mọi
  thứ đã ship tính đến nay là **frontend design system + shell + toàn bộ
  trang chính**, được xây với đầy đủ prop shape/type thật để sau này chỉ
  cần "nối dữ liệu thật vào", không phải xây lại UI.
- **Quy tắc chi phí:** chỉ dùng free/low tier khi có hạ tầng thật (Vercel,
  Postgres free-tier, object storage free-tier). Không trả phí hạ tầng
  trước khi có người dùng thật.

---

## 2. Kiến trúc thư mục

```
src/
├── app/                      Next.js App Router — routes/layout thật
│   ├── layout.tsx            Root layout: fonts, metadata, viewport, AppShell
│   ├── page.tsx               Home ("/")
│   ├── globals.css            Reset + prefers-reduced-motion global collapse
│   ├── template.tsx           Page-transition wrapper (vt-page-enter)
│   ├── loading.tsx             Global loading fallback (Next file convention)
│   ├── error.tsx               Per-route error boundary (Next file convention)
│   ├── global-error.tsx        Root-layout-level error fallback (xem §6)
│   ├── not-found.tsx           404 trên thương hiệu
│   ├── icon.tsx / apple-icon.tsx / opengraph-image.tsx   next/og ImageResponse, tự vẽ theo Mascot
│   ├── icon192/route.tsx / icon512/route.tsx             Route handler cho icon PWA cỡ lớn (force-static)
│   ├── manifest.ts             PWA install manifest
│   ├── robots.ts / sitemap.ts   SEO file convention
│   ├── explore/page.tsx
│   ├── leaderboard/page.tsx
│   ├── profile/page.tsx
│   ├── play/[activityId]/{page.tsx,PlayClient.tsx}
│   └── vo-tri-styleguide/{layout.tsx,page.tsx}   Nội bộ, noindex, "sổ tay sống" cho mọi primitive
│
├── vo-tri/                   Toàn bộ code đặc thù sản phẩm, theo domain
│   ├── design-system/         tokens.css + motion.css — nguồn sự thật duy nhất cho brand
│   ├── fonts.ts                next/font (Unbounded + Be Vietnam Pro), self-hosted
│   ├── copy/                  microcopy.ts (từ điển copy) + daily-messages.ts (thông điệp theo ngày)
│   ├── ui/                    Design system primitives dùng chung mọi domain (barrel: index.ts)
│   ├── shell/                 App Shell: AppShell, Header, BottomNav, Sidebar, Container...
│   ├── lib/                   Helper thuần túy: cn, date, time, sound, analytics, site, hooks
│   ├── home/                  Component riêng cho Home
│   ├── explore/                Component + catalog riêng cho Explore
│   ├── profile/                Component + types riêng cho Profile
│   ├── leaderboard/             Component + types riêng cho Leaderboard
│   ├── game/                   Gameplay Engine (state machine, scoring, timer, result pipeline)
│   ├── retention/               Quest/Streak/Milestone/Claim
│   └── social/                  Reaction/Comment/Share/Follow/Feed/Notification
│
tests/e2e/                    Playwright E2E — golden path cho mọi route thật
docs/                          Tài liệu chính thức của dự án
```

### Nguyên tắc tổ chức mã nguồn (bắt buộc tuân thủ)

1. **Generic + tái sử dụng across domain → `ui/` hoặc `lib/`.** Nếu 2 domain
   trở lên cần cùng một component, nó thuộc về `ui/`, không phải một
   trong hai domain. Ví dụ điển hình: `RewardReveal`/`LevelUpBanner`/
   `AchievementUnlockCard` ban đầu sống trong `game/`, được refactor sang
   `ui/` khi `retention/ClaimRewardDialog` cũng cần dùng chung ngôn ngữ
   celebration đó. `ChipGroup` cũng vậy — được tổng quát hoá từ
   `CategoryChips` (Explore) để `ScopeFilter` (Leaderboard) dùng lại.
2. **Đặc thù một domain → thư mục domain đó.** Không kéo logic riêng của
   Explore sang Profile chỉ vì "tiện".
3. **Hằng số thương hiệu → `design-system/` + `tailwind.config.ts`.**
   Không hardcode màu/spacing trực tiếp trong component.
4. **Mỗi domain có một barrel `index.ts`** — import từ đó, không import
   trực tiếp từng file nội bộ, để call site không cần biết cấu trúc file
   bên trong domain.
5. **Một component "test/fixture-only" luôn được đánh dấu rõ trong
   comment** khi dùng dữ liệu fixture trên `/vo-tri-styleguide` — không
   bao giờ để dữ liệu giả trông như dữ liệu thật.
6. **Refactor trước, tính năng sau, khi phát hiện trùng lặp.** Xuyên suốt
   lịch sử dự án, mỗi khi audit phát hiện code trùng (ví dụ: 4 bản sao
   logic toast check-in, 3 bản sao `timeAgo()`, 6 bản sao avatar-fallback
   markup), việc đầu tiên là hợp nhất **trước khi** viết tính năng mới,
   và luôn re-verify (`next build` + E2E) rằng hành vi không đổi sau khi
   refactor.

---

## 3. Những gì đã hoàn thành (theo giai đoạn)

> Đánh số "Prompt N" khớp với nhật ký quyết định trong `CLAUDE.md` — dùng
> để tra cứu chi tiết/lý do nếu cần, không phải thứ tự bắt buộc phải đọc.

### Prompt 01 — Design Bible & nền tảng thương hiệu
Thiết lập toàn bộ token màu/spacing/radius/shadow/blur/gradient
(`tokens.css`), hệ thống typography (Unbounded + Be Vietnam Pro,
self-hosted, subset `vietnamese`), hệ thống motion (`motion.css`), và bộ
primitive đầu tiên (Button, Card, Input, Badge, Toast, Dialog,
BottomSheet, các global state). Mascot được xây như một khối hình học
placeholder với 7 mood cố định (idle/happy/laughing/thinking/sleepy/
mindblown/celebrating) — chờ minh hoạ thật thay thế sau này mà không đổi
call site. `/vo-tri-styleguide` ra đời làm nơi chứng minh trực quan cho
mọi token/primitive.

**Kết quả:** một design system hoàn chỉnh, độc lập, không phụ thuộc bất
kỳ trang nào — mọi trang sau này chỉ tiêu thụ nó.

### Prompt 02 — App Shell
`AppShell` (`src/vo-tri/shell/`) bọc mọi route một lần duy nhất từ
`src/app/layout.tsx`: Background (gradient CSS-only, không canvas),
Header cuộn-nhạy có throttle qua `requestAnimationFrame`, BottomNav dạng
pill nổi với FAB check-in ở giữa (mobile), Sidebar bên trái (desktop,
`md:`+) dùng chung `nav-items.ts`. Bốn preset Dialog (Confirm/Error/
Success/Reward) cho bốn khoảnh khắc khác tính cách. `Toaster` mount một
lần trong `AppShell`.

**Kết quả:** một khung sườn điều hướng nhất quán cho mọi trang, không
lặp lại logic ở từng route.

### Prompt 03 — Home
Tagline chính thức ra đời ở đây. `daily-messages.ts` seed theo
day-of-year (không random mỗi lần render) để SSR/CSR ổn định và thật sự
đọc như "thông điệp của hôm nay". `HeroScene` kết hợp scroll-shrink và
pointer-parallax bằng hai hiệu ứng `rAF` độc lập trên hai ref lồng nhau
để không tranh chấp transform. Vì chưa có hệ thống session, Home luôn đi
theo nhánh logged-out (không có `TodayCard`) — nhưng mọi component giàu
dữ liệu (`TodayCard`, `ActivitySpotlight`, `CommunityPulse`) đều được xây
đầy đủ theo prop shape thật, không phải stub.

**Kết quả:** trang chủ hoàn chỉnh về giao diện, sẵn sàng nhận dữ liệu
thật ngay khi có session.

### Prompt 04 — Explore
`src/vo-tri/explore/`. Catalog hoạt động thật (`activities.ts`) — hiện có
**9 activity thật** (`Activity[]`, đầy đủ reward/XP/difficulty/thời
lượng/giới hạn): Điểm Danh Hôm Nay, Vòng Quay Vô Tri, Rút Thẻ Số Phận,
Thử Thách 60 Giây, Đố Vui Vô Tri, Máy Chế Meme, Chuyện Ngẫu Nhiên, Đoán
Cảm Xúc Mascot, Gõ Nhanh Vô Tri — cộng thêm **3 "Coming Soon"**
(`ComingSoonActivity[]`, một type nhẹ hơn, chỉ id/name/description/icon,
**không có** reward/xp/difficulty vì chưa có gameplay thật): Đấu Trường
Vô Tri, Nuôi Thú Vô Tri, Chợ Đồ Vô Tri — đây là **nội dung sản phẩm
thật**, không phải dữ liệu giả CLAUDE.md cấm (rule đó nhắm vào tín hiệu
xã hội/lượt dùng giả, không phải nội dung game). Featured Activity +
Daily Picks tái dùng cơ chế day-seed của Home trên chính catalog thật
này. Category chip là nút thường trong tab order tự nhiên, không phải
ARIA `tablist` tự chế — hành vi Tab/Enter đúng chuẩn có sẵn, được verify
bằng Playwright keyboard test thật.

**Kết quả:** trang khám phá hoạt động đầy đủ với search/filter/detail
sheet, hoàn toàn client-side trên catalog tĩnh (chưa cần backend).

### Prompt 05 — Profile
`src/vo-tri/profile/`. Vì Profile vốn là dữ liệu cá nhân (avatar/level/
thành tích/timeline đều thuộc về một người dùng cụ thể), không có phiên
bản "xem thử khi chưa đăng nhập" trung thực nào khả thi — hiển thị bất
kỳ số liệu cụ thể nào mà không có người dùng thật sẽ chính là dữ liệu
giả CLAUDE.md cấm. Giải pháp: route thật `/profile` chỉ hiển thị trạng
thái logged-out trung thực (mascot + CTA "Đăng nhập"). Mọi component
giàu (ProfileHero, LevelCard, AchievementSection, BadgeCollection,
JourneyTimeline, CollectionShowcase, EditProfileSheet, ShareProfile) được
xây đầy đủ và trình diễn bằng fixture data rõ ràng trên
`/vo-tri-styleguide`. Rank ladder (`ranks.ts`): level → "Tân Binh" (≥1) /
"Kỳ Cựu" (≥5) / "Cao Thủ" (≥10) / "Huyền Thoại Vô Tri" (≥20).

**Kết quả:** toàn bộ UI hồ sơ người dùng sẵn sàng, chỉ chờ session thật.

### Prompt 06 — Leaderboard
`src/vo-tri/leaderboard/`. `CategoryChips` của Explore được tổng quát
hoá thành `ChipGroup` (`ui/`) để `ScopeFilter` dùng lại. Cùng nguyên tắc
trung thực như Profile, nhưng khác ở chỗ: một bảng xếp hạng **có thể
trung thực là rỗng** (không giống Profile) — nên `/leaderboard` hiển thị
trạng thái "chưa ai chơi" thật, trong khi `TopThreePodium`/
`LeaderboardList`/`MyPositionCard`/`RankChangeIcon` được xây và trình
diễn đầy đủ bằng fixture trên styleguide. `LeaderboardRow` có chiều cao
cố định (`ROW_HEIGHT_PX`, đã export) — chuẩn bị sẵn cho virtualization
(react-window) sau này khi có dataset thật lớn, chưa thêm dependency đó
vì chưa cần.

**Kết quả:** kiến trúc bảng xếp hạng đầy đủ 5 scope filter (Toàn cầu/Bạn
bè/Tuần/Tháng/Mùa giải) — tất cả tương tác thật, chỉ có backend đứng sau
là chưa có.

### Prompt 08 — Gameplay Framework (nền tảng ban đầu)
`src/vo-tri/game/`. State machine đầu tiên: pre-game → playing ⇄ paused
→ result, điều khiển qua render-prop (`children: (ctx) => ReactNode`) —
không có gameplay cụ thể nào được implement ở bước này, đúng phạm vi
được giao. Route thật `/play/[activityId]` dùng `generateStaticParams`
trên catalog Explore thật.

### Prompt 09 — Social Foundation
`src/vo-tri/social/`. Hệ thống reaction có 5 loại **có brand riêng**
(Thích/Cười xỉu/Đỉnh/Bất ngờ/**Vô Tri** — reaction chữ ký, icon `Brain`),
cố ý không sao chép bộ Like/Haha/Wow/Sad/Angry kiểu Facebook. `ShareSheet`
là nút copy-link **thật sự hoạt động** (Clipboard API) — nút mạng xã hội
hiển thị nhưng disabled (thật thà "chưa xây", không phải fake
integration). `FollowButton` fully controlled, không có logic thật, đúng
"không cần logic, chỉ chuẩn bị giao diện". Mọi component trình diễn bằng
fixture trên styleguide.

### Prompt 10 — Platform Foundation (audit/hardening, không có màn hình mới)
Đợt audit toàn diện đầu tiên: hợp nhất 4 bản sao logic check-in toast
(`lib/check-in.ts`), 3 bản sao `timeAgo()` (`lib/time.ts`), 6 bản sao
avatar-fallback markup (`ui/Avatar.tsx`); xây các global state còn thiếu
(Offline/Retry/Permission/Maintenance qua `StatePanel` preset); thêm
`Tooltip`/`ContextMenu` (Radix-based); phát hiện và sửa bug điều hướng
thật (một rule `scroll-behavior: smooth` toàn cục vô tình làm mượt luôn
cả animation scroll-to-top của Next khi chuyển route — sửa bằng
`SmoothAnchorLink` chỉ mượt đúng lúc click).

### Các đợt audit tự động tiếp theo (không đánh số prompt)
- **SEO/production-readiness:** phát hiện `/vo-tri-styleguide` được tài
  liệu hoá là "noindex" từ Prompt 01 nhưng **chưa từng thực sự áp dụng**
  (page là Client Component, không export được `metadata`) — sửa bằng
  `layout.tsx` riêng (Server Component) + `robots.ts`. Thêm
  `icon.tsx`/`apple-icon.tsx` (vẽ lại chính ngôn ngữ gradient+mắt của
  Mascot), `opengraph-image.tsx`, `sitemap.ts`.
- **A11y + dead-CTA:** thêm skip-to-content link (`SkipLink`) — trước đó
  hoàn toàn không có (vi phạm WCAG 2.4.1). Phát hiện nút "Đăng nhập" ở cả
  Header lẫn Profile **không có `onClick` gì cả** — sửa bằng
  `LoginButton` dùng chung, bắn toast "chưa xây auth thật" trung thực.
- **CI hoàn toàn hỏng:** `.github/workflows/ci.yml` vẫn 100% là di sản
  LoveBox — dựng Postgres thật, chạy `prisma migrate deploy` (Prisma đã
  bị xoá cùng LoveBox), gọi `npm run test`/`test:integration` (không tồn
  tại trong `package.json`). CI đã fail trên **mọi push** kể từ khi xoá
  LoveBox mà không ai biết. Viết lại hoàn toàn: install → lint →
  typecheck → unit test → build → Playwright install → E2E. Đồng thời
  dựng bộ Playwright E2E thật đầu tiên (dependency đã nằm sẵn trong
  `package.json` từ thời LoveBox nhưng chưa từng có config/test nào).
- **PWA installability:** thêm `manifest.ts` + `icon192`/`icon512` route
  handler (force-static) + `viewport` export với `theme-color` thật.

### Prompt 11 — Retention System
`src/vo-tri/retention/`. Trước khi xây, đã audit và nhận ra `game/` đã
có sẵn `RewardReveal`/`LevelUpBanner`/`AchievementUnlockCard` (celebration
primitive tổng quát) và Profile đã có `LevelCard`/`JourneyTimeline`/
`StatCards.streakDays` — nên việc thật sự cần làm là **lấp khoảng trống
giữa chúng** (Daily Quest, Weekly Goal, Streak tracker, Milestone ladder,
luồng claim/celebration), không phải xây lại. Refactor trước:
`RewardReveal`/`LevelUpBanner`/`AchievementUnlockCard` chuyển từ `game/`
sang `ui/`. Milestone chỉ theo dõi `streak`/`activitiesPlayed`, cố ý
**không** có milestone theo level vì `ranks.ts` đã phủ đúng vai trò đó.
Home có section "Nhiệm vụ hôm nay" **luôn hiển thị** (catalog quest an
toàn để show cho mọi người, giống Daily Picks của Explore) nhưng mỗi
`QuestCard` hiển thị dòng "Đăng nhập để theo dõi tiến độ" trung thực thay
vì progress bar giả — vì hiện tại **luôn** chưa đăng nhập.

### Prompt 12 — Gameplay Engine
`src/vo-tri/game/`. Biến framework Prompt 08 (chỉ có state machine) thành
một Engine thật: Timer Engine (đếm lên mặc định; khai báo
`rules.timeLimitSeconds` chuyển cùng một đồng hồ thành đếm ngược, tự bắn
kết quả `"timeout"` khi về 0), Scoring + Combo
(`DEFAULT_SCORING = basePoints × hệ số độ khó × hệ số combo`), auto-win
khi đạt `rules.targetScore`, Countdown overlay tuỳ chọn, Statistics
Pipeline (`SessionStats`, chỉ client-side, honest — reset khi reload),
analytics no-op hook. `GameOutcome` có discriminant `kind`
(`win`/`lose`/`complete`/`timeout`/`abandoned`) — `ResultScreen` render
cả 5 qua **cùng một** composition, không phải 5 màn hình khác nhau. Mọi
field trong `ActivityRules` mặc định **tắt** — Activity thật duy nhất
hiện có (`/play/[activityId]`) chỉ bật `comboEnabled: true`, hành vi cũ
giữ nguyên byte-for-byte sau khi viết lại engine (verify bằng E2E không
đổi).

### Đợt bổ sung gần nhất (round hiện tại, các commit cuối `git log`)
- **Testing layer hoàn chỉnh:** dựng **Vitest** cho logic thuần (trước
  đó dự án chỉ có E2E, không có unit test nào) — 7 file test, 30 test,
  nối vào CI giữa bước Typecheck và Build.
- **Accessibility:** `StreakTracker`/`MilestoneTrack` trước đó chỉ
  truyền trạng thái qua màu/icon — thêm `aria-hidden` + text `sr-only`.
  `ShareSheet` (nút mạng xã hội disabled chỉ có `title`, không có
  accessible name) và `FollowButton` (toggle button thiếu
  `aria-pressed`) cũng được vá.
- **`global-error.tsx`:** `error.tsx` chỉ bắt lỗi bên dưới root layout —
  một crash trong chính `layout.tsx` sẽ rơi vào màn hình lỗi mặc định
  xấu xí của Next. Đã thêm fallback tối giản riêng, không phụ thuộc
  `AppShell`/provider.
- **`ActivityFeed`** (xây từ Prompt 09 nhưng chưa từng gắn route thật) —
  nay hiển thị ở Home ("Cộng đồng đang làm gì") với empty-state trung
  thực.
- **PWA:** `manifest.ts` + `icon192`/`icon512` (route handler
  `force-static`) + `viewport` export (`theme-color` = `#120E17`).
- **Verify:** console sạch trên cả 6 route thật (kiểm bằng Playwright
  thật, không chỉ giả định), bundle size hợp lý (~167–184 kB First Load
  JS mỗi route thật).

---

## 4. Design System

Tài liệu đầy đủ: [`docs/VO_TRI_DESIGN_BIBLE.md`](./VO_TRI_DESIGN_BIBLE.md).
Tóm tắt các phần bắt buộc phải biết:

### Tokens (`src/vo-tri/design-system/tokens.css`)
Namespace `--vt-*` toàn bộ. Giá trị màu lưu dạng "R G B" (không có dấu
phẩy, không `rgb()`) để Tailwind áp dụng opacity ở cấp utility-class
(`bg-vt-primary/40`).

| Token | Giá trị | Vai trò |
|---|---|---|
| `--vt-bg` | `#120E17` | Nền chính (tím-nâu ấm, không đen tuyền) |
| `--vt-surface` | `#1A1420` | Nền cấp 2 |
| `--vt-card` | `#221A2A` | Nền card |
| `--vt-text-primary` | `#F6F1F8` | Chữ sáng — **chỉ** dùng trên nền trung tính (bg/surface/card) |
| `--vt-on-accent` | = `--vt-bg` | Chữ/icon trên **bất kỳ** nền accent đặc nào |
| `--vt-primary` | `#FF4D8D` | "Riot" — CTA, accent thương hiệu |
| `--vt-secondary` | `#C8FF4D` | "Zap" — highlight, XP, năng lượng |
| `--vt-vip` | `#C9A6FF` | **Chỉ** dùng cho VIP/premium (và badge rarity `"special"`) |
| `--vt-reward` | `#FFD447` | Điểm, coin, phần thưởng đã nhận |
| `--vt-xp` | = `--vt-secondary` | Cố ý alias — lên cấp CHÍNH LÀ màu năng lượng thương hiệu |

**Quy tắc contrast (đã verify bằng script luminance thật, không nhìn bằng
mắt):** chữ sáng (`--vt-text-primary`) chỉ được đặt trên nền trung tính.
Bất kỳ thứ gì ngồi trên một nền accent đặc (primary/secondary/success/
warning/danger/info/reward/vip) phải dùng `--vt-on-accent` — vì tất cả
các accent đó **fail AA** với chữ sáng.

Radius: `sm` 8px (chip/badge) → `md` 14px (input/button) → `lg` 20px
(card) → `xl` 28px (modal/sheet) → `full` 999px (pill/avatar).

### Typography (`src/vo-tri/fonts.ts`)
- **Display:** Unbounded (`--vt-font-display`) — chữ hình học đậm, có cá
  tính. Cố ý **không** dùng họ Inter/Poppins/Montserrat (mặc định của
  mọi "AI SaaS" template) và không dùng font bo tròn kiểu Baloo (đọc như
  app trẻ em).
- **Body:** Be Vietnam Pro (`--vt-font-body`) — thiết kế riêng cho dấu
  tiếng Việt, không phải font Latin gắn thêm subset tiếng Việt.
- Cả hai self-hosted qua `next/font/google`, subset `["vietnamese",
  "latin"]`, `display: "swap"`.

### Motion (`src/vo-tri/design-system/motion.css`)
5 duration (`instant` 100ms → `lazy` 700ms), 4 easing (`out`, `in-out`,
`spring`, và `mischief` — overshoot cố tình lố hơn `spring`, dành riêng
cho khoảnh khắc "tinh nghịch": wiggle, bounce-in, celebrate). Các class
animation sẵn dùng: `vt-fade-up`, `vt-pop-in`, `vt-scale-in`,
`vt-bounce-in`, `vt-wiggle`, `vt-shake`, `vt-float`, `vt-spin-slow`,
`vt-pulse-glow`, `vt-skeleton` (shimmer), `vt-celebrate`, `vt-page-enter`,
và class tiện ích `vt-interactive` (hover lift + press squash dùng chung
cho mọi primitive tương tác).

**Quy tắc bất biến:** mọi keyframe chỉ animate `transform`/`opacity`
(/`box-shadow` cho glow) — không bao giờ width/height/top/left/
background-position — để không component nào trong hệ thống motion có
thể gây CLS. `prefers-reduced-motion: reduce` được collapse toàn cục
**một lần** ở đầu `src/app/globals.css` bằng selector `*, *::before,
*::after` — **không thêm nhánh reduced-motion riêng cho từng component**,
nó đã tự động áp dụng cho mọi `.vt-*` class.

### Components (`src/vo-tri/ui/`)
Barrel export duy nhất: `src/vo-tri/ui/index.ts` — import từ đây, không
import trực tiếp file nội bộ. Danh sách đầy đủ hiện có: `AchievementUnlockCard`,
`Avatar`, `Background`, `Badge`, `BottomSheet` (+ 5 sub-export, dùng
`vaul`), `Button`, `Card` (+ 5 sub-export), `ChipGroup`, `ContextMenu`
(+ 10 sub-export, Radix-based), `Dialog` (+ 6 sub-export, Radix-based) và
4 preset (`ConfirmDialog`/`ErrorDialog`/`RewardDialog`/`SuccessDialog`),
`StatePanel` (7 preset: `EmptyState`/`ErrorState`/`MaintenanceState`/
`OfflineState`/`PermissionState`/`RetryState`/`SuccessState`), `Field`/
`Input`/`Textarea`, `LevelUpBanner`, `LoadingState`, `Mascot`,
`ProgressBar`, `RewardReveal`, `Skeleton`, `SmoothAnchorLink`, hệ thống
`toast` (`toast()`, `Toaster`, `useToasts`, Radix-based), `Tooltip`
(+ 3 sub-export, Radix-based).

### Quy tắc sử dụng bắt buộc
1. Không hardcode hex màu trong component — luôn qua class Tailwind
   `bg-vt-*`/`text-vt-*` (đọc từ token).
2. Chữ sáng chỉ trên nền trung tính; `--vt-on-accent` trên mọi nền accent
   đặc — không có ngoại lệ (trừ badge rarity `"special"` dùng VIP glow,
   đã ghi nhận là ngoại lệ duy nhất, có chủ đích).
3. Copy UI qua `microcopy.ts` — không viết chuỗi tiếng Anh/chung chung
   trực tiếp trong JSX.
4. Mọi transition/animation dùng token `duration-vt-*`/`ease-vt-*`
   (Tailwind extension) hoặc class `.vt-*` có sẵn — không dùng
   `duration-150`/`ease-out` mặc định của Tailwind (đã có một đợt audit
   riêng sửa 8 file phạm lỗi này).

---

## 5. Các hệ thống đã xây dựng

### App Shell (`src/vo-tri/shell/`)
`AppShell` bọc mọi route từ `layout.tsx`. Chứa: `Background` (gradient
trôi CSS-only), `Header` (scroll-aware, throttle qua rAF, chứa
`NotificationBell` + `LoginButton`), `BottomNav` (pill nổi, FAB check-in
giữa, mobile), `Sidebar` (rail trái, `md:`+, dùng chung `nav-items.ts`
với BottomNav), `Container` (2 size: `app` max-w-6xl, `prose` max-w-2xl —
nơi duy nhất quyết định độ rộng nội dung), `SkipLink` (WCAG 2.4.1),
`OfflineWatcher` (hook `useOnlineStatus` thật, bắn toast khi online/
offline thật), `TooltipProvider`.

### Home (`src/app/page.tsx` + `src/vo-tri/home/`)
Hero với tagline + daily message (seed theo ngày), QuickAccess (grid
lối tắt), section "Nhiệm vụ hôm nay" (`DailyQuestPreview`, luôn hiện),
"Đang diễn ra" (`ActivitySpotlight`, empty trung thực), `CommunityPulse`
(social-proof trung thực), "Cộng đồng đang làm gì" (`ActivityFeed`, empty
trung thực). `TodayCard` tồn tại đầy đủ nhưng chỉ render khi
`currentUser` thật (hiện luôn `undefined`).

### Explore (`src/app/explore/page.tsx` + `src/vo-tri/explore/`)
Catalog 9 activity thật + 3 "Coming Soon" (`activities.ts`). Hero, Featured Activity +
Daily Picks (day-seeded), category chip filter, search client-side,
`ActivityDetailSheet` (BottomSheet mobile/Dialog desktop qua
`useMediaQuery`), `ComingSoonStrip`/`ComingSoonCard` (không bao giờ hứa
ngày ra mắt giả), `ContinuePlaying` (render rỗng khi `items=[]`, chưa có
play-history backend).

### Profile (`src/app/profile/page.tsx` + `src/vo-tri/profile/`)
Route thật chỉ hiển thị trạng thái logged-out (mascot + CTA "Đăng
nhập"). Mọi component giàu (`ProfileHero`, `ProfileAvatar`, `LevelCard`,
`StatCards`, `AchievementSection`, `BadgeCollection`, `JourneyTimeline`,
`CollectionShowcase`, `EditProfileSheet`, `ShareProfile`) được xây đầy đủ
và trình diễn bằng fixture trên `/vo-tri-styleguide`. `EditProfileSheet`
chọn Dialog (desktop) hay BottomSheet (mobile) từ một `useMediaQuery`
hook duy nhất. `ShareProfile` là wrapper 3 dòng quanh `social/ShareSheet`
dùng chung.

### Leaderboard (`src/app/leaderboard/page.tsx` + `src/vo-tri/leaderboard/`)
5 scope filter (Toàn cầu/Bạn bè/Tuần/Tháng/Mùa giải) — kiến trúc thật,
mọi scope hiện resolve về cùng một trạng thái rỗng (chưa có backend
đứng sau). `TopThreePodium`, `LeaderboardList`/`LeaderboardRow` (chiều
cao cố định `ROW_HEIGHT_PX`, chuẩn bị cho virtualization), `MyPositionCard`
(`position: fixed`, không phải `sticky` — bug thật đã được sửa vì
`sticky` sẽ trôi mất khỏi màn hình với danh sách hàng nghìn dòng),
`RankChangeIcon`.

### Gameplay Framework → Gameplay Engine (`src/vo-tri/game/`)
Tài liệu đầy đủ: [`docs/VO_TRI_GAMEPLAY_ENGINE.md`](./VO_TRI_GAMEPLAY_ENGINE.md).
`GameFrame` là state machine trung tâm: `pre-game → (countdown, tuỳ
chọn) → playing ⇄ paused → result`, nhận gameplay cụ thể qua render-prop
`children: (ctx: GameplayContext) => ReactNode`. Một Activity khai báo
`rules: ActivityRules` (tất cả optional, mặc định tắt) để có miễn phí:
timer đếm ngược + auto-timeout, auto-win theo target score, combo +
scoring engine, countdown overlay. `GameHeader` (HUD chung: title, pause,
exit, progress, timer, combo, score — mọi field độc lập optional).
`ResultScreen` render 5 loại kết quả (`win`/`lose`/`complete`/`timeout`/
`abandoned`) qua cùng một composition, copy lấy từ `resultCopy` trong
`microcopy.ts`. `scoring.ts`: `DEFAULT_SCORING` = basePoints × hệ số độ
khó (`de` 1 / `vua` 1.25 / `kho` 1.5) × hệ số combo (tối đa 10 stack,
+10%/stack). Route thật `/play/[activityId]` dùng
`generateStaticParams` trên catalog Explore, chỉ bật
`rules.comboEnabled: true`.

### Retention System (`src/vo-tri/retention/`)
Daily Quest (2 quest cố định + 1 quest bonus xoay vòng theo
day-of-year trong pool 3) + Weekly Goal (3 goal cố định) qua
`QuestCard`/`QuestList` (một component, tham số hoá qua `cadence`).
`StreakTracker` (flame + dải 7 ngày, có chế độ `compact` nhúng trong
`TodayCard`). `MilestoneTrack` (ladder theo `streak` hoặc
`activitiesPlayed` — cố ý không có milestone theo `level` vì
`ranks.ts` đã phủ). `ClaimRewardDialog` (compose `RewardReveal` +
`LevelUpBanner` tuỳ chọn + `MilestoneBanner`, cùng ngôn ngữ celebration
với `ResultScreen` của Gameplay Engine). `DailyQuestPreview` là client
wrapper zero-props Home dùng (tự gọi `getDailyQuests()`, xem §6 về lý do
RSC).

### Social Foundation (`src/vo-tri/social/`)
5 reaction có brand riêng (`reactions.ts`, gồm reaction chữ ký "Vô Tri").
`CommentSection`/`CommentItem`/`CommentComposer` (list/reply/composer/
empty/loading/error đầy đủ). `ShareSheet` (copy-link thật hoạt động qua
Clipboard API; nút mạng xã hội hiển thị disabled trung thực). `FollowButton`
(controlled, không persistence). `ActivityFeed` (**đã** gắn vào Home,
empty trung thực) + `FeedItemCard`. `NotificationCenter` (đã nâng cấp
`NotificationBell` ở Header từ chỉ có empty-state lên hiển thị danh mục
achievement/reward/friend/system). `UserPreviewCard` tái dùng
`ProfileAvatar`/`getRank` để avatar/rank nhất quán mọi nơi xuất hiện.

### Platform Foundation (audit/hardening, không phải một domain riêng)
Không có thư mục riêng — đây là các đợt audit toàn dự án đã thẩm thấu
vào mọi domain: consolidate code trùng lặp, thêm global state còn
thiếu, sửa a11y gap, sửa navigation bug, chuẩn hoá motion token, dựng CI
thật, dựng test layer (E2E + unit), thêm SEO/PWA file convention. Xem
§3 để biết chi tiết từng đợt.

---

## 6. Quyết định kiến trúc quan trọng

### Phải giữ nguyên (không đổi nếu không có chỉ thị rõ ràng của chủ dự án)

1. **Bảng màu + 2 hue thương hiệu.** Coral-pink + acid-lime là lựa chọn
   có chủ đích để KHÁC với tổ hợp tím/fuchsia "AI SaaS" phổ biến. Không
   đổi màu thương hiệu vì lý do thẩm mỹ cá nhân.
2. **VIP violet chỉ ở khoảnh khắc VIP/premium** (+ ngoại lệ badge rarity
   `"special"` đã ghi nhận). Không dùng nó ở nơi khác dù trông "đẹp".
3. **Không bịa dữ liệu — never.** Đây là quy tắc quan trọng nhất của
   toàn dự án. Bất kỳ route thật nào chưa có backend đứng sau PHẢI hiển
   thị trạng thái trung thực (empty/logged-out), không phải placeholder
   trông như thật. Component giàu vẫn được xây đầy đủ — chỉ là trình
   diễn bằng fixture rõ ràng trên `/vo-tri-styleguide`, không phải trên
   route thật.
4. **`prefers-reduced-motion` collapse toàn cục một lần** trong
   `globals.css`. Không thêm nhánh reduced-motion riêng lẻ cho từng
   component mới — nó đã tự động phủ hết.
5. **Animation chỉ transform/opacity(/box-shadow).** Không thêm keyframe
   nào động vào width/height/top/left/background-position.
6. **Copy qua `microcopy.ts`, không viết string rời rạc trong JSX.**
7. **Barrel export (`index.ts`) mỗi domain** — không import file nội bộ
   trực tiếp từ ngoài domain.
8. **`ROW_HEIGHT_PX` cố định trên `LeaderboardRow`** — đừng đổi nó thành
   chiều cao động, nó tồn tại chính xác để virtualization sau này chỉ là
   một thay đổi trong `LeaderboardList`.
9. **`ActivityRules` mọi field mặc định tắt (Gameplay Engine).** Một
   Activity không khai báo gì phải hoạt động y hệt trước khi Engine
   được viết lại — đây là hợp đồng tương thích ngược quan trọng.

### Tuyệt đối không nên phá vỡ

- **Không được thêm backend/service thật (Supabase/Auth/Payment/Storage/
  Email/analytics thật) mà không có chỉ thị rõ ràng** — dự án đang ở
  giai đoạn frontend-only có chủ đích, không phải bị bỏ quên.
- **Không xoá/viết lại nội dung `archive/`** — đó là tài sản cá nhân của
  chủ dự án, không liên quan tới VÔ TRI.
- **Không tự bịa nội dung pháp lý** (Điều khoản/Chính sách bảo mật) nếu
  được yêu cầu xây các trang đó — cần nội dung thật từ chủ dự án.
- **Không dùng `git push --force`, không xoá branch, không bypass CI**
  mà không có chỉ thị rõ ràng.
- **Không nâng cấp Next.js lên canary/major version một cách tự ý** — dù
  có CVE đã biết ở bản 15.5.20 hiện tại (xem §9), đây là quyết định kiến
  trúc cần chủ dự án duyệt, không phải một "bug fix" tự động.

---

## 7. Những extension point đã chuẩn bị

Đây là các "điểm nối" đã được thiết kế sẵn trong code — khi giai đoạn
Backend bắt đầu, phần lớn công việc là **implement thật vào những điểm
này**, không phải thiết kế lại kiến trúc.

| Hệ thống | Điểm nối hiện tại | Trạng thái |
|---|---|---|
| **Backend / dữ liệu thật** | Mọi component giàu dữ liệu nhận prop shape thật (`TodayStats`, `SpotlightItem`, `CommunityStats`, `LeaderboardPlayer`, `QuestProgress`, `FeedItem`...) — chỉ cần fetch dữ liệu thật và truyền vào, không đổi component | Chưa nối — mọi route thật đang truyền `undefined`/`[]` |
| **Auth / Session** | `shell/types.ts`: `VoTriUser { name, avatarUrl?, points }`. Mọi trang kiểm tra qua một biến `currentUser` cục bộ (ví dụ `src/app/page.tsx` dòng khai báo `const currentUser: {...} | undefined = undefined`) | Chưa có — đây là điểm khoá gần như toàn bộ tính năng còn lại (xem §10) |
| **Payment** | Chưa có bất kỳ điểm nối nào — VIP token/badge rarity là chuẩn bị hình ảnh, không phải luồng thanh toán | Chưa bắt đầu, cần chủ dự án quyết định trước |
| **Analytics** | `src/vo-tri/lib/analytics.ts` — `trackEvent(event, payload?)`, hiện là no-op, được gọi ở mọi khoảnh khắc gameplay quan trọng (`activity_start`/`activity_exit`/`activity_result`) | Sẵn sàng — nối provider thật là thay đổi 1 file |
| **Audio** | `src/vo-tri/lib/sound.ts` — `playSound(event)`, hiện là no-op, được gọi ở mọi khoảnh khắc thưởng/lên cấp/thành tích/đổi trạng thái game | Sẵn sàng — nối audio file thật là thay đổi 1 file |
| **Storage** | Chưa có điểm nối cụ thể (avatar dùng `<img>` thô với `avatarUrl` optional, luôn `undefined` hiện tại — xem `ui/Avatar.tsx`) | Chưa cần cho tới khi có upload ảnh thật |
| **Notification** | `social/NotificationCenter.tsx` (4 category: achievement/reward/friend/system) đã nối vào `shell/NotificationBell.tsx` ở Header, hiện `items={[]}` | Sẵn sàng nhận dữ liệu thật |
| **Site URL / SEO** | `src/vo-tri/lib/site.ts` — `SITE_URL` đọc từ `NEXT_PUBLIC_SITE_URL`, fallback `localhost` | Cần set domain thật khi deploy |

---

## 8. Tình trạng kiểm thử

Tất cả các mục dưới đây đã được **verify trực tiếp** (chạy lệnh thật),
không phải giả định.

| Kiểm tra | Lệnh | Trạng thái xác nhận gần nhất |
|---|---|---|
| Lint | `npm run lint` (ESLint 9, flat config, `next/core-web-vitals` + `next/typescript`) | Sạch |
| Typecheck | `npm run typecheck` (`tsc --noEmit`, strict mode) | Sạch |
| Unit test | `npm run test` (Vitest, `src/**/*.test.ts`) | **30/30 pass**, 7 file test (`lib/cn`, `lib/date`, `lib/time`, `profile/ranks`, `game/scoring`, `retention/quests`, `retention/milestones`) |
| Build | `npm run build` (`next build`) | Thành công, 25 route, First Load JS shared ~102 kB, mỗi route thật ~167–184 kB |
| E2E | `npm run test:e2e` (Playwright, build+serve production thật rồi mới test) | **16/16 pass**, 6 file spec (`navigation`, `accessibility`, `explore`, `play-flow`, `retention`, `social`) |
| CI | `.github/workflows/ci.yml` — install → lint → typecheck → unit → build → Playwright install → E2E | Xanh trên GitHub Actions cho commit mới nhất trên branch hiện tại |
| Console runtime | Kiểm bằng Playwright thật trên cả 6 route (`/`, `/explore`, `/leaderboard`, `/profile`, `/play/diem-danh`, `/vo-tri-styleguide`) | 0 warning/error/pageerror |
| Responsive | Playwright screenshot + đo `scrollWidth` tại 390/1024/1440px trên mọi route | Không overflow ngang |
| Accessibility | Skip-link Tab-order test, dialog focus-return test, keyboard-only click test, `sr-only` text cho mọi trạng thái chỉ-biểu-diễn-qua-màu | Pass |

Playwright config trỏ vào Chromium cài sẵn tại `/opt/pw-browsers/chromium`
khi tồn tại (môi trường sandbox), fallback về hành vi mặc định (tự
install) khi không tồn tại (CI runner thật) — xem `playwright.config.ts`.

---

## 9. Những việc còn lại

### Vẫn làm được chỉ với frontend (không cần backend)
Đã audit kỹ ở round gần nhất — **hiện không còn hạng mục frontend-only
rõ ràng, có giá trị, an toàn để tự triển khai** mà không cần input/quyết
định từ chủ dự án. Các ứng viên còn lại đều rơi vào nhóm dưới đây.

### Cần input/quyết định từ chủ dự án trước khi làm (không phải bug)
- **Điều khoản sử dụng / Chính sách bảo mật:** không thể tự bịa nội dung
  pháp lý (tên pháp nhân, cách xử lý dữ liệu, thông tin liên hệ) — rủi ro
  thật nếu ship nội dung giả.
- **Next.js 15.5.20 có CVE đã biết** (DoS Server Actions, SSRF, cache
  confusion, unauthenticated Server Function disclosure) — đã xác nhận
  đây là bản stable 15.x mới nhất (`npm view next versions --json`, chỉ
  còn `15.6.0-canary.*`), không có bản vá non-breaking nào. Nâng lên
  canary hoặc Next 16 là quyết định kiến trúc lớn hơn, cần chủ dự án
  duyệt.
- **Domain thật chưa có** — `NEXT_PUBLIC_SITE_URL` còn fallback
  `localhost`, ảnh hưởng URL tuyệt đối trong sitemap/OG image khi lên
  production thật.

### Cần backend thật (không thể làm nếu thiếu)
- Toàn bộ Auth/Session — điểm khoá gần như mọi tính năng còn lại.
- Persist User/Profile/XP/Level thật.
- Persist tiến độ Quest/Streak/Milestone thật.
- Query ranking Leaderboard thật.
- Dữ liệu Social thật (feed/comment/follow/reaction).
- Analytics/audio thật (điểm nối đã sẵn sàng, chỉ thiếu provider/asset
  thật).
- Upload ảnh (avatar) thật — cần Storage.

---

## 10. Hướng phát triển đề xuất

### Giai đoạn tiếp theo: Backend

**Thứ tự đề xuất và lý do:**

1. **Chọn stack** — khuyến nghị **Supabase**: free tier có sẵn Auth +
   Postgres + Storage trong một dịch vụ, khớp "cost rules" của dự án
   (không trả phí hạ tầng trước khi có người dùng thật).
2. **Auth trước tiên** — đây là bước khoá gần như mọi phần còn lại: Home
   (`TodayCard`), Profile (toàn bộ), Leaderboard (vị trí bản thân),
   Retention (tiến độ quest/streak), Social (feed/comment/follow) đều
   đang chờ một `currentUser` thật. Không có Auth, mọi bước sau chỉ có
   thể verify bằng fixture, không phải luồng thật.
3. **User/Profile schema + XP/Level persistence** — nền tảng cho mọi
   tính năng phụ thuộc điểm/level.
4. **Quest/Streak/Milestone progress persistence** — `retention/types.ts`
   đã định nghĩa sẵn `QuestProgress`/`StreakData`/`MilestoneProgress`,
   map thẳng vào bảng DB, không cần thiết kế lại type.
5. **Leaderboard ranking query thật** — `leaderboard/types.ts` đã có
   `LeaderboardPlayer`/`MyPosition`, chỉ cần query thật thay cho mảng
   rỗng.
6. **Social dữ liệu thật** (feed/comment/follow/reaction) — `social/
   types.ts` đã đủ shape.
7. **Analytics/audio thật** — làm sau cùng vì rủi ro thấp nhất và điểm
   nối (`lib/analytics.ts`/`lib/sound.ts`) đã là thay đổi 1 file.

**Lý do đặt Auth ở vị trí #2 (ngay sau chọn stack):** đây không phải một
tính năng độc lập mà là *tiền đề* — mọi route thật hiện tại đều có nhánh
"nếu có `currentUser`" đã viết sẵn (`src/app/page.tsx`,
`src/app/profile/page.tsx`...), chỉ chờ nguồn thật để nhánh đó kích
hoạt. Làm Auth sớm biến phần lớn công việc còn lại từ "xây tính năng
mới" thành "nối dữ liệu vào nhánh đã có".

---

## 11. Hướng dẫn cho AI mới

Nếu bạn là một phiên Claude mới được giao tiếp tục dự án này, đọc kỹ
phần này trước khi làm bất cứ điều gì:

### Đây là trạng thái hiện tại — không làm lại
Dự án đã hoàn thành: design system đầy đủ, App Shell, 4 trang chính
(Home/Explore/Profile/Leaderboard) với đầy đủ component giàu dữ liệu +
trạng thái trung thực khi chưa có backend, Gameplay Engine hoàn chỉnh
(không chỉ framework), Retention System hoàn chỉnh, Social Foundation
hoàn chỉnh, testing layer đầy đủ (Vitest + Playwright, tất cả xanh trong
CI), SEO + PWA đầy đủ. **Đừng xây lại bất kỳ phần nào trong danh sách
này** — nếu bạn nghĩ một phần "còn thiếu", hãy đọc `CLAUDE.md` (nhật ký
quyết định) trước, rất có khả năng nó đã được cân nhắc và có lý do cụ
thể để ở trạng thái hiện tại (ví dụ: "tại sao Home không hiển thị số
người online" → xem quy tắc không bịa dữ liệu, không phải một tính năng
bị bỏ sót).

### Nguyên tắc phải tuân thủ (không thương lượng trừ khi chủ dự án nói rõ)
1. **Không bịa dữ liệu.** Đây là quy tắc số một. Trước khi thêm bất kỳ
   con số/thống kê/hoạt động nào vào một route thật, tự hỏi: "dữ liệu
   này có tới từ một nguồn thật không?" Nếu không, đó phải là empty
   state, không phải placeholder.
2. **Đọc `CLAUDE.md` trước khi đổi bất cứ quy tắc thiết kế nào** — mục
   "Non-negotiable design rules" ở đầu file liệt kê rõ những gì không
   được đổi mà không có sự chấp thuận rõ ràng của chủ dự án.
3. **Refactor trước khi thêm tính năng, nếu phát hiện trùng lặp.** Đây
   không phải một gợi ý — đó là cách toàn bộ dự án đã được xây, xuyên
   suốt mọi giai đoạn.
4. **Luôn verify thật, không bao giờ giả định.** Sau mỗi thay đổi đáng
   kể: `npm run lint && npm run typecheck && npm run test && npm run
   build`, và nếu có ảnh hưởng UI, chạy `npm run test:e2e` +
   render/screenshot thật (Playwright) để xác nhận trực quan. **Không
   bao giờ báo cáo "đã hoàn thành" hay "đã verify" mà không thực sự chạy
   lệnh đó.**
5. **Mọi animation mới: chỉ `transform`/`opacity`(/`box-shadow`).** Không
   cần thêm nhánh `prefers-reduced-motion` riêng — nó đã được xử lý toàn
   cục.
6. **Copy UI mới luôn qua `microcopy.ts`**, không viết chuỗi trực tiếp
   trong JSX trừ khi nó thực sự là nội dung động (tên activity, tên
   người dùng...).
7. **Component dùng ở 2+ domain → chuyển vào `ui/`** ngay khi phát hiện,
   không chờ "dọn sau".

### Cách tiếp tục phát triển mà không làm giảm chất lượng kiến trúc
- **Trước khi viết code:** đọc phần liên quan trong `CLAUDE.md` (nhật ký
  quyết định) để hiểu *tại sao* phần đó ở trạng thái hiện tại, tránh
  "sửa" một quyết định có chủ đích.
- **Khi thêm một Activity gameplay mới:** đọc
  `docs/VO_TRI_GAMEPLAY_ENGINE.md` — engine đã được thiết kế để một
  Activity mới chỉ cần khai báo `rules: ActivityRules` + logic
  win/lose/scoring qua `GameplayContext`, không cần đụng vào
  `GameFrame.tsx`.
- **Khi bắt đầu nối backend thật:** bắt đầu từ Auth (xem §10), và khi
  nối dữ liệu thật vào một component, ưu tiên tìm prop shape đã có sẵn
  (types trong mỗi domain) trước khi định nghĩa type mới — phần lớn đã
  được chuẩn bị sẵn chính xác cho việc này.
- **Khi gặp lỗi "Event handlers cannot be passed to Client Component
  props" hoặc "Functions cannot be passed directly to Client
  Components":** đây là lỗi RSC boundary đã gặp nhiều lần (component
  chứa `LucideIcon` reference không thể truyền từ Server Component qua
  props, kể cả khi con là Client Component). Cách sửa chuẩn của dự án:
  tạo một wrapper Client Component **zero-props** tự import module
  catalog và tự lấy dữ liệu (xem `PlayClient.tsx`, `DailyQuestPreview.tsx`
  làm mẫu) — không cố truyền dữ liệu chứa icon qua props.
- **Trước khi commit/push:** chạy đủ bộ verify (mục 8 ở trên), và nếu
  dự án có CI (`git push` sẽ trigger `.github/workflows/ci.yml`), xác
  nhận CI xanh thật trước khi báo cáo hoàn thành — đừng suy đoán kết
  quả CI.
- **Khi không chắc một quyết định có phải của chủ dự án hay không:** hỏi
  trước khi hành động, đặc biệt với: đổi màu/token thương hiệu, xoá code
  mà không rõ mục đích, nâng cấp dependency lớn (Next.js major version),
  và bất kỳ điều gì cần tài khoản/API key/thanh toán thật.
