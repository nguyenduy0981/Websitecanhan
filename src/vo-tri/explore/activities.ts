import { BookOpenText, Brain, Dices, Keyboard, Layers, Smile, Sparkles, Timer, Wand2 } from "lucide-react";
import { dayOfYear } from "@/vo-tri/lib/date";
import type { Activity, ComingSoonActivity } from "./types";

/**
 * The activity catalog itself is real, authored product content (like a
 * game platform's list of games) — not the "fake data" CLAUDE.md's
 * no-fabrication rule is about. That rule targets fabricated *social/usage*
 * signals (fake online counts, fake "X just did Y" feed items) — nothing
 * here claims a real play count or a real other-user event, so nothing
 * here violates it. Featured/Daily-Picks selection below is a real
 * deterministic day-seed algorithm over this real catalog, the same
 * pattern already used for Home's daily message — an honest "editorial
 * rotation" today, swappable for real engagement-based ranking once
 * backend analytics exist.
 */
export const activities: Activity[] = [
  {
    id: "diem-danh",
    name: "Điểm Danh Hôm Nay",
    description: "Ghé qua mỗi ngày, nhận vài điểm cho có khí thế.",
    category: "nhanh",
    icon: Sparkles,
    reward: 15,
    xp: 10,
    difficulty: "de",
    estMinutes: 1,
    dailyLimit: 1,
    action: "check-in",
  },
  {
    id: "vong-quay-vo-tri",
    name: "Vòng Quay Vô Tri",
    description: "Quay một vòng, số phận tự quyết định phần còn lại.",
    category: "may-man",
    icon: Dices,
    reward: 30,
    xp: 5,
    difficulty: "de",
    estMinutes: 1,
    dailyLimit: 3,
    cooldownMinutes: 240,
  },
  {
    id: "rut-the-so-phan",
    name: "Rút Thẻ Số Phận",
    description: "Một lá bài, một lời tiên tri vô tri dành riêng cho bạn.",
    category: "may-man",
    icon: Layers,
    reward: 18,
    xp: 5,
    difficulty: "de",
    estMinutes: 1,
    dailyLimit: 5,
    cooldownMinutes: 60,
  },
  {
    id: "thu-thach-60-giay",
    name: "Thử Thách 60 Giây",
    description: "60 giây để chứng minh phản xạ của bạn không vô tri lắm.",
    category: "thu-thach",
    icon: Timer,
    reward: 35,
    xp: 20,
    difficulty: "vua",
    estMinutes: 1,
    dailyLimit: 3,
    cooldownMinutes: 30,
  },
  {
    id: "do-vui-vo-tri",
    name: "Đố Vui Vô Tri",
    description: "Những câu hỏi không giúp ích gì cho cuộc sống của bạn.",
    category: "thu-thach",
    icon: Brain,
    reward: 25,
    xp: 15,
    difficulty: "vua",
    estMinutes: 3,
    dailyLimit: 5,
  },
  {
    id: "meme-generator",
    name: "Máy Chế Meme",
    description: "Ghép chữ vào ảnh, tạo ra tuyệt tác vô tri của riêng bạn.",
    category: "giai-tri",
    icon: Wand2,
    reward: 15,
    xp: 10,
    difficulty: "de",
    estMinutes: 2,
  },
  {
    id: "cau-chuyen-ngau-nhien",
    name: "Chuyện Ngẫu Nhiên",
    description: "Điền vài từ, nhận về một câu chuyện không ai ngờ tới.",
    category: "giai-tri",
    icon: BookOpenText,
    reward: 15,
    xp: 10,
    difficulty: "de",
    estMinutes: 2,
  },
  {
    id: "doan-cam-xuc-mascot",
    name: "Đoán Cảm Xúc Mascot",
    description: "Nhìn mặt, đoán tâm trạng. Khó hơn bạn nghĩ đấy.",
    category: "giai-tri",
    icon: Smile,
    reward: 10,
    xp: 5,
    difficulty: "de",
    estMinutes: 1,
    dailyLimit: 5,
  },
  {
    id: "go-nhanh-vo-tri",
    name: "Gõ Nhanh Vô Tri",
    description: "Gõ lại một câu vô nghĩa, càng nhanh càng nhiều điểm.",
    category: "nhanh",
    icon: Keyboard,
    reward: 20,
    xp: 10,
    difficulty: "vua",
    estMinutes: 1,
    dailyLimit: 3,
  },
];

export const comingSoonActivities: ComingSoonActivity[] = [
  {
    id: "dau-truong-vo-tri",
    name: "Đấu Trường Vô Tri",
    description: "Đối đầu người chơi khác trong các thử thách chớp nhoáng.",
    icon: Timer,
  },
  {
    id: "nuoi-thu-vo-tri",
    name: "Nuôi Thú Vô Tri",
    description: "Một sinh vật nhỏ, cần bạn chăm — hoặc bỏ bê, tuỳ tâm trạng.",
    icon: Smile,
  },
  {
    id: "cho-do-vo-tri",
    name: "Chợ Đồ Vô Tri",
    description: "Đổi điểm lấy vật phẩm chẳng để làm gì, nhưng trông rất ngầu.",
    icon: Layers,
  },
];

export function getFeaturedActivity(date: Date = new Date()): Activity {
  const pool = activities;
  return pool[dayOfYear(date) % pool.length]!;
}

export function getDailyPicks(count = 3, date: Date = new Date()): Activity[] {
  const featured = getFeaturedActivity(date);
  const rest = activities.filter((a) => a.id !== featured.id);
  const offset = dayOfYear(date);
  const picks: Activity[] = [];
  for (let i = 0; i < count && i < rest.length; i++) {
    picks.push(rest[(offset + i * 3) % rest.length]!);
  }
  return picks;
}
