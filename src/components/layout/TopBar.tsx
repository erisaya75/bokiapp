'use client';

import { useState } from 'react';

export default function TopBar() {
  const [searchFocused, setSearchFocused] = useState(false);

  return (
    <header className="h-12 bg-[#1e3a5f] border-b border-[#2d5282] flex items-center px-4 gap-4 flex-shrink-0 z-10">
      {/* Logo area */}
      <div className="flex items-center gap-2 w-64 flex-shrink-0">
        <div className="w-7 h-7 bg-[#0070f2] rounded flex items-center justify-center flex-shrink-0">
          <svg viewBox="0 0 24 24" fill="none" className="w-4 h-4 text-white" stroke="currentColor" strokeWidth={2.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 18.75a60.07 60.07 0 0115.797 2.101c.727.198 1.453-.342 1.453-1.096V18.75M3.75 4.5v.75A.75.75 0 013 6h-.75m0 0v-.375c0-.621.504-1.125 1.125-1.125H20.25M2.25 6v9m18-10.5v.75c0 .414.336.75.75.75h.75m-1.5-1.5h.375c.621 0 1.125.504 1.125 1.125v9.75c0 .621-.504 1.125-1.125 1.125h-.375m1.5-1.5H21a.75.75 0 00-.75.75v.75m0 0H3.75m0 0h-.375a1.125 1.125 0 01-1.125-1.125V15m1.5 1.5v-.75A.75.75 0 003 15h-.75" />
          </svg>
        </div>
        <span className="text-white font-bold text-sm tracking-wide">BokiApp</span>
        <span className="text-[#7fb3d3] text-xs ml-1">/ FI</span>
      </div>

      {/* Search */}
      <div className={`flex items-center gap-2 bg-[#2d5282] rounded px-3 py-1.5 flex-1 max-w-md transition-all ${searchFocused ? 'ring-1 ring-[#0070f2]' : ''}`}>
        <svg viewBox="0 0 24 24" fill="none" className="w-4 h-4 text-[#7fb3d3] flex-shrink-0" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" />
        </svg>
        <input
          type="text"
          placeholder="伝票番号・科目・摘要を検索..."
          className="bg-transparent text-white placeholder-[#7fb3d3] text-sm outline-none w-full"
          onFocus={() => setSearchFocused(true)}
          onBlur={() => setSearchFocused(false)}
        />
        <kbd className="text-[#7fb3d3] text-xs hidden sm:block opacity-60">⌘K</kbd>
      </div>

      {/* Right area */}
      <div className="flex items-center gap-3 ml-auto">
        {/* Fiscal period indicator */}
        <div className="hidden md:flex items-center gap-1.5 bg-[#2d5282] rounded px-2.5 py-1">
          <div className="w-1.5 h-1.5 bg-green-400 rounded-full animate-pulse" />
          <span className="text-[#c8dff0] text-xs">FY2026 P3</span>
        </div>

        {/* Notification bell */}
        <button className="relative text-[#7fb3d3] hover:text-white transition-colors p-1 rounded hover:bg-[#2d5282]">
          <svg viewBox="0 0 24 24" fill="none" className="w-5 h-5" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M14.857 17.082a23.848 23.848 0 005.454-1.31A8.967 8.967 0 0118 9.75v-.7V9A6 6 0 006 9v.75a8.967 8.967 0 01-2.312 6.022c1.733.64 3.56 1.085 5.455 1.31m5.714 0a24.255 24.255 0 01-5.714 0m5.714 0a3 3 0 11-5.714 0" />
          </svg>
          <span className="absolute top-0.5 right-0.5 w-2 h-2 bg-red-500 rounded-full border border-[#1e3a5f]" />
        </button>

        {/* Help */}
        <button className="text-[#7fb3d3] hover:text-white transition-colors p-1 rounded hover:bg-[#2d5282]">
          <svg viewBox="0 0 24 24" fill="none" className="w-5 h-5" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M9.879 7.519c1.171-1.025 3.071-1.025 4.242 0 1.172 1.025 1.172 2.687 0 3.712-.203.179-.43.326-.67.442-.745.361-1.45.999-1.45 1.827v.75M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-9 5.25h.008v.008H12v-.008z" />
          </svg>
        </button>

        {/* Divider */}
        <div className="h-5 w-px bg-[#2d5282]" />

        {/* User avatar */}
        <div className="flex items-center gap-2 cursor-pointer group">
          <div className="w-7 h-7 rounded-full bg-[#0070f2] flex items-center justify-center text-white text-xs font-bold flex-shrink-0">
            AD
          </div>
          <div className="hidden md:block">
            <div className="text-white text-xs font-medium leading-none">ADMIN</div>
            <div className="text-[#7fb3d3] text-[10px] mt-0.5">会社コード 1000</div>
          </div>
          <svg viewBox="0 0 24 24" fill="none" className="w-3.5 h-3.5 text-[#7fb3d3] hidden md:block" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 8.25l-7.5 7.5-7.5-7.5" />
          </svg>
        </div>
      </div>
    </header>
  );
}
