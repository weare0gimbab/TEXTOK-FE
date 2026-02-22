'use client';

import { useAuth } from '@/src/providers/AuthProvider';
import { useLoginModal } from '@/src/providers/LoginModalProvider';
import { useNotificationStore } from '@/src/stores/useNotificationsStore';
import { Bell, Home, MoreHorizontal, PlusSquare, Search, Users } from 'lucide-react';
import { usePathname, useRouter } from 'next/navigation';
import { useState } from 'react';
import MoreSheet from './MoreSheet';
import SearchSheet from './SearchSheet';

export default function MobileTabBar() {
  const { isLogin } = useAuth();
  const { open } = useLoginModal();
  const unreadCount = useNotificationStore((s) => s.unreadCount);
  const pathname = usePathname();
  const router = useRouter();

  const [isMoreSheetOpen, setIsMoreSheetOpen] = useState(false);
  const [isSearchSheetOpen, setIsSearchSheetOpen] = useState(false);
  const [showLogoutModal, setShowLogoutModal] = useState(false);
  const [mobileKeyword, setMobileKeyword] = useState('');

  const effectiveKeyword = pathname.startsWith('/search') ? mobileKeyword : '';

  // 탭 active 여부 판단
  const isTabActive = (href: string) => {
    if (href === '/') return pathname === '/';
    return pathname.startsWith(href);
  };

  const handleCreateClick = () => {
    if (!isLogin) {
      open();
      return;
    }
    router.push('/create-content');
  };

  const handleNotificationOrCreatorsClick = () => {
    if (isLogin) {
      router.push('/notifications');
    } else {
      router.push('/creators');
    }
  };

  // 탭 버튼 기본 스타일 (일반)
  const tabCls = (active: boolean) =>
    `flex flex-col items-center justify-center gap-0.5 flex-1 py-2 text-[11px] font-medium transition-colors ${
      active ? 'text-[#2979FF]' : 'text-gray-500'
    }`;

  return (
    <>
      {/* 탭바 */}
      <nav
        aria-label="모바일 하단 내비게이션"
        className="
          fixed bottom-0 left-0 right-0 z-[70]
          bg-white border-t border-gray-200
          flex items-end
          h-tab-bar
          md:hidden
        "
      >
        {/* 1. 검색 */}
        <button
          type="button"
          aria-label="검색"
          onClick={() => setIsSearchSheetOpen(true)}
          className={tabCls(false)}
          style={{ paddingBottom: 'env(safe-area-inset-bottom, 8px)' }}
        >
          <Search size={22} />
          <span>검색</span>
        </button>

        {/* 2. 작성 */}
        <button
          type="button"
          aria-label="작성"
          onClick={handleCreateClick}
          className={tabCls(isTabActive('/create-content'))}
          style={{ paddingBottom: 'env(safe-area-inset-bottom, 8px)' }}
        >
          <PlusSquare size={22} />
          <span>작성</span>
        </button>

        {/* 3. 홈 (FAB 스타일 중앙) */}
        <div
          className="flex flex-col items-center justify-center flex-1 relative"
          style={{ paddingBottom: 'env(safe-area-inset-bottom, 8px)' }}
        >
          <button
            type="button"
            aria-label="홈"
            onClick={() => router.push('/')}
            className="
              flex items-center justify-center
              w-12 h-12 rounded-full
              bg-[#2979FF] text-white
              shadow-lg
              -mt-3
              transition-transform active:scale-95
            "
          >
            <Home size={22} />
          </button>
          <span
            className={`text-[11px] font-medium mt-0.5 ${pathname === '/' ? 'text-[#2979FF]' : 'text-gray-500'}`}
          >
            홈
          </span>
        </div>

        {/* 4. 알림 (로그인) / 추천계정 (비로그인) */}
        <button
          type="button"
          aria-label={isLogin ? '알림' : '추천 계정'}
          onClick={handleNotificationOrCreatorsClick}
          className={tabCls(
            isLogin ? isTabActive('/notifications') : isTabActive('/creators'),
          )}
          style={{ paddingBottom: 'env(safe-area-inset-bottom, 8px)' }}
        >
          <div className="relative">
            {isLogin ? <Bell size={22} /> : <Users size={22} />}
            {isLogin && unreadCount > 0 && (
              <span className="absolute -right-1 -top-1 h-2 w-2 rounded-full bg-red-500 ring-1 ring-white" />
            )}
          </div>
          <span>{isLogin ? '알림' : '추천계정'}</span>
        </button>

        {/* 5. 더보기 */}
        <button
          type="button"
          aria-label="더보기"
          onClick={() => setIsMoreSheetOpen(true)}
          className={tabCls(false)}
          style={{ paddingBottom: 'env(safe-area-inset-bottom, 8px)' }}
        >
          <MoreHorizontal size={22} />
          <span>더보기</span>
        </button>
      </nav>

      {/* 검색 시트 */}
      {isSearchSheetOpen && (
        <SearchSheet
          initialKeyword={effectiveKeyword}
          onClose={() => setIsSearchSheetOpen(false)}
          onSearch={(kw) => setMobileKeyword(kw)}
        />
      )}

      {/* 더보기 시트 */}
      <MoreSheet
        isOpen={isMoreSheetOpen}
        onClose={() => setIsMoreSheetOpen(false)}
        showLogoutModal={showLogoutModal}
        setShowLogoutModal={setShowLogoutModal}
      />
    </>
  );
}
