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

      // 사이드바 클릭 확인
      const clickedInsideSidebar = sidebarRef.current && sidebarRef.current.contains(target);
      const clickedInsideMore = moreModalRef.current && moreModalRef.current.contains(target);
      const clickedInsideSearch =
        searchWrapperRef.current && searchWrapperRef.current.contains(target);

      // 사이드바 안쪽 클릭이면 아무것도 하지 않음
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
          bg-white border-r border-gray-200
          h-screen fixed flex flex-col
          transition-all duration-300 ease-in-out
          z-[60]
        `}
      >
        {/* ================= HEADER ================= */}
        <div className="pl-1 pr-1 pt-5 pb-2 flex items-center justify-center transition-all duration-300 ease-in-out">
          {isCollapsed && (
            <button
              type="button"
              onClick={goHome}
              className="flex items-center justify-center rounded-xl text-slate-900 transition-opacity duration-300"
            >
              <Image
                src="/icons/book.png"
                alt="텍스톡 아이콘"
                width={48}
                height={39}
                className="object-contain"
              />
            </button>
          )}

          {!isCollapsed && (
            <button
              type="button"
              onClick={goHome}
              className="flex items-center justify-center transition-opacity duration-300 py-2"
            >
              <Image
                src="/icons/logo.png"
                alt="textok 로고"
                width={145}
                height={44}
                className="object-contain"
              />
            </button>
          )}
        </div>

        {/* SEARCH WRAPPER */}
        <div ref={searchWrapperRef}>
          <div className="px-5 pt-2 pb-1">
            <div
              onClick={() => {
                if (isSearchOpen) closePanelFn();
                else openPanelFn('search');
              }}
              className={`
                relative flex items-center cursor-pointer overflow-hidden
                transition-all duration-300 ease-in-out
                mx-auto
                ${
                  isCollapsed
                    ? 'h-10 w-10 justify-center rounded-full'
                    : 'h-10 w-full rounded-full pl-10 pr-3 border'
                }
                ${
                  isSearchOpen
                    ? 'bg-sky-50 border-sky-200 text-[#2979FF]'
                    : isCollapsed
                      ? ' text-slate-600 hover:bg-slate-100'
                      : 'bg-slate-50 border-slate-200 text-slate-700 hover:bg-white'
                }
              `}
            >
              <div
                className={`
                  flex items-center justify-center
                  ${
                    isCollapsed
                      ? 'h-6 w-6 text-slate-600'
                      : 'pointer-events-none absolute left-3 top-1/2 h-6 w-6 -translate-y-1/2 text-slate-400'
                  }
                `}
              >
                <Search size={18} />
              </div>

              <input
                type="text"
                readOnly
                value={effectiveSidebarKeyword}
                placeholder="검색어를 입력하세요"
                className={`
                  bg-transparent text-sm outline-none text-slate-800 placeholder:text-slate-400
                  transition-all duration-300 ease-in-out
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

        {/* MENU LIST */}
        <nav className="flex-1 px-3 space-y-1 text-[15px]">
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
                      w-full text-left flex items-center gap-3 px-4 py-2 rounded-lg transition-all duration-200 ease-in-out
                      ${isMoreOpen ? 'text-blue-600 font-medium bg-slate-50' : 'text-gray-600 hover:bg-gray-100'}
                    `}
                  >
                    <div
                      className={`
                        flex items-center justify-center flex-shrink-0
                        ${
                          isMoreOpen
                            ? 'text-[#2979FF]'
                            : isCollapsed
                              ? ' text-slate-600 hover:bg-slate-100'
                              : 'bg-slate-50 border-slate-200 text-slate-700 hover:bg-white'
                        }
                      `}
                    >
                      <item.icon size={20} />
                    </div>

                    <span
                      className={`
                        whitespace-nowrap transition-all duration-300 ease-in-out
                        ${isCollapsed ? 'w-0 opacity-0 overflow-hidden' : 'w-auto opacity-100'}
                      `}
                    >
                      {item.label}
                    </span>
                  </button>

                  {isCollapsed && (
                    <span className="absolute left-20 top-1/2 -translate-y-1/2 px-2 py-1 bg-gray-900 text-white text-xs rounded opacity-0 group-hover:opacity-100 transition pointer-events-none">
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
                    w-full text-left flex items-center gap-3 px-4 py-2 rounded-lg transition-all duration-200 ease-in-out
                    ${
                      isActive || (item.label === '알림' && isNotificationOpen)
                        ? 'text-blue-600 font-medium'
                        : 'text-gray-600 hover:bg-gray-100'
                    }
                  `}
                >
                  <div
                    className={`
                      relative flex items-center justify-center flex-shrink-0
                      ${isCollapsed ? 'w-6 h-6' : 'w-7 h-7'}
                    `}
                  >
                    {isProfile && isLogin ? (
                      <Image
                        src={loginUser?.profileImgUrl || '/tmpProfile.png'}
                        alt="profile"
                        width={28}
                        height={28}
                        className="w-7 h-7 rounded-full object-cover"
                        unoptimized
                      />
                    ) : (
                      <div
                        className={`
                          relative flex items-center justify-center flex-shrink-0
                          ${isCollapsed ? 'w-6 h-6' : 'w-7 h-7'}
                        `}
                      >
                        <item.icon size={20} />

                        {item.label === '메시지' && unreadMessagesCount > 0 && (
                          <span className="absolute -right-0.5 -top-0.5 h-2 w-2 rounded-full bg-red-500 ring-2 ring-white" />
                        )}

                        {item.label === '알림' && unreadCount > 0 && (
                          <span className="absolute -right-0.5 -top-0.5 h-2 w-2 rounded-full bg-red-500 ring-2 ring-white" />
                        )}
                      </div>
                    )}
                  </div>

                  <span
                    className={`
                      whitespace-nowrap transition-all duration-300 ease-in-out
                      ${isCollapsed ? 'w-0 opacity-0 overflow-hidden' : 'w-auto opacity-100'}
                    `}
                  >
                    {item.label}
                  </span>
                </button>

                {isCollapsed && (
                  <span
                    className="
                      absolute left-20 top-1/2 -translate-y-1/2
                      px-2 py-1 bg-gray-900 text-white text-xs rounded
                      opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none
                      whitespace-nowrap z-50
                    "
                  >
                    {item.label}
                  </span>
                )}
              </div>
            );
          })}

          {!isLogin && !isCollapsed && (
            <div className="pt-2 pb-6 border-b border-gray-200">
              <button
                onClick={() => open()}
                className="w-full bg-blue-600 text-white py-3 rounded-lg font-medium hover:bg-blue-700 transition"
              >
                로그인
              </button>
            </div>
          )}
        </nav>
      </aside>

      {/* 알림 패널 */}
      <NotificationPanel
        open={isNotificationOpen}
        onClose={closePanelFn}
        sidebarWidth={sidebarWidth}
        sidebarRef={sidebarRef}
      />
    </>
  );
}
