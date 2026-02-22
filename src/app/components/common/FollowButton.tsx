'use client';

import { useQueryClient } from '@tanstack/react-query';
import { useCurrentUser } from '@/src/hooks/useCurrentUser';
import { useFollowStatus, useFollowMutation } from '@/src/hooks/useFollow';
import { showGlobalToast } from '@/src/lib/toastStore';
import LoadingSpinner from './LoadingSpinner';

interface FollowButtonProps {
  userId: number;
  initialIsFollowing?: boolean;
  onFollowChange?: (isFollowing: boolean) => void;
  variant?: 'default' | 'small';
}

export default function FollowButton({
  userId,
  initialIsFollowing = false,
  onFollowChange,
  variant = 'default',
}: FollowButtonProps) {
  const queryClient = useQueryClient();

  // 현재 사용자 정보 가져오기
  const { data: currentUser, isLoading: isUserLoading } = useCurrentUser();

  // 팔로우 상태 가져오기
  const {
    data: isFollowingFromServer,
    isLoading: isFollowStatusLoading
  } = useFollowStatus(userId, currentUser?.id ?? null);

  // 팔로우/언팔로우 뮤테이션
  const { followMutation, unfollowMutation } = useFollowMutation(userId, currentUser?.id ?? null);

  // 팔로우 상태 결정: 서버에서 가져온 데이터 우선, 없으면 초기값 사용
  const isFollowingState = isFollowingFromServer ?? initialIsFollowing;

  // 로딩 상태
  const isLoading = followMutation.isPending || unfollowMutation.isPending;
  const isCheckingFollow = isUserLoading || isFollowStatusLoading;

  // 팔로우/언팔로우 토글
  const handleToggleFollow = async () => {
    // 로그인 확인
    if (!currentUser) {
      showGlobalToast('로그인이 필요한 기능입니다.', 'warning');
      return;
    }

    try {
      const previousState = isFollowingState;

      if (previousState) {
        await unfollowMutation.mutateAsync();
        onFollowChange?.(false);
      } else {
        await followMutation.mutateAsync();
        onFollowChange?.(true);
      }

      // React Query 캐시 무효화
      queryClient.invalidateQueries({ queryKey: ['shorlog-feed'] });
      queryClient.invalidateQueries({ queryKey: ['profile'] });
    } catch (error) {
      // 에러는 뮤테이션 훅에서 처리되지만 추가 로깅
      console.error('팔로우 토글 실패:', {
        userId,
        previousState: isFollowingState,
        error: error instanceof Error ? error.message : error
      });
    }
  };

  // 본인이면 표시하지 않음
  if (currentUser?.id === userId) {
    return null;
  }

  // 로딩 중
  if (isCheckingFollow) {
    return (
      <button
        disabled
        className={`
          flex items-center justify-center rounded-full border border-slate-200 bg-white
          ${variant === 'small' ? 'px-3 py-1.5 text-xs' : 'px-4 py-2 text-sm'}
          font-medium text-slate-400 cursor-not-allowed
        `}
      >
        <LoadingSpinner size="sm" inline />
      </button>
    );
  }

  return (
    <button
      onClick={handleToggleFollow}
      disabled={isLoading}
      aria-label={`${isFollowingState ? '언팔로우' : '팔로우'} 버튼`}
      className={`
        flex items-center justify-center gap-2 rounded-full border transition-all duration-200
        ${variant === 'small' ? 'px-3 py-1.5 text-xs' : 'px-4 py-2 text-sm'}
        font-medium focus:outline-none focus:ring-2 focus:ring-offset-2
        ${
          isFollowingState
            ? 'bg-slate-200 text-slate-700 hover:bg-slate-300'
            : 'border-[#2979FF] bg-[#2979FF] text-white hover:bg-[#1f63d1] focus:ring-blue-500'
        }
        disabled:cursor-not-allowed disabled:opacity-50 disabled:transform-none
        active:scale-95
      `}
    >
      {isLoading && <LoadingSpinner size="sm" inline theme={isFollowingState ? 'default' : 'light'} />}
      {isLoading ? '처리중...' : (isFollowingState ? '팔로잉' : '팔로우')}
    </button>
  );
}

