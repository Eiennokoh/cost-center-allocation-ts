import type { AllocationResult, Basis, Driver, JournalLine, MasterData } from './types';
import { BASES, BASIS_LABEL } from './types';

const BASIS_FIELD: Record<Basis, keyof Omit<Driver, 'cc'>> = {
  HEADCOUNT: 'headcount',
  AREA: 'area',
  DEVICES: 'devices'
};

const FIRST_DOC_NO = 100000001;

/**
 * 原価センタ配賦（一段階配賦）
 * 共通部門の費用を、配賦ルールで指定した統計指標の比率で営業部門へ按分し、配賦仕訳を作る。
 */
export function runAllocation(d: MasterData): AllocationResult {
  const errors: string[] = [];
  const warnings: string[] = [];
  const lines: JournalLine[] = [];

  const ccMap = new Map(d.costCenters.map(c => [c.code, c]));
  const receivers = d.costCenters.filter(c => c.category === 'SALES');
  const before: Record<string, number> = {};
  const sent: Record<string, number> = {};
  const recv: Record<string, number> = {};
  for (const c of d.costCenters) {
    before[c.code] = 0;
    sent[c.code] = 0;
    recv[c.code] = 0;
  }

  d.actuals.forEach((a, i) => {
    if (!ccMap.has(a.cc)) {
      errors.push(`費用実績 ${i + 1}行目：原価センタ「${a.cc}」がマスタにありません`);
      return;
    }
    before[a.cc] += a.amount;
  });

  const usedSenders = new Set<string>();
  let docNo = FIRST_DOC_NO;

  d.rules.forEach((r, i) => {
    const row = `配賦ルール ${i + 1}行目`;
    const sender = ccMap.get(r.sender);
    if (!sender) { errors.push(`${row}：送信側「${r.sender}」がマスタにありません`); return; }
    if (sender.category !== 'SHARED') { errors.push(`${row}：送信側「${sender.name}」は共通部門ではありません`); return; }
    if (usedSenders.has(r.sender)) { errors.push(`${row}：「${sender.name}」のルールが重複しています`); return; }
    if (!BASES.includes(r.basis)) { errors.push(`${row}：配賦基準「${r.basis}」は使えません`); return; }
    if (!r.account) { errors.push(`${row}：配賦用勘定が空欄です`); return; }
    usedSenders.add(r.sender);

    const total = before[r.sender];
    if (total === 0) { warnings.push(`${sender.name}：費用実績がないため配賦しません`); return; }

    const field = BASIS_FIELD[r.basis];
    const weights = receivers.map(c => d.drivers.find(x => x.cc === c.code)?.[field] ?? 0);
    const weightSum = weights.reduce((a, b) => a + b, 0);
    if (weightSum <= 0) { errors.push(`${row}：営業部門の「${BASIS_LABEL[r.basis]}」が全部0です`); return; }

    // 端数は比率が最も大きい受信側に寄せ、送信額と受信額を必ず一致させる
    const amounts = weights.map(w => Math.round((total * w) / weightSum));
    const diff = total - amounts.reduce((a, b) => a + b, 0);
    amounts[weights.indexOf(Math.max(...weights))] += diff;

    receivers.forEach((c, j) => {
      if (amounts[j] === 0) return;
      sent[r.sender] += amounts[j];
      recv[c.code] += amounts[j];
      lines.push({
        docNo,
        debitCC: c.code,
        debitName: c.name,
        creditCC: sender.code,
        creditName: sender.name,
        account: r.account,
        accountName: r.accountName,
        basis: r.basis,
        ratio: weights[j] / weightSum,
        amount: amounts[j]
      });
    });
    docNo++;
  });

  for (const c of d.costCenters) {
    if (c.category === 'SHARED' && before[c.code] !== 0 && !usedSenders.has(c.code)) {
      warnings.push(`${c.name}：配賦ルールがないため費用が残ります（未配賦）`);
    }
  }

  const rows = d.costCenters.map(c => ({
    code: c.code,
    name: c.name,
    category: c.category,
    before: before[c.code],
    sent: -sent[c.code],
    recv: recv[c.code],
    after: before[c.code] - sent[c.code] + recv[c.code]
  }));
  const totalBefore = rows.reduce((a, r) => a + r.before, 0);
  const totalAfter = rows.reduce((a, r) => a + r.after, 0);

  return { rows, lines, errors, warnings, totalBefore, totalAfter, balanced: totalBefore === totalAfter };
}
