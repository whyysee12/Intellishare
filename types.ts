export type Role = 'Administrator' | 'Officer' | 'Analyst' | 'Read-Only';

export interface User {
  id: string;
  name: string;
  badgeNumber: string;
  agency: string;
  role: Role;
  email: string;
  avatar?: string;
}

export type CaseStatus = 'Registered' | 'Under Investigation' | 'Closed' | 'Cold Case';

export interface Case {
  id: string;
  title: string;
  description: string;
  type: string;
  status: CaseStatus;
  date: string;
  location: {
    lat: number;
    lng: number;
    address: string;
    city: string;
  };
  priority: 'High' | 'Medium' | 'Low';
  assignedOfficer: string;
  entities: Entity[];
  similarityScore?: number; // For search/analytics
}

export interface Entity {
  id: string;
  type: 'Person' | 'Location' | 'Vehicle' | 'Phone' | 'Organization';
  value: string;
  details?: string;
}

export interface ActivityLog {
  id: string;
  action: string;
  user: string;
  timestamp: string;
  type: 'info' | 'warning' | 'alert' | 'success';
}

export interface Notification {
  id: string;
  title: string;
  message: string;
  type: 'alert' | 'update' | 'share' | 'system';
  read: boolean;
  time: string;
}

export interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  token: string | null;
}
