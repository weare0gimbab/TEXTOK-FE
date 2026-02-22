import type { Metadata } from 'next';
import Script from 'next/script';
import { AuthProvider } from '../providers/AuthProvider';
import { LoginModalProvider } from '../providers/LoginModalProvider';
import ReactQueryProvider from '../providers/ReactQueryProvider';
import LoginModal from './components/auth/LoginModal';
import { ToastContainer } from './components/common/ToastContainer';
import MessagesRealtimeInitializer from './components/messages/MessagesRealtimeInitializer';
import NotificationInitializer from './components/notifications/NotificationInitializer';
import Sidebar from './components/sidebar/SideBar';
import './globals.css';

export const metadata: Metadata = {
  title: 'TexTok',
  icons: {
    icon: '/icons/titleBook.png',
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ko">
      <head>
        <Script
          src="https://t1.kakaocdn.net/kakao_js_sdk/2.7.2/kakao.min.js"
          strategy="afterInteractive"
          integrity="sha384-TiCUE00h649CAMonG018J2ujOgDKW/kVWlChEuu4jK2vxfAAD0eZxzCKakxg55G4"
          crossOrigin="anonymous"
        />
        <script
          dangerouslySetInnerHTML={{
            __html: `
              window.addEventListener('load', function() {
                if (window.Kakao && !window.Kakao.isInitialized()) {
                  const kakaoKey = '${process.env.NEXT_PUBLIC_KAKAO_APP_KEY || ''}';
                  if (kakaoKey) {
                    try {
                      window.Kakao.init(kakaoKey);
                    } catch (error) {
                      console.warn('Kakao SDK 초기화 실패');
                    }
                  }
                }
              });
            `,
          }}
        />
      </head>
      <body>
        <ReactQueryProvider>
          <AuthProvider>
            <LoginModalProvider>
              <NotificationInitializer />
              <MessagesRealtimeInitializer />
              <div className="flex min-h-screen">
                <Sidebar />
                <main
                  className="
                  flex-1 bg-white 
                  pl-20 
                  xl:pl-60
                  transition-all duration-300
                "
                >
                  {children}
                </main>
                <ToastContainer />
              </div>
              <LoginModal />
            </LoginModalProvider>
          </AuthProvider>
        </ReactQueryProvider>
      </body>
    </html>
  );
}
