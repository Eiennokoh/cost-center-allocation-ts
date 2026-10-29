import type { ChangeEvent } from 'react';
import { parseCSV, toCSV, toNumber } from '../domain/csv';
import { TABLES, emptyRow, type Column, type TableKey } from '../domain/tables';
import type { CostCenter } from '../domain/types';
import { downloadCSV } from '../util';

type Row = Record<string, string | number>;

interface Props {
  tableKey: TableKey;
  rows: Row[];
  costCenters: CostCenter[];
  onChange: (rows: Row[]) => void;
}

export default function EditableTable({ tableKey, rows, costCenters, onChange }: Props) {
  const def = TABLES[tableKey];

  const setCell = (i: number, col: Column, value: string) => {
    const next = rows.map((r, j) => (j === i ? { ...r, [col.key]: col.type === 'number' ? toNumber(value) : value } : r));
    onChange(next);
  };

  const importCSV = async (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    e.target.value = '';
    if (!file) return;
    try {
      const imported = parseCSV(await file.text(), def.cols);
      onChange(imported);
      alert(`${imported.length}行を取り込みました`);
    } catch (err) {
      alert('取り込めませんでした：' + (err as Error).message);
    }
  };

  const exportCSV = () => {
    const label = (c: Column, v: string | number) => c.options?.find(o => o.value === v)?.label ?? v;
    downloadCSV(`${tableKey}.csv`, toCSV(def.cols.map(c => c.label), rows.map(r => def.cols.map(c => label(c, r[c.key])))));
  };

  const cell = (i: number, col: Column, value: string | number) => {
    if (col.type === 'cc') {
      return (
        <select value={value} onChange={e => setCell(i, col, e.target.value)}>
          <option value="" />
          {costCenters.map(c => (
            <option key={c.code} value={c.code}>{c.code} {c.name}</option>
          ))}
        </select>
      );
    }
    if (col.type === 'select') {
      return (
        <select value={value} onChange={e => setCell(i, col, e.target.value)}>
          {col.options!.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
        </select>
      );
    }
    return (
      <input
        type={col.type === 'number' ? 'number' : 'text'}
        value={value}
        onChange={e => setCell(i, col, e.target.value)}
      />
    );
  };

  return (
    <div className="card">
      <h2>{def.title}</h2>
      <p className="desc">{def.desc}</p>
      <div className="table-wrap">
        <table>
          <thead>
            <tr>{def.cols.map(c => <th key={c.key}>{c.label}</th>)}<th /></tr>
          </thead>
          <tbody>
            {rows.map((r, i) => (
              <tr key={i}>
                {def.cols.map(c => <td key={c.key}>{cell(i, c, r[c.key] ?? '')}</td>)}
                <td>
                  <button className="btn del" onClick={() => onChange(rows.filter((_, j) => j !== i))}>削除</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div className="toolbar">
        <button className="btn sub" onClick={() => onChange([...rows, emptyRow(tableKey)])}>行を追加</button>
        <label className="file btn sub">
          CSVを取り込む
          <input type="file" accept=".csv" onChange={importCSV} />
        </label>
        <button className="btn sub" onClick={exportCSV}>CSVを出力</button>
      </div>
    </div>
  );
}
