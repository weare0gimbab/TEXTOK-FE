'use client';

import { fetchMe } from '@/src/api/user';
import { BlogCard } from '@/src/app/components/blogs/get/BlogCard';
import { showGlobalToast } from '@/src/lib/toastStore';
import { useLoginModal } from '@/src/providers/LoginModalProvider';
import type { BlogScope, BlogSliceResponse, BlogSortType, BlogSummary } from '@/src/types/blog';
import { PenLine } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import LoadingSpinner from '../../common/LoadingSpinner';
import { BlogEmptyState, BlogErrorState } from './BlogStates';
import { BlogToolbar } from './BlogToolbar';
const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL;

type Props = {
  initialBlogs: BlogSummary[];
};

export function BlogListClient({ initialBlogs }: Props) {
  const router = useRouter();
  const [blogs, setBlogs] = useState<BlogSummary[]>(initialBlogs);
  const [error, setError] = useState<Error | null>(null);

  const [sortType, setSortType] = useState<BlogSortType>('LATEST');
  const [keyword, setKeyword] = useState('');
  const [scope, setScope] = useState<BlogScope>('ALL');

  const [loading, setLoading] = useState(true);

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

  // 로그인 안했는데 팔로잉탭 클릭시 로그인 모달
  const handleScopeChange = (next: BlogScope) => {
    if (next === 'FOLLOWING' && !isLoggedIn) {
      showGlobalToast('팔로잉 피드는 로그인 후 이용할 수 있어요.', 'warning');
      openLoginModal();
      return;
    }
    setScope(next);
  };

  const handleWriteClick = () => {
    if (!isLoggedIn) {
      openLoginModal();
      return;
    }
    router.push('/blogs/new');
  };

  async function loadBlogs() {
    try {
      setLoading(true);
      setError(null);
      const params = new URLSearchParams();
      params.set('sort', sortType);
      params.set('scope', scope);
      if (keyword) params.set('keyword', keyword);
      const res = await fetch(`${API_BASE_URL}/api/v1/blogs?${params}`, {
        credentials: 'include',
      });
      if (!res.ok) throw new Error('블로그 목록을 불러올 수 없습니다.');
      const json = (await res.json()) as BlogSliceResponse<BlogSummary>;
      setBlogs(json.content);
    } catch (e) {
      setError(e as Error);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadBlogs();
  }, [sortType, keyword, scope]);

  return (
    <section className="space-y-8">
      <header className="mb-6 md:mb-8">
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-sky-600">BLOG FEED</p>

        <h1 className="mt-2 text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl md:text-4xl">
          블로그
        </h1>

        {/* 소개글 + 작성 버튼 같은 줄 */}
        <div className="mt-2 flex items-center justify-between gap-4">
          <p className="text-sm text-slate-500 md:text-base">
            길게 남기고 싶은 생각과 기록을 자유롭게 공유해 보세요.
          </p>
          <button
            onClick={handleWriteClick}
            className="hidden shrink-0 items-center gap-1.5 rounded-xl bg-[#2979FF] px-4 py-2 text-sm font-semibold text-white shadow-sm shadow-blue-500/20 transition hover:-translate-y-0.5 hover:bg-blue-700 hover:shadow-md hover:shadow-blue-500/25 active:translate-y-0 sm:inline-flex"
            aria-label="블로그 글 작성"
          >
            <PenLine size={14} />
          </button>
        </div>

        <div className="pt-3">
          <BlogToolbar
            keyword={keyword}
            onKeywordChange={setKeyword}
            sortType={sortType}
            onSortChange={setSortType}
            scope={scope}
            onScopeChange={handleScopeChange}
          />
        </div>
      </header>

      {/* 블로그 리스트 */}
      <div className="space-y-4">
        {loading && (
          <div className="py-10 text-center text-sm text-slate-500">
            <LoadingSpinner label="블로그를 불러오는 중입니다" />
          </div>
        )}

        {!loading && error && <BlogErrorState onRetry={loadBlogs} />}

        {!loading && !error && blogs.length === 0 && <BlogEmptyState />}

        {!loading &&
          !error &&
          blogs.length > 0 &&
          blogs.map((blog) => <BlogCard key={blog.id} blog={blog} />)}
      </div>

      {/* 모바일 플로팅 작성 버튼 */}
      <button
        onClick={handleWriteClick}
        className="fixed bottom-20 right-4 z-40 flex h-14 w-14 items-center justify-center rounded-full bg-blue-600 text-white shadow-lg shadow-blue-500/30 transition-all duration-200 hover:bg-blue-700 hover:shadow-xl hover:shadow-blue-500/35 active:scale-95 sm:hidden"
      >
        <PenLine size={22} />
      </button>
    </section>
  );
}
