
export type TransactionType = 'Deposit' | 'Expense';

export interface Transaction {
  id: string;
  date: string;
  description: string;
  amount: number;
  billNumber: string;
  category: string;
  type: TransactionType;
  invoiceImage?: string; // Base64 string of the attached receipt
}

export interface PettyCashStats {
  totalBudget: number;
  totalExpenses: number;
  balance: number;
  count: number;
}

// Added missing AssetStatus enum used in AssetTable.tsx
export enum AssetStatus {
  AVAILABLE = 'AVAILABLE',
  ASSIGNED = 'ASSIGNED',
  MAINTENANCE = 'MAINTENANCE',
  RETIRED = 'RETIRED',
}

// Added missing Custodian interface used in AssetTable.tsx
export interface Custodian {
  id: string;
  name: string;
}

// Added missing Asset interface used in AssetTable.tsx
export interface Asset {
  id: string;
  name: string;
  category: string;
  serialNumber: string;
  status: AssetStatus;
  custodianId?: string;
  value: number;
}
