'use client';

import { useAuth } from '@/src/providers/AuthProvider';
import { Clock, Search, X } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useEffect, useRef, useState } from 'react';
import {
  deleteSearchHistory,
  fetchRecommendedKeywords,
  fetchSearchHistory,
  fetchTop10Keywords,
  saveSearchHistory,
} from './panel/SearchPanel';
import type { RecommendedKeyword, SearchHistoryItem } from './panel/SearchPanel';

function useDebounce<T>(value: T, delay: number) {
  const [debouncedValue, setDebouncedValue] = useState(value);
  useEffect(() => {
    const handler = setTimeout(() => setDebouncedValue(value), delay);
    return () => clearTimeout(handler);
  }, [value, delay]);
  return debouncedValue;
}

export default function SearchSheet({
  initialKeyword = '',
  onClose,
  onSearch,
}: {
  initialKeyword?: string;
  onClose: () => void;
  onSearch: (keyword: string) => void;
}) {
  const { isLogin } = useAuth();
  const [keyword, setKeyword] = useState(initialKeyword);
  const [top10Keywords, setTop10Keywords] = useState<RecommendedKeyword[]>([]);
  const [searchHistory, setSearchHistory] = useState<SearchHistoryItem[]>([]);
  const [autocomplete, setAutocomplete] = useState<RecommendedKeyword[]>([]);
  const debouncedKeyword = useDebounce(keyword, 300);
  const router = useRouter();
  const inputRef = useRef<HTMLInputElement>(null);

  // 추천 검색어 + 내 검색 기록 병렬 호출
  useEffect(() => {
    async function loadAll() {
      try {
        const [recommended, history] = await Promise.all([
          fetchTop10Keywords(),
          isLogin ? fetchSearchHistory() : Promise.resolve([]),
        ]);
        if (recommended) setTop10Keywords(recommended);
        if (history) setSearchHistory(history);
      } finally {
        // 로드 완료
      }
    }
    loadAll();
  }, [isLogin]);

  // 자동완성
  useEffect(() => {
    async function loadAutocomplete() {
      if (!debouncedKeyword.trim()) {
        setAutocomplete([]);
        return;
      }
      const auto = await fetchRecommendedKeywords(debouncedKeyword);
      if (auto) setAutocomplete(auto);
    }
    loadAutocomplete();
  }, [debouncedKeyword]);

  // 자동 포커스
  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  // Body scroll lock
  useEffect(() => {
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = '';
    };
  }, []);

  // ESC 키 닫기
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [onClose]);

  const handleDeleteHistory = async (id: number) => {
    const success = await deleteSearchHistory(id);
    if (success) {
      setSearchHistory((prev) => prev.filter((item) => item.id !== id));
    }
  };

  const handleSearch = async (kw: string) => {
    if (!kw.trim()) return;
    try {
      await saveSearchHistory(kw);
    } catch (err) {
      console.error('검색 기록 저장 실패:', err);
    }
    onSearch(kw);
    router.push(`/search/shorlog?keyword=${encodeURIComponent(kw)}`);
    onClose();
  };

  const showRecommendedOnly = !keyword && !isLogin;
  const showRecentAndRecommend = !keyword && isLogin;
  const showAutoResults = autocomplete.length > 0 && keyword.length > 0;

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/40 z-[75]"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* 전체화면 검색 시트 */}
      <div
        role="dialog"
        aria-modal="true"
        aria-label="검색"
        className="fixed inset-0 z-[80] bg-white flex flex-col animate-fade-in"
      >
        {/* 헤더 */}
        <div className="flex items-center gap-2 px-3 py-3 border-b border-gray-100">
          <button
            type="button"
            onClick={onClose}
            aria-label="검색 닫기"
            className="p-2 rounded-full hover:bg-gray-100 flex-shrink-0"
          >
            <X size={20} />
          </button>

          <div className="flex-1 relative">
            <Search
              size={16}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none"
            />
            <input
              ref={inputRef}
              type="text"
              placeholder="통합 검색어를 입력해주세요."
              value={keyword}
              onChange={(e) => setKeyword(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') handleSearch(keyword);
              }}
              className="
                w-full h-10 bg-gray-100 rounded-full pl-9 pr-10
                text-[15px] outline-none border border-gray-200
                focus:bg-white focus:ring-2 focus:ring-blue-100 transition
              "
            />
            {keyword && (
              <button
                onClick={() => setKeyword('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-gray-500 hover:bg-gray-200 rounded-full"
              >
                <X size={14} />
              </button>
            )}
          </div>
        </div>

        {/* 콘텐츠 */}
        <div className="flex-1 overflow-y-auto px-4 py-4 space-y-6">
          {/* 자동완성 */}
          {showAutoResults && (
            <ul className="space-y-1">
              {autocomplete.map((item) => (
                <li
                  key={item.keyword}
                  onClick={() => handleSearch(item.keyword)}
                  className="flex items-center gap-2 px-2 py-2 rounded-lg hover:bg-gray-100 cursor-pointer"
                >
                  <Search size={16} className="text-gray-400 flex-shrink-0" />
                  {item.keyword}
                </li>
              ))}
            </ul>
          )}

          {/* 로그인: 최근 검색어 + 추천 검색어 */}
          {showRecentAndRecommend && (
            <>
              <div>
                <h3 className="text-sm text-gray-500 mb-2">최근 검색어</h3>
                <ul className="space-y-1">
                  {searchHistory.map((item) => (
                    <li
                      key={item.id}
                      onClick={() => handleSearch(item.keyword)}
                      className="flex items-center gap-2 px-2 py-2 rounded-lg hover:bg-gray-100 cursor-pointer"
                    >
                      <Clock size={14} className="text-gray-400 flex-shrink-0" />
                      <span className="flex-1">{item.keyword}</span>
                      <button
                        className="p-1 hover:bg-gray-200 rounded-full"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDeleteHistory(item.id);
                        }}
                      >
                        <X size={12} className="text-gray-500" />
                      </button>
                    </li>
                  ))}
                </ul>
              </div>

              <div>
                <h3 className="text-sm text-gray-500 mb-2">추천 검색어</h3>
                <ul className="space-y-1">
                  {top10Keywords.map((item) => (
                    <li
                      key={item.keyword}
                      onClick={() => handleSearch(item.keyword)}
                      className="px-2 py-2 rounded-lg hover:bg-gray-100 cursor-pointer flex items-center gap-2"
                    >
                      • {item.keyword}
                    </li>
                  ))}
                </ul>
              </div>
            </>
          )}

          {/* 비로그인: 추천 검색어만 */}
          {showRecommendedOnly && (
            <div>
              <h3 className="text-sm text-gray-500 mb-2">추천 검색어</h3>
              <ul className="space-y-1">
                {top10Keywords.map((item) => (
                  <li
                    key={item.keyword}
                    onClick={() => handleSearch(item.keyword)}
                    className="px-2 py-2 rounded-lg hover:bg-gray-100 cursor-pointer"
                  >
                    • {item.keyword}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      </div>
    </>
  );
}
