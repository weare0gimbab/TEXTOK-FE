import type { ElementType } from 'react';
import {
  Bell,
  FileText,
  Home,
  Image,
  MessageCircle,
  MoreHorizontal,
  PlusSquare,
  User,
  Users,
} from 'lucide-react';

export type MenuItem = {
  icon: ElementType;
  label: string;
  href: string;
  alert?: boolean;
};

// 비로그인 메뉴
export const guestMenu: MenuItem[] = [
  { icon: Home, label: '메인', href: '/' },
  { icon: Image, label: '숏피드', href: '/shorlog/feed' },
  { icon: FileText, label: '블로그', href: '/blogs' },
  { icon: Users, label: '추천 계정', href: '/creators' },
  { icon: PlusSquare, label: '작성', href: '/create-content' },
  { icon: User, label: '프로필', href: '/profile' },
  { icon: MoreHorizontal, label: '더보기', href: '' },
];

export function loggedInMenu(unreadCount: number): MenuItem[] {
  return [
    { icon: Home, label: '메인', href: '/' },
    { icon: Image, label: '숏피드', href: '/shorlog/feed' },
    { icon: FileText, label: '블로그', href: '/blogs' },
    { icon: Users, label: '추천 계정', href: '/creators' },
    { icon: PlusSquare, label: '작성', href: '/create-content' },
    { icon: MessageCircle, label: '메시지', href: '/messages', alert: false },

    // 알림 메뉴 (조건부 alert)
    {
      icon: Bell,
      label: '알림',
      href: '/notifications',
      alert: unreadCount > 0,
    },

    { icon: User, label: '프로필', href: '/profile' },
    { icon: MoreHorizontal, label: '더보기', href: '' },
  ];
}
