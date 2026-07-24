/**
 * Hand-written to match supabase/migrations/*.sql exactly as of this
 * writing (see docs/BACKEND_ARCHITECTURE.md §4). This file exists so a
 * repository/service layer can typecheck against the real schema shape
 * before a live Supabase project exists to run `supabase gen types
 * typescript` against. That command REPLACES this file once a project
 * exists — the two are not meant to be kept in sync by hand forever,
 * this is a bootstrap, not a permanent hand-maintained duplicate.
 */

export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[];

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string;
          username: string;
          display_name: string;
          avatar_url: string | null;
          tagline: string | null;
          points: number;
          total_xp_earned: number;
          level: number;
          xp: number;
          xp_to_next: number;
          current_streak: number;
          longest_streak: number;
          last_active_date: string | null;
          total_active_days: number;
          total_activities_played: number;
          joined_at: string;
          updated_at: string;
        };
        Insert: {
          id: string;
          username: string;
          display_name: string;
          avatar_url?: string | null;
          tagline?: string | null;
        };
        Update: Partial<Database["public"]["Tables"]["profiles"]["Insert"]> & {
          avatar_url?: string | null;
          tagline?: string | null;
          display_name?: string;
        };
      };
      activities: {
        Row: {
          id: string;
          name: string;
          category: string;
          difficulty: "de" | "vua" | "kho";
          reward: number;
          xp: number;
          daily_limit: number | null;
          cooldown_minutes: number | null;
          is_coming_soon: boolean;
          updated_at: string;
        };
        Insert: Database["public"]["Tables"]["activities"]["Row"];
        Update: Partial<Database["public"]["Tables"]["activities"]["Row"]>;
      };
      quest_definitions: {
        Row: { id: string; cadence: "daily" | "weekly"; target: number; reward: number; xp: number };
        Insert: Database["public"]["Tables"]["quest_definitions"]["Row"];
        Update: Partial<Database["public"]["Tables"]["quest_definitions"]["Row"]>;
      };
      milestone_definitions: {
        Row: { id: string; metric: "streak" | "activitiesPlayed"; threshold: number };
        Insert: Database["public"]["Tables"]["milestone_definitions"]["Row"];
        Update: Partial<Database["public"]["Tables"]["milestone_definitions"]["Row"]>;
      };
      achievement_definitions: {
        Row: { id: string; name: string; description: string };
        Insert: Database["public"]["Tables"]["achievement_definitions"]["Row"];
        Update: Partial<Database["public"]["Tables"]["achievement_definitions"]["Row"]>;
      };
      badge_definitions: {
        Row: { id: string; name: string; description: string; rarity: "common" | "rare" | "special" };
        Insert: Database["public"]["Tables"]["badge_definitions"]["Row"];
        Update: Partial<Database["public"]["Tables"]["badge_definitions"]["Row"]>;
      };
      collection_definitions: {
        Row: { id: string; name: string; kind: "skin" | "title" | "item" };
        Insert: Database["public"]["Tables"]["collection_definitions"]["Row"];
        Update: Partial<Database["public"]["Tables"]["collection_definitions"]["Row"]>;
      };
      seasons: {
        Row: { id: string; name: string; starts_at: string; ends_at: string };
        Insert: { id?: string; name: string; starts_at: string; ends_at: string };
        Update: Partial<Database["public"]["Tables"]["seasons"]["Insert"]>;
      };
      activity_sessions: {
        Row: {
          id: string;
          user_id: string;
          activity_id: string;
          kind: "win" | "lose" | "complete" | "timeout" | "abandoned";
          client_reported_points: number;
          awarded_points: number;
          awarded_xp: number;
          combo_max: number;
          duration_seconds: number;
          created_at: string;
        };
        Insert: never; // writes only via record_activity_session(); see §6.2
        Update: never;
      };
      daily_activity_log: {
        Row: { user_id: string; activity_date: string };
        Insert: never;
        Update: never;
      };
      xp_ledger: {
        Row: {
          id: string;
          user_id: string;
          source: "activity_session" | "quest_claim" | "milestone_claim";
          source_id: string | null;
          points: number;
          xp: number;
          created_at: string;
        };
        Insert: never;
        Update: never;
      };
      quest_progress: {
        Row: {
          user_id: string;
          quest_id: string;
          period_key: string;
          current_value: number;
          claimed_at: string | null;
          updated_at: string;
        };
        Insert: never; // writes only via advance_quest_progress()/claim_quest()
        Update: never;
      };
      milestone_progress: {
        Row: { user_id: string; milestone_id: string; reached_at: string | null; claimed_at: string | null };
        Insert: never;
        Update: never;
      };
      user_achievements: {
        Row: { user_id: string; achievement_id: string; unlocked_at: string };
        Insert: never;
        Update: never;
      };
      user_badges: {
        Row: { user_id: string; badge_id: string; unlocked_at: string };
        Insert: never;
        Update: never;
      };
      user_collection_items: {
        Row: { user_id: string; item_id: string; unlocked_at: string };
        Insert: never;
        Update: never;
      };
      follows: {
        Row: { follower_id: string; followee_id: string; created_at: string };
        Insert: never; // writes only via toggle_follow()
        Update: never;
      };
      reactions: {
        Row: {
          id: string;
          user_id: string;
          target_type: "feed_item" | "comment";
          target_id: string;
          reaction_id: "thich" | "cuoi" | "dinh" | "bat-ngo" | "vo-tri";
          created_at: string;
        };
        Insert: {
          user_id: string;
          target_type: "feed_item" | "comment";
          target_id: string;
          reaction_id: "thich" | "cuoi" | "dinh" | "bat-ngo" | "vo-tri";
        };
        Update: Partial<Database["public"]["Tables"]["reactions"]["Insert"]>;
      };
      comments: {
        Row: {
          id: string;
          target_type: "activity" | "feed_item";
          target_id: string;
          author_id: string;
          parent_comment_id: string | null;
          body: string;
          created_at: string;
          deleted_at: string | null;
        };
        Insert: {
          target_type: "activity" | "feed_item";
          target_id: string;
          author_id: string;
          parent_comment_id?: string | null;
          body: string;
        };
        Update: { deleted_at?: string | null };
      };
      feed_items: {
        Row: {
          id: string;
          actor_id: string;
          event_type: "level_up" | "milestone" | "achievement" | "quest_claim";
          text: string;
          created_at: string;
        };
        Insert: never; // system-generated only; see §4.6
        Update: never;
      };
      notifications: {
        Row: {
          id: string;
          user_id: string;
          type: "achievement" | "reward" | "friend" | "system";
          title: string;
          description: string;
          read_at: string | null;
          created_at: string;
        };
        Insert: never; // system-generated only
        Update: { read_at: string };
      };
      journey_events: {
        Row: {
          id: string;
          user_id: string;
          type: "joined" | "level-up" | "achievement" | "reward" | "quest" | "milestone" | "streak";
          label: string;
          occurred_at: string;
        };
        Insert: never;
        Update: never;
      };
      leaderboard_rank_snapshots: {
        Row: {
          id: string;
          user_id: string;
          scope: "global" | "week" | "month" | "season";
          season_id: string | null;
          rank: number;
          points: number;
          captured_at: string;
        };
        Insert: never; // service-role snapshot job only
        Update: never;
      };
      audit_log: {
        Row: {
          id: string;
          actor_id: string | null;
          action: string;
          target_type: string | null;
          target_id: string | null;
          metadata: Json;
          created_at: string;
        };
        Insert: never; // not client-readable or writable at all; service_role/security-definer only
        Update: never;
      };
    };
    Functions: {
      record_activity_session: {
        Args: {
          p_activity_id: string;
          p_kind: "win" | "lose" | "complete" | "timeout" | "abandoned";
          p_client_reported_points: number;
          p_client_reported_xp: number;
          p_combo_max?: number;
          p_duration_seconds?: number;
        };
        Returns: { awarded_points: number; awarded_xp: number; leveled_up: boolean; new_level: number }[];
      };
      claim_quest: {
        Args: { p_quest_id: string; p_period_key: string };
        Returns: { points: number; xp: number; leveled_up: boolean; new_level: number }[];
      };
      claim_milestone: {
        Args: { p_milestone_id: string };
        Returns: { points: number; xp: number }[];
      };
      toggle_follow: {
        Args: { p_target_id: string };
        Returns: boolean;
      };
    };
  };
}
