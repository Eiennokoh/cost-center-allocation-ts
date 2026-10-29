import type { Column } from './tables';

export function toNumber(v: unknown): number {
  const n = Number(String(v ?? '').replace(/,/g, ''));
  return Number.isFinite(n) ? n : 0;
}

export function splitCSVLine(line: string): string[] {
  const out: string[] = [];
  let cur = '';
  let quoted = false;
  for (let i = 0; i < line.length; i++) {
    const ch = line[i];
    if (quoted) {
      if (ch === '"' && line[i + 1] === '"') { cur += '"'; i++; }
      else if (ch === '"') quoted = false;
      else cur += ch;
    } else if (ch === '"') quoted = true;
    else if (ch === ',') { out.push(cur); cur = ''; }
    else cur += ch;
  }
  out.push(cur);
  return out.map(s => s.trim());
}

/**
 * CSV を読み込む。見出しは画面の列名と同じ。
 * select 列は表示名（例：営業部門）でもコード（例：SALES）でも受け付ける。
 */
export function parseCSV(text: string, cols: Column[]): Record<string, string | number>[] {
  const lines = text.replace(/^﻿/, '').split(/\r?\n/).filter(l => l.trim());
  if (lines.length < 2) throw new Error('データ行がありません');
  const header = splitCSVLine(lines[0]);
  const idx = cols.map(c => header.indexOf(c.label));
  const missing = cols.filter((_, i) => idx[i] < 0).map(c => c.label);
  if (missing.length) throw new Error('見出しが足りません：' + missing.join('、'));

  return lines.slice(1).map(line => {
    const v = splitCSVLine(line);
    const row: Record<string, string | number> = {};
    cols.forEach((c, i) => {
      const raw = v[idx[i]] ?? '';
      if (c.type === 'number') row[c.key] = toNumber(raw);
      else if (c.options) row[c.key] = c.options.find(o => o.label === raw || o.value === raw)?.value ?? raw;
      else row[c.key] = raw;
    });
    return row;
  });
}

export function toCSV(headers: string[], rows: (string | number)[][]): string {
  const esc = (v: string | number) => {
    const s = String(v ?? '');
    return /[",\n]/.test(s) ? '"' + s.replace(/"/g, '""') + '"' : s;
  };
  return '﻿' + [headers, ...rows].map(r => r.map(esc).join(',')).join('\r\n');
}
