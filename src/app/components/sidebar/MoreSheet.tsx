'use client';

import { useAuth } from '@/src/providers/AuthProvider';
import { useLoginModal } from '@/src/providers/LoginModalProvider';
import { FileText, Image, MessageCircle, User, X } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import ConfirmLogoutModal from './ConfirmLogoutModal';

function ItemBtn({ children, onClick }: { children: React.ReactNode; onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="w-full text-left font-semibold py-3 px-3 rounded-lg hover:bg-gray-100 transition"
    >
      {children}
    </button>
  );
}

export default function MoreSheet({
  isOpen,
  onClose,
  showLogoutModal,
  setShowLogoutModal,
}: {
  isOpen: boolean;
  onClose: () => void;
  showLogoutModal: boolean;
  setShowLogoutModal: (value: boolean) => void;
}) {
  const router = useRouter();
  const { isLogin, logout, loginUser } = useAuth();
  const { open } = useLoginModal();

  const handleLogout = async () => {
    await logout();
    setShowLogoutModal(false);
    onClose();
  };

  const go = (href: string) => {
    onClose();
    router.push(href);
  };

  const handleProfileClick = () => {
    if (isLogin && loginUser) {
      go(`/profile/${loginUser.id}`);
    } else {
      onClose();
      open();
    }
  };

  // Body scroll lock
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  // ESC 키 닫기
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) onClose();
    };
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/40 z-[75]"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Bottom Sheet */}
      <div
        role="dialog"
        aria-modal="true"
        aria-label="더보기 메뉴"
        className="
          fixed bottom-0 left-0 right-0 z-[80]
          bg-white rounded-t-2xl shadow-xl
          animate-slideUp
        "
        style={{ paddingBottom: 'env(safe-area-inset-bottom, 0px)' }}
      >
        {/* 드래그 핸들 */}
        <div className="flex justify-center pt-3 pb-1">
          <div className="w-10 h-1 bg-gray-300 rounded-full" />
        </div>

        {/* 헤더 */}
        <div className="flex items-center justify-between px-5 py-3">
          <h2 className="text-lg font-semibold">더보기</h2>
          <button
            type="button"
            onClick={onClose}
            aria-label="더보기 닫기"
            className="p-2 rounded-full hover:bg-gray-100"
          >
            <X size={20} />
          </button>
        </div>

        {/* 항목 목록 */}
        <div className="px-3 pb-6 space-y-1 text-[15px]">
          {/* 프로필 (모바일 전용 추가 항목) */}
          <button
            type="button"
            onClick={handleProfileClick}
            className="w-full text-left font-semibold py-3 px-3 rounded-lg hover:bg-gray-100 transition flex items-center gap-3"
          >
            <User size={18} className="text-gray-500 flex-shrink-0" />
            프로필
          </button>

          {/* 메세지 (모바일 전용 추가 항목) */}
          <button
            type="button"
            onClick={() => go('/messages')}
            className="w-full text-left font-semibold py-3 px-3 rounded-lg hover:bg-gray-100 transition flex items-center gap-3"
          >
            <MessageCircle size={18} className="text-gray-500 flex-shrink-0" />
            메세지
          </button>

          {/* 숏피드 */}
          <button
            type="button"
            onClick={() => go('/shorlog/feed')}
            className="w-full text-left font-semibold py-3 px-3 rounded-lg hover:bg-gray-100 transition flex items-center gap-3"
          >
            <Image size={18} className="text-gray-500 flex-shrink-0" />
            숏피드
          </button>

          {/* 블로그 */}
          <button
            type="button"
            onClick={() => go('/blogs')}
            className="w-full text-left font-semibold py-3 px-3 rounded-lg hover:bg-gray-100 transition flex items-center gap-3"
          >
            <FileText size={18} className="text-gray-500 flex-shrink-0" />
            블로그
          </button>

          <div className="border-t border-gray-100 my-2" />

          {/* 기존 MorePanel 항목 */}
          <ItemBtn onClick={() => go('/terms')}>TexTok 이용약관</ItemBtn>
          <ItemBtn onClick={() => go('/privacy')}>개인정보 처리방침</ItemBtn>

          <button
            className="w-full text-left font-semibold py-3 px-3 rounded-lg transition opacity-40 cursor-not-allowed"
            disabled
          >
            다크모드 (개발중)
          </button>

          {isLogin ? (
            <ItemBtn onClick={() => setShowLogoutModal(true)}>로그아웃</ItemBtn>
          ) : (
            <>
              <ItemBtn
                onClick={() => {
                  onClose();
                  open();
                }}
              >
                로그인
              </ItemBtn>

              <Link
                href="/auth/register"
                onClick={onClose}
                className="block w-full text-left font-semibold py-3 px-3 rounded-lg hover:bg-gray-100 transition"
              >
                회원가입
              </Link>
            </>
          )}
        </div>

        <div className="px-5 pb-4 text-xs text-slate-400">
          © {new Date().getFullYear()} TexTok
        </div>
      </div>

      {showLogoutModal && (
        <ConfirmLogoutModal onConfirm={handleLogout} onCancel={() => setShowLogoutModal(false)} />
      )}
    </>
  );
}
