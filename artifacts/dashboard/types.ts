// Dashboard data model interfaces

export interface GridLayout {
  columns: number;
  rows: number;
  cellSize: {
    width: number;
    height: number;
  };
}

export interface GridPosition {
  column: number; // 0-based index (A=0, B=1, C=2, etc.)
  row: number; // 0-based index (1=0, 2=1, 3=2, etc.)
}

export interface GridSize {
  width: number; // cells to span horizontally
  height: number; // cells to span vertically
}

export type WidgetType = 'text' | 'metric' | 'chart' | 'image' | 'table';

export interface WidgetContent {
  [key: string]: any; // Flexible content structure for different widget types
}

export interface WidgetConfig {
  backgroundColor?: string;
  textColor?: string;
  borderColor?: string;
  borderWidth?: number;
  [key: string]: any; // Additional configuration options
}

export interface Widget {
  id: string;
  type: WidgetType;
  position: GridPosition;
  size: GridSize;
  content: WidgetContent;
  config: WidgetConfig;
}

export interface DashboardMetadata {
  createdAt: string;
  lastModified: string;
  theme: string;
  [key: string]: any; // Additional metadata fields
}

export interface DashboardData {
  version: string;
  layout: GridLayout;
  widgets: Widget[];
  metadata: DashboardMetadata;
}

// Stream data types for dashboard updates
export interface DashboardStreamParts {
  dashboardDelta: string; // JSON patches for incremental updates
  layoutChange: GridLayout; // Layout dimension changes
  widgetAdd: Widget; // New widget addition
  widgetUpdate: Partial<Widget> & { id: string }; // Widget modifications
  widgetRemove: string; // Widget removal by ID
}

// Grid coordinate system types
export interface GridCoordinate {
  column: string; // Letter format (A, B, C, etc.)
  row: number; // Number format (1, 2, 3, etc.)
}

export interface GridBounds {
  minColumn: number;
  maxColumn: number;
  minRow: number;
  maxRow: number;
}

// Component prop interfaces
export interface DashboardGridProps {
  layout: GridLayout;
  widgets: Widget[];
  onLayoutChange?: (layout: GridLayout) => void;
  onWidgetUpdate?: (widget: Widget) => void;
  onWidgetAdd?: (widget: Widget) => void;
  onWidgetRemove?: (widgetId: string) => void;
  isEditable?: boolean;
  className?: string;
}

export interface DashboardCellProps {
  coordinate: GridCoordinate;
  position: GridPosition;
  size: GridSize;
  isOccupied?: boolean;
  widget?: Widget;
  onClick?: (position: GridPosition) => void;
  className?: string;
}

export interface WidgetContainerProps {
  widget: Widget;
  gridLayout: GridLayout;
  onUpdate?: (widget: Widget) => void;
  onRemove?: (widgetId: string) => void;
  isEditable?: boolean;
  className?: string;
}