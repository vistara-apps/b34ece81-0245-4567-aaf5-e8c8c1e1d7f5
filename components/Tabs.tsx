'use client';

import { cn } from '../lib/utils';

interface Tab {
  id: string;
  label: string;
  count?: number;
}

interface TabsProps {
  tabs: Tab[];
  activeTab: string;
  onTabChange: (tabId: string) => void;
  className?: string;
}

export function Tabs({ tabs, activeTab, onTabChange, className }: TabsProps) {
  return (
    <div className={cn('border-b border-gray-200', className)}>
      <nav className="flex space-x-8">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => onTabChange(tab.id)}
            className={cn(
              'py-2 px-1 border-b-2 font-medium text-sm transition-colors duration-200',
              activeTab === tab.id
                ? 'border-primary text-primary'
                : 'border-transparent text-text-secondary hover:text-text-primary hover:border-gray-300'
            )}
          >
            {tab.label}
            {tab.count !== undefined && tab.count > 0 && (
              <span className={cn(
                'ml-2 py-0.5 px-2 rounded-full text-xs font-medium',
                activeTab === tab.id
                  ? 'bg-primary text-white'
                  : 'bg-gray-100 text-text-secondary'
              )}>
                {tab.count}
              </span>
            )}
          </button>
        ))}
      </nav>
    </div>
  );
}

