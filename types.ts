export interface Medication {
  drug_name: string | null;
  strength: string | null;
  form: string | null; // e.g., TAB, CAP, CRM
  sig_instructions: string | null;
  quantity: string | null;
  refills: string | null;
  din: string | null;
  fill_date: string | null; // YYYY-MM-DD
}

export interface Patient {
  name: string | null;
  dob: string | null; // YYYY-MM-DD
  hcn: string | null;
  address: string | null;
}

export interface Prescriber {
  name: string | null;
  license_id: string | null;
  clinic_name: string | null;
  phone: string | null;
  fax: string | null;
}

export interface PrescriptionData {
  id?: string; // Internal system ID
  document_type: string; // "New Prescription", "Refill Request", "Transfer Report", etc.
  issue_date: string | null; // YYYY-MM-DD
  patient: Patient;
  prescriber: Prescriber;
  medications: Medication[];
  status: 'pending' | 'approved';
  createdAt: number;
}

export interface User {
  id: string;
  email: string;
  name: string;
}

export interface AuthState {
  isAuthenticated: boolean;
  user: User | null;
}