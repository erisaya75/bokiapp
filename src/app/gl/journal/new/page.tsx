'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useGL } from '@/context/GLContext';
import { accounts } from '@/data/accounts';
import { formatAmount, getNextDocumentNumber } from '@/lib/calculations';
import { DocumentType, DOCUMENT_TYPE_LABELS, JournalLineItem } from '@/types/gl';
import PageHeader from '@/components/layout/PageHeader';

interface LineItemDraft {
  id: number;
  accountCode: string;
  side: 'debit' | 'credit';
  amount: string;
  text: string;
}

const DOCUMENT_TYPES: DocumentType[] = ['SA', 'KR', 'DR', 'AA', 'ZP'];

export default function NewJournalPage() {
  const router = useRouter();
  const { entries, addEntry } = useGL();

  const today = new Date().toISOString().split('T')[0];

  const [postingDate, setPostingDate] = useState(today);
  const [documentDate, setDocumentDate] = useState(today);
  const [docType, setDocType] = useState<DocumentType>('SA');
  const [description, setDescription] = useState('');
  const [reference, setReference] = useState('');
  const [lineItems, setLineItems] = useState<LineItemDraft[]>([
    { id: 1, accountCode: '', side: 'debit', amount: '', text: '' },
    { id: 2, accountCode: '', side: 'credit', amount: '', text: '' },
  ]);
  const [error, setError] = useState('');
  const [submitted, setSubmitted] = useState(false);

  function addLine() {
    const nextId = Math.max(...lineItems.map(i => i.id)) + 1;
    setLineItems(prev => [...prev, { id: nextId, accountCode: '', side: 'debit', amount: '', text: '' }]);
  }

  function removeLine(id: number) {
    if (lineItems.length <= 2) return;
    setLineItems(prev => prev.filter(i => i.id !== id));
  }

  function updateLine(id: number, field: keyof LineItemDraft, value: string) {
    setLineItems(prev => prev.map(i => (i.id === id ? { ...i, [field]: value } : i)));
  }

  const totalDebit = lineItems.filter(i => i.side === 'debit').reduce((s, i) => s + (parseFloat(i.amount) || 0), 0);
  const totalCredit = lineItems.filter(i => i.side === 'credit').reduce((s, i) => s + (parseFloat(i.amount) || 0), 0);
  const isBalanced = totalDebit > 0 && Math.abs(totalDebit - totalCredit) < 0.01;

  function validate(): string {
    if (!postingDate) return '転記日付を入力してください';
    if (!description.trim()) return '摘要を入力してください';
    for (const item of lineItems) {
      if (!item.accountCode) return '全明細行に勘定科目を指定してください';
      if (!item.amount || parseFloat(item.amount) <= 0) return '全明細行に正の金額を入力してください';
    }
    if (!isBalanced) return '借方合計と貸方合計が一致していません';
    return '';
  }

  function handlePost(status: 'posted' | 'parked') {
    const err = validate();
    if (err) { setError(err); return; }
    setError('');

    const docNumber = getNextDocumentNumber(entries);
    const items: JournalLineItem[] = lineItems.map((li, idx) => ({
      lineNo: idx + 1,
      accountCode: li.accountCode,
      side: li.side,
      amount: parseFloat(li.amount),
      text: li.text,
    }));

    const postingDateParsed = new Date(postingDate);
    const month = postingDateParsed.getMonth() + 1;
    const fiscalPeriod = month >= 4 ? month - 3 : month + 9;
    const fiscalYear = month >= 4 ? postingDateParsed.getFullYear() + 1 : postingDateParsed.getFullYear();

    addEntry({
      id: String(Date.now()),
      documentNumber: docNumber,
      postingDate,
      documentDate,
      type: docType,
      companyCode: '1000',
      fiscalYear,
      fiscalPeriod,
      description,
      reference,
      items,
      status,
      createdBy: 'ADMIN',
      createdAt: new Date().toISOString(),
    });

    setSubmitted(true);
    setTimeout(() => router.push('/gl/journal'), 1500);
  }

  if (submitted) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-center">
          <div className="text-4xl mb-3">✓</div>
          <div className="text-lg font-semibold text-[#107e3e]">仕訳伝票を保存しました</div>
          <div className="text-sm text-[#6b7280] mt-1">仕訳一覧に戻ります...</div>
        </div>
      </div>
    );
  }

  return (
    <div>
      <PageHeader
        title="仕訳入力"
        subtitle="新規仕訳伝票作成"
        breadcrumb={['SAP FI', '仕訳', '新規入力']}
        actions={
          <div className="flex gap-2">
            <button onClick={() => router.back()} className="sap-btn-secondary">キャンセル</button>
            <button onClick={() => handlePost('parked')} className="sap-btn-secondary">仮保存</button>
            <button onClick={() => handlePost('posted')} className="sap-btn-primary">転記</button>
          </div>
        }
      />

      <div className="p-6 space-y-4 max-w-5xl">
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded text-sm">
            ⚠ {error}
          </div>
        )}

        {/* Header Section */}
        <div className="sap-card p-5">
          <h2 className="text-sm font-semibold text-[#32363a] mb-4 pb-2 border-b border-[#d9d9d9]">
            伝票ヘッダ
          </h2>
          <div className="grid grid-cols-3 gap-4">
            <div>
              <label className="block text-xs text-[#6b7280] mb-1">転記日付 <span className="text-red-500">*</span></label>
              <input type="date" value={postingDate} onChange={e => setPostingDate(e.target.value)} className="sap-input" />
            </div>
            <div>
              <label className="block text-xs text-[#6b7280] mb-1">伝票日付 <span className="text-red-500">*</span></label>
              <input type="date" value={documentDate} onChange={e => setDocumentDate(e.target.value)} className="sap-input" />
            </div>
            <div>
              <label className="block text-xs text-[#6b7280] mb-1">伝票タイプ <span className="text-red-500">*</span></label>
              <select value={docType} onChange={e => setDocType(e.target.value as DocumentType)} className="sap-input">
                {DOCUMENT_TYPES.map(t => (
                  <option key={t} value={t}>{t} - {DOCUMENT_TYPE_LABELS[t]}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-xs text-[#6b7280] mb-1">会社コード</label>
              <input type="text" value="1000" disabled className="sap-input bg-gray-50 text-[#6b7280]" />
            </div>
            <div>
              <label className="block text-xs text-[#6b7280] mb-1">摘要 <span className="text-red-500">*</span></label>
              <input
                type="text"
                placeholder="取引内容を入力"
                value={description}
                onChange={e => setDescription(e.target.value)}
                className="sap-input"
              />
            </div>
            <div>
              <label className="block text-xs text-[#6b7280] mb-1">参照番号</label>
              <input
                type="text"
                placeholder="SO番号・PO番号など"
                value={reference}
                onChange={e => setReference(e.target.value)}
                className="sap-input"
              />
            </div>
          </div>
        </div>

        {/* Line Items */}
        <div className="sap-card">
          <div className="px-5 py-3 border-b border-[#d9d9d9] flex items-center justify-between">
            <h2 className="text-sm font-semibold text-[#32363a]">明細行</h2>
            <button onClick={addLine} className="text-xs text-[#0070f2] hover:underline">
              ＋ 行追加
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-[#f5f6f7] border-b border-[#d9d9d9]">
                  <th className="text-left px-3 py-2 text-xs font-semibold text-[#32363a] w-8">行</th>
                  <th className="text-left px-3 py-2 text-xs font-semibold text-[#32363a] w-40">勘定科目</th>
                  <th className="text-left px-3 py-2 text-xs font-semibold text-[#32363a] w-28">借/貸</th>
                  <th className="text-left px-3 py-2 text-xs font-semibold text-[#32363a] w-40">金額（円）</th>
                  <th className="text-left px-3 py-2 text-xs font-semibold text-[#32363a]">テキスト</th>
                  <th className="w-8"></th>
                </tr>
              </thead>
              <tbody>
                {lineItems.map((item, idx) => {
                  const account = accounts.find(a => a.code === item.accountCode);
                  return (
                    <tr key={item.id} className="border-b border-[#f0f0f0]">
                      <td className="px-3 py-2 text-[#6b7280] text-xs">{idx + 1}</td>
                      <td className="px-3 py-2">
                        <select
                          value={item.accountCode}
                          onChange={e => updateLine(item.id, 'accountCode', e.target.value)}
                          className="sap-input"
                        >
                          <option value="">-- 選択 --</option>
                          {accounts.map(a => (
                            <option key={a.code} value={a.code}>
                              {a.code} {a.name}
                            </option>
                          ))}
                        </select>
                      </td>
                      <td className="px-3 py-2">
                        <select
                          value={item.side}
                          onChange={e => updateLine(item.id, 'side', e.target.value)}
                          className="sap-input"
                        >
                          <option value="debit">借方 (Dr)</option>
                          <option value="credit">貸方 (Cr)</option>
                        </select>
                      </td>
                      <td className="px-3 py-2">
                        <input
                          type="number"
                          min="0"
                          step="1"
                          placeholder="0"
                          value={item.amount}
                          onChange={e => updateLine(item.id, 'amount', e.target.value)}
                          className="sap-input text-right font-mono"
                        />
                      </td>
                      <td className="px-3 py-2">
                        <input
                          type="text"
                          placeholder="明細テキスト"
                          value={item.text}
                          onChange={e => updateLine(item.id, 'text', e.target.value)}
                          className="sap-input"
                        />
                      </td>
                      <td className="px-3 py-2">
                        <button
                          onClick={() => removeLine(item.id)}
                          disabled={lineItems.length <= 2}
                          className="text-[#6b7280] hover:text-[#bb0000] disabled:opacity-30 text-lg leading-none"
                        >
                          ×
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
              <tfoot>
                <tr className="bg-[#f5f6f7] border-t border-[#d9d9d9]">
                  <td colSpan={3} className="px-3 py-2 text-sm font-semibold text-right">合計</td>
                  <td className="px-3 py-2">
                    <div className="flex flex-col text-xs font-mono">
                      <span className="text-right">借方: ¥{formatAmount(totalDebit)}</span>
                      <span className="text-right">貸方: ¥{formatAmount(totalCredit)}</span>
                    </div>
                  </td>
                  <td colSpan={2} className="px-3 py-2">
                    {totalDebit > 0 && totalCredit > 0 && (
                      <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                        isBalanced
                          ? 'bg-green-100 text-green-800'
                          : 'bg-red-100 text-red-800'
                      }`}>
                        {isBalanced ? '✓ 貸借一致' : `差額: ¥${formatAmount(Math.abs(totalDebit - totalCredit))}`}
                      </span>
                    )}
                  </td>
                </tr>
              </tfoot>
            </table>
          </div>
        </div>

        {/* Actions */}
        <div className="flex justify-end gap-3">
          <button onClick={() => router.back()} className="sap-btn-secondary">キャンセル</button>
          <button onClick={() => handlePost('parked')} className="sap-btn-secondary">仮保存（未転記）</button>
          <button onClick={() => handlePost('posted')} className="sap-btn-primary">転記実行</button>
        </div>
      </div>
    </div>
  );
}
