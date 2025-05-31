export interface Lead {
  id?: string;
  name: string;
  whatsapp_number_: string;
  comments: string;
  platform: string;
  lead_status: string;
  created_time: string;
  [key: string]: string | number | boolean | undefined;
}

export interface LeadsResponse {
  leads: Lead[];
}

export interface KPI {
  title: string;
  value: number | string;
  icon: React.ReactNode;
  change?: number;
  color: string;
}

export interface ChartData {
  name: string;
  value: number;
}

export interface User {
  uid: string;
  phoneNumber: string | null;
}