import { ChatContext, ChatContextProvider } from '@/app/chat-context';
import NewSideBar from '@/components/layout/NewSideBar';
import { PermissionProvider } from '@/context/PermissionContext';
import TopActionBar from '@/new-components/layout/TopActionBar';
import { STORAGE_LANG_KEY } from '@/utils/constants/index';
import { App, ConfigProvider, MappingAlgorithm, theme } from 'antd';
import enUS from 'antd/locale/en_US';
import zhCN from 'antd/locale/zh_CN';
import classNames from 'classnames';
import type { AppProps } from 'next/app';
import Head from 'next/head';
import { useRouter } from 'next/router';
import React, { useContext, useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import '../app/i18n';
import '../nprogress.css';
import '../styles/globals.css';
// import TopProgressBar from '@/components/layout/top-progress-bar';

const antdDarkTheme: MappingAlgorithm = (seedToken, mapToken) => {
  return {
    ...theme.darkAlgorithm(seedToken, mapToken),
    colorBgBase: '#232734',
    colorBorder: '#828282',
    colorBgContainer: '#232734',
  };
};

function CssWrapper({ children }: { children: React.ReactElement }) {
  const { mode } = useContext(ChatContext);
  const { i18n } = useTranslation();

  useEffect(() => {
    if (mode) {
      document.body?.classList?.add(mode);
      if (mode === 'light') {
        document.body?.classList?.remove('dark');
      } else {
        document.body?.classList?.remove('light');
      }
    }
  }, [mode]);

  useEffect(() => {
    i18n.changeLanguage?.(window.localStorage.getItem(STORAGE_LANG_KEY) || 'zh');
  }, [i18n]);

  return (
    <div>
      {/* <TopProgressBar /> */}
      {children}
    </div>
  );
}

function LayoutWrapper({ children }: { children: React.ReactNode }) {
  const { isMenuExpand, mode } = useContext(ChatContext);
  const { i18n } = useTranslation();

  const router = useRouter();
  const [isChecking, setIsChecking] = useState(true);

  const isPublicPage =
    router.pathname === '/login' || router.pathname === '/register' || router.pathname.startsWith('/share');

  // 登录检测 - always call useEffect, but check isPublicPage inside
  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => {
    if (isPublicPage) {
      setIsChecking(false);
      return;
    }

    const controller = new AbortController();

    // Check session via /me API endpoint (session cookie is HttpOnly, cannot be read by JS)
    fetch('/api/v2/sys/auth/me', {
      credentials: 'include',
      signal: controller.signal,
    })
      .then(res => {
        if (res.ok) {
          setIsChecking(false);
        } else {
          router.push('/login');
        }
      })
      .catch(() => {
        router.push('/login');
      });

    return () => controller.abort();
  }, [isPublicPage, router]);

  // Public pages render immediately without layout
  if (isPublicPage) {
    return <>{children}</>;
  }

  // Loading state while checking auth
  if (isChecking) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100vh' }}>
        <div>Loading...</div>
      </div>
    );
  }

  const renderContent = () => {
    if (router.pathname.includes('mobile') || router.pathname.startsWith('/share')) {
      return <>{children}</>;
    }
    return (
      <div className='flex w-screen h-screen overflow-hidden'>
        <Head>
          <meta name='viewport' content='initial-scale=1.0, width=device-width, maximum-scale=1' />
        </Head>
        {router.pathname !== '/construct/app/extra' && (
          <div
            className={classNames(
              'h-full transition-[width] overflow-hidden shrink-0',
              isMenuExpand ? 'w-60' : 'w-16',
              'hidden',
              'md:block',
            )}
          >
            <NewSideBar />
          </div>
        )}
        <div className='flex flex-col flex-1 h-full relative overflow-hidden'>
          <TopActionBar />
          {children}
        </div>
      </div>
    );
  };

  return (
    <ConfigProvider
      locale={i18n.language === 'en' ? enUS : zhCN}
      theme={{
        token: {
          colorPrimary: '#1677ff',
          borderRadius: 8,
        },
        algorithm: mode === 'dark' ? antdDarkTheme : undefined,
      }}
    >
      <App>{renderContent()}</App>
    </ConfigProvider>
  );
}

function MyApp({ Component, pageProps }: AppProps) {
  return (
    <ChatContextProvider>
      <PermissionProvider>
        <CssWrapper>
          <LayoutWrapper>
            <Component {...pageProps} />
          </LayoutWrapper>
        </CssWrapper>
      </PermissionProvider>
    </ChatContextProvider>
  );
}

export default MyApp;
