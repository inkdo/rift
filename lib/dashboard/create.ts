import type { DashboardData, GridLayout, Widget } from '@/artifacts/dashboard/types';

/**
 * Creates a new dashboard with default 4x4 layout
 */
export function createDefaultDashboard(title?: string): DashboardData {
  const now = new Date().toISOString();
  
  const defaultLayout: GridLayout = {
    columns: 4,
    rows: 4,
    cellSize: {
      width: 200,
      height: 150,
    },
  };

  return {
    version: '1.0',
    layout: defaultLayout,
    widgets: [],
    metadata: {
      createdAt: now,
      lastModified: now,
      theme: 'default',
      title: title || 'New Dashboard',
      description: 'A customizable dashboard with 4x4 grid layout',
    },
  };
}

/**
 * Creates a dashboard with custom layout dimensions
 */
export function createDashboardWithLayout(
  columns: number,
  rows: number,
  title?: string,
  cellWidth = 200,
  cellHeight = 150
): DashboardData {
  const now = new Date().toISOString();
  
  const layout: GridLayout = {
    columns: Math.max(1, Math.min(12, columns)),
    rows: Math.max(1, Math.min(12, rows)),
    cellSize: {
      width: Math.max(100, Math.min(500, cellWidth)),
      height: Math.max(100, Math.min(500, cellHeight)),
    },
  };

  return {
    version: '1.0',
    layout,
    widgets: [],
    metadata: {
      createdAt: now,
      lastModified: now,
      theme: 'default',
      title: title || `Dashboard ${columns}x${rows}`,
      description: `A customizable dashboard with ${columns}x${rows} grid layout`,
    },
  };
}

/**
 * Creates a dashboard with predefined widgets
 */
export function createDashboardWithWidgets(
  title?: string,
  widgets: Widget[] = []
): DashboardData {
  const now = new Date().toISOString();
  
  const defaultLayout: GridLayout = {
    columns: 4,
    rows: 4,
    cellSize: {
      width: 200,
      height: 150,
    },
  };

  return {
    version: '1.0',
    layout: defaultLayout,
    widgets,
    metadata: {
      createdAt: now,
      lastModified: now,
      theme: 'default',
      title: title || 'New Dashboard',
      description: 'A customizable dashboard with predefined widgets',
    },
  };
}

/**
 * Creates a sample dashboard with example widgets
 */
export function createSampleDashboard(title?: string): DashboardData {
  const now = new Date().toISOString();
  
  const sampleWidgets: Widget[] = [
    {
      id: 'widget-1',
      type: 'text',
      position: { column: 0, row: 0 },
      size: { width: 2, height: 1 },
      content: { text: 'Welcome to your Dashboard' },
      config: { fontSize: '18px', fontWeight: 'bold' },
    },
    {
      id: 'widget-2',
      type: 'metric',
      position: { column: 2, row: 0 },
      size: { width: 2, height: 1 },
      content: { value: '1,234', label: 'Total Users', trend: '+12%' },
      config: { color: 'blue' },
    },
    {
      id: 'widget-3',
      type: 'chart',
      position: { column: 0, row: 1 },
      size: { width: 4, height: 2 },
      content: { 
        type: 'line', 
        data: [10, 20, 15, 30, 25, 40, 35],
        labels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']
      },
      config: { title: 'Weekly Activity' },
    },
    {
      id: 'widget-4',
      type: 'table',
      position: { column: 0, row: 3 },
      size: { width: 4, height: 1 },
      content: { 
        headers: ['Name', 'Status', 'Last Active'],
        rows: [
          ['John Doe', 'Active', '2 hours ago'],
          ['Jane Smith', 'Away', '1 day ago'],
          ['Bob Johnson', 'Active', '30 min ago']
        ]
      },
      config: { striped: true },
    },
  ];

  return {
    version: '1.0',
    layout: {
      columns: 4,
      rows: 4,
      cellSize: {
        width: 200,
        height: 150,
      },
    },
    widgets: sampleWidgets,
    metadata: {
      createdAt: now,
      lastModified: now,
      theme: 'default',
      title: title || 'Sample Dashboard',
      description: 'A sample dashboard with example widgets',
    },
  };
}
