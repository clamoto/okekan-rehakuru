export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string
          full_name: string
          avatar_url: string | null
          part: string
          instruments_owned: string[]
          has_car: boolean
          teachers: string
          past_conductors: string[]
          is_pro: boolean
          bio: string
          stripe_customer_id: string | null
          stripe_connect_account_id: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id: string
          full_name: string
          avatar_url?: string | null
          part: string
          instruments_owned?: string[]
          has_car?: boolean
          teachers?: string
          past_conductors?: string[]
          is_pro?: boolean
          bio?: string
          stripe_customer_id?: string | null
          stripe_connect_account_id?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          full_name?: string
          avatar_url?: string | null
          part?: string
          instruments_owned?: string[]
          has_car?: boolean
          teachers?: string
          past_conductors?: string[]
          is_pro?: boolean
          bio?: string
          stripe_customer_id?: string | null
          stripe_connect_account_id?: string | null
          updated_at?: string
        }
      }
      groups: {
        Row: {
          id: string
          name: string
          group_type: 'orchestra' | 'wind_band' | 'chamber' | 'other'
          description: string
          logo_url: string | null
          owner_id: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          name: string
          group_type: 'orchestra' | 'wind_band' | 'chamber' | 'other'
          description?: string
          logo_url?: string | null
          owner_id: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          name?: string
          group_type?: 'orchestra' | 'wind_band' | 'chamber' | 'other'
          description?: string
          logo_url?: string | null
          owner_id?: string
          updated_at?: string
        }
      }
      group_members: {
        Row: {
          id: string
          group_id: string
          user_id: string
          role: 'owner' | 'admin' | 'member'
          part: string
          created_at: string
        }
        Insert: {
          id?: string
          group_id: string
          user_id: string
          role?: 'owner' | 'admin' | 'member'
          part: string
          created_at?: string
        }
        Update: {
          id?: string
          group_id?: string
          user_id?: string
          role?: 'owner' | 'admin' | 'member'
          part?: string
        }
      }
      schedules: {
        Row: {
          id: string
          group_id: string
          title: string
          event_type: 'practice' | 'performance' | 'section_practice' | 'other'
          start_time: string
          end_time: string
          location: string
          pieces: string[]
          score_urls: string[]
          recording_urls: string[]
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          group_id: string
          title: string
          event_type?: 'practice' | 'performance' | 'section_practice' | 'other'
          start_time: string
          end_time: string
          location?: string
          pieces?: string[]
          score_urls?: string[]
          recording_urls?: string[]
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          group_id?: string
          title?: string
          event_type?: 'practice' | 'performance' | 'section_practice' | 'other'
          start_time?: string
          end_time?: string
          location?: string
          pieces?: string[]
          score_urls?: string[]
          recording_urls?: string[]
          updated_at?: string
        }
      }
      attendances: {
        Row: {
          id: string
          schedule_id: string
          user_id: string
          status: 'attending' | 'absent' | 'late' | 'early_leave' | 'undecided'
          comment: string
          updated_at: string
        }
        Insert: {
          id?: string
          schedule_id: string
          user_id: string
          status?: 'attending' | 'absent' | 'late' | 'early_leave' | 'undecided'
          comment?: string
          updated_at?: string
        }
        Update: {
          id?: string
          schedule_id?: string
          user_id?: string
          status?: 'attending' | 'absent' | 'late' | 'early_leave' | 'undecided'
          comment?: string
          updated_at?: string
        }
      }
      offers: {
        Row: {
          id: string
          group_id: string
          schedule_id: string | null
          target_user_id: string
          part: string
          reward_amount: number
          status: 'pending' | 'accepted' | 'rejected' | 'escrow_paid' | 'completed' | 'cancelled'
          stripe_payment_intent_id: string | null
          receipt_url: string | null
          notes: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          group_id: string
          schedule_id?: string | null
          target_user_id: string
          part: string
          reward_amount: number
          status?: 'pending' | 'accepted' | 'rejected' | 'escrow_paid' | 'completed' | 'cancelled'
          stripe_payment_intent_id?: string | null
          receipt_url?: string | null
          notes?: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          group_id?: string
          schedule_id?: string | null
          target_user_id?: string
          part?: string
          reward_amount?: number
          status?: 'pending' | 'accepted' | 'rejected' | 'escrow_paid' | 'completed' | 'cancelled'
          stripe_payment_intent_id?: string | null
          receipt_url?: string | null
          notes?: string
          updated_at?: string
        }
      }
    }
    Functions: {
      calculate_compatibility_score: {
        Args: {
          p_user_id: string
          p_group_id: string
        }
        Returns: number
      }
    }
  }
}
