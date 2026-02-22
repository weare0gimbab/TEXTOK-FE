'use client';

import { useAuth } from '@/src/providers/AuthProvider';
import { useLoginModal } from '@/src/providers/LoginModalProvider';
import { X } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

import ConfirmLogoutModal from '../ConfirmLogoutModal';

function ItemBtn({ children, onClick }: { children: React.ReactNode; onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="
        w-full text-left font-semibold
        py-2 px-2 rounded-lg
        hover:bg-gray-100 transition
      "
    >
      {children}
    </button>
  );
}

export default function MorePanel({
  onClose,
  showLogoutModal,
  setShowLogoutModal,
}: {
  onClose: () => void;
  showLogoutModal: boolean;
  setShowLogoutModal: (value: boolean) => void;
}) {
  const router = useRouter();
  const { isLogin, logout } = useAuth();
  const { open } = useLoginModal();

  const handleLogout = async () => {
    await logout();
    setShowLogoutModal(false);
    onClose();
  };

  const go = (href: string) => {
    onClose(); // ✅ 패널 닫고 이동 (UX 깔끔)
    router.push(href);
  };

  return (
    <>
      <div
        className="
          fixed left-20 top-0
          w-80 h-screen
          bg-white border-r border-gray-200
          shadow-md
          animate-slideIn
          z-[110]
          flex flex-col
        "
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-8 h-16">
          <h2 className="text-xl font-semibold">더보기</h2>
          <button onClick={onClose} className="p-2 rounded-full hover:bg-gray-100">
            <X size={22} />
          </button>
        </div>

        {/* List */}
        <div className="px-3 py-1 space-y-1 text-[15px]">
          <ItemBtn onClick={() => go('/terms')}>TexTok 이용약관</ItemBtn>
          <ItemBtn onClick={() => go('/privacy')}>개인정보 처리방침</ItemBtn>

          <button
            className="
              w-full text-left font-semibold
              py-2 px-2 rounded-lg
              hover:bg-gray-100 transition
            "
            disabled
          >
            다크모드 (개발중)
          </button>

          {/* ✅ 로그인 상태: 로그아웃 */}
          {isLogin ? (
            <ItemBtn
              onClick={() => {
                setShowLogoutModal(true);
              }}
            >
              로그아웃
            </ItemBtn>
          ) : (
            <>
              {/* ✅ 로그아웃 상태: 로그인 / 회원가입 */}
              <ItemBtn
                onClick={() => {
                  onClose(); // 패널 먼저 닫고
                  open(); // 로그인 모달 열기
                }}
              >
                로그인
              </ItemBtn>

              <Link
                href="/auth/register"
                onClick={() => onClose()}
                className="
                  block w-full text-left font-semibold
                  py-2 px-2 rounded-lg
                  hover:bg-gray-100 transition
                "
              >
                회원가입
              </Link>
            </>
          )}
        </div>

        {/* (선택) 맨 아래 작은 카피 */}
        <div className="mt-auto px-5 pb-5 pt-4 text-xs text-slate-400">
          © {new Date().getFullYear()} TexTok
        </div>
      </div>

      {showLogoutModal && (
        <ConfirmLogoutModal onConfirm={handleLogout} onCancel={() => setShowLogoutModal(false)} />
      )}
    </>
  );
}
