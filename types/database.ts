/**
 * Supabase PostgreSQL schema types (M2).
 * Regenerate with `supabase gen types typescript` when connected to a project.
 */

export type ReviewStatus =
  | "draft"
  | "for_review"
  | "approved"
  | "needs_revision";

export type UserRole = "learner" | "admin";

export type SectionKind =
  | "introduction"
  | "story"
  | "characters"
  | "cultural_context"
  | "illustration"
  | "audio"
  | "animation"
  | "learning_points"
  | "activity"
  | "completion";

export type MediaKind = "illustration" | "audio" | "animation";

export type AssessmentType = "pre" | "post";

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string;
          role: UserRole;
          display_name: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id: string;
          role?: UserRole;
          display_name?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          role?: UserRole;
          display_name?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
      chapters: {
        Row: {
          id: string;
          slug: string;
          chapter_number: number;
          title: string;
          subtitle: string | null;
          summary: string | null;
          review_status: ReviewStatus;
          is_active: boolean;
          cover_media_asset_id: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          slug: string;
          chapter_number: number;
          title: string;
          subtitle?: string | null;
          summary?: string | null;
          review_status?: ReviewStatus;
          is_active?: boolean;
          cover_media_asset_id?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          slug?: string;
          chapter_number?: number;
          title?: string;
          subtitle?: string | null;
          summary?: string | null;
          review_status?: ReviewStatus;
          is_active?: boolean;
          cover_media_asset_id?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
      chapter_sections: {
        Row: {
          id: string;
          chapter_id: string;
          kind: SectionKind;
          title: string;
          sort_order: number;
          review_status: ReviewStatus;
          body_text: string | null;
          transcript: string | null;
          completion_message: string | null;
          media_asset_id: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          chapter_id: string;
          kind: SectionKind;
          title: string;
          sort_order: number;
          review_status?: ReviewStatus;
          body_text?: string | null;
          transcript?: string | null;
          completion_message?: string | null;
          media_asset_id?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          chapter_id?: string;
          kind?: SectionKind;
          title?: string;
          sort_order?: number;
          review_status?: ReviewStatus;
          body_text?: string | null;
          transcript?: string | null;
          completion_message?: string | null;
          media_asset_id?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
      media_assets: {
        Row: {
          id: string;
          chapter_id: string | null;
          section_id: string | null;
          kind: MediaKind;
          storage_path: string | null;
          title: string | null;
          caption: string | null;
          alt_text: string | null;
          source_reference: string | null;
          duration_seconds: number | null;
          review_status: ReviewStatus;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          chapter_id?: string | null;
          section_id?: string | null;
          kind: MediaKind;
          storage_path?: string | null;
          title?: string | null;
          caption?: string | null;
          alt_text?: string | null;
          source_reference?: string | null;
          duration_seconds?: number | null;
          review_status?: ReviewStatus;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          chapter_id?: string | null;
          section_id?: string | null;
          kind?: MediaKind;
          storage_path?: string | null;
          title?: string | null;
          caption?: string | null;
          alt_text?: string | null;
          source_reference?: string | null;
          duration_seconds?: number | null;
          review_status?: ReviewStatus;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
      characters: {
        Row: {
          id: string;
          name: string;
          description: string | null;
          media_asset_id: string | null;
          review_status: ReviewStatus;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          name: string;
          description?: string | null;
          media_asset_id?: string | null;
          review_status?: ReviewStatus;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          name?: string;
          description?: string | null;
          media_asset_id?: string | null;
          review_status?: ReviewStatus;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
      chapter_characters: {
        Row: {
          chapter_id: string;
          character_id: string;
          sort_order: number;
        };
        Insert: {
          chapter_id: string;
          character_id: string;
          sort_order?: number;
        };
        Update: {
          chapter_id?: string;
          character_id?: string;
          sort_order?: number;
        };
        Relationships: [];
      };
      section_characters: {
        Row: {
          section_id: string;
          character_id: string;
          sort_order: number;
        };
        Insert: {
          section_id: string;
          character_id: string;
          sort_order?: number;
        };
        Update: {
          section_id?: string;
          character_id?: string;
          sort_order?: number;
        };
        Relationships: [];
      };
      learning_points: {
        Row: {
          id: string;
          chapter_id: string;
          title: string | null;
          description: string;
          sort_order: number;
          review_status: ReviewStatus;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          chapter_id: string;
          title?: string | null;
          description: string;
          sort_order?: number;
          review_status?: ReviewStatus;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          chapter_id?: string;
          title?: string | null;
          description?: string;
          sort_order?: number;
          review_status?: ReviewStatus;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
      section_learning_points: {
        Row: {
          section_id: string;
          learning_point_id: string;
          sort_order: number;
        };
        Insert: {
          section_id: string;
          learning_point_id: string;
          sort_order?: number;
        };
        Update: {
          section_id?: string;
          learning_point_id?: string;
          sort_order?: number;
        };
        Relationships: [];
      };
      assessments: {
        Row: {
          id: string;
          type: AssessmentType;
          title: string;
          instructions: string | null;
          review_status: ReviewStatus;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          type: AssessmentType;
          title: string;
          instructions?: string | null;
          review_status?: ReviewStatus;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          type?: AssessmentType;
          title?: string;
          instructions?: string | null;
          review_status?: ReviewStatus;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
      questions: {
        Row: {
          id: string;
          assessment_id: string;
          chapter_id: string | null;
          prompt: string;
          prompt_hiligaynon: string | null;
          explanation: string | null;
          explanation_hiligaynon: string | null;
          source_reference: string | null;
          sort_order: number;
          review_status: ReviewStatus;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          assessment_id: string;
          chapter_id?: string | null;
          prompt: string;
          prompt_hiligaynon?: string | null;
          explanation?: string | null;
          explanation_hiligaynon?: string | null;
          source_reference?: string | null;
          sort_order: number;
          review_status?: ReviewStatus;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          assessment_id?: string;
          chapter_id?: string | null;
          prompt?: string;
          prompt_hiligaynon?: string | null;
          explanation?: string | null;
          explanation_hiligaynon?: string | null;
          source_reference?: string | null;
          sort_order?: number;
          review_status?: ReviewStatus;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
      question_options: {
        Row: {
          id: string;
          question_id: string;
          label: string;
          label_hiligaynon: string | null;
          sort_order: number;
          is_correct: boolean;
          explanation: string | null;
        };
        Insert: {
          id?: string;
          question_id: string;
          label: string;
          label_hiligaynon?: string | null;
          sort_order: number;
          is_correct?: boolean;
          explanation?: string | null;
        };
        Update: {
          id?: string;
          question_id?: string;
          label?: string;
          label_hiligaynon?: string | null;
          sort_order?: number;
          is_correct?: boolean;
          explanation?: string | null;
        };
        Relationships: [];
      };
      learner_chapter_progress: {
        Row: {
          id: string;
          profile_id: string;
          chapter_id: string;
          current_section_id: string | null;
          started_at: string;
          completed_at: string | null;
          updated_at: string;
        };
        Insert: {
          id?: string;
          profile_id: string;
          chapter_id: string;
          current_section_id?: string | null;
          started_at?: string;
          completed_at?: string | null;
          updated_at?: string;
        };
        Update: {
          id?: string;
          profile_id?: string;
          chapter_id?: string;
          current_section_id?: string | null;
          started_at?: string;
          completed_at?: string | null;
          updated_at?: string;
        };
        Relationships: [];
      };
      assessment_attempts: {
        Row: {
          id: string;
          profile_id: string;
          assessment_id: string;
          score: number | null;
          started_at: string;
          completed_at: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          profile_id: string;
          assessment_id: string;
          score?: number | null;
          started_at?: string;
          completed_at?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          profile_id?: string;
          assessment_id?: string;
          score?: number | null;
          started_at?: string;
          completed_at?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
      assessment_answers: {
        Row: {
          id: string;
          attempt_id: string;
          question_id: string;
          selected_option_id: string | null;
        };
        Insert: {
          id?: string;
          attempt_id: string;
          question_id: string;
          selected_option_id?: string | null;
        };
        Update: {
          id?: string;
          attempt_id?: string;
          question_id?: string;
          selected_option_id?: string | null;
        };
        Relationships: [];
      };
    };
    Views: Record<string, never>;
    Functions: {
      is_admin: { Args: Record<string, never>; Returns: boolean };
      is_authenticated_user: { Args: Record<string, never>; Returns: boolean };
    };
    Enums: {
      review_status: ReviewStatus;
      user_role: UserRole;
      section_kind: SectionKind;
      media_kind: MediaKind;
      assessment_type: AssessmentType;
    };
    CompositeTypes: Record<string, never>;
  };
}

export type Tables<T extends keyof Database["public"]["Tables"]> =
  Database["public"]["Tables"][T]["Row"];

export type ChapterRow = Tables<"chapters">;
export type ChapterSectionRow = Tables<"chapter_sections">;
export type MediaAssetRow = Tables<"media_assets">;
export type CharacterRow = Tables<"characters">;
export type LearningPointRow = Tables<"learning_points">;
export type AssessmentRow = Tables<"assessments">;
export type QuestionRow = Tables<"questions">;
export type QuestionOptionRow = Tables<"question_options">;
export type LearnerChapterProgressRow = Tables<"learner_chapter_progress">;
