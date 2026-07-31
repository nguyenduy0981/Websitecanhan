-- achievement_definitions/badge_definitions/collection_definitions were
-- created in 20260724000003_catalog_tables.sql but never seeded — a real
-- gap found auditing the frontend for Profile's Achievement/Badge/
-- Collection sections. Mirrors src/vo-tri/profile/{achievements,badges,
-- collection}.ts exactly as of this writing, same idempotent convention
-- as the other catalog seeds in 20260724000003. Granting rows into
-- user_achievements/user_badges/user_collection_items themselves is a
-- separate, deliberately-not-yet-designed concern — see
-- docs/BACKEND_ARCHITECTURE.md §10.

insert into public.achievement_definitions (id, name, description) values
  ('first-play', 'Cú Chạm Đầu Tiên', 'Hoàn thành hoạt động đầu tiên trên VÔ TRI'),
  ('all-rounder', 'Thử Hết Một Lượt', 'Đã chơi thử toàn bộ hoạt động hiện có'),
  ('combo-five', 'Không Thể Cản', 'Đạt combo x5 trong một lượt chơi'),
  ('streak-week', 'Một Tuần Vô Tri', 'Điểm danh đủ 7 ngày liên tiếp'),
  ('night-owl', 'Cú Đêm', 'Chơi một hoạt động sau nửa đêm'),
  ('first-comment', 'Lên Tiếng', 'Để lại bình luận đầu tiên')
on conflict (id) do update set
  name = excluded.name,
  description = excluded.description;

insert into public.badge_definitions (id, name, description, rarity) values
  ('welcome', 'Khởi Đầu', 'Tạo tài khoản VÔ TRI', 'common'),
  ('first-reward', 'Món Quà Đầu Tiên', 'Nhận phần thưởng đầu tiên', 'common'),
  ('golden-streak', 'Chuỗi Vàng', 'Điểm danh 30 ngày liên tiếp', 'rare'),
  ('combo-king', 'Vua Combo', 'Đạt combo x10 trong một lượt chơi', 'rare'),
  ('legend', 'Huyền Thoại Vô Tri', 'Đạt hạng Huyền Thoại Vô Tri', 'special'),
  ('top-three', 'Đỉnh Bảng Xếp Hạng', 'Lọt top 3 bảng xếp hạng toàn cầu', 'special')
on conflict (id) do update set
  name = excluded.name,
  description = excluded.description,
  rarity = excluded.rarity;

insert into public.collection_definitions (id, name, kind) values
  ('vo-tri-shirt', 'Áo Vô Tri', 'skin'),
  ('ambassador-title', 'Đại Sứ Vô Tri', 'title'),
  ('mystery-palette', 'Bảng Màu Bí Ẩn', 'item'),
  ('golden-spin', 'Vòng Quay Vàng', 'item')
on conflict (id) do update set
  name = excluded.name,
  kind = excluded.kind;
