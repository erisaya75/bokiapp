'use client';

import { useGL } from '@/context/GLContext';
import { computeTrialBalance, formatAmount } from '@/lib/calculations';
import { AccountType, ACCOUNT_TYPE_LABELS } from '@/types/gl';
import PageHeader from '@/components/layout/PageHeader';
import { useState } from 'react';

const TYPE_COLORS: Record<AccountType, string> = {
  asset: 'bg-blue-50 text-blue-700',
  liability: 'bg-purple-50 text-purple-700',
  equity: 'bg-green-50 text-green-700',
  revenue: 'bg-emerald-50 text-emerald-700',
  expense: 'bg-orange-50 text-orange-700',
};

export default function TrialBalancePage() {
  const { entries } = useGL();
  const rows = computeTrialBalance(entries);
  const [filterType, setFilterType] = useState<string>('all');
  const [showZero, setShowZero] = useState(false);

  const filtered = rows
    .filter(r => filterType === 'all' || r.accountType === filterType)
    .filter(r => showZero || r.closingDebit > 0 || r.closingCredit > 0);

  const totalOpeningDebit = filtered.reduce((s, r) => s + r.openingDebit, 0);
  const totalOpeningCredit = filtered.reduce((s, r) => s + r.openingCredit, 0);
  const totalPeriodDebit = filtered.reduce((s, r) => s + r.periodDebit, 0);
  const totalPeriodCredit = filtered.reduce((s, r) => s + r.periodCredit, 0);
  const totalClosingDebit = filtered.reduce((s, r) => s + r.closingDebit, 0);
  const totalClosingCredit = filtered.reduce((s, r) => s + r.closingCredit, 0);

  const isBalanced = Math.abs(totalClosingDebit - totalClosingCredit) < 1;

  return (
    <div>
      <PageHeader
        title="試算表"
        subtitle="合計残高試算表"
        breadcrumb={['SAP FI', '元帳照会', '試算表']}
        actions={
          <div className={`text-sm font-medium px-3 py-1 rounded-full ${
            isBalanced ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
          }`}>
            {isBalanced ? '✓ 貸借一致' : '⚠ 貸借不一致'}
          </div>
        }
      />

      <div className="p-6 space-y-4">
        {/* Filters */}
        <div className="sap-card p-4">
          <div className="flex items-center gap-4">
            <div>
              <label className="block text-xs text-[#6b7280] mb-1">科目分類</label>
              <select value={filterType} onChange={e => setFilterType(e.target.value)} className="sap-input w-40">
                <option value="all">すべて</option>
                {(['asset', 'liability', 'equity', 'revenue', 'expense'] as AccountType[]).map(t => (
                  <option key={t} value={t}>{ACCOUNT_TYPE_LABELS[t]}</option>
                ))}
              </select>
            </div>
            <div className="flex items-end pb-0.5">
              <label className="flex items-center gap-2 text-sm cursor-pointer">
                <input
                  type="checkbox"
                  checked={showZero}
                  onChange={e => setShowZero(e.target.checked)}
                  className="rounded"
                />
                ゼロ残高科目を表示
              </label>
            </div>
          </div>
        </div>

        {/* Trial Balance Table */}
        <div className="sap-card overflow-hidden">
          <div className="overflow-x-auto">
            <table className="sap-table">
              <thead>
                <tr>
                  <th rowSpan={2} className="align-middle">科目コード</th>
                  <th rowSpan={2} className="align-middle">科目名</th>
                  <th rowSpan={2} className="align-middle">分類</th>
                  <th colSpan={2} className="text-center bg-blue-50">期首残高</th>
                  <th colSpan={2} className="text-center bg-green-50">当期発生</th>
                  <th colSpan={2} className="text-center bg-yellow-50">期末残高</th>
                </tr>
                <tr>
                  <th className="text-right bg-blue-50">借方</th>
                  <th className="text-right bg-blue-50">貸方</th>
                  <th className="text-right bg-green-50">借方</th>
                  <th className="text-right bg-green-50">貸方</th>
                  <th className="text-right bg-yellow-50">借方</th>
                  <th className="text-right bg-yellow-50">貸方</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map(row => (
                  <tr key={row.accountCode}>
                    <td className="font-mono text-[#0070f2] font-medium">{row.accountCode}</td>
                    <td className="font-medium">{row.accountName}</td>
                    <td>
                      <span className={`text-xs px-1.5 py-0.5 rounded-full font-medium ${TYPE_COLORS[row.accountType]}`}>
                        {ACCOUNT_TYPE_LABELS[row.accountType]}
                      </span>
                    </td>
                    <td className="text-right font-mono text-sm">
                      {row.openingDebit > 0 ? `¥${formatAmount(row.openingDebit)}` : ''}
                    </td>
                    <td className="text-right font-mono text-sm">
                      {row.openingCredit > 0 ? `¥${formatAmount(row.openingCredit)}` : ''}
                    </td>
                    <td className="text-right font-mono text-sm">
                      {row.periodDebit > 0 ? `¥${formatAmount(row.periodDebit)}` : ''}
                    </td>
                    <td className="text-right font-mono text-sm">
                      {row.periodCredit > 0 ? `¥${formatAmount(row.periodCredit)}` : ''}
                    </td>
                    <td className={`text-right font-mono text-sm font-medium ${
                      row.normalBalance === 'debit' && row.closingDebit > 0 ? 'text-[#32363a]' : ''
                    }`}>
                      {row.closingDebit > 0 ? `¥${formatAmount(row.closingDebit)}` : ''}
                    </td>
                    <td className={`text-right font-mono text-sm font-medium ${
                      row.normalBalance === 'credit' && row.closingCredit > 0 ? 'text-[#32363a]' : ''
                    }`}>
                      {row.closingCredit > 0 ? `¥${formatAmount(row.closingCredit)}` : ''}
                    </td>
                  </tr>
                ))}
              </tbody>
              <tfoot>
                <tr className="bg-[#f5f6f7] font-bold text-sm">
                  <td colSpan={3} className="px-3 py-2 text-right">合計</td>
                  <td className="px-3 py-2 text-right font-mono">¥{formatAmount(totalOpeningDebit)}</td>
                  <td className="px-3 py-2 text-right font-mono">¥{formatAmount(totalOpeningCredit)}</td>
                  <td className="px-3 py-2 text-right font-mono">¥{formatAmount(totalPeriodDebit)}</td>
                  <td className="px-3 py-2 text-right font-mono">¥{formatAmount(totalPeriodCredit)}</td>
                  <td className="px-3 py-2 text-right font-mono">¥{formatAmount(totalClosingDebit)}</td>
                  <td className="px-3 py-2 text-right font-mono">¥{formatAmount(totalClosingCredit)}</td>
                </tr>
                <tr className={`text-sm font-semibold ${isBalanced ? 'bg-green-50' : 'bg-red-50'}`}>
                  <td colSpan={7} className="px-3 py-2 text-right text-[#6b7280]">差額</td>
                  <td colSpan={2} className={`px-3 py-2 text-right font-mono ${isBalanced ? 'text-[#107e3e]' : 'text-[#bb0000]'}`}>
                    {isBalanced ? '¥0 (一致)' : `¥${formatAmount(Math.abs(totalClosingDebit - totalClosingCredit))}`}
                  </td>
                </tr>
              </tfoot>
            </table>
          </div>
        </div>

        {/* Group Summary */}
        <div className="sap-card p-4">
          <h2 className="text-sm font-semibold mb-3">科目分類別サマリ</h2>
          <div className="grid grid-cols-5 gap-3">
            {(['asset', 'liability', 'equity', 'revenue', 'expense'] as AccountType[]).map(type => {
              const typeRows = rows.filter(r => r.accountType === type);
              const debit = typeRows.reduce((s, r) => s + r.closingDebit, 0);
              const credit = typeRows.reduce((s, r) => s + r.closingCredit, 0);
              const balance = type === 'asset' || type === 'expense' ? debit - credit : credit - debit;
              return (
                <div key={type} className={`p-3 rounded border ${TYPE_COLORS[type].replace('text-', 'border-').split(' ')[0]} bg-white`}>
                  <div className={`text-xs font-semibold mb-2 ${TYPE_COLORS[type].split(' ')[1]}`}>
                    {ACCOUNT_TYPE_LABELS[type]}
                  </div>
                  <div className="text-xs text-[#6b7280]">期末残高</div>
                  <div className="font-bold font-mono text-sm">¥{formatAmount(Math.abs(balance))}</div>
                  <div className="text-xs text-[#6b7280] mt-1">{typeRows.length}科目</div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
