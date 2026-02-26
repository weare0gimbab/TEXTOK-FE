'use client';

import { useEffect, useMemo, useState } from 'react';
import { useInfiniteQuery } from '@tanstack/react-query';
import { useInView } from 'react-intersection-observer';
import ShorlogFilterTabs from './ShorlogFilterTabs';
import ShorlogSortButton from './ShorlogSortButton';
import LoadingSpinner from '../../common/LoadingSpinner';
import ShorlogCard from './ShorlogCard';
import { fetchMe } from '@/src/api/user';
import { showGlobalToast } from '@/src/lib/toastStore';
import { useLoginModal } from '@/src/providers/LoginModalProvider';
import { PenLine } from 'lucide-react';
import { useRouter } from 'next/navigation';

export type ShorlogFilter = 'all' | 'following';
export type ShorlogSort = 'recommend' | null;

export type ShorlogItem = {
  id: number;
  thumbnailUrl: string | null;
  profileImgUrl: string;
  nickname: string;
  hashtags: string[];
  likeCount: number;
  commentCount: number;
  firstLine: string;
};

type ShorlogFeedResponse = {
  items: ShorlogItem[];
  nextPage: number | null;
};

type RsData<T> = {
  resultCode: string;
  msg: string;
  data: T;
};

type PageResponse<T> = {
  content: T[];
  pageable: { pageNumber: number };
  last: boolean;
  totalPages: number;
  totalElements: number;
};

async function fetchShorlogFeed(
  filter: ShorlogFilter,
  sort: ShorlogSort,
  page: number,
): Promise<ShorlogFeedResponse> {
  const API_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8080';

  let endpoint: string;
  if (filter === 'following') {
    endpoint = `${API_URL}/api/v1/shorlog/following?page=${page}`;
  } else {
    endpoint =
      sort === 'recommend'
        ? `${API_URL}/api/v1/shorlog/feed/recommended?page=${page}`
        : `${API_URL}/api/v1/shorlog/feed?page=${page}`;
  }

  const res = await fetch(endpoint, { cache: 'no-store', credentials: 'include' });
  if (!res.ok) throw new Error(`Failed to fetch shorlog feed: ${res.status}`);

  const rsData: RsData<PageResponse<ShorlogItem>> = await res.json();
  const pageData = rsData.data;

  return {
    items: pageData.content || [],
    nextPage: !pageData.last ? page + 1 : null,
  };
}

export default function ShorlogFeedPageClient() {
  const router = useRouter();
  const [filter, setFilter] = useState<ShorlogFilter>('all');
  const [sort, setSort] = useState<ShorlogSort>('recommend');
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const { open: openLoginModal } = useLoginModal();

  useEffect(() => {
    const checkAuth = async () => {
      try {
        await fetchMe();
        setIsLoggedIn(true);
      } catch {
        setIsLoggedIn(false);
      }
    };
    checkAuth();
  }, []);

  const handleFilterChange = (next: ShorlogFilter) => {
    if (next === 'following' && !isLoggedIn) {
      showGlobalToast('팔로잉 피드는 로그인 후 이용할 수 있어요.', 'warning');
      openLoginModal();
      return;
    }
    setFilter(next);
  };

  const handleWriteClick = () => {
    if (!isLoggedIn) {
      openLoginModal();
      return;
    }
    router.push('/shorlog/create');
  };

  const { data, isLoading, fetchNextPage, hasNextPage, isFetchingNextPage } = useInfiniteQuery({
    queryKey: ['shorlog-feed', filter, sort],
    queryFn: ({ pageParam }) => fetchShorlogFeed(filter, sort, pageParam as number),
    initialPageParam: 0,
    getNextPageParam: (lastPage) => lastPage.nextPage ?? undefined,
  });

  const { ref: sentinelRef, inView } = useInView({ rootMargin: '200px', triggerOnce: false });

  useEffect(() => {
    if (inView && hasNextPage && !isFetchingNextPage) {
      fetchNextPage();
    }
  }, [inView, hasNextPage, isFetchingNextPage, fetchNextPage]);

  const items = useMemo(() => {
    const allItems = data?.pages.flatMap((page) => page.items) ?? [];
    return allItems.filter(
      (item, index, self) => index === self.findIndex((t) => t.id === item.id),
    );
  }, [data]);

  const isEmpty = !isLoading && items.length === 0;

  return (
    <section aria-label="숏 피드">
      <header className="mb-6 md:mb-8">
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-sky-600">
          SHORLOG FEED
        </p>
        <h1 className="mt-2 text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl md:text-4xl">
          숏 피드
        </h1>

        {/* 소개글 + 작성 버튼 같은 줄 */}
        <div className="mt-2 flex items-center justify-between gap-4">
          <p className="text-sm text-slate-500 md:text-base">
            짧은 글을 스와이프로 훑어보고, 더 보고 싶은 콘텐츠만 깊게 읽어보세요.
          </p>
          <button
            onClick={handleWriteClick}
            className="hidden shrink-0 items-center gap-1.5 rounded-xl bg-[#2979FF] px-4 py-2 text-sm font-semibold text-white shadow-sm shadow-blue-500/20 transition hover:-translate-y-0.5 hover:bg-blue-700 hover:shadow-md hover:shadow-blue-500/25 active:translate-y-0 sm:inline-flex"
            aria-label="숏로그 작성"
          >
            <PenLine size={14} />
          </button>
        </div>
      </header>

      {/* 필터 / 정렬 */}
      <div className="flex items-center gap-2">
        <ShorlogFilterTabs value={filter} onChange={handleFilterChange} />
        {filter === 'all' && <ShorlogSortButton value={sort} onChange={setSort} />}
      </div>

      <div className="mt-4 md:mt-6">
        {isEmpty && !isLoading ? (
          <EmptyState onWrite={handleWriteClick} />
        ) : (
          <>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-5 gap-3 md:gap-4 pt-2">
              {items.map((item, index) => (
                <ShorlogCard key={item.id} item={item} index={index} allItems={items} />
              ))}
            </div>

            {hasNextPage && <div ref={sentinelRef} className="h-10 w-full" />}

            {isFetchingNextPage && (
              <div className="flex justify-center py-4">
                <div className="flex items-center gap-2 text-xs text-slate-400">
                  <div className="h-4 w-4 animate-spin rounded-full border-2 border-slate-200 border-t-slate-400"></div>
                  <span>로딩중...</span>
                </div>
              </div>
            )}

            {isLoading && items.length === 0 && (
              <div className="flex justify-center py-12">
                <LoadingSpinner label="숏로그를 불러오는 중입니다" size="sm" />
              </div>
            )}

            {!hasNextPage && items.length > 0 && !isLoading && (
              <p className="mt-6 text-center text-xs text-slate-400">
                끝까지 둘러보셨네요. 더 많은 숏로그는 곧 업데이트될 예정이에요.
              </p>
            )}
          </>
        )}
      </div>

      {/* 모바일 플로팅 작성 버튼 */}
      <button
        onClick={handleWriteClick}
        className="fixed bottom-20 right-4 z-40 flex h-14 w-14 items-center justify-center rounded-full bg-[#2979FF] text-white shadow-lg shadow-blue-500/30 transition-all duration-200 hover:bg-blue-700 hover:shadow-xl hover:shadow-blue-500/35 active:scale-95 sm:hidden"
        aria-label="숏로그 작성"
      >
        <PenLine size={22} />
      </button>
    </section>
  );
}

type EmptyStateProps = {
  onWrite: () => void;
};

function EmptyState({ onWrite }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-slate-200 bg-white/70 px-4 py-16 text-center">
      <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-sky-50 text-sky-500">
        <PenLine size={22} />
      </div>
      <p className="mt-4 text-sm font-semibold text-slate-800">아직 볼 수 있는 숏로그가 없어요.</p>
      <p className="mt-1 text-xs text-slate-500">
        첫 숏로그를 남기거나, 더 많은 작가를 팔로우해 보세요.
      </p>
      <button
        onClick={onWrite}
        className="mt-4 inline-flex items-center rounded-full bg-[#2979FF] px-4 py-1.5 text-xs font-semibold text-white shadow-sm transition hover:bg-sky-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-500 focus-visible:ring-offset-2 focus-visible:ring-offset-sky-50"
      >
        <PenLine size={13} />
      </button>
    </div>
  );
}
