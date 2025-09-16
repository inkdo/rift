'use client';

import React from 'react';
import DashboardGrid from './dashboard-grid';
import type {
  DashboardData,
  GridLayout,
  Widget,
} from '@/artifacts/dashboard/types';

interface DashboardContentProps {
  dashboardData: DashboardData | null;
  isEditable?: boolean;
  onLayoutChange?: (layout: GridLayout) => void;
  onWidgetUpdate?: (widget: Widget) => void;
  onWidgetAdd?: (widget: Widget) => void;
  onWidgetRemove?: (widgetId: string) => void;
  className?: string;
}

export const DashboardContent: React.FC<DashboardContentProps> = ({
  dashboardData,
  isEditable = false,
  onLayoutChange,
  onWidgetUpdate,
  onWidgetAdd,
  onWidgetRemove,
  className,
}) => {
  if (!dashboardData) {
    return (
      <div className="flex h-full items-center justify-center">
        <div className="text-center text-gray-500">
          <div className="font-medium text-lg">No dashboard data</div>
          <div className="text-sm">Dashboard content will appear here</div>
        </div>
      </div>
    );
  }

  const { layout, widgets } = dashboardData;

  return (
    <div className={`dashboard-content ${className || ''}`}>
      <DashboardGrid
        layout={layout}
        widgets={widgets}
        onLayoutChange={onLayoutChange}
        onWidgetUpdate={onWidgetUpdate}
        onWidgetAdd={onWidgetAdd}
        onWidgetRemove={onWidgetRemove}
        isEditable={isEditable}
      />
    </div>
  );
};

export default DashboardContent;
