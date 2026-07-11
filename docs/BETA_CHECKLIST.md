# Beta checklist

A short, practical list for going from "code is done" to "real people are
using LoveBox." Written for the owner (phone-only, no local terminal) —
every step below can be done from the Vercel dashboard and the site
itself. See `docs/SETUP.md` for the detailed how-to on each integration.

## 1. Confirm what's already working

All of these are done and verified (see `docs/MILESTONE_REPORTS.md` for
the full history):

- Register / login / logout / forgot password
- Create, edit, publish a gift (title, message, text blocks, theme,
  effect)
- Public gift link (`/g/...`) with QR code
- Free tier (3 ngày) vs VIP tier (15 ngày) lifecycle, including automatic
  expiry → recovery → deletion
- Content moderation: reporting, admin review, suspend/unsuspend
- View stats for gift owners; site-wide monitoring for admins

## 2. Finish the integrations that are still "awaiting credentials"

Check `/admin/monitoring` on the live site — it now shows a live
✓/✗ status for each of these:

| Integration | Blocks until configured | Setup steps |
|---|---|---|
| Cloudflare R2 | Uploading images to a gift | `docs/SETUP.md` → Cloudflare R2 |
| PayOS | Upgrading a gift to VIP | `docs/SETUP.md` → PayOS |
| Resend | Password-reset emails actually being sent (the reset link still works if you're logged in and can copy it, but nobody receives an email yet) | `docs/SETUP.md` → Resend |
| `SUPER_ADMIN_EMAIL` | Access to `/admin` (reports, moderation, monitoring) at all | `docs/SETUP.md` → "First admin account" |

None of these are required to *look at* the site — only to use the
specific feature they gate. You can run a very small beta (e.g. text-only
gifts, free tier only) before all four are done, if you want to start
sooner.

## 3. Do one real test of each integration once configured

- **R2**: upload a real photo to a real gift, confirm it shows up on the
  public `/g/...` page.
- **PayOS**: buy VIP on a real test gift with your own money (small
  amount), confirm the gift's tier actually flips to VIP after the
  webhook fires (refresh the editor page — the return page intentionally
  never claims success on its own).
- **Resend**: use "forgot password" on a real account, confirm the email
  actually arrives (check spam folder too).
- **SUPER_ADMIN_EMAIL**: log in with that email, confirm the "Quản trị"
  link appears on the dashboard and `/admin/reports` loads.

## 4. Run a small beta

Suggested for a first real cohort:

1. Invite a handful of people you know (5-15 people) rather than posting
   publicly — this is a real production app but hasn't been used by real
   strangers yet.
2. Ask them to actually do the full flow: create a gift, publish it, send
   the link to someone, have that person open it on their phone.
3. Watch `/admin/monitoring` for the first few days: cron job runs should
   all show "OK" (a red entry means a lifecycle/cleanup step failed —
   worth investigating, though each step is independent so one failure
   doesn't take down the others).
4. Watch `/admin/reports` for any content reports.
5. Ask beta users directly what confused them or didn't work — this is
   more reliable than analytics alone at this scale.

## 5. Known limitations to set expectations around during beta

These are intentional, documented scope decisions (not bugs) — see each
milestone's "Known issues" section in `docs/MILESTONE_REPORTS.md` for the
full reasoning:

- Only single images and text blocks are creatable from the editor UI;
  multi-image "gallery" blocks and music selection aren't wired into the
  UI yet.
- No email verification is enforced (`emailVerified` exists in the schema
  but nothing requires it).
- No time-series analytics charts — only rolling total/7d/30d view
  counts.
- No automated alerting on a failed cron job — `/admin/monitoring` must
  be checked manually.
- Rate limits (gift creation, image upload, VIP checkout) are judgment
  calls made pre-launch, not tuned against real traffic yet.

## 6. When you're ready to move past beta

Milestone 13 (Launch) and 14 (Growth) are about wider rollout and
iterating based on real usage — revisit this checklist once the beta
cohort has used the product for a while and you have real feedback to act
on.
