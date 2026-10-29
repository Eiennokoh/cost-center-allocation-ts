import type { MasterData } from './types';

/** 架空のサンプルデータ（証券会社の本部と支店を想定） */
export function sampleData(): MasterData {
  return {
    costCenters: [
      { code: '1100', name: '情報システム部', category: 'SHARED' },
      { code: '1200', name: '総務部', category: 'SHARED' },
      { code: '1300', name: '経営企画部', category: 'SHARED' },
      { code: '2100', name: '新宿支店', category: 'SALES' },
      { code: '2200', name: '渋谷支店', category: 'SALES' },
      { code: '2300', name: '横浜支店', category: 'SALES' },
      { code: '2400', name: '大阪支店', category: 'SALES' }
    ],
    actuals: [
      { cc: '1100', account: '6100', accountName: '給与手当', amount: 18000000 },
      { cc: '1100', account: '6310', accountName: 'システム利用料', amount: 24000000 },
      { cc: '1100', account: '6320', accountName: '通信費', amount: 3000000 },
      { cc: '1200', account: '6100', accountName: '給与手当', amount: 12000000 },
      { cc: '1200', account: '6400', accountName: '地代家賃', amount: 9000000 },
      { cc: '1200', account: '6500', accountName: '消耗品費', amount: 1500000 },
      { cc: '1300', account: '6100', accountName: '給与手当', amount: 15000000 },
      { cc: '1300', account: '6600', accountName: '業務委託費', amount: 4000000 },
      { cc: '2100', account: '6100', accountName: '給与手当', amount: 30000000 },
      { cc: '2200', account: '6100', accountName: '給与手当', amount: 25000000 },
      { cc: '2300', account: '6100', accountName: '給与手当', amount: 20000000 },
      { cc: '2400', account: '6100', accountName: '給与手当', amount: 22000000 }
    ],
    drivers: [
      { cc: '2100', headcount: 40, area: 300, devices: 55 },
      { cc: '2200', headcount: 30, area: 250, devices: 40 },
      { cc: '2300', headcount: 20, area: 180, devices: 28 },
      { cc: '2400', headcount: 25, area: 220, devices: 35 }
    ],
    rules: [
      { sender: '1100', basis: 'DEVICES', account: '9110', accountName: 'IT費配賦' },
      { sender: '1200', basis: 'AREA', account: '9120', accountName: '総務費配賦' },
      { sender: '1300', basis: 'HEADCOUNT', account: '9130', accountName: '企画費配賦' }
    ]
  };
}
