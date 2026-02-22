'use client';

import { useAuth } from '@/src/providers/AuthProvider';
import { Clock, Search, X } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL;

export type RecommendedKeyword = {
  keyword: string;
  count: number;
};

export type SearchHistoryItem = {
  id: number;
  keyword: string;
  createdAt: string;
};

export default function SearchPanel({
  onClose,
  onSearch,
  initialKeyword = '',
}: {
  onClose: () => void;
  onSearch: (keyword: string) => void;
  initialKeyword?: string;
}) {
  const { isLogin } = useAuth();
  const [keyword, setKeyword] = useState(initialKeyword);
  const [top10Keywords, setTop10Keywords] = useState<RecommendedKeyword[]>([]);
  const [searchHistory, setSearchHistory] = useState<SearchHistoryItem[]>([]);
  const [autocomplete, setAutocomplete] = useState<RecommendedKeyword[]>([]);
  const debouncedKeyword = useDebounce(keyword, 300); // 0.3초 후 요청
  const router = useRouter();

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

  // 검색 기록 삭제
  const handleDeleteHistory = async (id: number) => {
    const success = await deleteSearchHistory(id);
    if (success) {
      setSearchHistory((prev) => prev.filter((item) => item.id !== id));
    }
  };

  // 검색어 입력 시 검색 실행
  const handleSearch = async (keyword: string) => {
    if (!keyword.trim()) return;

    try {
      await saveSearchHistory(keyword);
    } catch (err) {
      console.error('검색 기록 저장 실패:', err);
    }

    onSearch(keyword);
    router.push(`/search/shorlog?keyword=${encodeURIComponent(keyword)}`);
    onClose();
  };

  const showRecommendedOnly = !keyword && !isLogin;
  const showRecentAndRecommend = !keyword && isLogin;
  const showAutoResults = autocomplete.length > 0 && keyword.length > 0;

  return (
    <div>
      <div
        className="
          fixed left-20 top-0 
          w-80 h-screen 
          bg-white border-r border-gray-200 
          shadow-md animate-slideIn 
          z-[110]
        "
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-8 h-16">
          <h2 className="text-xl font-semibold">검색</h2>
          <button onClick={onClose} className="p-2 rounded-full hover:bg-gray-100">
            <X size={22} />
          </button>
        </div>

        {/* 검색 입력 */}
        <div className="flex-1 relative px-4 py-1">
          <input
            type="text"
            autoFocus
            placeholder="통합 검색어를 입력해주세요."
            value={keyword}
            onChange={(e) => setKeyword(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                handleSearch(keyword);
              }
            }}
            className="
              w-full h-10 bg-gray-100 rounded-full pl-4 pr-10
              text-[15px] outline-none border border-gray-200
              focus:bg-white focus:ring-2 focus:ring-blue-100 transition
            "
          />

          {/* 입력 초기화 버튼 */}
          {keyword && (
            <button
              onClick={() => setKeyword('')}
              className="absolute right-7 top-1/2 -translate-y-1/2 p-1 text-gray-500 hover:bg-gray-200 rounded-full"
            >
              <X size={14} />
            </button>
          )}
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto px-6 py-4 space-y-6">
          {/* 자동완성 */}
          {showAutoResults && (
            <div>
              <ul className="space-y-2">
                {autocomplete.map((item) => (
                  <li
                    key={item.keyword}
                    onClick={() => handleSearch(item.keyword)}
                    className="flex items-center gap-2 px-2 py-2 rounded-lg hover:bg-gray-100 cursor-pointer"
                  >
                    <Search size={18} className="text-gray-500" />
                    {item.keyword}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* 로그인 상태: 최근 검색어 + 추천 검색어 */}
          {showRecentAndRecommend && (
            <>
              {/* 최근 검색어 */}
              <div>
                <h3 className="text-sm text-gray-500 mb-2">최근 검색어</h3>
                <ul className="space-y-1">
                  {searchHistory.map((item) => (
                    <li
                      key={item.id}
                      onClick={() => handleSearch(item.keyword)}
                      className="flex items-center gap-2 px-1 py-1 rounded-lg hover:bg-gray-100 cursor-pointer"
                    >
                      <div className="w-4 h-4 flex items-center justify-center">
                        <Clock size={12} className="text-gray-600" />
                      </div>

                      {item.keyword}

                      <button
                        className="ml-auto p-1 hover:bg-gray-200 rounded-full"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDeleteHistory(item.id);
                        }}
                      >
                        <X size={12} className="text-gray-600" />
                      </button>
                    </li>
                  ))}
                </ul>
              </div>

              {/* 추천 검색어 */}
              <div>
                <h3 className="text-sm text-gray-500 mb-2">추천 검색어</h3>
                <ul className="space-y-1">
                  {top10Keywords.map((item) => (
                    <li
                      key={item.keyword}
                      onClick={() => handleSearch(item.keyword)}
                      className="px-1 py-1 rounded-lg hover:bg-gray-100 cursor-pointer flex items-center gap-2"
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
                    className="px-1 py-1 rounded-lg hover:bg-gray-100 cursor-pointer"
                  >
                    • {item.keyword}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

/* ================================
    API FUNCTIONS
================================ */

export async function fetchTop10Keywords() {
  try {
    const res = await fetch(`${API_BASE_URL}/api/v1/search/trends/top10`, {
      method: 'GET',
      headers: {
        Accept: 'application/json',
      },
    });

    if (!res.ok) throw new Error('Failed to fetch top 10 keywords');

    const json = await res.json();
    return json.data as RecommendedKeyword[];
  } catch (err) {
    console.error(err);
    return null;
  }
}

export async function fetchRecommendedKeywords(params: string) {
  try {
    const res = await fetch(`${API_BASE_URL}/api/v1/search/trends/recommend?keyword=${params}`, {
      method: 'GET',
      headers: {
        Accept: 'application/json',
      },
    });

    if (!res.ok) throw new Error('Failed to fetch recommended keywords');

    const json = await res.json();
    return json.data as RecommendedKeyword[];
  } catch (err) {
    console.error(err);
    return null;
  }
}

export async function fetchSearchHistory() {
  try {
    const res = await fetch(`${API_BASE_URL}/api/v1/search/history`, {
      method: 'GET',
      credentials: 'include',
      headers: {
        Accept: 'application/json',
      },
    });

    if (!res.ok) throw new Error('Failed to fetch search history');

    const json = await res.json();
    return json.data as SearchHistoryItem[];
  } catch (err) {
    console.error(err);
    return null;
  }
}

export async function deleteSearchHistory(id: number) {
  try {
    const res = await fetch(`${API_BASE_URL}/api/v1/search/history/${id}`, {
      method: 'DELETE',
      credentials: 'include',
      headers: {
        Accept: 'application/json',
      },
    });

    if (!res.ok) throw new Error('Failed to delete search history item');

    return true;
  } catch (err) {
    console.error(err);
    return false;
  }
}

function useDebounce<T>(value: T, delay: number) {
  const [debouncedValue, setDebouncedValue] = useState(value);

  useEffect(() => {
    const handler = setTimeout(() => setDebouncedValue(value), delay);
    return () => clearTimeout(handler);
  }, [value, delay]);

  return debouncedValue;
}

export async function saveSearchHistory(keyword: string) {
  await fetch(`${API_BASE_URL}/api/v1/search?keyword=${encodeURIComponent(keyword)}`, {
    method: 'POST',
    credentials: 'include',
    headers: { Accept: 'application/json' },
  });
}
