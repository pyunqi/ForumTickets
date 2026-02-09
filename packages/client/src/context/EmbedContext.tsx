import { createContext, useContext, useEffect, ReactNode } from 'react';
import { useLanguage } from '../i18n';

interface EmbedContextType {
  isEmbed: boolean;
  routePrefix: string;
}

const EmbedContext = createContext<EmbedContextType>({
  isEmbed: false,
  routePrefix: '',
});

export function EmbedProvider({ children }: { children: ReactNode }) {
  const { setLanguage } = useLanguage();

  useEffect(() => {
    setLanguage('en');
  }, []);

  return (
    <EmbedContext.Provider value={{ isEmbed: true, routePrefix: '/embed' }}>
      {children}
    </EmbedContext.Provider>
  );
}

export function useEmbed() {
  return useContext(EmbedContext);
}
