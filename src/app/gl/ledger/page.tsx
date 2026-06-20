'use client';

import { useState } from 'react';
import { useGL } from '@/context/GLContext';
import { accounts } from '@/data/accounts';
import { formatAmount } from '@/lib/calculations';
import { ACCOUNT_TYPE_LABELS, AccountType } from '@/types/gl';
import PageHeader from '@/components/layout/PageHeader';

export default function LedgerPage() {
  const { entries } = useGL();
  const [selectedAccount, setSelectedAccount] = useState('1100');

  const account = accounts.find(a => a.code === selectedAccount);
  const posted = entries.filter(e => e.status === 'posted');

  // Get all line items for selected account
  const ledgerLines: Array<{
    entryId: string;
    docNumber: string;
    postingDate: string;
    description: string;
    type: string;
    side: 'debit' | 'credit';
    amount: number;
    text: string;
    runningBalance: number;
  }> = [];

  let running = 0;
  const sortedEntries = [...posted].sort((a, b) => a.postingDate.localeCompare(b.postingDate));
  for (const entry of sortedEntries) {
    for (const item of entry.items) {
      if (item.accountCode !== selectedAccount) continue;
      if (account) {
        if (account.normalBalance === 'debit') {
          running += item.side === 'debit' ? item.amount : -item.amount;
        } else {
          running += item.side === 'credit' ? item.amount : -item.amount;
        }
      }
      ledgerLines.push({
        entryId: entry.id,
        docNumber: entry.documentNumber,
        postingDate: entry.postingDate,
        description: entry.description,
        type: entry.type,
        side: item.side,
        amount: item.amount,
        text: item.text,
        runningBalance: running,
      });
    }
  }

  const totalDebit = ledgerLines.filter(l => l.side === 'debit').reduce((s, l) => s + l.amount, 0);
  const totalCredit = ledgerLines.filter(l => l.side === 'credit').reduce((s, l) => s + l.amount, 0);
  const balance = account?.normalBalance === 'debit' ? totalDebit - totalCredit : totalCredit - totalDebit;

  const typeColors: Record<AccountType, string> = {
    asset: 'text-blue-700',
    liability: 'text-purple-700',
    equity: 'text-green-700',
    revenue: 'text-emerald-700',
    expense: 'text-orange-700',
  };

  return (
    <div>
      <PageHeader
        title="総勘定元帳"
        subtitle="勘定科目別取引明細"
        breadcrumb={['SAP FI', '元帳照会', '総勘定元帳']}
      />

      <div className="p-6 space-y-4">
        {/* Account Selector */}
        <div className="sap-card p-4">
          <div className="grid grid-cols-3 gap-4">
            <div className="col-span-1">
              <label className="block text-xs text-[#6b7280] mb-1">勘定科目</label>
              <select
                value={selectedAccount}
                onChange={e => setSelectedAccount(e.target.value)}
                className="sap-input"
              >
                {accounts.map(a => (
                  <option key={a.code} value={a.code}>
                    {a.code} - {a.name}
                  </option>
                ))}
              </select>
            </div>
            {account && (
              <div className="col-span-2 flex items-end gap-6 pb-0.5">
                <div>
                  <div className="text-xs text-[#6b7280]">科目名</div>
                  <div className="font-semibold">{account.name}</div>
                </div>
                <div>
                  <div className="text-xs text-[#6b7280]">分類</div>
                  <div className={`font-medium ${account ? typeColors[account.type] : ''}`}>
                    {account ? ACCOUNT_TYPE_LABELS[account.type] : ''}
                  </div>
                </div>
                <div>
                  <div className="text-xs text-[#6b7280]">正常残高</div>
                  <div>{account.normalBalance === 'debit' ? '借方' : '貸方'}</div>
                </div>
                <div>
                  <div className="text-xs text-[#6b7280]">グループ</div>
                  <div>{account.group}</div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Balance Summary */}
        <div className="grid grid-cols-3 gap-4">
          <div className="sap-card p-4 border-l-4 border-l-sky-400">
            <div className="text-xs text-[#6b7280]">借方合計</div>
            <div className="text-lg font-bold font-mono">¥{formatAmount(totalDebit)}</div>
          </div>
          <div className="sap-card p-4 border-l-4 border-l-violet-400">
            <div className="text-xs text-[#6b7280]">貸方合計</div>
            <div className="text-lg font-bold font-mono">¥{formatAmount(totalCredit)}</div>
          </div>
          <div className={`sap-card p-4 border-l-4 ${balance >= 0 ? 'border-l-[#107e3e]' : 'border-l-[#bb0000]'}`}>
            <div className="text-xs text-[#6b7280]">残高</div>
            <div className="text-lg font-bold font-mono">¥{formatAmount(Math.abs(balance))}</div>
            <div className="text-xs text-[#6b7280]">{account?.normalBalance === 'debit' ? '借方残高' : '貸方残高'}</div>
          </div>
        </div>

        {/* Ledger Table */}
        <div className="sap-card overflow-hidden">
          <div className="px-4 py-3 border-b border-[#d9d9d9]">
            <h2 className="text-sm font-semibold text-[#32363a]">
              {account?.name} - 取引明細 ({ledgerLines.length}件)
            </h2>
          </div>
          <div className="overflow-x-auto">
            <table className="sap-table">
              <thead>
                <tr>
                  <th>伝票番号</th>
                  <th>転記日付</th>
                  <th>タイプ</th>
                  <th>摘要</th>
                  <th>テキスト</th>
                  <th className="text-right">借方</th>
                  <th className="text-right">貸方</th>
                  <th className="text-right">残高</th>
                </tr>
              </thead>
              <tbody>
                {ledgerLines.length === 0 && (
                  <tr>
                    <td colSpan={8} className="text-center text-[#6b7280] py-8">
                      この勘定科目の取引明細がありません
                    </td>
                  </tr>
                )}
                {ledgerLines.map((line, idx) => (
                  <tr key={idx}>
                    <td className="font-mono text-sm text-[#0070f2]">{line.docNumber}</td>
                    <td className="whitespace-nowrap">{line.postingDate}</td>
                    <td>
                      <span className="text-xs bg-[#e8f3ff] text-[#0070f2] px-1.5 py-0.5 rounded font-mono">
                        {line.type}
                      </span>
                    </td>
                    <td className="max-w-[200px] truncate">{line.description}</td>
                    <td className="text-[#6b7280] text-sm max-w-[150px] truncate">{line.text}</td>
                    <td className="text-right font-mono text-sm">
                      {line.side === 'debit' ? `¥${formatAmount(line.amount)}` : ''}
                    </td>
                    <td className="text-right font-mono text-sm">
                      {line.side === 'credit' ? `¥${formatAmount(line.amount)}` : ''}
                    </td>
                    <td className={`text-right font-mono text-sm font-medium ${line.runningBalance >= 0 ? '' : 'text-[#bb0000]'}`}>
                      ¥{formatAmount(Math.abs(line.runningBalance))}
                      {line.runningBalance < 0 && <span className="text-xs ml-1">(逆)</span>}
                    </td>
                  </tr>
                ))}
              </tbody>
              {ledgerLines.length > 0 && (
                <tfoot>
                  <tr className="bg-[#f5f6f7] font-semibold">
                    <td colSpan={5} className="px-3 py-2 text-right">合計</td>
                    <td className="px-3 py-2 text-right font-mono">¥{formatAmount(totalDebit)}</td>
                    <td className="px-3 py-2 text-right font-mono">¥{formatAmount(totalCredit)}</td>
                    <td className="px-3 py-2 text-right font-mono">¥{formatAmount(Math.abs(balance))}</td>
                  </tr>
                </tfoot>
              )}
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
