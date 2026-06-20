'use client';

import { useState } from 'react';
import { accounts } from '@/data/accounts';
import { useGL } from '@/context/GLContext';
import { computeBalances, formatAmount } from '@/lib/calculations';
import { AccountType, ACCOUNT_TYPE_LABELS } from '@/types/gl';
import PageHeader from '@/components/layout/PageHeader';

const TYPE_COLORS: Record<AccountType, string> = {
  asset: 'bg-blue-100 text-blue-800',
  liability: 'bg-purple-100 text-purple-800',
  equity: 'bg-green-100 text-green-800',
  revenue: 'bg-emerald-100 text-emerald-800',
  expense: 'bg-orange-100 text-orange-800',
};

export default function AccountsPage() {
  const { entries } = useGL();
  const balances = computeBalances(entries);
  const balanceMap = new Map(balances.map(b => [b.accountCode, b]));

  const [searchText, setSearchText] = useState('');
  const [filterType, setFilterType] = useState<string>('all');

  const filtered = accounts
    .filter(a => filterType === 'all' || a.type === filterType)
    .filter(a =>
      !searchText ||
      a.code.includes(searchText) ||
      a.name.toLowerCase().includes(searchText.toLowerCase())
    );

  const groups = [...new Set(filtered.map(a => a.group))];

  const typeOptions: { value: string; label: string }[] = [
    { value: 'all', label: 'すべて' },
    ...(['asset', 'liability', 'equity', 'revenue', 'expense'] as AccountType[]).map(t => ({
      value: t,
      label: ACCOUNT_TYPE_LABELS[t],
    })),
  ];

  return (
    <div>
      <PageHeader
        title="勘定科目マスタ"
        subtitle={`${filtered.length}科目`}
        breadcrumb={['SAP FI', 'マスタデータ', '勘定科目']}
      />

      <div className="p-6 space-y-4">
        {/* Filter */}
        <div className="sap-card p-4">
          <div className="grid grid-cols-4 gap-3">
            <div className="col-span-2">
              <label className="block text-xs text-[#6b7280] mb-1">科目コード・科目名</label>
              <input
                type="text"
                placeholder="コードまたは科目名で検索..."
                value={searchText}
                onChange={e => setSearchText(e.target.value)}
                className="sap-input"
              />
            </div>
            <div>
              <label className="block text-xs text-[#6b7280] mb-1">科目分類</label>
              <select value={filterType} onChange={e => setFilterType(e.target.value)} className="sap-input">
                {typeOptions.map(o => (
                  <option key={o.value} value={o.value}>{o.label}</option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-5 gap-3">
          {(['asset', 'liability', 'equity', 'revenue', 'expense'] as AccountType[]).map(type => {
            const count = accounts.filter(a => a.type === type).length;
            const total = balances
              .filter(b => b.accountType === type)
              .reduce((s, b) => s + b.balance, 0);
            return (
              <div key={type} className="sap-card p-3">
                <div className={`text-xs px-2 py-0.5 rounded-full font-medium inline-block mb-2 ${TYPE_COLORS[type]}`}>
                  {ACCOUNT_TYPE_LABELS[type]}
                </div>
                <div className="text-xs text-[#6b7280]">{count}科目</div>
                <div className="text-sm font-bold font-mono mt-1">¥{formatAmount(total)}</div>
              </div>
            );
          })}
        </div>

        {/* Account Table */}
        <div className="sap-card overflow-hidden">
          <div className="overflow-x-auto">
            <table className="sap-table">
              <thead>
                <tr>
                  <th>勘定科目コード</th>
                  <th>勘定科目名</th>
                  <th>分類</th>
                  <th>グループ</th>
                  <th>貸借区分</th>
                  <th>状態</th>
                  <th className="text-right">借方合計</th>
                  <th className="text-right">貸方合計</th>
                  <th className="text-right">残高</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map(account => {
                  const bal = balanceMap.get(account.code);
                  return (
                    <tr key={account.code}>
                      <td className="font-mono font-medium text-[#0070f2]">{account.code}</td>
                      <td className="font-medium">{account.name}</td>
                      <td>
                        <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${TYPE_COLORS[account.type]}`}>
                          {ACCOUNT_TYPE_LABELS[account.type]}
                        </span>
                      </td>
                      <td className="text-[#6b7280] text-sm">{account.group}</td>
                      <td>
                        <span className={`text-xs px-2 py-0.5 rounded font-medium ${
                          account.normalBalance === 'debit'
                            ? 'bg-sky-50 text-sky-700'
                            : 'bg-violet-50 text-violet-700'
                        }`}>
                          {account.normalBalance === 'debit' ? '借方' : '貸方'}
                        </span>
                      </td>
                      <td>
                        <span className={`text-xs px-2 py-0.5 rounded-full ${account.isActive ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'}`}>
                          {account.isActive ? '有効' : '無効'}
                        </span>
                      </td>
                      <td className="text-right font-mono text-sm">
                        {bal ? `¥${formatAmount(bal.debitTotal)}` : '-'}
                      </td>
                      <td className="text-right font-mono text-sm">
                        {bal ? `¥${formatAmount(bal.creditTotal)}` : '-'}
                      </td>
                      <td className="text-right font-mono text-sm font-medium">
                        {bal ? `¥${formatAmount(bal.balance)}` : '-'}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
