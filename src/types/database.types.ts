export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "14.5"
  }
  public: {
    Tables: {
      admin_notifications: {
        Row: {
          body: string | null
          created_at: string
          event_id: string
          href: string | null
          id: number
          is_read: boolean
          metadata: Json
          read_at: string | null
          recipient_profile_id: string
          title: string
          type: string
        }
        Insert: {
          body?: string | null
          created_at?: string
          event_id: string
          href?: string | null
          id?: never
          is_read?: boolean
          metadata?: Json
          read_at?: string | null
          recipient_profile_id: string
          title: string
          type: string
        }
        Update: {
          body?: string | null
          created_at?: string
          event_id?: string
          href?: string | null
          id?: never
          is_read?: boolean
          metadata?: Json
          read_at?: string | null
          recipient_profile_id?: string
          title?: string
          type?: string
        }
        Relationships: [
          {
            foreignKeyName: "admin_notifications_event_id_fkey"
            columns: ["event_id"]
            isOneToOne: false
            referencedRelation: "notification_events"
            referencedColumns: ["event_id"]
          },
          {
            foreignKeyName: "admin_notifications_recipient_profile_id_fkey"
            columns: ["recipient_profile_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      appointments: {
        Row: {
          assigned_staff_id: string | null
          created_at: string
          deleted_at: string | null
          description: string | null
          end_time: string
          id: string
          is_blockout: boolean | null
          lead_id: string | null
          location_geo: unknown
          start_time: string
          status: string | null
          title: string
          updated_at: string
        }
        Insert: {
          assigned_staff_id?: string | null
          created_at?: string
          deleted_at?: string | null
          description?: string | null
          end_time: string
          id?: string
          is_blockout?: boolean | null
          lead_id?: string | null
          location_geo?: unknown
          start_time: string
          status?: string | null
          title: string
          updated_at?: string
        }
        Update: {
          assigned_staff_id?: string | null
          created_at?: string
          deleted_at?: string | null
          description?: string | null
          end_time?: string
          id?: string
          is_blockout?: boolean | null
          lead_id?: string | null
          location_geo?: unknown
          start_time?: string
          status?: string | null
          title?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "appointments_assigned_staff_id_fkey"
            columns: ["assigned_staff_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "appointments_lead_id_fkey"
            columns: ["lead_id"]
            isOneToOne: false
            referencedRelation: "leads"
            referencedColumns: ["id"]
          },
        ]
      }
      audit_logs: {
        Row: {
          action: string
          created_at: string
          id: number
          ip_address: string | null
          new_data: Json | null
          old_data: Json | null
          record_id: string | null
          table_name: string
          user_agent: string | null
          user_id: string | null
        }
        Insert: {
          action: string
          created_at?: string
          id?: never
          ip_address?: string | null
          new_data?: Json | null
          old_data?: Json | null
          record_id?: string | null
          table_name: string
          user_agent?: string | null
          user_id?: string | null
        }
        Update: {
          action?: string
          created_at?: string
          id?: never
          ip_address?: string | null
          new_data?: Json | null
          old_data?: Json | null
          record_id?: string | null
          table_name?: string
          user_agent?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "audit_logs_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      blog_categories: {
        Row: {
          created_at: string
          id: number
          name: string
          slug: string
        }
        Insert: {
          created_at?: string
          id?: never
          name: string
          slug: string
        }
        Update: {
          created_at?: string
          id?: never
          name?: string
          slug?: string
        }
        Relationships: []
      }
      blog_posts: {
        Row: {
          author_name: string
          body: string | null
          category_id: number | null
          cover_alt: string | null
          cover_image_url: string | null
          created_at: string
          excerpt: string | null
          id: number
          published_at: string | null
          slug: string
          status: string
          tags: string[]
          title: string
          updated_at: string
          view_count: number
        }
        Insert: {
          author_name?: string
          body?: string | null
          category_id?: number | null
          cover_alt?: string | null
          cover_image_url?: string | null
          created_at?: string
          excerpt?: string | null
          id?: never
          published_at?: string | null
          slug: string
          status?: string
          tags?: string[]
          title: string
          updated_at?: string
          view_count?: number
        }
        Update: {
          author_name?: string
          body?: string | null
          category_id?: number | null
          cover_alt?: string | null
          cover_image_url?: string | null
          created_at?: string
          excerpt?: string | null
          id?: never
          published_at?: string | null
          slug?: string
          status?: string
          tags?: string[]
          title?: string
          updated_at?: string
          view_count?: number
        }
        Relationships: [
          {
            foreignKeyName: "blog_posts_category_id_fkey"
            columns: ["category_id"]
            isOneToOne: false
            referencedRelation: "blog_categories"
            referencedColumns: ["id"]
          },
        ]
      }
      business_settings: {
        Row: {
          address: string | null
          created_at: string
          email: string | null
          id: number
          metadata: Json
          phone: string | null
          updated_at: string
        }
        Insert: {
          address?: string | null
          created_at?: string
          email?: string | null
          id?: number
          metadata?: Json
          phone?: string | null
          updated_at?: string
        }
        Update: {
          address?: string | null
          created_at?: string
          email?: string | null
          id?: number
          metadata?: Json
          phone?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      case_studies: {
        Row: {
          body: string | null
          client_name: string | null
          cover_image_url: string | null
          created_at: string
          id: number
          location: string | null
          outcome: string | null
          published: boolean
          service_id: number
          slug: string
          sort_order: number
          summary: string | null
          tags: string[]
          title: string
          updated_at: string
        }
        Insert: {
          body?: string | null
          client_name?: string | null
          cover_image_url?: string | null
          created_at?: string
          id?: never
          location?: string | null
          outcome?: string | null
          published?: boolean
          service_id: number
          slug: string
          sort_order?: number
          summary?: string | null
          tags?: string[]
          title: string
          updated_at?: string
        }
        Update: {
          body?: string | null
          client_name?: string | null
          cover_image_url?: string | null
          created_at?: string
          id?: never
          location?: string | null
          outcome?: string | null
          published?: boolean
          service_id?: number
          slug?: string
          sort_order?: number
          summary?: string | null
          tags?: string[]
          title?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "case_studies_service_id_fkey"
            columns: ["service_id"]
            isOneToOne: false
            referencedRelation: "services"
            referencedColumns: ["id"]
          },
        ]
      }
      case_study_media: {
        Row: {
          caption: string | null
          case_study_id: number
          created_at: string
          id: number
          is_cover: boolean
          media_type: string
          sort_order: number
          url: string
        }
        Insert: {
          caption?: string | null
          case_study_id: number
          created_at?: string
          id?: never
          is_cover?: boolean
          media_type: string
          sort_order?: number
          url: string
        }
        Update: {
          caption?: string | null
          case_study_id?: number
          created_at?: string
          id?: never
          is_cover?: boolean
          media_type?: string
          sort_order?: number
          url?: string
        }
        Relationships: [
          {
            foreignKeyName: "case_study_media_case_study_id_fkey"
            columns: ["case_study_id"]
            isOneToOne: false
            referencedRelation: "case_studies"
            referencedColumns: ["id"]
          },
        ]
      }
      categories: {
        Row: {
          created_at: string
          description: string | null
          id: number
          name: string
          slug: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          id?: never
          name: string
          slug: string
        }
        Update: {
          created_at?: string
          description?: string | null
          id?: never
          name?: string
          slug?: string
        }
        Relationships: []
      }
      customers: {
        Row: {
          address: string | null
          created_at: string
          email: string | null
          full_name: string
          id: string
          metadata: Json | null
          phone: string | null
          updated_at: string
        }
        Insert: {
          address?: string | null
          created_at?: string
          email?: string | null
          full_name: string
          id?: string
          metadata?: Json | null
          phone?: string | null
          updated_at?: string
        }
        Update: {
          address?: string | null
          created_at?: string
          email?: string | null
          full_name?: string
          id?: string
          metadata?: Json | null
          phone?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      leads: {
        Row: {
          created_at: string
          customer_id: string | null
          id: string
          inquiry_details: string | null
          metadata: Json | null
          preferred_end_time: string | null
          preferred_start_time: string | null
          referral_partner_id: string | null
          service_id: number | null
          site_location: string | null
          site_location_geo: unknown
          source: string | null
          status: string | null
          updated_at: string
        }
        Insert: {
          created_at?: string
          customer_id?: string | null
          id?: string
          inquiry_details?: string | null
          metadata?: Json | null
          preferred_end_time?: string | null
          preferred_start_time?: string | null
          referral_partner_id?: string | null
          service_id?: number | null
          site_location?: string | null
          site_location_geo?: unknown
          source?: string | null
          status?: string | null
          updated_at?: string
        }
        Update: {
          created_at?: string
          customer_id?: string | null
          id?: string
          inquiry_details?: string | null
          metadata?: Json | null
          preferred_end_time?: string | null
          preferred_start_time?: string | null
          referral_partner_id?: string | null
          service_id?: number | null
          site_location?: string | null
          site_location_geo?: unknown
          source?: string | null
          status?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "leads_customer_id_fkey"
            columns: ["customer_id"]
            isOneToOne: false
            referencedRelation: "customers"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "leads_referral_partner_id_fkey"
            columns: ["referral_partner_id"]
            isOneToOne: false
            referencedRelation: "referral_partners"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "leads_service_id_fkey"
            columns: ["service_id"]
            isOneToOne: false
            referencedRelation: "services"
            referencedColumns: ["id"]
          },
        ]
      }
      notification_deliveries: {
        Row: {
          attempt_count: number
          channel: string
          created_at: string
          event_id: string
          id: number
          idempotency_key: string
          last_attempt_at: string | null
          last_error: string | null
          max_attempts: number
          next_retry_at: string | null
          provider: string | null
          provider_message_id: string | null
          recipient_key: string
          retryable: boolean
          sent_at: string | null
          status: string
        }
        Insert: {
          attempt_count?: number
          channel: string
          created_at?: string
          event_id: string
          id?: never
          idempotency_key: string
          last_attempt_at?: string | null
          last_error?: string | null
          max_attempts?: number
          next_retry_at?: string | null
          provider?: string | null
          provider_message_id?: string | null
          recipient_key: string
          retryable?: boolean
          sent_at?: string | null
          status: string
        }
        Update: {
          attempt_count?: number
          channel?: string
          created_at?: string
          event_id?: string
          id?: never
          idempotency_key?: string
          last_attempt_at?: string | null
          last_error?: string | null
          max_attempts?: number
          next_retry_at?: string | null
          provider?: string | null
          provider_message_id?: string | null
          recipient_key?: string
          retryable?: boolean
          sent_at?: string | null
          status?: string
        }
        Relationships: [
          {
            foreignKeyName: "notification_deliveries_event_id_fkey"
            columns: ["event_id"]
            isOneToOne: false
            referencedRelation: "notification_events"
            referencedColumns: ["event_id"]
          },
        ]
      }
      notification_events: {
        Row: {
          actor_id: string | null
          aggregate_id: string
          created_at: string
          event_id: string
          event_type: string
          id: number
          occurred_at: string
          payload: Json
          source: string
          source_event_key: string | null
        }
        Insert: {
          actor_id?: string | null
          aggregate_id: string
          created_at?: string
          event_id: string
          event_type: string
          id?: never
          occurred_at: string
          payload?: Json
          source: string
          source_event_key?: string | null
        }
        Update: {
          actor_id?: string | null
          aggregate_id?: string
          created_at?: string
          event_id?: string
          event_type?: string
          id?: never
          occurred_at?: string
          payload?: Json
          source?: string
          source_event_key?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "notification_events_actor_id_fkey"
            columns: ["actor_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      posts: {
        Row: {
          author_id: string | null
          category_id: number | null
          content: string
          created_at: string
          deleted_at: string | null
          excerpt: string | null
          featured_image: string | null
          id: string
          is_published: boolean | null
          metadata: Json | null
          published_at: string | null
          seo_description: string | null
          seo_title: string | null
          slug: string
          title: string
          updated_at: string
        }
        Insert: {
          author_id?: string | null
          category_id?: number | null
          content: string
          created_at?: string
          deleted_at?: string | null
          excerpt?: string | null
          featured_image?: string | null
          id?: string
          is_published?: boolean | null
          metadata?: Json | null
          published_at?: string | null
          seo_description?: string | null
          seo_title?: string | null
          slug: string
          title: string
          updated_at?: string
        }
        Update: {
          author_id?: string | null
          category_id?: number | null
          content?: string
          created_at?: string
          deleted_at?: string | null
          excerpt?: string | null
          featured_image?: string | null
          id?: string
          is_published?: boolean | null
          metadata?: Json | null
          published_at?: string | null
          seo_description?: string | null
          seo_title?: string | null
          slug?: string
          title?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "posts_author_id_fkey"
            columns: ["author_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "posts_category_id_fkey"
            columns: ["category_id"]
            isOneToOne: false
            referencedRelation: "categories"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          avatar_url: string | null
          bio: string | null
          created_at: string
          deleted_at: string | null
          full_name: string
          id: string
          metadata: Json | null
          role: string | null
          updated_at: string
        }
        Insert: {
          avatar_url?: string | null
          bio?: string | null
          created_at?: string
          deleted_at?: string | null
          full_name: string
          id: string
          metadata?: Json | null
          role?: string | null
          updated_at?: string
        }
        Update: {
          avatar_url?: string | null
          bio?: string | null
          created_at?: string
          deleted_at?: string | null
          full_name?: string
          id?: string
          metadata?: Json | null
          role?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      referral_partners: {
        Row: {
          commission_rate_bps: number | null
          company: string | null
          created_at: string
          deleted_at: string | null
          email: string
          id: string
          metadata: Json | null
          name: string
          phone: string | null
          referral_code: string
          status: string | null
          updated_at: string
        }
        Insert: {
          commission_rate_bps?: number | null
          company?: string | null
          created_at?: string
          deleted_at?: string | null
          email: string
          id?: string
          metadata?: Json | null
          name: string
          phone?: string | null
          referral_code: string
          status?: string | null
          updated_at?: string
        }
        Update: {
          commission_rate_bps?: number | null
          company?: string | null
          created_at?: string
          deleted_at?: string | null
          email?: string
          id?: string
          metadata?: Json | null
          name?: string
          phone?: string | null
          referral_code?: string
          status?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      referral_payouts: {
        Row: {
          amount_cents: number
          created_at: string
          id: string
          lead_id: string
          notes: string | null
          paid_at: string | null
          partner_id: string
          status: string | null
        }
        Insert: {
          amount_cents: number
          created_at?: string
          id?: string
          lead_id: string
          notes?: string | null
          paid_at?: string | null
          partner_id: string
          status?: string | null
        }
        Update: {
          amount_cents?: number
          created_at?: string
          id?: string
          lead_id?: string
          notes?: string | null
          paid_at?: string | null
          partner_id?: string
          status?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "referral_payouts_lead_id_fkey"
            columns: ["lead_id"]
            isOneToOne: false
            referencedRelation: "leads"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "referral_payouts_partner_id_fkey"
            columns: ["partner_id"]
            isOneToOne: false
            referencedRelation: "referral_partners"
            referencedColumns: ["id"]
          },
        ]
      }
      scheduler_settings: {
        Row: {
          booking_horizon_days: number
          buffer_minutes: number
          id: number
          slot_duration_minutes: number
          timezone: string
          updated_at: string
          weekly_hours: Json
        }
        Insert: {
          booking_horizon_days?: number
          buffer_minutes?: number
          id?: number
          slot_duration_minutes?: number
          timezone?: string
          updated_at?: string
          weekly_hours?: Json
        }
        Update: {
          booking_horizon_days?: number
          buffer_minutes?: number
          id?: number
          slot_duration_minutes?: number
          timezone?: string
          updated_at?: string
          weekly_hours?: Json
        }
        Relationships: []
      }
      service_pages: {
        Row: {
          hero_image_url: string | null
          overview: string | null
          process_steps: Json
          published: boolean
          service_id: number
          tagline: string | null
          updated_at: string
        }
        Insert: {
          hero_image_url?: string | null
          overview?: string | null
          process_steps?: Json
          published?: boolean
          service_id: number
          tagline?: string | null
          updated_at?: string
        }
        Update: {
          hero_image_url?: string | null
          overview?: string | null
          process_steps?: Json
          published?: boolean
          service_id?: number
          tagline?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "service_pages_service_id_fkey"
            columns: ["service_id"]
            isOneToOne: true
            referencedRelation: "services"
            referencedColumns: ["id"]
          },
        ]
      }
      services: {
        Row: {
          base_price_cents: number | null
          created_at: string
          deleted_at: string | null
          description: string | null
          duration_estimate_hours: number | null
          features: string[] | null
          id: number
          is_active: boolean | null
          metadata: Json | null
          name: string
          slug: string
          sort_order: number | null
          updated_at: string
        }
        Insert: {
          base_price_cents?: number | null
          created_at?: string
          deleted_at?: string | null
          description?: string | null
          duration_estimate_hours?: number | null
          features?: string[] | null
          id?: never
          is_active?: boolean | null
          metadata?: Json | null
          name: string
          slug: string
          sort_order?: number | null
          updated_at?: string
        }
        Update: {
          base_price_cents?: number | null
          created_at?: string
          deleted_at?: string | null
          description?: string | null
          duration_estimate_hours?: number | null
          features?: string[] | null
          id?: never
          is_active?: boolean | null
          metadata?: Json | null
          name?: string
          slug?: string
          sort_order?: number | null
          updated_at?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      create_booking_request:
        | {
            Args: {
              p_email: string
              p_full_name: string
              p_inquiry_details?: string
              p_phone: string
              p_preferred_end: string
              p_preferred_start: string
              p_referral_code?: string
              p_service_id: number
              p_site_location: string
            }
            Returns: string
          }
        | {
            Args: {
              p_email: string
              p_full_name: string
              p_inquiry_details?: string
              p_phone: string
              p_preferred_end: string
              p_preferred_start: string
              p_referral_code?: string
              p_service_id: number
              p_site_lat: number
              p_site_lng: number
              p_site_location: string
            }
            Returns: string
          }
      get_available_slots: {
        Args: { p_date: string }
        Returns: {
          slot_end: string
          slot_start: string
        }[]
      }
      increment_blog_view_count: {
        Args: { post_id: number }
        Returns: undefined
      }
      is_admin: { Args: never; Returns: boolean }
      is_super_admin: { Args: never; Returns: boolean }
      time_to_minutes: { Args: { p_time: string }; Returns: number }
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {},
  },
} as const
