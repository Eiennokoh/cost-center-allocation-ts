import { toCSV } from '../domain/csv';
import { CATEGORY_LABEL, type AllocationResult } from '../domain/types';
import { downloadCSV, yen } from '../util';

export function Messages({ result }: { result: AllocationResult }) {
  return (
    <>
      {result.errors.map(e => <div key={e} className="msg ng">エラー：{e}</div>)}
      {result.warnings.map(w => <div key={w} className="msg warn">注意：{w}</div>)}
      <div className={`msg ${result.balanced ? 'ok' : 'ng'}`}>
        配賦前合計 {yen(result.totalBefore)} 円、配賦後合計 {yen(result.totalAfter)} 円：
        {result.balanced ? '一致しています' : '一致しません'}
      </div>
    </>
  );
}

export default function ResultView({ result }: { result: AllocationResult }) {
  const sales = result.rows.filter(r => r.category === 'SALES');
  const maxAfter = Math.max(1, ...sales.map(r => r.after));
  const sum = (k: 'before' | 'sent' | 'recv' | 'after') => result.rows.reduce((a, r) => a + r[k], 0);

  const exportCSV = () =>
    downloadCSV('allocation_result.csv', toCSV(
      ['原価センタ', '名称', '区分', '配賦前', '配賦送出', '配賦受入', '配賦後'],
      result.rows.map(r => [r.code, r.name, CATEGORY_LABEL[r.category], r.before, r.sent, r.recv, r.after])
    ));

  return (
    <>
      <div className="card">
        <h2>配賦結果</h2>
        <p className="desc">共通部門の費用が配賦されて0になり、営業部門に配賦受入額が加わります。</p>
        <Messages result={result} />
        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th>原価センタ</th><th>名称</th><th>区分</th>
                <th className="num">配賦前</th><th className="num">配賦送出</th>
                <th className="num">配賦受入</th><th className="num">配賦後</th>
              </tr>
            </thead>
            <tbody>
              {result.rows.map(r => (
                <tr key={r.code}>
                  <td>{r.code}</td><td>{r.name}</td><td>{CATEGORY_LABEL[r.category]}</td>
                  <td className="num">{yen(r.before)}</td>
                  <td className="num minus">{r.sent ? yen(r.sent) : ''}</td>
                  <td className="num plus">{r.recv ? yen(r.recv) : ''}</td>
                  <td className="num">{yen(r.after)}</td>
                </tr>
              ))}
              <tr className="total">
                <td colSpan={3}>合計</td>
                <td className="num">{yen(sum('before'))}</td><td className="num">{yen(sum('sent'))}</td>
                <td className="num">{yen(sum('recv'))}</td><td className="num">{yen(sum('after'))}</td>
              </tr>
            </tbody>
          </table>
        </div>
        <div className="toolbar"><button className="btn sub" onClick={exportCSV}>CSVを出力</button></div>
      </div>
      <div className="card">
        <h2>営業部門の配賦後費用</h2>
        <div className="legend">
          <span><i style={{ background: 'var(--direct)' }} />直接費</span>
          <span><i style={{ background: 'var(--alloc)' }} />配賦受入</span>
        </div>
        {sales.map(r => (
          <div className="bar-row" key={r.code}>
            <span>{r.name}</span>
            <div className="bar">
              <div style={{ width: `${(r.before / maxAfter) * 100}%`, background: 'var(--direct)' }} />
              <div style={{ width: `${(r.recv / maxAfter) * 100}%`, background: 'var(--alloc)' }} />
            </div>
            <span className="num" style={{ textAlign: 'right' }}>{yen(r.after)}</span>
          </div>
        ))}
      </div>
    </>
  );
}
