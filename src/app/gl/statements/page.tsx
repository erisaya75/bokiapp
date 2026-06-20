'use client';

import { useState } from 'react';
import { useGL } from '@/context/GLContext';
import { computeBalances, formatAmount, getNetIncome } from '@/lib/calculations';
import { AccountBalance, AccountType } from '@/types/gl';
import PageHeader from '@/components/layout/PageHeader';

function groupByKey<T>(arr: T[], key: (item: T) => string): Record<string, T[]> {
  return arr.reduce((acc, item) => {
    const k = key(item);
    acc[k] = [...(acc[k] ?? []), item];
    return acc;
  }, {} as Record<string, T[]>);
}

function SectionTotal({ label, amount, bold }: { label: string; amount: number; bold?: boolean }) {
  return (
    <div className={`flex justify-between py-1.5 border-t border-[#d9d9d9] mt-1 ${bold ? 'font-bold' : 'font-semibold text-sm'}`}>
      <span>{label}</span>
      <span className="font-mono">¥{formatAmount(amount)}</span>
    </div>
  );
}

function AccountRow({ balance }: { balance: AccountBalance }) {
  return (
    <div className="flex justify-between py-1 text-sm">
      <div className="flex items-center gap-2">
        <span className="text-[#6b7280] font-mono text-xs">{balance.accountCode}</span>
        <span>{balance.accountName}</span>
      </div>
      <span className="font-mono">¥{formatAmount(balance.balance)}</span>
    </div>
  );
}

function GroupSection({ title, balances }: { title: string; balances: AccountBalance[] }) {
  const total = balances.reduce((s, b) => s + b.balance, 0);
  return (
    <div className="mb-4">
      <div className="text-xs font-semibold text-[#6b7280] uppercase tracking-wider pb-1 border-b border-[#d9d9d9] mb-1">
        {title}
      </div>
      {balances.map(b => <AccountRow key={b.accountCode} balance={b} />)}
      <SectionTotal label={`${title} 合計`} amount={total} />
    </div>
  );
}

export default function StatementsPage() {
  const { entries } = useGL();
  const balances = computeBalances(entries);
  const [activeTab, setActiveTab] = useState<'bs' | 'pl'>('bs');

  // Balance Sheet data
  const assets = balances.filter(b => b.accountType === 'asset');
  const liabilities = balances.filter(b => b.accountType === 'liability');
  const equity = balances.filter(b => b.accountType === 'equity');

  const assetGroups = groupByKey(assets, b => b.group);
  const liabilityGroups = groupByKey(liabilities, b => b.group);
  const equityGroups = groupByKey(equity, b => b.group);

  const totalAssets = assets.reduce((s, b) => s + b.balance, 0);
  const totalLiabilities = liabilities.reduce((s, b) => s + b.balance, 0);
  const totalEquity = equity.reduce((s, b) => s + b.balance, 0);
  const netIncome = getNetIncome(balances);
  const totalLiabilitiesAndEquity = totalLiabilities + totalEquity + netIncome;

  // P&L data
  const revenues = balances.filter(b => b.accountType === 'revenue');
  const expenses = balances.filter(b => b.accountType === 'expense');

  const revenueGroups = groupByKey(revenues, b => b.group);
  const expenseGroups = groupByKey(expenses, b => b.group);

  const totalRevenue = revenues.reduce((s, b) => s + b.balance, 0);
  const totalExpense = expenses.reduce((s, b) => s + b.balance, 0);

  const isBalanced = Math.abs(totalAssets - totalLiabilitiesAndEquity) < 1;

  return (
    <div>
      <PageHeader
        title="財務諸表"
        subtitle="会計年度 2026 / 2025年4月〜2025年7月"
        breadcrumb={['SAP FI', '財務諸表']}
        actions={
          <button className="sap-btn-secondary text-sm">印刷</button>
        }
      />

      <div className="p-6 space-y-4">
        {/* Tab */}
        <div className="flex gap-0 border-b border-[#d9d9d9]">
          <button
            onClick={() => setActiveTab('bs')}
            className={`px-6 py-2.5 text-sm font-medium border-b-2 transition-colors ${
              activeTab === 'bs'
                ? 'border-[#0070f2] text-[#0070f2]'
                : 'border-transparent text-[#6b7280] hover:text-[#32363a]'
            }`}
          >
            貸借対照表（B/S）
          </button>
          <button
            onClick={() => setActiveTab('pl')}
            className={`px-6 py-2.5 text-sm font-medium border-b-2 transition-colors ${
              activeTab === 'pl'
                ? 'border-[#0070f2] text-[#0070f2]'
                : 'border-transparent text-[#6b7280] hover:text-[#32363a]'
            }`}
          >
            損益計算書（P/L）
          </button>
        </div>

        {activeTab === 'bs' && (
          <div className="space-y-4">
            {/* Balance check */}
            <div className={`p-3 rounded text-sm font-medium ${
              isBalanced ? 'bg-green-50 text-green-800 border border-green-200' : 'bg-red-50 text-red-800 border border-red-200'
            }`}>
              {isBalanced
                ? `✓ 貸借一致　資産合計 = 負債・純資産合計 = ¥${formatAmount(totalAssets)}`
                : `⚠ 貸借不一致　差額: ¥${formatAmount(Math.abs(totalAssets - totalLiabilitiesAndEquity))}`
              }
            </div>

            <div className="grid grid-cols-2 gap-4">
              {/* Assets */}
              <div className="sap-card">
                <div className="px-5 py-3 border-b border-[#d9d9d9] bg-blue-50">
                  <h2 className="font-bold text-blue-800">資産の部</h2>
                </div>
                <div className="p-5">
                  {Object.entries(assetGroups).map(([group, items]) => (
                    <GroupSection key={group} title={group} balances={items} />
                  ))}
                  <div className="flex justify-between py-2 font-bold text-base border-t-2 border-[#32363a] mt-2">
                    <span>資産合計</span>
                    <span className="font-mono">¥{formatAmount(totalAssets)}</span>
                  </div>
                </div>
              </div>

              {/* Liabilities + Equity */}
              <div className="sap-card">
                <div className="px-5 py-3 border-b border-[#d9d9d9] bg-purple-50">
                  <h2 className="font-bold text-purple-800">負債・純資産の部</h2>
                </div>
                <div className="p-5">
                  <div className="mb-4">
                    <div className="text-sm font-bold text-[#32363a] mb-2 pb-1 border-b-2 border-[#32363a]">
                      負債の部
                    </div>
                    {Object.entries(liabilityGroups).map(([group, items]) => (
                      <GroupSection key={group} title={group} balances={items} />
                    ))}
                    <SectionTotal label="負債合計" amount={totalLiabilities} bold />
                  </div>

                  <div className="mb-4 mt-4">
                    <div className="text-sm font-bold text-[#32363a] mb-2 pb-1 border-b-2 border-[#32363a]">
                      純資産の部
                    </div>
                    {Object.entries(equityGroups).map(([group, items]) => (
                      <GroupSection key={group} title={group} balances={items} />
                    ))}
                    <div className="flex justify-between py-1 text-sm">
                      <div className="flex items-center gap-2">
                        <span className="text-[#6b7280] font-mono text-xs">当期純利益</span>
                      </div>
                      <span className={`font-mono ${netIncome >= 0 ? 'text-[#107e3e]' : 'text-[#bb0000]'}`}>
                        {netIncome >= 0 ? '' : '-'}¥{formatAmount(Math.abs(netIncome))}
                      </span>
                    </div>
                    <SectionTotal label="純資産合計" amount={totalEquity + netIncome} bold />
                  </div>

                  <div className="flex justify-between py-2 font-bold text-base border-t-2 border-[#32363a] mt-2">
                    <span>負債・純資産合計</span>
                    <span className="font-mono">¥{formatAmount(totalLiabilitiesAndEquity)}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'pl' && (
          <div className="space-y-4">
            {/* Net Income Summary */}
            <div className={`p-4 rounded border ${
              netIncome >= 0
                ? 'bg-green-50 border-green-200'
                : 'bg-red-50 border-red-200'
            }`}>
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-sm font-medium text-[#6b7280]">当期純利益</div>
                  <div className={`text-2xl font-bold font-mono ${netIncome >= 0 ? 'text-[#107e3e]' : 'text-[#bb0000]'}`}>
                    {netIncome >= 0 ? '' : '-'}¥{formatAmount(Math.abs(netIncome))}
                  </div>
                </div>
                <div className="text-right text-sm text-[#6b7280]">
                  <div>売上高: ¥{formatAmount(totalRevenue)}</div>
                  <div>費用合計: ¥{formatAmount(totalExpense)}</div>
                  <div>利益率: {totalRevenue > 0 ? ((netIncome / totalRevenue) * 100).toFixed(1) : 0}%</div>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              {/* Revenue */}
              <div className="sap-card">
                <div className="px-5 py-3 border-b border-[#d9d9d9] bg-emerald-50">
                  <h2 className="font-bold text-emerald-800">収益の部</h2>
                </div>
                <div className="p-5">
                  {Object.entries(revenueGroups).map(([group, items]) => (
                    <GroupSection key={group} title={group} balances={items} />
                  ))}
                  <div className="flex justify-between py-2 font-bold text-base border-t-2 border-[#32363a] mt-2">
                    <span>収益合計</span>
                    <span className="font-mono">¥{formatAmount(totalRevenue)}</span>
                  </div>
                </div>
              </div>

              {/* Expenses */}
              <div className="sap-card">
                <div className="px-5 py-3 border-b border-[#d9d9d9] bg-orange-50">
                  <h2 className="font-bold text-orange-800">費用の部</h2>
                </div>
                <div className="p-5">
                  {Object.entries(expenseGroups).map(([group, items]) => (
                    <GroupSection key={group} title={group} balances={items} />
                  ))}
                  <div className="flex justify-between py-2 font-bold text-base border-t-2 border-[#32363a] mt-2">
                    <span>費用合計</span>
                    <span className="font-mono">¥{formatAmount(totalExpense)}</span>
                  </div>

                  <div className={`flex justify-between py-2 font-bold text-lg border-t-2 border-[#32363a] mt-3 ${
                    netIncome >= 0 ? 'text-[#107e3e]' : 'text-[#bb0000]'
                  }`}>
                    <span>当期純利益</span>
                    <span className="font-mono">{netIncome >= 0 ? '' : '-'}¥{formatAmount(Math.abs(netIncome))}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* P&L Waterfall Summary */}
            <div className="sap-card p-5">
              <h2 className="text-sm font-semibold mb-4">損益サマリ</h2>
              <div className="space-y-2 max-w-md">
                <div className="flex justify-between text-sm py-1 border-b border-[#f0f0f0]">
                  <span>売上高</span>
                  <span className="font-mono text-[#107e3e]">+ ¥{formatAmount(revenues.find(r => r.accountCode === '4000')?.balance ?? 0)}</span>
                </div>
                <div className="flex justify-between text-sm py-1 border-b border-[#f0f0f0]">
                  <span>売上原価</span>
                  <span className="font-mono text-[#bb0000]">- ¥{formatAmount(expenses.find(e => e.accountCode === '5000')?.balance ?? 0)}</span>
                </div>
                <div className="flex justify-between text-sm py-1 font-semibold border-b border-[#d9d9d9]">
                  <span>売上総利益</span>
                  <span className="font-mono">
                    ¥{formatAmount(
                      (revenues.find(r => r.accountCode === '4000')?.balance ?? 0) -
                      (expenses.find(e => e.accountCode === '5000')?.balance ?? 0)
                    )}
                  </span>
                </div>
                {expenses.filter(e => e.group === '販売費及び一般管理費').map(e => (
                  <div key={e.accountCode} className="flex justify-between text-sm py-1 border-b border-[#f0f0f0] pl-4">
                    <span className="text-[#6b7280]">{e.accountName}</span>
                    <span className="font-mono text-[#bb0000]">- ¥{formatAmount(e.balance)}</span>
                  </div>
                ))}
                <div className="flex justify-between text-sm py-1 font-semibold border-b border-[#d9d9d9]">
                  <span>営業利益</span>
                  <span className={`font-mono ${netIncome >= 0 ? '' : 'text-[#bb0000]'}`}>
                    ¥{formatAmount(
                      totalRevenue -
                      expenses.filter(e => ['売上原価', '販売費及び一般管理費'].includes(e.group)).reduce((s, e) => s + e.balance, 0)
                    )}
                  </span>
                </div>
                <div className="flex justify-between text-base py-2 font-bold border-t-2 border-[#32363a]">
                  <span>当期純利益</span>
                  <span className={`font-mono ${netIncome >= 0 ? 'text-[#107e3e]' : 'text-[#bb0000]'}`}>
                    {netIncome >= 0 ? '' : '-'}¥{formatAmount(Math.abs(netIncome))}
                  </span>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
