export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export interface Database {
  public: {
    Tables: {
      beneficiaries: {
        Row: {
          id: string;
          name: string;
          category: string;
          email: string | null;
          phone: string | null;
          address: string | null;
          notes: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          name: string;
          category: string;
          email?: string | null;
          phone?: string | null;
          address?: string | null;
          notes?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          name?: string;
          category?: string;
          email?: string | null;
          phone?: string | null;
          address?: string | null;
          notes?: string | null;
          created_at?: string;
          updated_at?: string;
        };
      };
      givers: {
        Row: {
          id: string;
          name: string;
          email: string | null;
          phone: string | null;
          address: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          name: string;
          email?: string | null;
          phone?: string | null;
          address?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          name?: string;
          email?: string | null;
          phone?: string | null;
          address?: string | null;
          created_at?: string;
          updated_at?: string;
        };
      };
      mosque_admins: {
        Row: {
          id: string;
          user_id: string;
          mosque_id: string;
          role: string;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          mosque_id: string;
          role: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          mosque_id?: string;
          role?: string;
          created_at?: string;
          updated_at?: string;
        };
      };
      mosques: {
        Row: {
          id: string;
          name: string;
          address: string | null;
          city: string | null;
          state: string | null;
          zip: string | null;
          phone: string | null;
          email: string | null;
          website: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          name: string;
          address?: string | null;
          city?: string | null;
          state?: string | null;
          zip?: string | null;
          phone?: string | null;
          email?: string | null;
          website?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          name?: string;
          address?: string | null;
          city?: string | null;
          state?: string | null;
          zip?: string | null;
          phone?: string | null;
          email?: string | null;
          website?: string | null;
          created_at?: string;
          updated_at?: string;
        };
      };
      users: {
        Row: {
          avatar_url: string | null;
          created_at: string;
          credits: string | null;
          email: string | null;
          full_name: string | null;
          id: string;
          image: string | null;
          name: string | null;
          subscription: string | null;
          token_identifier: string;
          updated_at: string | null;
          user_id: string | null;
        };
        Insert: {
          avatar_url?: string | null;
          created_at?: string;
          credits?: string | null;
          email?: string | null;
          full_name?: string | null;
          id: string;
          image?: string | null;
          name?: string | null;
          subscription?: string | null;
          token_identifier: string;
          updated_at?: string | null;
          user_id?: string | null;
        };
        Update: {
          avatar_url?: string | null;
          created_at?: string;
          credits?: string | null;
          email?: string | null;
          full_name?: string | null;
          id?: string;
          image?: string | null;
          name?: string | null;
          subscription?: string | null;
          token_identifier?: string;
          updated_at?: string | null;
          user_id?: string | null;
        };
      };
      zakat_collections: {
        Row: {
          id: string;
          mosque_id: string;
          giver_id: string | null;
          amount: number;
          type: string;
          description: string | null;
          collected_by: string | null;
          collection_date: string;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          mosque_id: string;
          giver_id?: string | null;
          amount: number;
          type: string;
          description?: string | null;
          collected_by?: string | null;
          collection_date?: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          mosque_id?: string;
          giver_id?: string | null;
          amount?: number;
          type?: string;
          description?: string | null;
          collected_by?: string | null;
          collection_date?: string;
          created_at?: string;
          updated_at?: string;
        };
      };
      zakat_distributions: {
        Row: {
          id: string;
          mosque_id: string;
          beneficiary_id: string;
          amount: number;
          type: string;
          description: string | null;
          distributed_by: string | null;
          distribution_date: string;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          mosque_id: string;
          beneficiary_id: string;
          amount: number;
          type: string;
          description?: string | null;
          distributed_by?: string | null;
          distribution_date?: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          mosque_id?: string;
          beneficiary_id?: string;
          amount?: number;
          type?: string;
          description?: string | null;
          distributed_by?: string | null;
          distribution_date?: string;
          created_at?: string;
          updated_at?: string;
        };
      };
    };
  };
}

export type Tables<T extends keyof Database["public"]["Tables"]> =
  Database["public"]["Tables"][T]["Row"];
export type InsertTables<T extends keyof Database["public"]["Tables"]> =
  Database["public"]["Tables"][T]["Insert"];
export type UpdateTables<T extends keyof Database["public"]["Tables"]> =
  Database["public"]["Tables"][T]["Update"];
