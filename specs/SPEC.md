# SPEC.md — LoveBox Consolidated Specification

## Product
LoveBox — nền tảng hộp quà kỹ thuật số cảm xúc, mobile-first, thị trường Việt Nam.

## Flow
Creator → Account → Draft Gift → Message + Images + Theme + Effects + Music →
Preview → Publish → Share Link/QR (unlisted) → Recipient mở trên viewer công khai
không cần đăng nhập → có thể chuyển thành creator mới.

## Roles
Guest, Creator, Moderator, Admin, Super Admin (RBAC backend).

## V1 Features
- Landing page (indexable).
- Full auth: đăng ký / đăng nhập / đăng xuất / reset password, rate limiting.
- Dashboard.
- Gift editor: text/images/gallery blocks, theme, effect, music, reorder, autosave, preview.
- Public viewer: mobile-first, graceful degradation — nếu nhạc/hiệu ứng/analytics/email
  hỏng thì nội dung quà vẫn hiển thị.
- Upload ảnh: validate (magic bytes) + tối ưu WebP + ownership + cleanup.
- Chia sẻ: link + QR + social preview không lộ nội dung riêng tư.
- Lifecycle server-side (DB now() authoritative).
- VIP qua thanh toán chuyển khoản VietQR (PayOS), xác minh webhook idempotent.
- Admin panel.
- Content reporting + moderation với audit log.
- Analytics funnel tự lưu (landing → create → publish → share → open → convert → VIP),
  payment đã verify là nguồn chân lý doanh thu.
- Background jobs idempotent: expire, recovery-end, purge, orphan cleanup, analytics retention.
- Monitoring + backup + tested restore.
- Trang pháp lý: terms, privacy, refund.

## Accessibility
Keyboard, focus, labels, contrast, reduced-motion, zoom.

## Performance
Core Web Vitals, CDN, responsive images, lazy loading, chịu được mạng chậm và
in-app browser (Zalo/Messenger/TikTok).

## Acceptance gate (final)
- User A không truy cập được tài nguyên User B (no IDOR).
- Free hết hạn đúng 3 ngày, VIP đúng 15 ngày.
- Recovery + xóa vĩnh viễn hoạt động đúng.
- Duplicate webhook kích hoạt đúng 1 lần.
- Sai amount/signature không kích hoạt.
- Gift mặc định unlisted/noindex.
- Test mobile + mạng chậm + a11y.
- Backup/restore/rollback sẵn sàng.

## Data model overview
See `prisma/schema.prisma` for the authoritative model definitions: User, Session,
PasswordResetToken, Gift, GiftBlock, MediaAsset, MusicTrack, Payment, Report,
GiftView, AnalyticsEvent, AuditLog, JobRun.

## Roadmap
0 Setup · 1 Foundation · 2 Authentication · 3 Gift Core · 4 Editor · 5 Public Viewer ·
6 Media & Themes · 7 Lifecycle · 8 VIP & Payments · 9 Admin & Moderation ·
10 Analytics & Monitoring · 11 Testing & Hardening · 12 Beta · 13 Launch · 14 Growth.

Non-negotiable business rules, security rules, cost rules, and architecture rules
are defined in `CLAUDE.md` and are binding for every milestone.
