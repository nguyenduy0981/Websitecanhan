import type { LucideIcon } from "lucide-react";

export type SocialCardState = "normal" | "featured" | "pinned" | "saved";

export interface ReactionKind {
  id: string;
  label: string;
  icon: LucideIcon;
}

export interface ReactionCounts {
  [reactionId: string]: number;
}

export interface CommentAuthor {
  name: string;
  avatarUrl?: string;
}

export interface CommentData {
  id: string;
  author: CommentAuthor;
  text: string;
  createdAt: Date;
  replies?: CommentData[];
}

export interface UserPreview {
  name: string;
  username: string;
  avatarUrl?: string;
  level: number;
  badgeLabel?: string;
}

export type NotificationType = "achievement" | "reward" | "friend" | "system";

export interface NotificationItem {
  id: string;
  type: NotificationType;
  title: string;
  description: string;
  createdAt: Date;
  read?: boolean;
}

export interface FeedItem {
  id: string;
  actor: CommentAuthor;
  text: string;
  createdAt: Date;
  cardState?: SocialCardState;
}
