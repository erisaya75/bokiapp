'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useGL } from '@/context/GLContext';
import { formatAmount, computeBalances } from '@/lib/calculations';
import { DOCUMENT_TYPE_LABELS, DocumentType, JournalStatus } from '@/types/gl';
import PageHeader from '@/components/layout/PageHeader';

function StatusBadge({ status }: { status: JournalStatus }) {
  const map: Record<JournalStatus, { label: string; cls: string }> = {
    posted: { label: '転記済', cls: 'bg-green-100 text-green-800' },
    parked: { label: '仮保存', cls: 'bg-yellow-100 text-yellow-800' },
    reversed: { label: '取消済', cls: 'bg-red-100 text-red-800' },
  };
  const { label, cls } = map[status];
  return <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${cls}`}>{label}</span>;
}

export default function JournalListPage() {
  const { entries, updateEntryStatus } = useGL();
  const [searchText, setSearchText] = useState('');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [filterType, setFilterType] = useState<string>('all');
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');
  const [selectedId, setSelectedId] = useState<string | null>(null);

  const filtered = entries
    .filter(e => filterStatus === 'all' || e.status === filterStatus)
    .filter(e => filterType === 'all' || e.type === filterType)
    .filter(e => !dateFrom || e.postingDate >= dateFrom)
    .filter(e => !dateTo || e.postingDate <= dateTo)
    .filter(e =>
      !searchText ||
      e.documentNumber.includes(searchText) ||
      e.description.toLowerCase().includes(searchText.toLowerCase()) ||
      e.reference.toLowerCase().includes(searchText.toLowerCase())
    )
    .sort((a, b) => b.postingDate.localeCompare(a.postingDate));

  const selected = selectedId ? entries.find(e => e.id === selectedId) : null;

  return (
    <div>
      <PageHeader
        title="仕訳伝票一覧"
        subtitle={`${filtered.length}件`}
        breadcrumb={['SAP FI', '仕訳', '一覧']}
        actions={
          <Link href="/gl/journal/new" className="sap-btn-primary">
            ＋ 新規入力
          </Link>
        }
      />

      <div className="p-6 space-y-4">
        {/* Search & Filter */}
        <div className="sap-card p-4">
          <div className="grid grid-cols-5 gap-3">
            <div>
              <label className="block text-xs text-[#6b7280] mb-1">フリーテキスト</label>
              <input
                type="text"
                placeholder="伝票番号・摘要..."
                value={searchText}
                onChange={e => setSearchText(e.target.value)}
                className="sap-input"
              />
            </div>
            <div>
              <label className="block text-xs text-[#6b7280] mb-1">ステータス</label>
              <select value={filterStatus} onChange={e => setFilterStatus(e.target.value)} className="sap-input">
                <option value="all">すべて</option>
                <option value="posted">転記済</option>
                <option value="parked">仮保存</option>
                <option value="reversed">取消済</option>
              </select>
            </div>
            <div>
              <label className="block text-xs text-[#6b7280] mb-1">伝票タイプ</label>
              <select value={filterType} onChange={e => setFilterType(e.target.value)} className="sap-input">
                <option value="all">すべて</option>
                {Object.entries(DOCUMENT_TYPE_LABELS).map(([k, v]) => (
                  <option key={k} value={k}>{k} - {v}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-xs text-[#6b7280] mb-1">転記日付（From）</label>
              <input type="date" value={dateFrom} onChange={e => setDateFrom(e.target.value)} className="sap-input" />
            </div>
            <div>
              <label className="block text-xs text-[#6b7280] mb-1">転記日付（To）</label>
              <input type="date" value={dateTo} onChange={e => setDateTo(e.target.value)} className="sap-input" />
            </div>
          </div>
        </div>

        <div className={`grid gap-4 ${selected ? 'grid-cols-[1fr,380px]' : 'grid-cols-1'}`}>
          {/* Table */}
          <div className="sap-card overflow-hidden">
            <div className="overflow-x-auto">
              <table className="sap-table">
                <thead>
                  <tr>
                    <th>伝票番号</th>
                    <th>転記日付</th>
                    <th>伝票日付</th>
                    <th>タイプ</th>
                    <th>摘要</th>
                    <th>参照番号</th>
                    <th className="text-right">借方合計</th>
                    <th>ステータス</th>
                    <th>操作</th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.map(entry => {
                    const debit = entry.items.filter(i => i.side === 'debit').reduce((s, i) => s + i.amount, 0);
                    const isSelected = selectedId === entry.id;
                    return (
                      <tr
                        key={entry.id}
                        className={isSelected ? 'bg-[#e8f3ff]' : ''}
                        onClick={() => setSelectedId(isSelected ? null : entry.id)}
                        style={{ cursor: 'pointer' }}
                      >
                        <td className="font-mono text-[#0070f2] font-medium">{entry.documentNumber}</td>
                        <td className="whitespace-nowrap">{entry.postingDate}</td>
                        <td className="whitespace-nowrap text-[#6b7280]">{entry.documentDate}</td>
                        <td>
                          <span className="text-xs bg-[#e8f3ff] text-[#0070f2] px-1.5 py-0.5 rounded font-mono">
                            {entry.type}
                          </span>
                        </td>
                        <td className="max-w-[200px] truncate">{entry.description}</td>
                        <td className="text-[#6b7280] text-xs">{entry.reference || '-'}</td>
                        <td className="text-right font-mono">¥{formatAmount(debit)}</td>
                        <td><StatusBadge status={entry.status} /></td>
                        <td>
                          {entry.status === 'parked' && (
                            <button
                              onClick={e => { e.stopPropagation(); updateEntryStatus(entry.id, 'posted'); }}
                              className="text-xs text-[#0070f2] hover:underline"
                            >
                              転記
                            </button>
                          )}
                          {entry.status === 'posted' && (
                            <button
                              onClick={e => { e.stopPropagation(); updateEntryStatus(entry.id, 'reversed'); }}
                              className="text-xs text-[#bb0000] hover:underline ml-1"
                            >
                              取消
                            </button>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                  {filtered.length === 0 && (
                    <tr>
                      <td colSpan={9} className="text-center text-[#6b7280] py-8">
                        該当する仕訳伝票がありません
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* Detail Panel */}
          {selected && (
            <div className="sap-card">
              <div className="px-4 py-3 border-b border-[#d9d9d9] flex items-center justify-between">
                <h3 className="text-sm font-semibold">伝票明細</h3>
                <button onClick={() => setSelectedId(null)} className="text-[#6b7280] hover:text-[#32363a] text-lg leading-none">×</button>
              </div>
              <div className="p-4 space-y-3 text-sm">
                <div className="grid grid-cols-2 gap-2 text-xs">
                  <div>
                    <div className="text-[#6b7280]">伝票番号</div>
                    <div className="font-mono font-medium">{selected.documentNumber}</div>
                  </div>
                  <div>
                    <div className="text-[#6b7280]">伝票タイプ</div>
                    <div>{selected.type} - {DOCUMENT_TYPE_LABELS[selected.type]}</div>
                  </div>
                  <div>
                    <div className="text-[#6b7280]">転記日付</div>
                    <div>{selected.postingDate}</div>
                  </div>
                  <div>
                    <div className="text-[#6b7280]">会計年度/期間</div>
                    <div>{selected.fiscalYear} / {selected.fiscalPeriod}</div>
                  </div>
                  <div className="col-span-2">
                    <div className="text-[#6b7280]">摘要</div>
                    <div>{selected.description}</div>
                  </div>
                  {selected.reference && (
                    <div className="col-span-2">
                      <div className="text-[#6b7280]">参照番号</div>
                      <div>{selected.reference}</div>
                    </div>
                  )}
                </div>

                <div className="border-t border-[#d9d9d9] pt-3">
                  <div className="text-xs font-semibold text-[#6b7280] mb-2">明細行</div>
                  <table className="w-full text-xs">
                    <thead>
                      <tr className="border-b border-[#d9d9d9]">
                        <th className="text-left py-1">科目</th>
                        <th className="text-right py-1">借方</th>
                        <th className="text-right py-1">貸方</th>
                      </tr>
                    </thead>
                    <tbody>
                      {selected.items.map(item => (
                        <tr key={item.lineNo} className="border-b border-[#f0f0f0]">
                          <td className="py-1">
                            <div className="font-mono text-[#6b7280]">{item.accountCode}</div>
                            <div className="truncate max-w-[120px]">{item.text}</div>
                          </td>
                          <td className="py-1 text-right font-mono">
                            {item.side === 'debit' ? `¥${formatAmount(item.amount)}` : ''}
                          </td>
                          <td className="py-1 text-right font-mono">
                            {item.side === 'credit' ? `¥${formatAmount(item.amount)}` : ''}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                    <tfoot>
                      <tr className="border-t border-[#d9d9d9] font-semibold">
                        <td className="py-1">合計</td>
                        <td className="py-1 text-right font-mono">
                          ¥{formatAmount(selected.items.filter(i => i.side === 'debit').reduce((s, i) => s + i.amount, 0))}
                        </td>
                        <td className="py-1 text-right font-mono">
                          ¥{formatAmount(selected.items.filter(i => i.side === 'credit').reduce((s, i) => s + i.amount, 0))}
                        </td>
                      </tr>
                    </tfoot>
                  </table>
                </div>

                <div className="text-xs text-[#6b7280] border-t border-[#d9d9d9] pt-2">
                  作成者: {selected.createdBy} / {selected.createdAt}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
