const FLOW = ['原価センタ', '費用実績', '配賦基準', '配賦ルール', '配賦結果', '配賦仕訳'];

export default function Home({ onReset }: { onReset: () => void }) {
  return (
    <>
      <div className="card">
        <h2>このシステムでできること</h2>
        <p className="desc">
          情報システム部、総務部、経営企画部などの共通部門の費用を、人数、面積、端末台数といった基準で営業部門（支店）へ配賦し、
          配賦仕訳を自動で作成します。SAP CO の配賦（Assessment）を簡略化して再現したものです。
        </p>
        <div className="flow">
          {FLOW.map((s, i) => (
            <span key={s} style={{ display: 'contents' }}>
              {i > 0 && <span className="arrow">▶</span>}
              <span className="step">{s}</span>
            </span>
          ))}
        </div>
      </div>
      <div className="card">
        <h2>使い方</h2>
        <p className="desc">
          1. 各タブでマスタと実績を確認します。表の中は直接書き換えられ、配賦結果はすぐに再計算されます。<br />
          2. 自社データを使う場合は、各タブの「CSVを取り込む」で読み込みます（見出しは画面の列名と同じにしてください）。<br />
          3. 「配賦結果」タブで配賦前後の費用、「配賦仕訳」タブで自動作成された仕訳を確認します。<br />
          4. 同じ計算は GraphQL API（npm run api）からも呼び出せます。
        </p>
        <div className="toolbar">
          <button className="btn sub" onClick={() => confirm('サンプルデータに戻しますか？') && onReset()}>
            サンプルデータに戻す
          </button>
        </div>
      </div>
    </>
  );
}
