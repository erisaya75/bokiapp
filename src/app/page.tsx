'use client';

import Link from 'next/link';
import { useGL } from '@/context/GLContext';
import { computeBalances, formatAmount, getNetIncome, getTotalAssets } from '@/lib/calculations';
import { DOCUMENT_TYPE_LABELS } from '@/types/gl';
import PageHeader from '@/components/layout/PageHeader';

function StatusBadge({ status }: { status: string }) {
  const map: Record<string, { label: string; cls: string }> = {
    posted:   { label: '転記済', cls: 'bg-emerald-50 text-emerald-700 ring-1 ring-emerald-200' },
    parked:   { label: '仮保存', cls: 'bg-amber-50 text-amber-700 ring-1 ring-amber-200' },
    reversed: { label: '取消済', cls: 'bg-red-50 text-red-700 ring-1 ring-red-200' },
  };
  const { label, cls } = map[status] ?? { label: status, cls: 'bg-gray-100 text-gray-700' };
  return <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${cls}`}>{label}</span>;
}

function TrendArrow({ value }: { value: number }) {
  if (value > 0) return (
    <span className="inline-flex items-center gap-0.5 text-emerald-600 text-xs font-medium">
      <svg viewBox="0 0 16 16" fill="currentColor" className="w-3 h-3"><path d="M8 3l5 6H3l5-6z"/></svg>
      {value}%
    </span>
  );
  if (value < 0) return (
    <span className="inline-flex items-center gap-0.5 text-red-500 text-xs font-medium">
      <svg viewBox="0 0 16 16" fill="currentColor" className="w-3 h-3"><path d="M8 13l5-6H3l5 6z"/></svg>
      {Math.abs(value)}%
    </span>
  );
  return <span className="text-gray-400 text-xs">—</span>;
}

// Simple SVG bar chart for monthly sales
function MonthlySalesChart({ data }: { data: { month: string; value: number }[] }) {
  const max = Math.max(...data.map(d => d.value), 1);
  const height = 80;
  const barWidth = 32;
  const gap = 12;
  const totalWidth = data.length * (barWidth + gap) - gap;

  return (
    <div className="flex flex-col gap-2">
      <svg width={totalWidth} height={height} className="overflow-visible">
        {data.map((d, i) => {
          const barH = Math.round((d.value / max) * (height - 16));
          const x = i * (barWidth + gap);
          const y = height - barH - 4;
          return (
            <g key={d.month}>
              {/* Bar background */}
              <rect x={x} y={4} width={barWidth} height={height - 8} rx={4} fill="#f0f4f8" />
              {/* Bar fill */}
              <rect x={x} y={y} width={barWidth} height={barH} rx={4} fill="#0070f2" opacity={0.85} />
              {/* Value label */}
              <text x={x + barWidth / 2} y={y - 4} textAnchor="middle" fontSize={9} fill="#6b7280" fontFamily="monospace">
                {d.value >= 1000000 ? `${(d.value / 1000000).toFixed(0)}M` : `${(d.value / 1000).toFixed(0)}K`}
              </text>
            </g>
          );
        })}
      </svg>
      <div className="flex gap-3">
        {data.map(d => (
          <div key={d.month} style={{ width: barWidth }} className="text-center text-[10px] text-gray-500 font-medium">
            {d.month}
          </div>
        ))}
      </div>
    </div>
  );
}

export default function Dashboard() {
  const { entries } = useGL();
  const balances = computeBalances(entries);

  const totalAssets = getTotalAssets(balances);
  const netIncome = getNetIncome(balances);
  const netSales = balances.find(b => b.accountCode === '4000')?.balance ?? 0;
  const cashAndBank =
    (balances.find(b => b.accountCode === '1000')?.balance ?? 0) +
    (balances.find(b => b.accountCode === '1100')?.balance ?? 0);

  const recentEntries = [...entries]
    .sort((a, b) => b.postingDate.localeCompare(a.postingDate))
    .slice(0, 8);

  // Compute monthly sales from journal entries
  const monthlySales = [4, 5, 6, 7, 8, 9].map(period => {
    const monthNames = ['', '4月', '5月', '6月', '7月', '8月', '9月', '10月', '11月', '12月', '1月', '2月', '3月'];
    const value = entries
      .filter(e => e.fiscalPeriod === period && e.status !== 'reversed')
      .flatMap(e => e.items)
      .filter(i => i.accountCode === '4000' && i.side === 'credit')
      .reduce((s, i) => s + i.amount, 0);
    return { month: monthNames[period], value };
  });

  const kpis = [
    {
      label: '総資産',
      value: `¥${formatAmount(totalAssets)}`,
      sub: '流動資産 + 固定資産',
      color: 'border-[#0070f2]',
      accent: 'text-[#0070f2]',
      bg: 'bg-[#e8f3ff]',
      trend: 0,
      icon: (
        <svg viewBox="0 0 24 24" fill="none" className="w-5 h-5" stroke="currentColor" strokeWidth={1.8}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 18.75a60.07 60.07 0 0115.797 2.101c.727.198 1.453-.342 1.453-1.096V18.75M3.75 4.5v.75A.75.75 0 013 6h-.75m0 0v-.375c0-.621.504-1.125 1.125-1.125H20.25M2.25 6v9m18-10.5v.75c0 .414.336.75.75.75h.75m-1.5-1.5h.375c.621 0 1.125.504 1.125 1.125v9.75c0 .621-.504 1.125-1.125 1.125h-.375m1.5-1.5H21a.75.75 0 00-.75.75v.75m0 0H3.75m0 0h-.375a1.125 1.125 0 01-1.125-1.125V15m1.5 1.5v-.75A.75.75 0 003 15h-.75" />
        </svg>
      ),
    },
    {
      label: '売上高（累計）',
      value: `¥${formatAmount(netSales)}`,
      sub: '当期累計',
      color: 'border-emerald-500',
      accent: 'text-emerald-600',
      bg: 'bg-emerald-50',
      trend: 12,
      icon: (
        <svg viewBox="0 0 24 24" fill="none" className="w-5 h-5" stroke="currentColor" strokeWidth={1.8}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 18L9 11.25l4.306 4.307a11.95 11.95 0 015.814-5.519l2.74-1.22m0 0l-5.94-2.28m5.94 2.28l-2.28 5.941" />
        </svg>
      ),
    },
    {
      label: '当期純利益',
      value: `¥${formatAmount(netIncome)}`,
      sub: '収益 - 費用',
      color: netIncome >= 0 ? 'border-emerald-500' : 'border-red-500',
      accent: netIncome >= 0 ? 'text-emerald-600' : 'text-red-600',
      bg: netIncome >= 0 ? 'bg-emerald-50' : 'bg-red-50',
      trend: netIncome >= 0 ? 8 : -5,
      icon: (
        <svg viewBox="0 0 24 24" fill="none" className="w-5 h-5" stroke="currentColor" strokeWidth={1.8}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v12m-3-2.818l.879.659c1.171.879 3.07.879 4.242 0 1.172-.879 1.172-2.303 0-3.182C13.536 12.219 12.768 12 12 12c-.725 0-1.45-.22-2.003-.659-1.106-.879-1.106-2.303 0-3.182s2.9-.879 4.006 0l.415.33M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      ),
    },
    {
      label: '現預金残高',
      value: `¥${formatAmount(cashAndBank)}`,
      sub: '現金 + 普通預金',
      color: 'border-orange-400',
      accent: 'text-orange-500',
      bg: 'bg-orange-50',
      trend: -3,
      icon: (
        <svg viewBox="0 0 24 24" fill="none" className="w-5 h-5" stroke="currentColor" strokeWidth={1.8}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M21 12a2.25 2.25 0 00-2.25-2.25H15a3 3 0 11-6 0H5.25A2.25 2.25 0 003 12m18 0v6a2.25 2.25 0 01-2.25 2.25H5.25A2.25 2.25 0 013 18v-6m18 0V9M3 12V9m18 0a2.25 2.25 0 00-2.25-2.25H5.25A2.25 2.25 0 003 9m18 0V6a2.25 2.25 0 00-2.25-2.25H5.25A2.25 2.25 0 003 6v3" />
        </svg>
      ),
    },
  ];

  return (
    <div>
      <PageHeader
        title="ダッシュボード"
        subtitle="財務会計 - 総勘定元帳"
        breadcrumb={['FI', 'ホーム']}
        actions={
          <Link href="/gl/journal/new" className="sap-btn-primary">
            <span className="mr-1">＋</span> 仕訳入力
          </Link>
        }
      />

      <div className="p-6 space-y-5">

        {/* Beginner Guide */}
        <div className="sap-card p-4 bg-gradient-to-r from-blue-50 to-indigo-50 border-blue-100">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <span className="text-lg">💡</span>
              <h2 className="text-sm font-semibold text-blue-900">はじめての方へ — 基本の流れ</h2>
            </div>
            <span className="text-xs text-blue-400">4ステップで完結</span>
          </div>
          <div className="grid grid-cols-4 gap-3">
            {[
              { step: '1', label: '仕訳を入力する', desc: '売上・費用などの取引を記録します', href: '/gl/journal/new', color: 'bg-blue-500' },
              { step: '2', label: '元帳で確認する', desc: '科目ごとの残高や取引履歴を確認します', href: '/gl/ledger', color: 'bg-indigo-500' },
              { step: '3', label: '試算表を見る', desc: 'すべての科目の残高が一覧で確認できます', href: '/gl/trial-balance', color: 'bg-violet-500' },
              { step: '4', label: '財務諸表を確認する', desc: 'BS（貸借対照表）・PL（損益計算書）を見ます', href: '/gl/statements', color: 'bg-purple-500' },
            ].map((s, i) => (
              <Link key={s.step} href={s.href} className="group bg-white rounded-lg p-3 border border-blue-100 hover:border-blue-300 hover:shadow-sm transition-all">
                <div className="flex items-center gap-2 mb-1.5">
                  <span className={`w-5 h-5 rounded-full ${s.color} text-white text-xs font-bold flex items-center justify-center flex-shrink-0`}>
                    {s.step}
                  </span>
                  {i < 3 && (
                    <svg viewBox="0 0 20 20" fill="currentColor" className="w-3 h-3 text-blue-200 absolute" style={{ right: -8 }}>
                      <path fillRule="evenodd" d="M7.21 14.77a.75.75 0 01.02-1.06L11.168 10 7.23 6.29a.75.75 0 111.04-1.08l4.5 4.25a.75.75 0 010 1.08l-4.5 4.25a.75.75 0 01-1.06-.02z" clipRule="evenodd" />
                    </svg>
                  )}
                  <span className="text-xs font-semibold text-gray-800 group-hover:text-blue-700 transition-colors">{s.label}</span>
                </div>
                <p className="text-[10px] text-gray-500 leading-relaxed">{s.desc}</p>
              </Link>
            ))}
          </div>
        </div>

        {/* KPI Cards */}
        <div className="grid grid-cols-4 gap-4">
          {kpis.map(kpi => (
            <div
              key={kpi.label}
              className={`sap-card p-4 border-t-2 ${kpi.color} hover:shadow-md transition-shadow`}
            >
              <div className="flex items-start justify-between mb-3">
                <div className={`w-9 h-9 rounded-lg ${kpi.bg} flex items-center justify-center ${kpi.accent}`}>
                  {kpi.icon}
                </div>
                <TrendArrow value={kpi.trend} />
              </div>
              <div className="text-xs text-gray-500 mb-0.5">{kpi.label}</div>
              <div className={`text-xl font-bold ${kpi.accent} font-mono`}>{kpi.value}</div>
              <div className="text-xs text-gray-400 mt-1">{kpi.sub}</div>
            </div>
          ))}
        </div>

        {/* Chart + Quick Actions row */}
        <div className="grid grid-cols-3 gap-4">
          {/* Monthly Sales Chart */}
          <div className="sap-card col-span-2">
            <div className="px-4 py-3 border-b border-gray-100 flex items-center justify-between">
              <div>
                <h2 className="text-sm font-semibold text-gray-800">月別売上推移</h2>
                <p className="text-xs text-gray-400 mt-0.5">FY2026 (4月〜9月)</p>
              </div>
              <span className="text-xs bg-blue-50 text-blue-600 px-2 py-0.5 rounded font-medium">売上高</span>
            </div>
            <div className="px-4 py-4 overflow-x-auto">
              <MonthlySalesChart data={monthlySales} />
            </div>
          </div>

          {/* Quick Actions */}
          <div className="sap-card">
            <div className="px-4 py-3 border-b border-gray-100">
              <h2 className="text-sm font-semibold text-gray-800">クイックアクション</h2>
            </div>
            <div className="p-3 space-y-2">
              {[
                { href: '/gl/journal/new', label: '仕訳入力', desc: '新規伝票を作成', primary: true },
                { href: '/gl/trial-balance', label: '試算表照会', desc: '残高確認' },
                { href: '/gl/statements', label: '財務諸表', desc: 'BS / PL' },
                { href: '/gl/ledger', label: '総勘定元帳', desc: '元帳照会' },
              ].map(action => (
                <Link
                  key={action.href}
                  href={action.href}
                  className={`flex items-center justify-between p-2.5 rounded-lg text-sm transition-all group ${
                    action.primary
                      ? 'bg-[#0070f2] text-white hover:bg-[#0057c2]'
                      : 'bg-gray-50 text-gray-700 hover:bg-gray-100'
                  }`}
                >
                  <div>
                    <div className="font-medium">{action.label}</div>
                    <div className={`text-xs mt-0.5 ${action.primary ? 'text-blue-100' : 'text-gray-400'}`}>
                      {action.desc}
                    </div>
                  </div>
                  <svg viewBox="0 0 20 20" fill="currentColor" className={`w-4 h-4 opacity-50 group-hover:opacity-100 transition-opacity ${action.primary ? 'text-white' : 'text-gray-400'}`}>
                    <path fillRule="evenodd" d="M7.21 14.77a.75.75 0 01.02-1.06L11.168 10 7.23 6.29a.75.75 0 111.04-1.08l4.5 4.25a.75.75 0 010 1.08l-4.5 4.25a.75.75 0 01-1.06-.02z" clipRule="evenodd" />
                  </svg>
                </Link>
              ))}
            </div>
          </div>
        </div>

        {/* Recent Journal Entries */}
        <div className="sap-card">
          <div className="px-4 py-3 border-b border-gray-100 flex items-center justify-between">
            <h2 className="text-sm font-semibold text-gray-800">最近の仕訳伝票</h2>
            <Link href="/gl/journal" className="text-xs text-[#0070f2] hover:underline font-medium">
              すべて表示 →
            </Link>
          </div>
          <div className="overflow-x-auto">
            <table className="sap-table">
              <thead>
                <tr>
                  <th>伝票番号</th>
                  <th>転記日付</th>
                  <th>伝票タイプ</th>
                  <th>摘要</th>
                  <th className="text-right">借方合計</th>
                  <th className="text-right">貸方合計</th>
                  <th>ステータス</th>
                  <th>作成者</th>
                </tr>
              </thead>
              <tbody>
                {recentEntries.map(entry => {
                  const debit = entry.items.filter(i => i.side === 'debit').reduce((s, i) => s + i.amount, 0);
                  const credit = entry.items.filter(i => i.side === 'credit').reduce((s, i) => s + i.amount, 0);
                  return (
                    <tr key={entry.id}>
                      <td className="font-mono text-[#0070f2] font-medium">
                        <Link href={`/gl/journal/${entry.id}`} className="hover:underline">
                          {entry.documentNumber}
                        </Link>
                      </td>
                      <td className="whitespace-nowrap text-gray-600">{entry.postingDate}</td>
                      <td>
                        <span className="text-xs bg-blue-50 text-blue-600 px-1.5 py-0.5 rounded font-mono font-medium">
                          {entry.type}
                        </span>
                        <span className="text-xs text-gray-400 ml-1.5">{DOCUMENT_TYPE_LABELS[entry.type]}</span>
                      </td>
                      <td className="max-w-[200px] truncate text-gray-700">{entry.description}</td>
                      <td className="text-right font-mono text-gray-700">¥{formatAmount(debit)}</td>
                      <td className="text-right font-mono text-gray-700">¥{formatAmount(credit)}</td>
                      <td><StatusBadge status={entry.status} /></td>
                      <td className="text-gray-400">{entry.createdBy}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

        {/* Bottom row: Account Summary + Status */}
        <div className="grid grid-cols-2 gap-4">
          <div className="sap-card">
            <div className="px-4 py-3 border-b border-gray-100 flex items-center justify-between">
              <h2 className="text-sm font-semibold text-gray-800">主要勘定科目残高</h2>
              <Link href="/gl/trial-balance" className="text-xs text-[#0070f2] hover:underline">詳細 →</Link>
            </div>
            <div className="p-4">
              <table className="w-full text-sm">
                <thead>
                  <tr className="text-xs text-gray-400 border-b border-gray-100">
                    <th className="text-left py-1.5 font-medium">科目名</th>
                    <th className="text-right py-1.5 font-medium">残高</th>
                  </tr>
                </thead>
                <tbody>
                  {balances
                    .filter(b => ['1000', '1100', '1200', '4000', '5000', '5100'].includes(b.accountCode))
                    .map(b => (
                      <tr key={b.accountCode} className="border-b border-gray-50 hover:bg-gray-50 transition-colors">
                        <td className="py-2 text-gray-700">
                          <span className="text-gray-400 font-mono text-xs mr-2">{b.accountCode}</span>
                          {b.accountName}
                        </td>
                        <td className="py-2 text-right font-mono font-medium text-gray-800">
                          ¥{formatAmount(b.balance)}
                        </td>
                      </tr>
                    ))}
                </tbody>
              </table>
            </div>
          </div>

          <div className="sap-card">
            <div className="px-4 py-3 border-b border-gray-100">
              <h2 className="text-sm font-semibold text-gray-800">伝票ステータス集計</h2>
            </div>
            <div className="p-4 space-y-4">
              {([
                { status: 'posted',   label: '転記済', color: 'bg-emerald-500', light: 'bg-emerald-50 text-emerald-700' },
                { status: 'parked',   label: '仮保存', color: 'bg-amber-400',   light: 'bg-amber-50 text-amber-700' },
                { status: 'reversed', label: '取消済', color: 'bg-red-400',     light: 'bg-red-50 text-red-700' },
              ] as const).map(({ status, label, color, light }) => {
                const count = entries.filter(e => e.status === status).length;
                const pct = entries.length > 0 ? Math.round((count / entries.length) * 100) : 0;
                return (
                  <div key={status}>
                    <div className="flex items-center justify-between mb-1.5">
                      <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${light}`}>{label}</span>
                      <span className="text-sm font-semibold text-gray-700">{count}件
                        <span className="text-xs text-gray-400 ml-1">({pct}%)</span>
                      </span>
                    </div>
                    <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                      <div
                        className={`h-full ${color} rounded-full transition-all duration-500`}
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                  </div>
                );
              })}

              <div className="pt-2 mt-2 border-t border-gray-100 flex justify-between text-xs text-gray-400">
                <span>合計</span>
                <span className="font-semibold text-gray-700">{entries.length}件</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
