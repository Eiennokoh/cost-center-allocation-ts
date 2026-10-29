import { createSchema, createYoga } from 'graphql-yoga';
import { runAllocation } from '../src/domain/allocation';
import { sampleData } from '../src/domain/sampleData';
import type { Actual, AllocationRule, CostCenter, Driver, MasterData } from '../src/domain/types';

const typeDefs = /* GraphQL */ `
  "共通部門（送信側）と営業部門（受信側）"
  enum Category { SHARED SALES }

  "配賦基準：人数、面積、端末台数"
  enum Basis { HEADCOUNT AREA DEVICES }

  type CostCenter {
    code: String!
    name: String!
    category: Category!
    actuals: [Actual!]!
    driver: Driver
  }

  type Actual { cc: String! account: String! accountName: String! amount: Float! }
  type Driver { cc: String! headcount: Float! area: Float! devices: Float! }
  type AllocationRule { sender: String! basis: Basis! account: String! accountName: String! }

  type ResultRow {
    code: String! name: String! category: Category!
    before: Float! sent: Float! recv: Float! after: Float!
  }

  type JournalLine {
    docNo: Int! debitCC: String! debitName: String! creditCC: String! creditName: String!
    account: String! accountName: String! basis: Basis! ratio: Float! amount: Float!
  }

  type AllocationResult {
    rows: [ResultRow!]!
    lines: [JournalLine!]!
    errors: [String!]!
    warnings: [String!]!
    totalBefore: Float!
    totalAfter: Float!
    balanced: Boolean!
  }

  type Query {
    costCenters: [CostCenter!]!
    costCenter(code: String!): CostCenter
    rules: [AllocationRule!]!
    "現在のマスタと実績で配賦を計算する（データは変更しない）"
    allocation: AllocationResult!
  }

  input CostCenterInput { code: String! name: String! category: Category! }
  input ActualInput { cc: String! account: String! accountName: String! amount: Float! }
  input DriverInput { cc: String! headcount: Float! area: Float! devices: Float! }
  input RuleInput { sender: String! basis: Basis! account: String! accountName: String! }

  type Mutation {
    upsertCostCenter(input: CostCenterInput!): CostCenter!
    addActual(input: ActualInput!): Actual!
    upsertDriver(input: DriverInput!): Driver!
    upsertRule(input: RuleInput!): AllocationRule!
    resetSampleData: Boolean!
  }
`;

/** API を作る。store を渡せばテストごとに独立したデータで動かせる。 */
export function createApi(store: MasterData = sampleData()) {
  const upsert = <T>(list: T[], item: T, same: (x: T) => boolean): T => {
    const i = list.findIndex(same);
    if (i >= 0) list[i] = item;
    else list.push(item);
    return item;
  };

  const schema = createSchema({
    typeDefs,
    resolvers: {
      Query: {
        costCenters: () => store.costCenters,
        costCenter: (_: unknown, { code }: { code: string }) => store.costCenters.find(c => c.code === code) ?? null,
        rules: () => store.rules,
        allocation: () => runAllocation(store)
      },
      CostCenter: {
        actuals: (c: CostCenter) => store.actuals.filter(a => a.cc === c.code),
        driver: (c: CostCenter) => store.drivers.find(d => d.cc === c.code) ?? null
      },
      Mutation: {
        upsertCostCenter: (_: unknown, { input }: { input: CostCenter }) =>
          upsert(store.costCenters, input, c => c.code === input.code),
        addActual: (_: unknown, { input }: { input: Actual }) => {
          store.actuals.push(input);
          return input;
        },
        upsertDriver: (_: unknown, { input }: { input: Driver }) =>
          upsert(store.drivers, input, d => d.cc === input.cc),
        upsertRule: (_: unknown, { input }: { input: AllocationRule }) =>
          upsert(store.rules, input, r => r.sender === input.sender),
        resetSampleData: () => {
          Object.assign(store, sampleData());
          return true;
        }
      }
    }
  });

  return createYoga({ schema, graphqlEndpoint: '/graphql' });
}
