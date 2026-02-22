'use client';

import { useRouter, useSearchParams } from 'next/navigation';
import { useEffect, useMemo } from 'react';
import { useInfiniteQuery } from '@tanstack/react-query';
import { useInView } from 'react-intersection-observer';
import { searchShorlogs, ShorlogSearchSort } from '../../../api/shorlogSearchApi';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import ShorlogSearchCard from '../../components/shorlog/search/ShorlogSearchCard';

export default function ShorlogSearchPageClient() {
  const params = useSearchParams();
  const router = useRouter();

  const keyword = params.get('keyword') || '';
  const sort = (params.get('sort') as ShorlogSearchSort) || 'latest';

  // ⭐ 기본 정렬값 지정: latest
  useEffect(() => {
    if (!params.get('sort')) {
      router.replace(`/search/shorlog?keyword=${encodeURIComponent(keyword)}&sort=latest`);
    }
  }, [sort, keyword, params, router]);

  const {
    data,
    isLoading,
    isError,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    refetch,
  } = useInfiniteQuery({
    queryKey: ['shorlog-search', keyword, sort],
    queryFn: ({ pageParam = 0 }) => searchShorlogs(keyword, sort, pageParam as number),
    initialPageParam: 0,
    getNextPageParam: (lastPage) =>
      !lastPage.last ? lastPage.pageable.pageNumber + 1 : undefined,
    enabled: !!keyword, // 검색어가 있을 때만 실행
    staleTime: 1000 * 60 * 5, // 5분간 캐시 유지
  });

  const { ref: sentinelRef, inView } = useInView({
    rootMargin: '200px',
    triggerOnce: false,
  });

  useEffect(() => {
    if (inView && hasNextPage && !isFetchingNextPage) {
      fetchNextPage();
    }
  }, [inView, hasNextPage, isFetchingNextPage, fetchNextPage]);

  const items = useMemo(() => {
    const allItems = data?.pages.flatMap((page) => page.content) ?? [];
    return allItems.filter((item, index, self) =>
      index === self.findIndex((t) => t.id === item.id)
    );
  }, [data]);

  const isEmpty = !isLoading && items.length === 0;

  // 검색어가 없으면 검색 안내 표시
  if (!keyword) {
    return (
      <div className="flex flex-col items-center justify-center py-16">
        <div className="text-center">
          <p className="text-lg font-medium text-slate-900">검색어를 입력해주세요</p>
          <p className="mt-2 text-sm text-slate-500">
            관심 있는 숏로그를 검색해보세요
          </p>
        </div>
      </div>
    );
  }

  return (
    <div>
      {/* 검색 결과 헤더 */}
      {/* <div className="mb-6">
        <h1 className="text-xl font-bold text-slate-900">
          "{keyword}" 검색 결과
        </h1>
        {!isLoading && (
          <p className="mt-1 text-sm text-slate-500">
            {totalCount.toLocaleString()}개의 숏로그를 찾았습니다
          </p>
        )}
      </div> */}

      {/* 검색 결과 */}
      {isLoading ? (
        <div className="flex justify-center py-16">
          <LoadingSpinner label="숏로그를 검색하는 중입니다" />
        </div>
      ) : isError ? (
        <ErrorState onRetry={refetch} />
      ) : isEmpty ? (
        <EmptySearchState keyword={keyword} />
      ) : (
        <>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6 gap-3 sm:gap-4 pt-2">
            {items.map((item, index) => (
              <ShorlogSearchCard
                key={item.id}
                item={item}
                index={index}
                allItems={items}
                searchKeyword={keyword}
              />
            ))}
          </div>

          <div ref={sentinelRef} className="h-10 w-full" />

          {isFetchingNextPage && (
            <div className="flex justify-center py-6">
              <LoadingSpinner label="더 많은 검색 결과를 불러오는 중입니다" size="sm" />
            </div>
          )}

          {!hasNextPage && items.length > 0 && (
            <p className="mt-6 text-center text-xs text-slate-400">
              모든 검색 결과를 확인했습니다.
            </p>
          )}
        </>
      )}
    </div>
  );
}

function ErrorState({ onRetry }: { onRetry: () => void }) {
  return (
    <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-rose-100 bg-rose-50/40 px-4 py-10 text-center">
      <p className="text-sm font-medium text-rose-700">
        검색 중 문제가 발생했어요.
      </p>
      <p className="mt-1 text-xs text-rose-500">
        네트워크 상태를 확인하시고 다시 시도해 주세요.
      </p>
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

function EmptySearchState({ keyword }: { keyword: string }) {
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
        <p className="mt-2 text-sm text-slate-500">
          다른 검색어로 시도해보세요
        </p>
        <div className="mt-4 text-xs text-slate-400">
          <p>• 단어의 철자가 정확한지 확인해보세요</p>
          <p>• 다른 검색어를 사용해보세요</p>
          <p>• 더 일반적인 검색어를 사용해보세요</p>
        </div>
      </div>
    </div>
  );
}
