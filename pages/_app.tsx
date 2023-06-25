import '../styles/globals.css';
import type { AppProps } from 'next/app';
import { App as AntApp, ConfigProvider, theme } from 'antd';
import { appWithTranslation } from 'next-i18next';
import { useEffect, useState } from 'react';

function App({ Component, pageProps }: AppProps) {
  const [isDarkMode, setDarkMode] = useState(false);

  useEffect(() => {
    const isDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    if (isDark) {
      setDarkMode(true);
    }
  }, []);

  return (
    <ConfigProvider
      theme={{
        token: {
          colorPrimary: '#ec407a',
        },
        algorithm: isDarkMode ? theme.darkAlgorithm : theme.defaultAlgorithm,
      }}
    >
      <AntApp>
        <Component {...pageProps} />
      </AntApp>
    </ConfigProvider>
  );
}

export default appWithTranslation(App);
