'use client';

import { Search, X } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';

export default function SearchPanel({ onClose }: { onClose: () => void }) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [mounted] = useState<boolean>(() => typeof document !== 'undefined');

  useEffect(() => {
    inputRef.current?.focus(); // 자동 포커스
  }, []);

  if (!mounted) return null;

  return createPortal(
    <>
      <div
        className="
          fixed left-20 top-0
          w-80 h-screen
          bg-white border-r border-gray-200
          shadow-xl
          animate-slideIn
          z-50
        "
      >
        {/* Header */}
        <div className="flex items-center justify-between px-4 h-16 border-b">
          <h2 className="text-lg font-semibold">검색</h2>
          <button onClick={onClose} className="p-2 rounded-lg hover:bg-gray-100">
            <X size={22} />
          </button>
        </div>

        {/* Search Box */}
        <div className="p-4">
          <div className="relative">
            <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              ref={inputRef}
              type="text"
              placeholder="통합 검색어를 입력하세요..."
              className="
              w-full pl-10 pr-3 py-2
              rounded-lg bg-gray-100
              border border-gray-200
              focus:border-blue-500 outline-none
            "
            />
          </div>
        </div>

        {/* Body */}
        <div className="px-4 py-2">
          <h3 className="text-sm font-semibold text-gray-500 mb-2">최근 검색</h3>
          <div className="text-gray-400 text-sm">최근 검색 기록이 없습니다.</div>
        </div>
      </div>
    </>,
    document.body,
  );
}
