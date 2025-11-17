export interface Client {
  id: string;
  client_name: string;
  company_name: string;
  email: string;
  phone: string;
  address: string;
  city: string;
  state: string;
  zip_code: string;
  country: string;
  tax_id: string;
  industry: string;
  status: "active" | "inactive" | "potential";
  notes: string | null;
  created_at: string;
  updated_at: string;
}

export interface ClientWork {
  id: string;
  client_id: string | null; // Can be null if using manual client name
  client_name_manual: string | null; // For manually entered client names
  project_name: string;
  project_type: string;
  start_date: string;
  end_date: string | null;
  status: "planning" | "in-progress" | "completed" | "on-hold" | "cancelled";
  budget: number;
  currency: string;
  description: string | null;
  supervisor_id: string | null; // Employee ID of supervisor
  supervisor_email: string | null; // Email for notifications
  team_member_ids: string[]; // Array of employee IDs
  team_member_emails: string[]; // Array of emails for notifications
  created_at: string;
  updated_at: string;
}
