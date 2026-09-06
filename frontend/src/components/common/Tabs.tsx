import React from 'react';

export interface TabItem {
  id: string;
  label: string;
  count?: number;
}

interface TabsProps {
  tabs: TabItem[];
  activeTab: string;
  onChange: (tabId: string) => void;
}

export const Tabs: React.FC<TabsProps> = ({ tabs, activeTab, onChange }) => {
  return (
    <div className="flex items-center gap-1 border-b border-[var(--color-border)] pb-px">
      {tabs.map((tab) => {
        const isActive = activeTab === tab.id;
        return (
          <button
            key={tab.id}
            className={`px-4 py-2.5 text-xs font-semibold tracking-wide border-b-2 transition-colors cursor-pointer flex items-center gap-2 ${
              isActive
                ? 'border-[var(--color-primary)] text-[var(--color-primary)] font-bold'
                : 'border-transparent text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)]'
            }`}
            onClick={() => onChange(tab.id)}
            type="button"
          >
            <span>{tab.label}</span>
            {typeof tab.count === 'number' && (
              <span
                className={`px-1.5 py-0.5 rounded-full text-[10px] font-bold ${
                  isActive
                    ? 'bg-[var(--color-primary-soft)] text-[var(--color-primary)]'
                    : 'bg-[var(--color-surface-secondary)] text-[var(--color-text-secondary)]'
                }`}
              >
                {tab.count}
              </span>
            )}
          </button>
        );
      })}
    </div>
  );
};
