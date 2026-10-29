import { toCSV } from '../domain/csv';
import { BASIS_LABEL, type AllocationResult } from '../domain/types';
import { downloadCSV, yen } from '../util';

export default function JournalView({ result }: { result: AllocationResult }) {
  const exportCSV = () =>
    downloadCSV('allocation_journal.csv', toCSV(
      ['伝票番号', '借方原価センタ', '貸方原価センタ', '配賦用勘定', '配賦用勘定名', '配賦基準', '比率', '金額'],
      result.lines.map(l => [l.docNo, l.debitCC, l.creditCC, l.account, l.accountName, BASIS_LABEL[l.basis], l.ratio.toFixed(4), l.amount])
    ));

  return (
    <div className="card">
      <h2>配賦仕訳</h2>
      <p className="desc">配賦ルール1件につき伝票1件を作成します。借方が受信側、貸方が送信側で、同じ配賦用勘定を使います。</p>
      {result.errors.map(e => <div key={e} className="msg ng">エラー：{e}</div>)}
      <div className="table-wrap">
        <table>
          <thead>
            <tr>
              <th>伝票番号</th><th>借方 原価センタ</th><th>貸方 原価センタ</th>
              <th>配賦用勘定</th><th>配賦基準</th><th className="num">比率</th><th className="num">金額</th>
            </tr>
          </thead>
          <tbody>
            {result.lines.map(l => (
              <tr key={`${l.docNo}-${l.debitCC}`}>
                <td>{l.docNo}</td>
                <td>{l.debitCC} {l.debitName}</td>
                <td>{l.creditCC} {l.creditName}</td>
                <td>{l.account} {l.accountName}</td>
                <td>{BASIS_LABEL[l.basis]}</td>
                <td className="num">{(l.ratio * 100).toFixed(1)}%</td>
                <td className="num">{yen(l.amount)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div className="toolbar"><button className="btn sub" onClick={exportCSV}>CSVを出力</button></div>
    </div>
  );
}
