'use client';

import { addBookmark, getBookmarkStatus, removeBookmark } from '@/src/api/shorlogBookmarkApi';
import { handleApiError } from '@/src/lib/handleApiError';
import { showGlobalToast } from '@/src/lib/toastStore';
import { Bookmark } from 'lucide-react';
import { useQueryClient } from '@tanstack/react-query';
import { useEffect, useState } from 'react';

interface BookmarkButtonProps {
  shorlogId: number;
  authorId?: number; // 작성자 ID (본인 글 확인용)
  initialBookmarked?: boolean;
  initialBookmarkCount?: number;
  onBookmarkChange?: (isBookmarked: boolean, bookmarkCount?: number) => void;
  variant?: 'default' | 'small';
  showCount?: boolean;
}

export default function BookmarkButton({
  shorlogId,
  authorId,
  initialBookmarked = false,
  initialBookmarkCount = 0,
  onBookmarkChange,
  variant = 'default',
  showCount = false,
}: BookmarkButtonProps) {
  const queryClient = useQueryClient();
  const [isBookmarked, setIsBookmarked] = useState(initialBookmarked);
  const [bookmarkCount, setBookmarkCount] = useState(initialBookmarkCount);
  const [isLoading, setIsLoading] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [isCheckingAuth, setIsCheckingAuth] = useState(true);
  const [currentUserId, setCurrentUserId] = useState<number | null>(null);

  // 로그인 상태 확인 및 북마크 상태 확인
  useEffect(() => {
    const checkAuthAndBookmark = async () => {
      try {
        const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8080';
        const response = await fetch(`${API_BASE_URL}/api/v1/auth/me`, {
          credentials: 'include',
          cache: 'no-store',
        });

        if (response.ok) {
          const json = await response.json();
          const user = json.data;
          setCurrentUserId(user?.id);
          setIsLoggedIn(true);

          // 실제 북마크 상태 확인
          try {
            const bookmarkStatus = await getBookmarkStatus(shorlogId);
            setIsBookmarked(bookmarkStatus.isBookmarked);
            setBookmarkCount(bookmarkStatus.bookmarkCount);
          } catch (bookmarkError) {
            // 북마크 상태 조회 실패 시 기본값 사용
            console.error('북마크 상태 조회 실패:', bookmarkError);
          }
        } else {
          setIsLoggedIn(false);
        }
      } catch {
        setIsLoggedIn(false);
      } finally {
        setIsCheckingAuth(false);
      }
    };

    checkAuthAndBookmark();
  }, [shorlogId]);

  // 북마크/북마크 해제 토글
  const handleToggleBookmark = async () => {
    // 로그인 확인
    if (!isLoggedIn) {
      showGlobalToast('로그인이 필요한 기능입니다.', 'warning');
      return;
    }

    // 본인 글 확인
    if (authorId && currentUserId === authorId) {
      handleApiError({ message: '본인의 글에는 북마크할 수 없습니다.' }, '북마크 처리');
      return;
    }

    setIsLoading(true);

    try {
      let result;
      if (isBookmarked) {
        result = await removeBookmark(shorlogId);
      } else {
        result = await addBookmark(shorlogId);
      }

      setIsBookmarked(result.isBookmarked);
      setBookmarkCount(result.bookmarkCount);
      onBookmarkChange?.(result.isBookmarked, result.bookmarkCount);

      // 토스트 알림 표시
      if (result.isBookmarked) {
        showGlobalToast('북마크에 추가했습니다.', 'success');
      } else {
        showGlobalToast('북마크에서 제거했습니다.', 'success');
      }

      // React Query 캐시 무효화
      queryClient.invalidateQueries({ queryKey: ['shorlog-feed'] });
      queryClient.invalidateQueries({ queryKey: ['profile'] });
      queryClient.invalidateQueries({ queryKey: ['shorlog-detail'] });
    } catch (error) {
      handleApiError(error, '북마크 처리');
    } finally {
      setIsLoading(false);
    }
  };

  // 로딩 중일 때 표시할 컴포넌트
  if (isCheckingAuth) {
    return (
      <button
        disabled
        className={`flex items-center justify-center ${variant === 'small' ? 'p-1' : 'p-2'}`}
      >
        <Bookmark
          className={`${variant === 'small' ? 'h-4 w-4' : 'h-5 w-5'} text-slate-300 animate-pulse`}
        />
      </button>
    );
  }

  return (
    <button
      onClick={handleToggleBookmark}
      disabled={isLoading}
      className={`
        flex items-center gap-1 transition-all duration-200 hover:scale-105 active:scale-95
        ${variant === 'small' ? 'text-xs' : 'text-sm'}
        ${isLoading ? 'cursor-not-allowed opacity-50' : 'cursor-pointer'}
      `}
      aria-label={isBookmarked ? '북마크 해제' : '북마크 추가'}
    >
      <Bookmark
        className={`
          ${variant === 'small' ? 'h-4 w-4' : 'h-5 w-5'}
          transition-all duration-200
          ${
            isBookmarked
              ? 'fill-yellow-500 text-yellow-500'
              : 'fill-none text-slate-500 hover:text-yellow-400'
          }
          ${isLoading ? 'animate-pulse' : ''}
        `}
      />

      {showCount && (
        <span
          className={`
          font-medium transition-colors duration-200
          ${isBookmarked ? 'text-yellow-500' : 'text-slate-600'}
        `}
        >
          {bookmarkCount.toLocaleString()}
        </span>
      )}
    </button>
  );
}
