import { useEffect, useMemo, useState } from 'react';
import { runAllocation } from './domain/allocation';
import { sampleData } from './domain/sampleData';
import type { TableKey } from './domain/tables';
import type { MasterData } from './domain/types';
import EditableTable from './components/EditableTable';
import Home from './components/Home';
import JournalView from './components/JournalView';
import ResultView from './components/ResultView';

const STORE_KEY = 'cc-allocation-ts-v1';

type TabId = 'home' | TableKey | 'result' | 'journal';

const TABS: { id: TabId; label: string }[] = [
  { id: 'home', label: 'はじめに' },
  { id: 'costCenters', label: '原価センタ' },
  { id: 'actuals', label: '費用実績' },
  { id: 'drivers', label: '配賦基準' },
  { id: 'rules', label: '配賦ルール' },
  { id: 'result', label: '配賦結果' },
  { id: 'journal', label: '配賦仕訳' }
];

function loadData(): MasterData {
  try {
    const saved = localStorage.getItem(STORE_KEY);
    if (saved) return JSON.parse(saved) as MasterData;
  } catch {
    // 保存データが読めない場合はサンプルで開始
  }
  return sampleData();
}

export default function App() {
  const [data, setData] = useState<MasterData>(loadData);
  const [tab, setTab] = useState<TabId>('home');

  useEffect(() => {
    try {
      localStorage.setItem(STORE_KEY, JSON.stringify(data));
    } catch {
      // 保存できない環境（プライベートブラウズ等）でも画面は動かす
    }
  }, [data]);

  // マスタや実績が変わるたびに配賦を再計算
  const result = useMemo(() => runAllocation(data), [data]);

  const updateTable = (key: TableKey, rows: Record<string, string | number>[]) =>
    setData(prev => ({ ...prev, [key]: rows }) as MasterData);

  return (
    <>
      <header>
        <h1>原価センタ配賦システム</h1>
        <p>Cost Center Assessment Mini ERP（TypeScript、React、GraphQL）</p>
      </header>
      <nav>
        {TABS.map(t => (
          <button key={t.id} className={t.id === tab ? 'active' : ''} onClick={() => setTab(t.id)}>
            {t.label}
          </button>
        ))}
      </nav>
      <main>
        {tab === 'home' && <Home onReset={() => setData(sampleData())} />}
        {tab === 'result' && <ResultView result={result} />}
        {tab === 'journal' && <JournalView result={result} />}
        {tab !== 'home' && tab !== 'result' && tab !== 'journal' && (
          <EditableTable
            tableKey={tab}
            rows={data[tab] as unknown as Record<string, string | number>[]}
            costCenters={data.costCenters}
            onChange={rows => updateTable(tab, rows)}
          />
        )}
      </main>
    </>
  );
}
