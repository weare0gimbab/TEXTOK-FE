'use client';

import { addLike, getLikeStatus, removeLike } from '@/src/api/shorlogLikeApi';
import { useCurrentUser } from '@/src/hooks/useCurrentUser';
import { handleApiError } from '@/src/lib/handleApiError';
import { showGlobalToast } from '@/src/lib/toastStore';
import { useQueryClient } from '@tanstack/react-query';
import { Heart } from 'lucide-react';
import { useEffect, useState } from 'react';

interface LikeButtonProps {
  shorlogId: number;
  authorId?: number; // 작성자 ID (본인 글 확인용)
  initialLiked?: boolean;
  initialLikeCount?: number;
  onLikeChange?: (isLiked: boolean, likeCount: number) => void;
  variant?: 'default' | 'small';
  showCount?: boolean;
}

export default function LikeButton({
  shorlogId,
  authorId,
  initialLiked = false,
  initialLikeCount = 0,
  onLikeChange,
  variant = 'default',
  showCount = true,
}: LikeButtonProps) {
  const queryClient = useQueryClient();
  const { data: currentUser, isLoading: isUserLoading } = useCurrentUser();

  const isLoggedIn = !!currentUser;
  const currentUserId = currentUser?.id ?? null;

  const [isLiked, setIsLiked] = useState(initialLiked);
  const [likeCount, setLikeCount] = useState(initialLikeCount);
  const [isLoading, setIsLoading] = useState(false);
  const [isCheckingStatus, setIsCheckingStatus] = useState(true);
  const [isAnimating, setIsAnimating] = useState(false);

  // 로그인 상태 및 좋아요 상태 확인
  useEffect(() => {
    let cancelled = false;

    (async () => {
      try {
        const likeStatus = await getLikeStatus(shorlogId); // 서버가 비로그인도 카운트 주고 isLiked=false로 주게 설계 권장
        if (!cancelled) {
          setIsLiked(likeStatus.isLiked);
          setLikeCount(likeStatus.likeCount);
        }
      } catch {
        // 실패하면 초기값 유지
      } finally {
        if (!cancelled) setIsCheckingStatus(false);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [shorlogId]);

  // 좋아요/좋아요 취소 토글
  const handleToggleLike = async () => {
    if (isUserLoading) return; // 로딩 중일 때 아무것도 하지 않음
    // 로그인 확인
    if (!isLoggedIn) {
      showGlobalToast('로그인이 필요한 기능입니다.', 'warning');
      return;
    }

    // 본인 글 확인
    if (authorId && currentUserId === authorId) {
      handleApiError({ message: '본인의 글에는 좋아요할 수 없습니다.' }, '좋아요 처리');
      return;
    }

    setIsLoading(true);
    setIsAnimating(true);

      try {
        const result = isLiked ? await removeLike(shorlogId) : await addLike(shorlogId);

        setIsLiked(result.isLiked);
        setLikeCount(result.likeCount);

        if (result.isLiked) showGlobalToast('좋아요를 눌렀습니다.', 'success');
        else showGlobalToast('좋아요를 취소했습니다.', 'success');

        // React Query 캐시 무효화
        queryClient.invalidateQueries({ queryKey: ['shorlog-feed'] });
        queryClient.invalidateQueries({ queryKey: ['profile'] });
        queryClient.invalidateQueries({ queryKey: ['shorlog-detail'] });

        // 애니메이션 완료 후 상태 초기화
        setTimeout(() => setIsAnimating(false), 300);
      } catch (error) {
        handleApiError(error, '좋아요 처리');
        setIsAnimating(false);
      } finally {
        setIsLoading(false);
      }
  };

  // 로딩 중일 때 표시할 컴포넌트
  if (isCheckingStatus) {
    return (
      <div className={`flex items-center gap-1 ${variant === 'small' ? 'text-xs' : 'text-sm'}`}>
        <Heart
          className={`${variant === 'small' ? 'h-4 w-4' : 'h-5 w-5'} text-slate-300 animate-pulse`}
        />
        {showCount && <span className="text-slate-300">•</span>}
      </div>
    );
  }

  return (
    <button
      onClick={handleToggleLike}
      disabled={isLoading}
      className={`
        flex items-center gap-1 transition-all duration-200 hover:scale-105 active:scale-95
        ${variant === 'small' ? 'text-xs' : 'text-sm'}
        ${isLoading ? 'cursor-not-allowed opacity-50' : 'cursor-pointer'}
      `}
      aria-label={isLiked ? '좋아요 취소' : '좋아요'}
    >
      <div className="relative">
        <Heart
          className={`
            ${variant === 'small' ? 'h-4 w-4' : 'h-5 w-5'}
            transition-all duration-200
            ${isLiked ? 'fill-red-500 text-red-500' : 'fill-none text-slate-500 hover:text-red-400'}
            ${isAnimating ? 'animate-bounce' : ''}
          `}
        />

        {/* 좋아요 애니메이션 효과 */}
        {isAnimating && isLiked && (
          <div className="absolute inset-0 animate-ping">
            <Heart
              className={`
              ${variant === 'small' ? 'h-4 w-4' : 'h-5 w-5'}
              fill-red-300 text-red-300 opacity-75
            `}
            />
          </div>
        )}
      </div>

      {showCount && (
        <span
          className={`
          font-medium transition-colors duration-200
          ${isLiked ? 'text-red-500' : 'text-slate-600'}
        `}
        >
          {likeCount.toLocaleString()}
        </span>
      )}
    </button>
  );
}
