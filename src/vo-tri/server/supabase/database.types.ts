/**
 * Hand-written to match supabase/migrations/*.sql exactly as of this
 * writing (see docs/BACKEND_ARCHITECTURE.md §4). This file exists so a
 * repository/service layer can typecheck against the real schema shape
 * before a live Supabase project exists to run `supabase gen types
 * typescript` against. That command REPLACES this file once a project
 * exists — the two are not meant to be kept in sync by hand forever,
 * this is a bootstrap, not a permanent hand-maintained duplicate.
 *
 * Every table needs `Relationships: []` and Insert/Update shapes that are
 * real objects (not `never`) to satisfy @supabase/supabase-js's
 * `GenericTable`/`GenericSchema` constraints (see
 * node_modules/@supabase/supabase-js/src/lib/rest/types/common/common.ts)
 * — a real typecheck error caught this: using `never` for
 * "not writable by a plain client call" seemed intuitive but broke the
 * client's generic type inference project-wide, since RLS (a runtime,
 * Postgres-level concept) is what actually prevents unauthorized writes,
 * not the TypeScript shape. `Insert`/`Update` here just describe the real
 * column shape, same as genuine `supabase gen types typescript` output.
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
        Update: Partial<Database["public"]["Tables"]["profiles"]["Row"]>;
        Relationships: [];
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
        Relationships: [];
      };
      quest_definitions: {
        Row: { id: string; cadence: "daily" | "weekly"; target: number; reward: number; xp: number };
        Insert: Database["public"]["Tables"]["quest_definitions"]["Row"];
        Update: Partial<Database["public"]["Tables"]["quest_definitions"]["Row"]>;
        Relationships: [];
      };
      milestone_definitions: {
        Row: { id: string; metric: "streak" | "activitiesPlayed"; threshold: number };
        Insert: Database["public"]["Tables"]["milestone_definitions"]["Row"];
        Update: Partial<Database["public"]["Tables"]["milestone_definitions"]["Row"]>;
        Relationships: [];
      };
      achievement_definitions: {
        Row: { id: string; name: string; description: string };
        Insert: Database["public"]["Tables"]["achievement_definitions"]["Row"];
        Update: Partial<Database["public"]["Tables"]["achievement_definitions"]["Row"]>;
        Relationships: [];
      };
      badge_definitions: {
        Row: { id: string; name: string; description: string; rarity: "common" | "rare" | "special" };
        Insert: Database["public"]["Tables"]["badge_definitions"]["Row"];
        Update: Partial<Database["public"]["Tables"]["badge_definitions"]["Row"]>;
        Relationships: [];
      };
      collection_definitions: {
        Row: { id: string; name: string; kind: "skin" | "title" | "item" };
        Insert: Database["public"]["Tables"]["collection_definitions"]["Row"];
        Update: Partial<Database["public"]["Tables"]["collection_definitions"]["Row"]>;
        Relationships: [];
      };
      seasons: {
        Row: { id: string; name: string; starts_at: string; ends_at: string };
        Insert: { id?: string; name: string; starts_at: string; ends_at: string };
        Update: Partial<Database["public"]["Tables"]["seasons"]["Row"]>;
        Relationships: [];
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
        // Real writes only happen via record_activity_session() — RLS has
        // no INSERT policy for `authenticated` at all (see §6.2) — but the
        // *type* still needs a real shape, not `never`, for the client
        // library's generics to work anywhere else in this file.
        Insert: Omit<Database["public"]["Tables"]["activity_sessions"]["Row"], "id" | "created_at">;
        Update: Partial<Database["public"]["Tables"]["activity_sessions"]["Row"]>;
        Relationships: [];
      };
      daily_activity_log: {
        Row: { user_id: string; activity_date: string };
        Insert: Database["public"]["Tables"]["daily_activity_log"]["Row"];
        Update: Partial<Database["public"]["Tables"]["daily_activity_log"]["Row"]>;
        Relationships: [];
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
        Insert: Omit<Database["public"]["Tables"]["xp_ledger"]["Row"], "id" | "created_at">;
        Update: Partial<Database["public"]["Tables"]["xp_ledger"]["Row"]>;
        Relationships: [];
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
        Insert: Omit<Database["public"]["Tables"]["quest_progress"]["Row"], "updated_at">;
        Update: Partial<Database["public"]["Tables"]["quest_progress"]["Row"]>;
        Relationships: [];
      };
      milestone_progress: {
        Row: { user_id: string; milestone_id: string; reached_at: string | null; claimed_at: string | null };
        Insert: Database["public"]["Tables"]["milestone_progress"]["Row"];
        Update: Partial<Database["public"]["Tables"]["milestone_progress"]["Row"]>;
        Relationships: [];
      };
      user_achievements: {
        Row: { user_id: string; achievement_id: string; unlocked_at: string };
        Insert: Omit<Database["public"]["Tables"]["user_achievements"]["Row"], "unlocked_at">;
        Update: Partial<Database["public"]["Tables"]["user_achievements"]["Row"]>;
        Relationships: [];
      };
      user_badges: {
        Row: { user_id: string; badge_id: string; unlocked_at: string };
        Insert: Omit<Database["public"]["Tables"]["user_badges"]["Row"], "unlocked_at">;
        Update: Partial<Database["public"]["Tables"]["user_badges"]["Row"]>;
        Relationships: [];
      };
      user_collection_items: {
        Row: { user_id: string; item_id: string; unlocked_at: string };
        Insert: Omit<Database["public"]["Tables"]["user_collection_items"]["Row"], "unlocked_at">;
        Update: Partial<Database["public"]["Tables"]["user_collection_items"]["Row"]>;
        Relationships: [];
      };
      follows: {
        Row: { follower_id: string; followee_id: string; created_at: string };
        Insert: Omit<Database["public"]["Tables"]["follows"]["Row"], "created_at">;
        Update: Partial<Database["public"]["Tables"]["follows"]["Row"]>;
        Relationships: [];
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
        Insert: Omit<Database["public"]["Tables"]["reactions"]["Row"], "id" | "created_at">;
        Update: Partial<Database["public"]["Tables"]["reactions"]["Row"]>;
        Relationships: [];
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
        Update: Partial<Database["public"]["Tables"]["comments"]["Row"]>;
        // Real FKs from 20260724000007_social.sql — needed for the
        // `select("*, author:profiles(*)")` embedded-resource query in
        // social-repository.ts to typecheck as an actual joined row
        // instead of `SelectQueryError`. Postgres's default constraint
        // naming (`<table>_<column>_fkey`, no name given in the CREATE
        // TABLE) is what `foreignKeyName` matches here.
        Relationships: [
          {
            foreignKeyName: "comments_author_id_fkey";
            columns: ["author_id"];
            isOneToOne: false;
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          },
        ];
      };
      feed_items: {
        Row: {
          id: string;
          actor_id: string;
          event_type: "level_up" | "milestone" | "achievement" | "quest_claim";
          text: string;
          created_at: string;
        };
        Insert: Omit<Database["public"]["Tables"]["feed_items"]["Row"], "id" | "created_at">;
        Update: Partial<Database["public"]["Tables"]["feed_items"]["Row"]>;
        Relationships: [
          {
            foreignKeyName: "feed_items_actor_id_fkey";
            columns: ["actor_id"];
            isOneToOne: false;
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          },
        ];
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
        Insert: Omit<Database["public"]["Tables"]["notifications"]["Row"], "id" | "created_at">;
        Update: Partial<Database["public"]["Tables"]["notifications"]["Row"]>;
        Relationships: [];
      };
      journey_events: {
        Row: {
          id: string;
          user_id: string;
          type: "joined" | "level-up" | "achievement" | "reward" | "quest" | "milestone" | "streak";
          label: string;
          occurred_at: string;
        };
        Insert: Omit<Database["public"]["Tables"]["journey_events"]["Row"], "id" | "occurred_at">;
        Update: Partial<Database["public"]["Tables"]["journey_events"]["Row"]>;
        Relationships: [];
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
        Insert: Omit<Database["public"]["Tables"]["leaderboard_rank_snapshots"]["Row"], "id" | "captured_at">;
        Update: Partial<Database["public"]["Tables"]["leaderboard_rank_snapshots"]["Row"]>;
        Relationships: [];
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
        Insert: Omit<Database["public"]["Tables"]["audit_log"]["Row"], "id" | "created_at">;
        Update: Partial<Database["public"]["Tables"]["audit_log"]["Row"]>;
        Relationships: [];
      };
    };
    Views: Record<string, never>;
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
