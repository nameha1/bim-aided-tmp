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
    PostgrestVersion: "13.0.5"
  }
  public: {
    Tables: {
      attendance: {
        Row: {
          admin_approved: boolean | null
          admin_approved_at: string | null
          admin_approved_by: string | null
          approved_by: string | null
          check_in_time: string | null
          check_out_time: string | null
          created_at: string | null
          date: string
          employee_id: string
          id: string
          leave_reason: string | null
          leave_type: Database["public"]["Enums"]["leave_type"] | null
          status: Database["public"]["Enums"]["attendance_status"]
          supervisor_approved: boolean | null
          supervisor_approved_at: string | null
          supervisor_approved_by: string | null
          total_hours: number | null
          updated_at: string | null
        }
        Insert: {
          admin_approved?: boolean | null
          admin_approved_at?: string | null
          admin_approved_by?: string | null
          approved_by?: string | null
          check_in_time?: string | null
          check_out_time?: string | null
          created_at?: string | null
          date: string
          employee_id: string
          id?: string
          leave_reason?: string | null
          leave_type?: Database["public"]["Enums"]["leave_type"] | null
          status: Database["public"]["Enums"]["attendance_status"]
          supervisor_approved?: boolean | null
          supervisor_approved_at?: string | null
          supervisor_approved_by?: string | null
          total_hours?: number | null
          updated_at?: string | null
        }
        Update: {
          admin_approved?: boolean | null
          admin_approved_at?: string | null
          admin_approved_by?: string | null
          approved_by?: string | null
          check_in_time?: string | null
          check_out_time?: string | null
          created_at?: string | null
          date?: string
          employee_id?: string
          id?: string
          leave_reason?: string | null
          leave_type?: Database["public"]["Enums"]["leave_type"] | null
          status?: Database["public"]["Enums"]["attendance_status"]
          supervisor_approved?: boolean | null
          supervisor_approved_at?: string | null
          supervisor_approved_by?: string | null
          total_hours?: number | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "attendance_admin_approved_by_fkey"
            columns: ["admin_approved_by"]
            isOneToOne: false
            referencedRelation: "employees"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "attendance_approved_by_fkey"
            columns: ["approved_by"]
            isOneToOne: false
            referencedRelation: "employees"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "attendance_employee_id_fkey"
            columns: ["employee_id"]
            isOneToOne: false
            referencedRelation: "employees"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "attendance_supervisor_approved_by_fkey"
            columns: ["supervisor_approved_by"]
            isOneToOne: false
            referencedRelation: "employees"
            referencedColumns: ["id"]
          },
        ]
      }
      career_postings: {
        Row: {
          closing_date: string | null
          created_at: string | null
          department_id: string | null
          description: string
          employment_type: string
          id: string
          location: string
          posted_date: string | null
          published: boolean | null
          requirements: string | null
          responsibilities: string | null
          title: string
          updated_at: string | null
        }
        Insert: {
          closing_date?: string | null
          created_at?: string | null
          department_id?: string | null
          description: string
          employment_type: string
          id?: string
          location: string
          posted_date?: string | null
          published?: boolean | null
          requirements?: string | null
          responsibilities?: string | null
          title: string
          updated_at?: string | null
        }
        Update: {
          closing_date?: string | null
          created_at?: string | null
          department_id?: string | null
          description?: string
          employment_type?: string
          id?: string
          location?: string
          posted_date?: string | null
          published?: boolean | null
          requirements?: string | null
          responsibilities?: string | null
          title?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "career_postings_department_id_fkey"
            columns: ["department_id"]
            isOneToOne: false
            referencedRelation: "departments"
            referencedColumns: ["id"]
          },
        ]
      }
      departments: {
        Row: {
          created_at: string | null
          description: string | null
          id: string
          manager_id: string | null
          name: string
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          description?: string | null
          id?: string
          manager_id?: string | null
          name: string
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          description?: string | null
          id?: string
          manager_id?: string | null
          name?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "fk_manager"
            columns: ["manager_id"]
            isOneToOne: false
            referencedRelation: "employees"
            referencedColumns: ["id"]
          },
        ]
      }
      designations: {
        Row: {
          created_at: string | null
          department_id: string | null
          id: string
          level: string | null
          name: string
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          department_id?: string | null
          id?: string
          level?: string | null
          name: string
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          department_id?: string | null
          id?: string
          level?: string | null
          name?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "designations_department_id_fkey"
            columns: ["department_id"]
            isOneToOne: false
            referencedRelation: "departments"
            referencedColumns: ["id"]
          },
        ]
      }
      documents: {
        Row: {
          created_at: string | null
          document_type: string
          employee_id: string
          expiry_date: string | null
          file_url: string
          id: string
          uploaded_on: string | null
        }
        Insert: {
          created_at?: string | null
          document_type: string
          employee_id: string
          expiry_date?: string | null
          file_url: string
          id?: string
          uploaded_on?: string | null
        }
        Update: {
          created_at?: string | null
          document_type?: string
          employee_id?: string
          expiry_date?: string | null
          file_url?: string
          id?: string
          uploaded_on?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "documents_employee_id_fkey"
            columns: ["employee_id"]
            isOneToOne: false
            referencedRelation: "employees"
            referencedColumns: ["id"]
          },
        ]
      }
      emergency_contacts: {
        Row: {
          address: string | null
          contact_name: string
          created_at: string | null
          employee_id: string
          id: string
          phone: string
          relationship: string
          updated_at: string | null
        }
        Insert: {
          address?: string | null
          contact_name: string
          created_at?: string | null
          employee_id: string
          id?: string
          phone: string
          relationship: string
          updated_at?: string | null
        }
        Update: {
          address?: string | null
          contact_name?: string
          created_at?: string | null
          employee_id?: string
          id?: string
          phone?: string
          relationship?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "emergency_contacts_employee_id_fkey"
            columns: ["employee_id"]
            isOneToOne: false
            referencedRelation: "employees"
            referencedColumns: ["id"]
          },
        ]
      }
      employees: {
        Row: {
          address: string | null
          created_at: string | null
          date_of_birth: string | null
          department_id: string | null
          designation_id: string | null
          email: string
          employment_status:
            | Database["public"]["Enums"]["employment_status"]
            | null
          first_name: string
          gender: Database["public"]["Enums"]["gender_type"] | null
          id: string
          joining_date: string
          last_name: string
          national_id: string | null
          phone_number: string | null
          profile_photo: string | null
          remarks: string | null
          supervisor_id: string | null
          updated_at: string | null
          user_id: string | null
        }
        Insert: {
          address?: string | null
          created_at?: string | null
          date_of_birth?: string | null
          department_id?: string | null
          designation_id?: string | null
          email: string
          employment_status?:
            | Database["public"]["Enums"]["employment_status"]
            | null
          first_name: string
          gender?: Database["public"]["Enums"]["gender_type"] | null
          id?: string
          joining_date?: string
          last_name: string
          national_id?: string | null
          phone_number?: string | null
          profile_photo?: string | null
          remarks?: string | null
          supervisor_id?: string | null
          updated_at?: string | null
          user_id?: string | null
        }
        Update: {
          address?: string | null
          created_at?: string | null
          date_of_birth?: string | null
          department_id?: string | null
          designation_id?: string | null
          email?: string
          employment_status?:
            | Database["public"]["Enums"]["employment_status"]
            | null
          first_name?: string
          gender?: Database["public"]["Enums"]["gender_type"] | null
          id?: string
          joining_date?: string
          last_name?: string
          national_id?: string | null
          phone_number?: string | null
          profile_photo?: string | null
          remarks?: string | null
          supervisor_id?: string | null
          updated_at?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "employees_department_id_fkey"
            columns: ["department_id"]
            isOneToOne: false
            referencedRelation: "departments"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "employees_designation_id_fkey"
            columns: ["designation_id"]
            isOneToOne: false
            referencedRelation: "designations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "employees_supervisor_id_fkey"
            columns: ["supervisor_id"]
            isOneToOne: false
            referencedRelation: "employees"
            referencedColumns: ["id"]
          },
        ]
      }
      leave_balances: {
        Row: {
          annual_leave_total: number | null
          annual_leave_used: number | null
          casual_leave_total: number | null
          casual_leave_used: number | null
          created_at: string | null
          employee_id: string
          id: string
          sick_leave_total: number | null
          sick_leave_used: number | null
          updated_at: string | null
          year: number
        }
        Insert: {
          annual_leave_total?: number | null
          annual_leave_used?: number | null
          casual_leave_total?: number | null
          casual_leave_used?: number | null
          created_at?: string | null
          employee_id: string
          id?: string
          sick_leave_total?: number | null
          sick_leave_used?: number | null
          updated_at?: string | null
          year: number
        }
        Update: {
          annual_leave_total?: number | null
          annual_leave_used?: number | null
          casual_leave_total?: number | null
          casual_leave_used?: number | null
          created_at?: string | null
          employee_id?: string
          id?: string
          sick_leave_total?: number | null
          sick_leave_used?: number | null
          updated_at?: string | null
          year?: number
        }
        Relationships: [
          {
            foreignKeyName: "leave_balances_employee_id_fkey"
            columns: ["employee_id"]
            isOneToOne: false
            referencedRelation: "employees"
            referencedColumns: ["id"]
          },
        ]
      }
      project_assignments: {
        Row: {
          created_at: string | null
          employee_id: string
          end_date: string | null
          id: string
          project_name: string
          role: string
          start_date: string
          status: Database["public"]["Enums"]["assignment_status"] | null
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          employee_id: string
          end_date?: string | null
          id?: string
          project_name: string
          role: string
          start_date: string
          status?: Database["public"]["Enums"]["assignment_status"] | null
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          employee_id?: string
          end_date?: string | null
          id?: string
          project_name?: string
          role?: string
          start_date?: string
          status?: Database["public"]["Enums"]["assignment_status"] | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "project_assignments_employee_id_fkey"
            columns: ["employee_id"]
            isOneToOne: false
            referencedRelation: "employees"
            referencedColumns: ["id"]
          },
        ]
      }
      projects: {
        Row: {
          category: Database["public"]["Enums"]["project_category"]
          client_name: string | null
          completion_date: string | null
          created_at: string | null
          description: string
          id: string
          image_url: string | null
          project_value: number | null
          published: boolean | null
          title: string
          updated_at: string | null
        }
        Insert: {
          category: Database["public"]["Enums"]["project_category"]
          client_name?: string | null
          completion_date?: string | null
          created_at?: string | null
          description: string
          id?: string
          image_url?: string | null
          project_value?: number | null
          published?: boolean | null
          title: string
          updated_at?: string | null
        }
        Update: {
          category?: Database["public"]["Enums"]["project_category"]
          client_name?: string | null
          completion_date?: string | null
          created_at?: string | null
          description?: string
          id?: string
          image_url?: string | null
          project_value?: number | null
          published?: boolean | null
          title?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      salaries: {
        Row: {
          allowances: number | null
          basic_salary: number
          created_at: string | null
          deductions: number | null
          effective_from: string
          effective_to: string | null
          employee_id: string
          id: string
          net_salary: number | null
          pay_frequency: string | null
          updated_at: string | null
        }
        Insert: {
          allowances?: number | null
          basic_salary: number
          created_at?: string | null
          deductions?: number | null
          effective_from: string
          effective_to?: string | null
          employee_id: string
          id?: string
          net_salary?: number | null
          pay_frequency?: string | null
          updated_at?: string | null
        }
        Update: {
          allowances?: number | null
          basic_salary?: number
          created_at?: string | null
          deductions?: number | null
          effective_from?: string
          effective_to?: string | null
          employee_id?: string
          id?: string
          net_salary?: number | null
          pay_frequency?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "salaries_employee_id_fkey"
            columns: ["employee_id"]
            isOneToOne: false
            referencedRelation: "employees"
            referencedColumns: ["id"]
          },
        ]
      }
      user_roles: {
        Row: {
          created_at: string | null
          id: string
          role: Database["public"]["Enums"]["user_role"]
          user_id: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          role: Database["public"]["Enums"]["user_role"]
          user_id: string
        }
        Update: {
          created_at?: string | null
          id?: string
          role?: Database["public"]["Enums"]["user_role"]
          user_id?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["user_role"]
          _user_id: string
        }
        Returns: boolean
      }
    }
    Enums: {
      assignment_status: "Active" | "Completed"
      attendance_status: "Present" | "Absent" | "Leave" | "Late"
      employment_status: "Active" | "On Leave" | "Resigned" | "Terminated"
      gender_type: "Male" | "Female" | "Other"
      leave_type:
        | "Sick Leave"
        | "Casual Leave"
        | "Hourly Leave"
        | "Half Day Leave"
        | "Full Day Leave"
        | "Earned Leave"
        | "Paid Leave"
        | "Unpaid Leave"
        | "Maternity Leave"
        | "Other Leave"
      project_category:
        | "Commercial"
        | "Education & Healthcare"
        | "Cultural & Sports"
        | "Residential"
        | "Infrastructure & Municipal"
        | "Industrial & Park"
      user_role: "Admin" | "Employee"
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
    Enums: {
      assignment_status: ["Active", "Completed"],
      attendance_status: ["Present", "Absent", "Leave", "Late"],
      employment_status: ["Active", "On Leave", "Resigned", "Terminated"],
      gender_type: ["Male", "Female", "Other"],
      leave_type: [
        "Sick Leave",
        "Casual Leave",
        "Hourly Leave",
        "Half Day Leave",
        "Full Day Leave",
        "Earned Leave",
        "Paid Leave",
        "Unpaid Leave",
        "Maternity Leave",
        "Other Leave",
      ],
      project_category: [
        "Commercial",
        "Education & Healthcare",
        "Cultural & Sports",
        "Residential",
        "Infrastructure & Municipal",
        "Industrial & Park",
      ],
      user_role: ["Admin", "Employee"],
    },
  },
} as const
