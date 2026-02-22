'use client';

import { useAuth } from '@/src/providers/AuthProvider';
import { X } from 'lucide-react';
import { useState } from 'react';
import { createPortal } from 'react-dom';

// ⭐ 추가: 모달 import
import ConfirmLogoutModal from './ConfirmLogoutModal';

export default function MorePanel({
  onClose,
  showLogoutModal,
  setShowLogoutModal,
}: {
  onClose: () => void;
  showLogoutModal: boolean;
  setShowLogoutModal: (value: boolean) => void;
}) {
  const { logout } = useAuth();
  const [mounted] = useState<boolean>(() => typeof document !== 'undefined');

  const handleLogout = async () => {
    await logout();
    setShowLogoutModal(false); // 모달 닫기
    onClose(); // 패널 닫기 (사이드바 복귀는 Sidebar가 처리)
  };

  if (!mounted) return null;

  return createPortal(
    <>
      <div
        className="
          fixed left-20 top-0 
          w-80 h-screen 
          bg-white border-r border-gray-200 
          shadow-xl
          animate-slideIn 
          z-50
        "
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 h-16">
          <h2 className="text-xl font-semibold">더보기</h2>
          <button onClick={onClose} className="p-2 rounded-full hover:bg-gray-100">
            <X size={22} />
          </button>
        </div>

        {/* List */}
        <div className="p-3 space-y-1 text-[15px]">
          <button
            className="
              w-full text-left font-semibold 
              py-2 px-2 rounded-lg 
              hover:bg-gray-100 transition
            "
          >
            설정 및 개인정보
          </button>
          <button
            className="
              w-full text-left font-semibold 
              py-2 px-2 rounded-lg 
              hover:bg-gray-100 transition
            "
          >
            다크모드 (개발중)
          </button>

          {/* ⭐ 로그아웃 메뉴 → 모달 오픈 */}
          <button
            onClick={() => {
              setShowLogoutModal(true);
            }}
            className="
              w-full text-left font-semibold 
              py-2 px-2 rounded-lg 
              hover:bg-gray-100 transition
            "
          >
            로그아웃
          </button>
        </div>
      </div>

      {showLogoutModal && (
        <ConfirmLogoutModal onConfirm={handleLogout} onCancel={() => setShowLogoutModal(false)} />
      )}
    </>,
    document.body,
  );
}
