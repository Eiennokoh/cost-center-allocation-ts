// データモデル（画面と API で共通）

export type Category = 'SHARED' | 'SALES';
export type Basis = 'HEADCOUNT' | 'AREA' | 'DEVICES';

export const CATEGORY_LABEL: Record<Category, string> = {
  SHARED: '共通部門',
  SALES: '営業部門'
};

export const BASIS_LABEL: Record<Basis, string> = {
  HEADCOUNT: '人数',
  AREA: '面積',
  DEVICES: '端末台数'
};

export const BASES = Object.keys(BASIS_LABEL) as Basis[];
export const CATEGORIES = Object.keys(CATEGORY_LABEL) as Category[];

/** 原価センタ */
export interface CostCenter {
  code: string;
  name: string;
  category: Category;
}

/** 費用実績（一次原価） */
export interface Actual {
  cc: string;
  account: string;
  accountName: string;
  amount: number;
}

/** 配賦基準（統計指標） */
export interface Driver {
  cc: string;
  headcount: number;
  area: number;
  devices: number;
}

/** 配賦ルール（配賦サイクル） */
export interface AllocationRule {
  sender: string;
  basis: Basis;
  account: string;
  accountName: string;
}

export interface MasterData {
  costCenters: CostCenter[];
  actuals: Actual[];
  drivers: Driver[];
  rules: AllocationRule[];
}

/** 配賦仕訳の明細（借方は受信側、貸方は送信側） */
export interface JournalLine {
  docNo: number;
  debitCC: string;
  debitName: string;
  creditCC: string;
  creditName: string;
  account: string;
  accountName: string;
  basis: Basis;
  ratio: number;
  amount: number;
}

export interface ResultRow {
  code: string;
  name: string;
  category: Category;
  before: number;
  sent: number;
  recv: number;
  after: number;
}

export interface AllocationResult {
  rows: ResultRow[];
  lines: JournalLine[];
  errors: string[];
  warnings: string[];
  totalBefore: number;
  totalAfter: number;
  balanced: boolean;
}
