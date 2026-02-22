'use client';

import { fetchShorlogView } from '@/src/api/viewApi';
import { useRegisterView } from '@/src/hooks/useRegisterView';
import { useMutation } from '@tanstack/react-query';
import { useRouter, useSearchParams } from 'next/navigation';
import { useCallback, useEffect, useMemo, useState } from 'react';
import ShorlogAuthorHeader from './ShorlogAuthorHeader';
import ShorlogCommentSection from './ShorlogCommentSection';
import ShorlogImageSlider from './ShorlogImageSlider';
import ShorlogReactionSection from './ShorlogReactionSection';
import { LinkedBlogListModal } from './LinkedBlogModal';
import { fetchLinkedBlogIds } from '@/src/api/blogShorlogLink';
import { fetchBlogDetail } from '@/src/api/blogDetail';
import ShorlogTtsController from './ShorlogTtsController';
import type { ShorlogDetail } from './types';
import type { LinkedBlogDetail } from '@/src/types/blog';

interface Props {
  detail: ShorlogDetail;
  isOwner?: boolean;
  hideNavArrows?: boolean;
}

function HighlightedContent({ content, progress, ttsMode }: { content: string; progress: number; ttsMode: 'none' | 'ai' | 'web' }) {
  if (!content || typeof content !== 'string') {
    return <p className="text-sm leading-relaxed text-slate-400">아직 내용이 없습니다.</p>;
  }

  const totalLength = content.length;

  if (totalLength === 0) {
    return <p className="text-sm leading-relaxed text-slate-400">아직 내용이 없습니다.</p>;
  }

  if (ttsMode === 'web') {
    return (
      <p className="whitespace-pre-line text-[15px] md:text-base leading-relaxed text-slate-800">
        {content}
      </p>
    );
  }

  const clamped = Math.max(0, Math.min(progress, 1));
  const highlightLength = Math.floor(totalLength * clamped);

  if (highlightLength <= 0) {
    return (
      <p className="whitespace-pre-line text-[15px] md:text-base leading-relaxed text-slate-800">
        {content}
      </p>
    );
  }

  if (highlightLength >= totalLength) {
    return (
      <p className="whitespace-pre-line text-[15px] md:text-base leading-relaxed text-slate-800">
        <span
          className="bg-gradient-to-r from-blue-50 to-blue-100 transition-all duration-500 ease-out"
          style={{ willChange: 'background-color' }}
        >
          {content}
        </span>
      </p>
    );
  }

  const remaining = content.slice(highlightLength);

  const fadeStartLength = Math.max(0, highlightLength - Math.floor(totalLength * 0.03));
  const alreadyRead = content.slice(0, fadeStartLength);
  const currentlyReading = content.slice(fadeStartLength, highlightLength);

  return (
    <p className="whitespace-pre-line text-[15px] md:text-base leading-relaxed text-slate-800">
      {fadeStartLength > 0 && (
        <span
          className="bg-blue-50 transition-all duration-150 ease-out"
          style={{ willChange: 'background-color' }}
        >
          {alreadyRead}
        </span>
      )}
      <span
        className="bg-gradient-to-r from-blue-100 to-blue-200 transition-all duration-100 ease-linear"
        style={{ willChange: 'background-color' }}
      >
        {currentlyReading}
      </span>
      <span className="transition-all duration-150 ease-out">{remaining}</span>
    </p>
  );
}

function PrevNextNavArrows({ currentId }: { currentId: number }) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isNavigating, setIsNavigating] = useState(false);

  // setState-in-effect 방지: searchParams + sessionStorage에서 파생값으로 직접 계산
  const { prevId, nextId } = useMemo(() => {
    let prev = searchParams.get('prev');
    let next = searchParams.get('next');

    if (!prev || !next) {
      if (typeof window !== 'undefined') {
        const feedIdsStr = sessionStorage.getItem('shorlog_feed_ids');
        if (feedIdsStr) {
          try {
            const feedIds: number[] = JSON.parse(feedIdsStr);
            const currentIndex = feedIds.findIndex((id) => id === currentId);

            if (currentIndex !== -1) {
              if (currentIndex > 0) prev = feedIds[currentIndex - 1].toString();
              if (currentIndex < feedIds.length - 1) next = feedIds[currentIndex + 1].toString();
            }
          } catch {
            // sessionStorage 파싱 실패 시 무시
          }
        }
      }
    }

    return { prevId: prev, nextId: next };
  }, [currentId, searchParams]);

  // 다음/이전 숏로그 데이터 프리페칭
  useEffect(() => {
    const prefetchShorlog = async (id: string) => {
      try {
        const API_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8080';
        await fetch(`${API_URL}/api/v1/shorlog/${id}`, {
          cache: 'force-cache',
          credentials: 'include',
        });
      } catch {
        // 프리페칭 실패는 무시
      }
    };

    if (prevId) prefetchShorlog(prevId);
    if (nextId) prefetchShorlog(nextId);
  }, [prevId, nextId]);

  const hasPrev = !!prevId;
  const hasNext = !!nextId;

  const handleNavigation = (targetId: string) => {
    setIsNavigating(true);

    // 프로필에서 온 경우 프로필 컨텍스트 유지
    const profileId = searchParams.get('profileId');
    const source = typeof window !== 'undefined' ? sessionStorage.getItem('shorlog_source') : null;

    if (source === 'profile' && profileId) {
      // 프로필에서 온 경우: profileId만 유지하고 prev/next는 새로 계산
      const queryParams = new URLSearchParams();
      queryParams.set('profileId', profileId);

      // sessionStorage에서 피드 정보 가져와서 새로운 prev/next 계산
      if (typeof window !== 'undefined') {
        const feedIdsStr = sessionStorage.getItem('shorlog_feed_ids');
        if (feedIdsStr) {
          try {
            const feedIds: number[] = JSON.parse(feedIdsStr);
            const targetIndex = feedIds.findIndex((id) => id === parseInt(targetId));

            if (targetIndex !== -1) {
              if (targetIndex > 0) {
                queryParams.set('prev', feedIds[targetIndex - 1].toString());
              }
              if (targetIndex < feedIds.length - 1) {
                queryParams.set('next', feedIds[targetIndex + 1].toString());
              }
            }
          } catch {
            // sessionStorage 파싱 실패 시 무시
          }
        }
      }

      router.push(`/shorlog/${targetId}?${queryParams.toString()}`);
    } else {
      // 피드에서 온 경우: 기존 방식
      router.push(`/shorlog/${targetId}`);
    }
  };

  return (
    <>
      {hasPrev && (
        <button
          type="button"
          aria-label="이전 숏로그"
          onClick={() => handleNavigation(prevId!)}
          disabled={isNavigating}
          className="
            absolute left-0 top-1/2 z-50 -translate-x-12 -translate-y-1/2
            flex h-12 w-12 items-center justify-center rounded-full
            border-2 border-white bg-white text-2xl text-slate-700
            shadow-xl transition-all duration-200 hover:bg-slate-50 hover:scale-110
            disabled:opacity-50 disabled:cursor-not-allowed
            md:flex
          "
        >
          {isNavigating ? (
            <div className="h-5 w-5 animate-spin rounded-full border-2 border-slate-300 border-t-slate-700"></div>
          ) : (
            '‹'
          )}
        </button>
      )}
      {hasNext && (
        <button
          type="button"
          aria-label="다음 숏로그"
          onClick={() => handleNavigation(nextId!)}
          disabled={isNavigating}
          className="
            absolute right-0 top-1/2 z-50 translate-x-12 -translate-y-1/2
            flex h-12 w-12 items-center justify-center rounded-full
            border-2 border-white bg-white text-2xl text-slate-700
            shadow-xl transition-all duration-200 hover:bg-slate-50 hover:scale-110
            disabled:opacity-50 disabled:cursor-not-allowed
            md:flex
          "
        >
          {isNavigating ? (
            <div className="h-5 w-5 animate-spin rounded-full border-2 border-slate-300 border-t-slate-700"></div>
          ) : (
            '›'
          )}
        </button>
      )}
    </>
  );
}

export default function ShorlogDetailPageClient({
  detail,
  isOwner = false,
  hideNavArrows = false,
}: Props) {
  // ── 모든 hook은 얼리 리턴보다 반드시 위에 선언 (react-hooks/rules-of-hooks) ──
  const [ttsProgress, setTtsProgress] = useState(0);
  const [ttsMode, setTtsMode] = useState<'none' | 'ai' | 'web'>('none');
  const [linkedBlogs, setLinkedBlogs] = useState<LinkedBlogDetail[]>([]);
  const [linkedBlogCount, setLinkedBlogCount] = useState(0);
  const [showLinkedBlogsModal, setShowLinkedBlogsModal] = useState(false);
  const [currentCommentCount, setCurrentCommentCount] = useState(detail?.commentCount ?? 0);

  const detailId = detail?.id ?? 0;

  // 연결된 블로그 정보 로드
  const loadLinkedBlogs = useCallback(async () => {
    if (!detailId) return;
    try {
      const blogIds = await fetchLinkedBlogIds(detailId);
      setLinkedBlogCount(blogIds.length);

      // 연결된 블로그가 있으면 상세 정보도 미리 로드
      if (blogIds.length > 0) {
        const blogDetails = await Promise.all(
          blogIds.map(async (id) => {
            const blog = await fetchBlogDetail(id);
            return {
              id: blog.id,
              title: blog.title,
              contentPre: blog.content?.slice(0, 100) + '...' || '',
              author: blog.nickname,
              modifiedAt: blog.updatedAt,
              hashtagNames: blog.hashtagNames || []
            };
          })
        );
        setLinkedBlogs(blogDetails);
      } else {
        setLinkedBlogs([]);
      }
    } catch {
      // 에러 무시
    }
  }, [detailId]);

  // set-state-in-effect 방지: async IIFE로 비동기 fetch 후 setState
  useEffect(() => {
    let cancelled = false;
    (async () => {
      if (!detailId) return;
      try {
        const blogIds = await fetchLinkedBlogIds(detailId);
        if (cancelled) return;
        setLinkedBlogCount(blogIds.length);
        if (blogIds.length > 0) {
          const blogDetails = await Promise.all(
            blogIds.map(async (id) => {
              const blog = await fetchBlogDetail(id);
              return {
                id: blog.id,
                title: blog.title,
                contentPre: blog.content?.slice(0, 100) + '...' || '',
                author: blog.nickname,
                modifiedAt: blog.updatedAt,
                hashtagNames: blog.hashtagNames || [],
              };
            }),
          );
          if (!cancelled) setLinkedBlogs(blogDetails);
        } else {
          if (!cancelled) setLinkedBlogs([]);
        }
      } catch {
        // 에러 무시
      }
    })();
    return () => { cancelled = true; };
  }, [detailId]);

  // 최근 본 게시물 등록
  const viewMutation = useMutation({
    mutationFn: () => fetchShorlogView(detailId),
  });

  useRegisterView({
    contentKey: `shorlog:${detailId}`, // 고유키
    cooldownMs: 5 * 60 * 1000, // 5분 쿨다운
    dwellMs: 3000, // 숏로그 3초
    onRegister: () => viewMutation.mutate(),
  });

  // ── guard는 모든 hook 선언 아래에 위치 ──
  if (!detail || !detail.content || typeof detail.content !== 'string') {
    return (
      <div className="flex h-full w-full items-center justify-center">
        <p className="text-slate-600">숏로그를 불러오는 중입니다...</p>
      </div>
    );
  }

  const firstLineForAlt = detail.content.split('\n')[0]?.slice(0, 40) ?? '';

  const formatDate = (dateStr: string) => {
    if (!dateStr) return '';
    const date = new Date(dateStr);
    const year = date.getFullYear();
    const month = date.getMonth() + 1;
    const day = date.getDate();
    const hours = String(date.getHours()).padStart(2, '0');
    const minutes = String(date.getMinutes()).padStart(2, '0');
    return `${year}.${month}.${day} ${hours}:${minutes}`;
  };

  const isModified = detail.modifiedAt && detail.modifiedAt !== detail.createdAt;

  const handleOpenLinkedBlogs = async () => {
    // 연결된 블로그가 있으면 항상 모달 열기 (1개든 여러 개든)
    setShowLinkedBlogsModal(true);
  };

  return (
    <div className="relative flex h-full w-full items-stretch">
      {!hideNavArrows && <PrevNextNavArrows currentId={detail.id} />}

      <div className="flex h-full w-full overflow-hidden rounded-3xl bg-white shadow-xl ring-1 ring-slate-200">
        <div className="flex flex-1 items-stretch">
          <ShorlogImageSlider images={detail.thumbnailUrls} alt={firstLineForAlt} />
        </div>

        <aside className="flex h-full flex-1 flex-col overflow-hidden">
          <div className="border-b border-slate-100 px-4 py-3 md:px-5 md:py-4">
            <ShorlogAuthorHeader
              username={detail.username}
              nickname={detail.nickname}
              profileImgUrl={detail.profileImgUrl}
              isOwner={isOwner}
              shorlogId={detail.id}
              userId={detail.userId}
              onBlogConnectionUpdate={loadLinkedBlogs}
            />
          </div>

          <div className="flex flex-1 flex-col overflow-y-auto px-3 sm:px-4 md:px-5 pb-4 md:pb-5 pt-3 md:pt-4">
            <section aria-label="숏로그 내용">
              <HighlightedContent content={detail.content} progress={ttsProgress} ttsMode={ttsMode} />

              {detail.hashtags && detail.hashtags.length > 0 && (
                <div className="mt-3 flex flex-wrap gap-2">
                  {detail.hashtags.map((tag) => (
                    <span
                      key={tag}
                      className="inline-flex items-center rounded-full bg-sky-50 px-3 py-1 text-xs font-medium text-sky-700"
                    >
                      #{tag}
                    </span>
                  ))}
                </div>
              )}

              <div className="mt-3 flex items-center gap-2 text-xs text-slate-400">
                <time dateTime={detail.createdAt}>{formatDate(detail.createdAt)}</time>
                {isModified && (
                  <>
                    <span>·</span>
                    <span>수정됨</span>
                  </>
                )}
              </div>
            </section>

            <section aria-label="리액션" className="mt-2 border-t border-slate-100 pt-3">
              <ShorlogReactionSection
                shorlogId={detail.id}
                authorId={detail.userId}
                likeCount={detail.likeCount}
                commentCount={currentCommentCount}
                bookmarkCount={detail.bookmarkCount}
                title={`${detail.nickname}님의 숏로그`}
                description={(detail.content || '').split('\n')[0]?.trim() || '숏로그를 확인해보세요!'}
                imageUrl={detail.thumbnailUrls.length > 0 ? detail.thumbnailUrls[0] : null}
                author={detail.nickname}
              />

              {linkedBlogCount > 0 && (
                <div className="mt-3">
                  <button
                    type="button"
                    onClick={handleOpenLinkedBlogs}
                    className="inline-flex items-center gap-1 rounded-full border border-sky-200 bg-sky-50 px-3 py-1.5 text-xs font-medium text-sky-700 hover:bg-sky-100 transition"
                  >
                    ⚡ 블로그 {linkedBlogCount}개 보기
                  </button>
                </div>
              )}
            </section>

            <section aria-label="TTS 컨트롤" className="mt-4">
              <ShorlogTtsController
                shorlogId={detail.id}
                content={detail.content}
                progress={ttsProgress}
                setProgress={setTtsProgress}
                setTtsMode={setTtsMode}
              />
            </section>

            <section aria-label="댓글" className="mt-4 border-t border-slate-100 pt-3">
              <ShorlogCommentSection
                shorlogId={detail.id}
                onCommentCountChange={setCurrentCommentCount}
              />
            </section>
          </div>
        </aside>
      </div>

      {/* 연결된 블로그 목록 모달 */}
      <LinkedBlogListModal
        open={showLinkedBlogsModal}
        loading={false}
        items={linkedBlogs}
        shorlogId={detail.id}
        isOwner={isOwner}
        onClose={() => setShowLinkedBlogsModal(false)}
        onUnlinked={() => {
          loadLinkedBlogs();
          // 연결된 블로그가 0개가 되면 모달 닫기
          if (linkedBlogs.length <= 1) {
            setShowLinkedBlogsModal(false);
          }
        }}
      />
    </div>
  );
}
