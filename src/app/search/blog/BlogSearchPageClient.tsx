'use client';

import { BlogSearchSort, searchBlogs } from '@/src/api/blogSearch';
import type { BlogSummary } from '@/src/types/blog';
import { useRouter, useSearchParams } from 'next/navigation';
import { useEffect, useState } from 'react';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import BlogSearchCard from '../../components/search/BlogSearchCard';

const SORT_PARAM_TO_ENUM: Record<string, BlogSearchSort> = {
  latest: 'LATEST',
  views: 'VIEWS',
  popular: 'POPULAR',
};


export default function BlogSearchPage() {
  const params = useSearchParams();
  const router = useRouter();

  const keyword = params.get('keyword') || '';
  const sortParam = params.get('sort');

  useEffect(() => {
    if (!sortParam) {
      router.replace(`/search/blog?keyword=${encodeURIComponent(keyword)}&sort=latest`);
    }
  }, [sortParam, keyword, router]);

  const sortEnum: BlogSearchSort = (sortParam && SORT_PARAM_TO_ENUM[sortParam]) || 'LATEST';

  // ---- 상태값들 ----
  const [items, setItems] = useState<BlogSummary[]>([]);
  const [cursor, setCursor] = useState<string | null>(null);
  const [hasNext, setHasNext] = useState(false);

  const [loading, setLoading] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  // 첫 페이지 로드
  useEffect(() => {
    if (!sortParam) return; // 아직 리다이렉트 전이면 대기

    // 검색어 없으면 API 호출 안 하고 안내만 보여줌
    if (!keyword) {
      setItems([]);
      // setTotalCount(null);
      setCursor(null);
      setHasNext(false);
      setError(null);
      return;
    }

    const load = async () => {
      try {
        setLoading(true);
        setError(null);

        const res = await searchBlogs({
          keyword,
          sort: sortEnum,
          size: 20,
          cursor: null,
        });

        setItems(res.content);
        setCursor(res.nextCursor ?? null);
        setHasNext(res.hasNext);
      } catch (e) {
        console.error('블로그 검색 실패', e);
        setError(e instanceof Error ? e : new Error(String(e)));
      } finally {
        setLoading(false);
      }
    };

    load();
  }, [keyword, sortEnum, sortParam]);

  const handleLoadMore = async () => {
    if (!hasNext || !cursor || loadingMore) return;
    try {
      setLoadingMore(true);
      const res = await searchBlogs({
        keyword,
        sort: sortEnum,
        size: 20,
        cursor,
      });

      setItems((prev) => [...prev, ...res.content]);
      setCursor(res.nextCursor ?? null);
      setHasNext(res.hasNext);
    } catch (e) {
      console.error('검색 더 불러오기 실패', e);
      // 굳이 에러 상태로 전환하지 않고, 토스트만 쓰고 싶으면 여기서 처리
    } finally {
      setLoadingMore(false);
    }
  };

  // ====== UI ======

  // 0) sortParam 세팅 전이면 아무 것도 안 보여줌 (리다이렉트 중)
  if (!sortParam) return null;

  // 1) 검색어가 없는 상태
  if (!keyword) {
    return (
      <>
        <main className="min-h-[60vh]   ">
          <div className="mx-auto w-full max-w-5xl px-4 pb-16 pt-10">
            <div className="mt-10 flex flex-col items-center justify-center">
              <p className="text-lg font-medium text-slate-900">검색어를 입력해주세요</p>
              <p className="mt-2 text-sm text-slate-500">보고 싶은 블로그를 키워드로 찾아보세요.</p>
            </div>
          </div>
        </main>
      </>
    );
  }

  const isEmpty = !loading && !error && items.length === 0;

  return (
    <main className="min-h-[60vh] bg-gradient-to-b ">
      <div>
        {/* 상태별 영역 */}
        {loading ? (
          <div className="flex justify-center py-16 text-sm text-slate-500">
            <LoadingSpinner label="블로그를 검색하는 중입니다" />
          </div>
        ) : error ? (
          <BlogSearchErrorState onRetry={() => router.refresh()} />
        ) : isEmpty ? (
          <BlogSearchEmptyState keyword={keyword} />
        ) : (
          <>
            <div className="pt-2 space-y-2">
              {items.map((blog) => (
                <BlogSearchCard key={blog.id} item={blog} searchKeyword={keyword} />
              ))}
            </div>

            {hasNext && (
              <div className="mt-8 flex justify-center">
                <button
                  type="button"
                  disabled={loadingMore}
                  onClick={handleLoadMore}
                  className="inline-flex items-center rounded-full bg-white px-4 py-2 text-xs font-medium text-slate-700 shadow-sm ring-1 ring-slate-200 hover:bg-slate-50 disabled:opacity-60"
                >
                  {loadingMore ? '불러오는 중…' : '더 보기'}
                </button>
              </div>
            )}

            {!hasNext && items.length > 0 && (
              <p className="mt-6 text-center text-xs text-slate-400">
                모든 검색 결과를 확인했습니다.
              </p>
            )}
          </>
        )}
      </div>
    </main>
  );
}

/* ====== 에러 / 빈 상태 컴포넌트 ====== */

function BlogSearchErrorState({ onRetry }: { onRetry: () => void }) {
  return (
    <div className="mt-10 flex flex-col items-center justify-center rounded-2xl border border-dashed border-rose-100 bg-rose-50/40 px-4 py-10 text-center">
      <p className="text-sm font-medium text-rose-700">검색 중 문제가 발생했어요.</p>
      <p className="mt-1 text-xs text-rose-500">네트워크 상태를 확인하시고 다시 시도해 주세요.</p>
      <button
        type="button"
        onClick={onRetry}
        className="mt-4 inline-flex items-center rounded-full bg-rose-600 px-4 py-1.5 text-xs font-semibold text-white shadow-sm transition hover:bg-rose-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-rose-500 focus-visible:ring-offset-2 focus-visible:ring-offset-rose-50"
      >
        다시 시도
      </button>
    </div>
  );
}


function BlogSearchEmptyState({ keyword }: { keyword: string }) {
  return (
    <div className="flex flex-col items-center justify-center py-16">
      <div className="text-center">
        <div className="mx-auto h-12 w-12 rounded-full bg-slate-100 flex items-center justify-center">
          <svg
            className="h-6 w-6 text-slate-400"
            fill="none"
            viewBox="0 0 24 24"
            strokeWidth={1.5}
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z"
            />
          </svg>
        </div>
        <p className="mt-4 text-lg font-medium text-slate-900">
          {'"'}{keyword}{'"'}에 대한 검색 결과가 없습니다
        </p>
        <p className="mt-2 text-sm text-slate-500">다른 검색어로 시도해보세요</p>
        <div className="mt-4 text-xs text-slate-400">
          <p>• 단어의 철자가 정확한지 확인해보세요</p>
          <p>• 다른 검색어를 사용해보세요</p>
          <p>• 더 일반적인 검색어를 사용해보세요</p>
        </div>
      </div>
    </div>
  );
}
