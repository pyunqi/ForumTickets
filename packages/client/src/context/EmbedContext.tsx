import { createContext, useContext, ReactNode } from 'react';

interface EmbedContextType {
  isEmbed: boolean;
  routePrefix: string;
}

const EmbedContext = createContext<EmbedContextType>({
  isEmbed: false,
  routePrefix: '',
});

export function EmbedProvider({ children }: { children: ReactNode }) {
  return (
    <EmbedContext.Provider value={{ isEmbed: true, routePrefix: '/embed' }}>
      {children}
    </EmbedContext.Provider>
  );
}

export function useEmbed() {
  return useContext(EmbedContext);
}
