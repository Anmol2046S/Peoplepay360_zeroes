import React, { createContext, useContext, useState, useCallback } from 'react';

export interface BreadcrumbItem {
  label: string;
  path?: string;
}

interface BreadcrumbContextType {
  extraBreadcrumbs: BreadcrumbItem[];
  setExtraBreadcrumbs: (items: BreadcrumbItem[]) => void;
  clearExtraBreadcrumbs: () => void;
}

const BreadcrumbContext = createContext<BreadcrumbContextType | undefined>(undefined);

export const BreadcrumbProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [extraBreadcrumbs, setExtraBreadcrumbsState] = useState<BreadcrumbItem[]>([]);

  const setExtraBreadcrumbs = useCallback((items: BreadcrumbItem[]) => {
    setExtraBreadcrumbsState(items);
  }, []);

  const clearExtraBreadcrumbs = useCallback(() => {
    setExtraBreadcrumbsState([]);
  }, []);

  return (
    <BreadcrumbContext.Provider value={{ extraBreadcrumbs, setExtraBreadcrumbs, clearExtraBreadcrumbs }}>
      {children}
    </BreadcrumbContext.Provider>
  );
};

export const useBreadcrumb = () => {
  const context = useContext(BreadcrumbContext);
  if (!context) {
    throw new Error('useBreadcrumb must be used within a BreadcrumbProvider');
  }
  return context;
};
