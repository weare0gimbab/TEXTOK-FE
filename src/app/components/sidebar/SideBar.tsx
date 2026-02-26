'use client';

import { useAuth } from '@/src/providers/AuthProvider';
import { useLoginModal } from '@/src/providers/LoginModalProvider';
import { useMessagesUnreadStore } from '@/src/stores/useMessagesUnreadStore';
import { useNotificationStore } from '@/src/stores/useNotificationsStore';
import { Search } from 'lucide-react';
import Image from 'next/image';
import { usePathname, useRouter } from 'next/navigation';
import { useEffect, useRef, useState } from 'react';
import NotificationPanel from '../notifications/NotificationPanel';
import MorePanel from './panel/MorePanel';
import SearchPanel from './panel/SearchPanel';
import { guestMenu, loggedInMenu } from './SideBarMenu';

type OpenPanel = 'none' | 'more' | 'search' | 'notification';

export default function Sidebar() {
  const { loginUser, isLogin } = useAuth();
  const { open } = useLoginModal();

  const unreadCount = useNotificationStore((s) => s.unreadCount);
  const unreadMessagesCount = useMessagesUnreadStore((s) => s.unreadCount);

  const [isCollapsed, setIsCollapsed] = useState(false);
  const [openPanel, setOpenPanel] = useState<OpenPanel>('none');
  const [showLogoutModal, setShowLogoutModal] = useState(false);
  const [sidebarKeyword, setSidebarKeyword] = useState('');
  const isPanelTransitioning = useRef(false);

  const pathname = usePathname();
  const router = useRouter();

  const moreModalRef = useRef<HTMLDivElement>(null);
  const searchWrapperRef = useRef<HTMLDivElement>(null);
  const sidebarRef = useRef<HTMLElement>(null);

  const menuData = isLogin ? loggedInMenu : guestMenu;
  const menu = typeof menuData === 'function' ? menuData(0) : menuData;

  const isMoreOpen = openPanel === 'more';
  const isSearchOpen = openPanel === 'search';
  const isNotificationOpen = openPanel === 'notification';
  const protectedMenus = ['프로필', '작성'];

  // 사이드바 너비 계산
  const sidebarWidth = isCollapsed ? 80 : 240;

  const openPanelFn = (panel: OpenPanel) => {
    if (openPanel !== 'none' && openPanel !== panel) {
      // 다른 패널이 열려있으면 패널만 교체
      isPanelTransitioning.current = true;
      setOpenPanel('none');
      setTimeout(() => {
        setOpenPanel(panel);
        isPanelTransitioning.current = false;
      }, 250);
    } else {
      setOpenPanel(panel);
    }
  };

  const closePanelFn = () => {
    setOpenPanel('none');
  };

  const goHome = () => {
    router.push('/');
  };

  useEffect(() => {
    function handleResize() {
      if (openPanel !== 'none' || window.innerWidth < 1280) {
        setIsCollapsed(true);
      } else {
        setIsCollapsed(false);
      }
    }

    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [openPanel]);

  // 외부 클릭 시 패널 닫기
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (showLogoutModal) return;

      const target = e.target as Node;

      const clickedInsideSidebar = sidebarRef.current && sidebarRef.current.contains(target);
      const clickedInsideMore = moreModalRef.current && moreModalRef.current.contains(target);
      const clickedInsideSearch =
        searchWrapperRef.current && searchWrapperRef.current.contains(target);

      if (clickedInsideSidebar) return;

      if (openPanel === 'search' && !clickedInsideSearch) {
        closePanelFn();
        return;
      }

      if (openPanel === 'more' && !clickedInsideMore) {
        closePanelFn();
        return;
      }
    }

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [openPanel, showLogoutModal]);

  // 검색 페이지에서만 키워드 표시
  const effectiveSidebarKeyword = pathname.startsWith('/search') ? sidebarKeyword : '';

  return (
    <>
      <aside
        ref={sidebarRef}
        className={`
          ${isCollapsed ? 'w-20' : 'w-60'}
          bg-white border-r border-slate-100
          h-screen fixed hidden md:flex md:flex-col
          transition-all duration-300 ease-in-out
          z-[60]
          dark:bg-slate-900 dark:border-slate-800
        `}
      >
        {/* ── HEADER ── */}
        <div className="flex items-center justify-center px-2 pb-2 pt-5 transition-all duration-300 ease-in-out">
          {isCollapsed && (
            <button
              type="button"
              onClick={goHome}
              className="flex items-center justify-center rounded-xl p-2 text-slate-900 transition-colors duration-200 hover:bg-slate-100 dark:text-slate-100 dark:hover:bg-slate-800"
              aria-label="홈으로"
            >
              <Image
                src="/icons/book.png"
                alt="텍스톡 아이콘"
                width={36}
                height={36}
                className="object-contain"
              />
            </button>
          )}

          {!isCollapsed && (
            <button
              type="button"
              onClick={goHome}
              className="flex items-center justify-center rounded-xl py-2 transition-opacity duration-200 hover:opacity-80 py-2"
              aria-label="홈으로"
            >
              <Image
                src="/icons/logo.png"
                alt="textok 로고"
                width={110}
                height={30}
                className="object-contain"
              />
            </button>
          )}
        </div>

        {/* ── SEARCH ── */}
        <div ref={searchWrapperRef}>
          <div className="px-3 pb-1 pt-2">
            <div
              onClick={() => {
                if (isSearchOpen) closePanelFn();
                else openPanelFn('search');
              }}
              className={`
                relative flex cursor-pointer items-center overflow-hidden
                transition-all duration-300 ease-in-out mx-auto
                ${
                  isCollapsed
                    ? 'h-10 w-10 justify-center rounded-xl'
                    : 'h-10 w-full rounded-xl pl-10 pr-3 border'
                }
                ${
                  isSearchOpen
                    ? 'bg-blue-50 border-blue-200 text-blue-600 dark:bg-blue-950 dark:border-blue-800 dark:text-blue-400'
                    : isCollapsed
                      ? 'text-slate-500 hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-slate-800'
                      : 'bg-slate-50 border-slate-200 text-slate-600 hover:bg-white hover:border-slate-300 dark:bg-slate-800 dark:border-slate-700 dark:text-slate-400'
                }
              `}
            >
              <div
                className={`
                  flex items-center justify-center
                  ${
                    isCollapsed
                      ? 'h-5 w-5'
                      : 'pointer-events-none absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400'
                  }
                `}
              >
                <Search size={17} />
              </div>

              <input
                type="text"
                readOnly
                value={effectiveSidebarKeyword}
                placeholder="검색"
                className={`
                  bg-transparent text-sm outline-none text-slate-800 placeholder:text-slate-400
                  transition-all duration-300 ease-in-out
                  dark:text-slate-200
                  ${isCollapsed ? 'w-0 opacity-0' : 'w-full opacity-100'}
                `}
              />
            </div>
          </div>

          {isSearchOpen && (
            <SearchPanel
              initialKeyword={effectiveSidebarKeyword}
              onClose={closePanelFn}
              onSearch={(keyword: string) => setSidebarKeyword(keyword)}
            />
          )}
        </div>

        {/* ── MENU ── */}
        <nav className="flex-1 space-y-0.5 px-3 py-1 text-[14px]">
          {menu.map((item) => {
            const isActive =
              item.href === '/profile' ? pathname.startsWith('/profile') : pathname === item.href;

            const isProfile = item.label === '프로필';
            const isProtected = protectedMenus.includes(item.label);

            if (item.label === '더보기') {
              return (
                <div key={item.label} className="relative group" ref={moreModalRef}>
                  <button
                    onClick={() => {
                      if (isMoreOpen) closePanelFn();
                      else openPanelFn('more');
                    }}
                    className={`
                      w-full text-left flex items-center gap-3 rounded-xl px-3 py-2.5
                      transition-all duration-150 ease-in-out
                      ${
                        isMoreOpen
                          ? 'bg-blue-50 text-blue-600 font-semibold dark:bg-blue-950 dark:text-blue-400'
                          : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900 dark:text-slate-400 dark:hover:bg-slate-800 dark:hover:text-slate-200'
                      }
                    `}
                  >
                    <div className="flex h-5 w-5 flex-shrink-0 items-center justify-center">
                      <item.icon size={19} />
                    </div>

                    <span
                      className={`
                        whitespace-nowrap transition-all duration-300 ease-in-out
                        ${isCollapsed ? 'w-0 overflow-hidden opacity-0' : 'w-auto opacity-100'}
                      `}
                    >
                      {item.label}
                    </span>
                  </button>

                  {/* 축소 상태 툴팁 */}
                  {isCollapsed && (
                    <span className="pointer-events-none absolute left-[72px] top-1/2 z-50 -translate-y-1/2 whitespace-nowrap rounded-lg bg-slate-800 px-2.5 py-1.5 text-xs font-medium text-white opacity-0 shadow-lg transition-opacity duration-150 group-hover:opacity-100 dark:bg-slate-700">
                      {item.label}
                    </span>
                  )}

                  {isMoreOpen && (
                    <MorePanel
                      onClose={closePanelFn}
                      showLogoutModal={showLogoutModal}
                      setShowLogoutModal={setShowLogoutModal}
                    />
                  )}
                </div>
              );
            }

            return (
              <div key={item.label} className="relative group">
                <button
                  onClick={(e) => {
                    e.stopPropagation();

                    if (item.label === '알림') {
                      if (isNotificationOpen) closePanelFn();
                      else openPanelFn('notification');
                      return;
                    }
                    if (isProtected && !isLogin) {
                      open();
                      return;
                    }

                    if (isProfile && isLogin && loginUser) {
                      router.push(`/profile/${loginUser.id}`);
                      return;
                    }

                    if (item.href === '/shorlog/feed') {
                      if (pathname === '/shorlog/feed') {
                        router.refresh();
                      } else if (
                        pathname.startsWith('/shorlog/') ||
                        pathname.startsWith('/profile/')
                      ) {
                        window.location.href = '/shorlog/feed';
                      } else {
                        router.push('/shorlog/feed');
                      }
                      return;
                    }

                    router.push(item.href);
                  }}
                  className={`
                    w-full text-left flex items-center gap-3 rounded-xl px-3 py-2.5
                    transition-all duration-150 ease-in-out
                    ${
                      isActive || (item.label === '알림' && isNotificationOpen)
                        ? 'bg-blue-50 text-blue-600 font-semibold dark:bg-blue-950 dark:text-blue-400'
                        : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900 dark:text-slate-400 dark:hover:bg-slate-800 dark:hover:text-slate-200'
                    }
                  `}
                >
                  {/* 아이콘 영역 */}
                  <div className="relative flex h-5 w-5 flex-shrink-0 items-center justify-center">
                    {isProfile && isLogin ? (
                      <Image
                        src={loginUser?.profileImgUrl || '/tmpProfile.png'}
                        alt="프로필"
                        width={24}
                        height={24}
                        className="h-6 w-6 rounded-full object-cover ring-2 ring-white dark:ring-slate-900"
                        unoptimized
                      />
                    ) : (
                      <>
                        <item.icon size={19} />

                        {item.label === '메시지' && unreadMessagesCount > 0 && (
                          <span className="absolute -right-0.5 -top-0.5 h-2 w-2 rounded-full bg-red-500 ring-2 ring-white dark:ring-slate-900" />
                        )}

                        {item.label === '알림' && unreadCount > 0 && (
                          <span className="absolute -right-0.5 -top-0.5 h-2 w-2 rounded-full bg-red-500 ring-2 ring-white dark:ring-slate-900" />
                        )}
                      </>
                    )}
                  </div>

                  {/* 레이블 */}
                  <span
                    className={`
                      whitespace-nowrap transition-all duration-300 ease-in-out
                      ${isCollapsed ? 'w-0 overflow-hidden opacity-0' : 'w-auto opacity-100'}
                    `}
                  >
                    {item.label}
                  </span>
                </button>

                {/* 축소 상태 툴팁 */}
                {isCollapsed && (
                  <span
                    className="
                      pointer-events-none absolute left-[72px] top-1/2 z-50
                      -translate-y-1/2 whitespace-nowrap rounded-lg
                      bg-slate-800 px-2.5 py-1.5 text-xs font-medium text-white
                      opacity-0 shadow-lg transition-opacity duration-150
                      group-hover:opacity-100 dark:bg-slate-700
                    "
                  >
                    {item.label}
                  </span>
                )}
              </div>
            );
          })}

          {/* 비로그인 로그인 버튼 */}
          {!isLogin && !isCollapsed && (
            <div className="pb-4 pt-2">
              <button
                onClick={() => open()}
                className="w-full rounded-xl bg-[#2979FF] hover:bg-[#1f5edb] px-4 py-2.5 text-sm font-semibold text-white shadow-sm shadow-blue-500/20 transition hover:-translate-y-0.5 hover:bg-blue-700 hover:shadow-md hover:shadow-blue-500/25 active:translate-y-0"
              >
                로그인
              </button>
            </div>
          )}
        </nav>
      </aside>

      {/* 알림 패널 - 데스크탑(md 이상)에서만 표시 */}
      <div className="hidden md:block">
        <NotificationPanel
          open={isNotificationOpen}
          onClose={closePanelFn}
          sidebarWidth={sidebarWidth}
          sidebarRef={sidebarRef}
        />
      </div>
    </>
  );
}
