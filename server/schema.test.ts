import { createApi } from './schema';

async function gql(api: ReturnType<typeof createApi>, query: string, variables?: object) {
  const res = await api.fetch('http://localhost/graphql', {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify({ query, variables })
  });
  return res.json();
}

describe('GraphQL API', () => {
  it('配賦結果を取得できる', async () => {
    const api = createApi();
    const res = await gql(api, '{ allocation { totalBefore totalAfter balanced lines { docNo amount } } }');
    expect(res.errors).toBeUndefined();
    expect(res.data.allocation.balanced).toBe(true);
    expect(res.data.allocation.totalAfter).toBe(183500000);
    expect(res.data.allocation.lines).toHaveLength(12);
  });

  it('原価センタから費用実績と配賦基準をたどれる', async () => {
    const api = createApi();
    const res = await gql(api, '{ costCenter(code: "2100") { name driver { devices } actuals { amount } } }');
    expect(res.data.costCenter).toEqual({ name: '新宿支店', driver: { devices: 55 }, actuals: [{ amount: 30000000 }] });
  });

  it('配賦基準を更新すると配賦結果が変わる', async () => {
    const api = createApi();
    await gql(api, 'mutation($i: DriverInput!) { upsertDriver(input: $i) { cc } }', {
      i: { cc: '2100', headcount: 0, area: 0, devices: 0 }
    });
    const res = await gql(api, '{ allocation { balanced lines { debitCC } } }');
    expect(res.data.allocation.balanced).toBe(true);
    expect(res.data.allocation.lines.some((l: { debitCC: string }) => l.debitCC === '2100')).toBe(false);
  });
});
