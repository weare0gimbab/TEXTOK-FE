'use client';

import { useState } from 'react';
import { X, Copy, Check, MessageCircle, Mail, Users, Briefcase } from 'lucide-react';

import { useToast } from '../../common/Toast';

interface ShareModalProps {
  shorlogId: number;
  title: string;
  description: string;
  imageUrl: string | null;
  author: string;
  isOpen: boolean;
  onClose: () => void;
}

interface ShorlogShareData {
  id: number;
  title: string;
  description: string;
  imageUrl: string | null;
  url: string;
  author: string;
}

export default function ShareModal({
  shorlogId,
  title,
  description,
  imageUrl,
  author,
  isOpen,
  onClose
}: ShareModalProps) {
  const [isCopied, setIsCopied] = useState(false);
  const { success, error, ToastContainer } = useToast();

  // 공유 데이터 생성
  const shareData: ShorlogShareData = {
    id: shorlogId,
    title,
    description: description.length > 160 ? `${description.substring(0, 157)}...` : description,
    imageUrl,
    url: `${typeof window !== 'undefined' ? window.location.origin : 'https://www.textok.store'}/shorlog/${shorlogId}`,
    author
  };

  const copyToClipboard = async () => {
    if (!shareData) return;

    try {
      await navigator.clipboard.writeText(shareData.url);
      setIsCopied(true);
      setTimeout(() => setIsCopied(false), 2000);
      success('링크가 클립보드에 복사되었습니다.');
    } catch (copyError) {
      // Fallback: 수동 복사
      const textArea = document.createElement('textarea');
      textArea.value = shareData.url;
      document.body.appendChild(textArea);
      textArea.focus();
      textArea.select();
      try {
        document.execCommand('copy');
        setIsCopied(true);
        setTimeout(() => setIsCopied(false), 2000);
        success('링크가 클립보드에 복사되었습니다.');
      } catch (fallbackError) {
        error('클립보드 복사에 실패했습니다.');
      }
      document.body.removeChild(textArea);
    }
  };

  const shareToKakao = () => {
    if (!shareData) return;

    if (typeof window !== 'undefined' && window.Kakao?.isInitialized()) {
      try {
        window.Kakao.Share.sendDefault({
          objectType: 'feed',
          content: {
            title: shareData.title,
            description: shareData.description,
            imageUrl: shareData.imageUrl || 'https://via.placeholder.com/400x300?text=TexTok',
            link: {
              mobileWebUrl: shareData.url,
              webUrl: shareData.url
            }
          },
          buttons: [{
            title: '숏로그 보기',
            link: {
              mobileWebUrl: shareData.url,
              webUrl: shareData.url
            }
          }]
        });
      } catch (kakaoError) {
        error('카카오톡 공유에 실패했습니다.');
      }
    } else {
      const confirmCopy = window.confirm(
        '카카오톡 공유 기능이 설정되지 않았습니다.\n대신 링크를 복사하시겠습니까?'
      );

      if (confirmCopy) {
        copyToClipboard();
      }
    }
  };

  const openShareWindow = (url: string) => {
    window.open(url, '_blank', 'width=600,height=400');
  };

  const shareToFacebook = () => {
    if (!shareData) return;
    openShareWindow(`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareData.url)}`);
  };

  const shareToNaverBand = () => {
    if (!shareData) return;
    const body = encodeURIComponent(`${shareData.title}\n${shareData.description}`);
    const route = encodeURIComponent(shareData.url);
    openShareWindow(`https://band.us/plugin/share?body=${body}&route=${route}`);
  };

  const shareToLinkedIn = () => {
    if (!shareData) return;
    openShareWindow(`https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(shareData.url)}`);
  };

  const createEmailData = () => {
    if (!shareData) return { subject: '', body: '' };
    return {
      subject: encodeURIComponent(shareData.title),
      body: encodeURIComponent(`${shareData.description}\n\n${shareData.url}`)
    };
  };

  const shareToGmail = () => {
    const { subject, body } = createEmailData();
    if (subject && body) {
      window.open(`https://mail.google.com/mail/?view=cm&fs=1&tf=1&su=${subject}&body=${body}`, '_blank');
    }
  };

  const shareToOutlook = () => {
    const { subject, body } = createEmailData();
    if (subject && body) {
      window.open(`https://outlook.live.com/owa/?path=/mail/action/compose&subject=${subject}&body=${body}`, '_blank');
    }
  };

  const shareToEmail = () => {
    const { subject, body } = createEmailData();
    if (subject && body) {
      window.open(`mailto:?subject=${subject}&body=${body}`);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="w-full max-w-md rounded-2xl bg-white shadow-xl">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-100 p-6">
          <h3 className="text-lg font-semibold text-slate-900">숏로그 공유</h3>
          <button
            onClick={onClose}
            className="flex h-8 w-8 items-center justify-center rounded-full text-slate-400 hover:bg-slate-100 hover:text-slate-600"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6">
          <>
            {/* Preview */}
              <div className="mb-6 rounded-lg border border-slate-200 p-4">
                <div className="flex gap-3">
                  {shareData.imageUrl && (
                    <div className="h-16 w-16 flex-shrink-0 overflow-hidden rounded-lg bg-slate-100">
                      <img
                        src={shareData.imageUrl}
                        alt=""
                        className="h-full w-full object-cover"
                      />
                    </div>
                  )}
                  <div className="flex-1 min-w-0">
                    <h4 className="font-medium text-slate-900 truncate">{shareData.title}</h4>
                    <p className="mt-1 text-sm text-slate-600 line-clamp-2">{shareData.description}</p>
                    <p className="mt-1 text-xs text-slate-500">by {shareData.author}</p>
                  </div>
                </div>
              </div>

              {/* Link Copy */}
              <div className="mb-6">
                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    value={shareData.url}
                    readOnly
                    className="flex-1 rounded-lg border border-slate-200 px-3 py-2 text-sm text-slate-600 bg-slate-50"
                  />
                  <button
                    onClick={copyToClipboard}
                    className={`flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-medium transition ${
                      isCopied
                        ? 'bg-green-500 text-white'
                        : 'bg-blue-500 text-white hover:bg-blue-600'
                    }`}
                  >
                    {isCopied ? (
                      <>
                        <Check className="h-4 w-4" />
                        복사됨
                      </>
                    ) : (
                      <>
                        <Copy className="h-4 w-4" />
                        복사
                      </>
                    )}
                  </button>
                </div>
              </div>

              {/* SNS Buttons */}
              <div className="space-y-3">
                <p className="text-sm font-medium text-slate-700">SNS로 공유하기</p>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    onClick={shareToKakao}
                    className="flex items-center justify-center gap-2 rounded-lg border border-yellow-300 bg-yellow-400 px-4 py-3 text-sm font-medium text-yellow-900 transition hover:bg-yellow-500"
                  >
                    <MessageCircle className="h-4 w-4" />
                    카카오톡
                  </button>

                  <button
                    onClick={shareToFacebook}
                    className="flex items-center justify-center gap-2 rounded-lg border border-blue-300 bg-blue-500 px-4 py-3 text-sm font-medium text-white transition hover:bg-blue-600"
                  >
                    <span className="h-4 w-4">f</span>
                    페이스북
                  </button>

                  <button
                    onClick={shareToNaverBand}
                    className="flex items-center justify-center gap-2 rounded-lg border border-green-300 bg-green-500 px-4 py-3 text-sm font-medium text-white transition hover:bg-green-600"
                  >
                    <Users className="h-4 w-4" />
                    네이버 밴드
                  </button>

                  <button
                    onClick={shareToLinkedIn}
                    className="flex items-center justify-center gap-2 rounded-lg border border-blue-300 bg-blue-600 px-4 py-3 text-sm font-medium text-white transition hover:bg-blue-700"
                  >
                    <Briefcase className="h-4 w-4" />
                    링크드인
                  </button>
                </div>

                <div className="space-y-2 mt-3">
                  <p className="text-xs font-medium text-slate-600">이메일로 공유</p>
                  <div className="grid grid-cols-3 gap-2">
                    <button
                      onClick={shareToGmail}
                      className="flex items-center justify-center gap-1 rounded-lg border border-red-300 bg-red-500 px-3 py-2 text-xs font-medium text-white transition hover:bg-red-600"
                    >
                      <Mail className="h-3 w-3" />
                      Gmail
                    </button>

                    <button
                      onClick={shareToOutlook}
                      className="flex items-center justify-center gap-1 rounded-lg border border-blue-300 bg-blue-500 px-3 py-2 text-xs font-medium text-white transition hover:bg-blue-600"
                    >
                      <Mail className="h-3 w-3" />
                      Outlook
                    </button>

                    <button
                      onClick={shareToEmail}
                      className="flex items-center justify-center gap-1 rounded-lg border border-slate-300 bg-slate-100 px-3 py-2 text-xs font-medium text-slate-700 transition hover:bg-slate-200"
                    >
                      <Mail className="h-3 w-3" />
                      기본앱
                    </button>
                  </div>
                </div>
              </div>
            </>
        </div>
      </div>
      <ToastContainer />
    </div>
  );
}

// Kakao SDK 타입 정의
declare global {
  interface Window {
    Kakao: any;
  }
}
