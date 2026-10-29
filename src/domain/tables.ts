import type { MasterData } from './types';
import { BASES, BASIS_LABEL, CATEGORIES, CATEGORY_LABEL } from './types';

export type TableKey = keyof MasterData;

export interface Column {
  key: string;
  label: string;
  type?: 'number' | 'cc' | 'select';
  /** select の選択肢（値と表示名） */
  options?: { value: string; label: string }[];
}

export interface TableDef {
  title: string;
  desc: string;
  cols: Column[];
}

const categoryOptions = CATEGORIES.map(v => ({ value: v, label: CATEGORY_LABEL[v] }));
const basisOptions = BASES.map(v => ({ value: v, label: BASIS_LABEL[v] }));

export const TABLES: Record<TableKey, TableDef> = {
  costCenters: {
    title: '原価センタマスタ',
    desc: '共通部門は配賦の送信側、営業部門は受信側になります。',
    cols: [
      { key: 'code', label: '原価センタ' },
      { key: 'name', label: '名称' },
      { key: 'category', label: '区分', type: 'select', options: categoryOptions }
    ]
  },
  actuals: {
    title: '費用実績',
    desc: '原価センタごとの当月費用（一次原価）です。',
    cols: [
      { key: 'cc', label: '原価センタ', type: 'cc' },
      { key: 'account', label: '勘定コード' },
      { key: 'accountName', label: '勘定名' },
      { key: 'amount', label: '金額', type: 'number' }
    ]
  },
  drivers: {
    title: '配賦基準（統計指標）',
    desc: '営業部門ごとの人数、面積（㎡）、端末台数です。配賦ルールで選んだ指標の比率で費用を按分します。',
    cols: [
      { key: 'cc', label: '原価センタ', type: 'cc' },
      { key: 'headcount', label: '人数', type: 'number' },
      { key: 'area', label: '面積', type: 'number' },
      { key: 'devices', label: '端末台数', type: 'number' }
    ]
  },
  rules: {
    title: '配賦ルール（配賦サイクル）',
    desc: 'どの共通部門の費用を、どの基準で、どの配賦用勘定（二次原価要素）で配賦するかを定義します。',
    cols: [
      { key: 'sender', label: '送信側原価センタ', type: 'cc' },
      { key: 'basis', label: '配賦基準', type: 'select', options: basisOptions },
      { key: 'account', label: '配賦用勘定' },
      { key: 'accountName', label: '配賦用勘定名' }
    ]
  }
};

/** 新しい行の初期値 */
export function emptyRow(key: TableKey): Record<string, string | number> {
  const row: Record<string, string | number> = {};
  for (const c of TABLES[key].cols) {
    row[c.key] = c.type === 'number' ? 0 : c.options ? c.options[0].value : '';
  }
  return row;
}
