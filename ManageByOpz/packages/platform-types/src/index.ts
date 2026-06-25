// Global Type Declarations
export type SafeAny = any;

export interface User {
  id: string;
  uid: string;
  name: string;
  email: string;
  role: string;
  tenantId: string;
}

export interface Ticket {
  id: number;
  number: string;
  title: string;
  description: string;
  status: string;
  priority: string;
  caller: string;
  callerEmail: string;
  assignedTo?: string;
  assignedToName?: string;
  assignmentGroup?: string;
  tenantId: string;
}
