import { runAllocation } from './allocation';
import { parseCSV } from './csv';
import { sampleData } from './sampleData';
import { TABLES } from './tables';

describe('runAllocation', () => {
  it('配賦前合計と配賦後合計が一致する', () => {
    const r = runAllocation(sampleData());
    expect(r.errors).toEqual([]);
    expect(r.totalBefore).toBe(183500000);
    expect(r.totalAfter).toBe(183500000);
    expect(r.balanced).toBe(true);
  });

  it('共通部門の費用は配賦後に0になる', () => {
    const r = runAllocation(sampleData());
    for (const row of r.rows.filter(x => x.category === 'SHARED')) {
      expect(row.after).toBe(0);
    }
  });

  it('端末台数の比率で IT費を按分する', () => {
    const r = runAllocation(sampleData());
    const it = r.lines.filter(l => l.account === '9110');
    // 情報システム部 45,000,000 円を 55:40:28:35 で按分
    expect(it.reduce((a, l) => a + l.amount, 0)).toBe(45000000);
    expect(it.find(l => l.debitCC === '2200')?.amount).toBe(Math.round((45000000 * 40) / 158));
  });

  it('端数が出ても送信額と受信額が一致する', () => {
    const d = sampleData();
    d.actuals = [{ cc: '1100', account: '6100', accountName: '給与手当', amount: 100 }];
    d.drivers = d.drivers.map(x => ({ ...x, devices: 1 }));
    d.rules = [d.rules[0]];
    const r = runAllocation(d);
    expect(r.lines.reduce((a, l) => a + l.amount, 0)).toBe(100);
    expect(r.balanced).toBe(true);
  });

  it('入力ミスをエラーにする', () => {
    const d = sampleData();
    d.actuals.push({ cc: '9999', account: '6100', accountName: '給与手当', amount: 1 });
    d.rules.push({ sender: '2100', basis: 'AREA', account: '9140', accountName: 'テスト' });
    d.rules.push({ sender: '1100', basis: 'AREA', account: '9150', accountName: '重複' });
    const r = runAllocation(d);
    expect(r.errors.some(e => e.includes('9999'))).toBe(true);
    expect(r.errors.some(e => e.includes('共通部門ではありません'))).toBe(true);
    expect(r.errors.some(e => e.includes('重複'))).toBe(true);
  });

  it('ルールがない共通部門は未配賦として警告する', () => {
    const d = sampleData();
    d.rules = d.rules.slice(0, 2);
    const r = runAllocation(d);
    expect(r.warnings.some(w => w.includes('経営企画部'))).toBe(true);
  });
});

describe('parseCSV', () => {
  it('日本語の見出しと区分名を読み込む', () => {
    const rows = parseCSV('﻿原価センタ,名称,区分\r\n2500,福岡支店,営業部門\r\n', TABLES.costCenters.cols);
    expect(rows).toEqual([{ code: '2500', name: '福岡支店', category: 'SALES' }]);
  });

  it('見出しが足りないとエラーにする', () => {
    expect(() => parseCSV('原価センタ,人数\n2100,1', TABLES.drivers.cols)).toThrow('見出しが足りません');
  });
});
