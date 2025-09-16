import type { DashboardData, GridLayout, Widget } from '@/artifacts/dashboard/types';

/**
 * Updates dashboard layout and adjusts widgets to fit new dimensions
 */
export function updateDashboardLayout(
  dashboard: DashboardData,
  newLayout: GridLayout
): DashboardData {
  const now = new Date().toISOString();
  
  // Validate new layout
  const validatedLayout: GridLayout = {
    columns: Math.max(1, Math.min(12, newLayout.columns)),
    rows: Math.max(1, Math.min(12, newLayout.rows)),
    cellSize: {
      width: Math.max(100, Math.min(500, newLayout.cellSize.width)),
      height: Math.max(100, Math.min(500, newLayout.cellSize.height)),
    },
  };

  // Adjust widgets to fit new layout
  const adjustedWidgets = adjustWidgetsToLayout(dashboard.widgets, validatedLayout);

  return {
    ...dashboard,
    layout: validatedLayout,
    widgets: adjustedWidgets,
    metadata: {
      ...dashboard.metadata,
      lastModified: now,
    },
  };
}

/**
 * Adjusts widgets to fit within new layout boundaries
 */
function adjustWidgetsToLayout(widgets: Widget[], layout: GridLayout): Widget[] {
  return widgets.map((widget) => {
    const adjustedWidget = { ...widget };

    // Adjust position if widget is outside new grid bounds
    if (widget.position.column >= layout.columns) {
      adjustedWidget.position.column = Math.max(0, layout.columns - widget.size.width);
    }
    if (widget.position.row >= layout.rows) {
      adjustedWidget.position.row = Math.max(0, layout.rows - widget.size.height);
    }

    // Adjust size if widget extends beyond new grid bounds
    if (widget.position.column + widget.size.width > layout.columns) {
      adjustedWidget.size.width = Math.max(1, layout.columns - widget.position.column);
    }
    if (widget.position.row + widget.size.height > layout.rows) {
      adjustedWidget.size.height = Math.max(1, layout.rows - widget.position.row);
    }

    // Ensure minimum size constraints
    adjustedWidget.size.width = Math.max(1, Math.min(6, adjustedWidget.size.width));
    adjustedWidget.size.height = Math.max(1, Math.min(6, adjustedWidget.size.height));

    return adjustedWidget;
  });
}

/**
 * Updates dashboard layout with specific dimension changes
 */
export function updateLayoutDimensions(
  dashboard: DashboardData,
  changes: {
    columns?: number;
    rows?: number;
    cellWidth?: number;
    cellHeight?: number;
  }
): DashboardData {
  const currentLayout = dashboard.layout;
  
  const newLayout: GridLayout = {
    columns: changes.columns ?? currentLayout.columns,
    rows: changes.rows ?? currentLayout.rows,
    cellSize: {
      width: changes.cellWidth ?? currentLayout.cellSize.width,
      height: changes.cellHeight ?? currentLayout.cellSize.height,
    },
  };

  return updateDashboardLayout(dashboard, newLayout);
}

/**
 * Resizes grid by adding or removing columns/rows
 */
export function resizeGrid(
  dashboard: DashboardData,
  direction: 'add-column' | 'remove-column' | 'add-row' | 'remove-row'
): DashboardData {
  const currentLayout = dashboard.layout;
  let newLayout: GridLayout;

  switch (direction) {
    case 'add-column':
      newLayout = {
        ...currentLayout,
        columns: Math.min(12, currentLayout.columns + 1),
      };
      break;
    case 'remove-column':
      newLayout = {
        ...currentLayout,
        columns: Math.max(1, currentLayout.columns - 1),
      };
      break;
    case 'add-row':
      newLayout = {
        ...currentLayout,
        rows: Math.min(12, currentLayout.rows + 1),
      };
      break;
    case 'remove-row':
      newLayout = {
        ...currentLayout,
        rows: Math.max(1, currentLayout.rows - 1),
      };
      break;
    default:
      return dashboard;
  }

  return updateDashboardLayout(dashboard, newLayout);
}

/**
 * Validates if a layout change is valid
 */
export function validateLayoutChange(
  currentLayout: GridLayout,
  newLayout: GridLayout
): { isValid: boolean; errors: string[] } {
  const errors: string[] = [];

  // Check column constraints
  if (newLayout.columns < 1 || newLayout.columns > 12) {
    errors.push('Columns must be between 1 and 12');
  }

  // Check row constraints
  if (newLayout.rows < 1 || newLayout.rows > 12) {
    errors.push('Rows must be between 1 and 12');
  }

  // Check cell size constraints
  if (newLayout.cellSize.width < 100 || newLayout.cellSize.width > 500) {
    errors.push('Cell width must be between 100 and 500 pixels');
  }

  if (newLayout.cellSize.height < 100 || newLayout.cellSize.height > 500) {
    errors.push('Cell height must be between 100 and 500 pixels');
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
}

/**
 * Checks if widgets will be affected by layout change
 */
export function getAffectedWidgets(
  widgets: Widget[],
  currentLayout: GridLayout,
  newLayout: GridLayout
): {
  unaffected: Widget[];
  affected: Widget[];
  removed: Widget[];
} {
  const unaffected: Widget[] = [];
  const affected: Widget[] = [];
  const removed: Widget[] = [];

  widgets.forEach((widget) => {
    const widgetEndCol = widget.position.column + widget.size.width;
    const widgetEndRow = widget.position.row + widget.size.height;

    // Check if widget is completely outside new grid
    if (
      widget.position.column >= newLayout.columns ||
      widget.position.row >= newLayout.rows ||
      widgetEndCol > newLayout.columns ||
      widgetEndRow > newLayout.rows
    ) {
      // Widget is partially or completely outside new grid
      if (
        widget.position.column >= newLayout.columns ||
        widget.position.row >= newLayout.rows
      ) {
        removed.push(widget);
      } else {
        affected.push(widget);
      }
    } else {
      // Widget is completely within new grid
      unaffected.push(widget);
    }
  });

  return { unaffected, affected, removed };
}

/**
 * Creates a layout change summary
 */
export function createLayoutChangeSummary(
  currentLayout: GridLayout,
  newLayout: GridLayout,
  affectedWidgets: { unaffected: Widget[]; affected: Widget[]; removed: Widget[] }
): {
  summary: string;
  warnings: string[];
  recommendations: string[];
} {
  const warnings: string[] = [];
  const recommendations: string[] = [];

  // Size change analysis
  const columnChange = newLayout.columns - currentLayout.columns;
  const rowChange = newLayout.rows - currentLayout.rows;

  let summary = `Layout changed from ${currentLayout.columns}x${currentLayout.rows} to ${newLayout.columns}x${newLayout.rows}`;

  if (columnChange !== 0) {
    summary += ` (${columnChange > 0 ? '+' : ''}${columnChange} columns)`;
  }
  if (rowChange !== 0) {
    summary += ` (${rowChange > 0 ? '+' : ''}${rowChange} rows)`;
  }

  // Widget impact warnings
  if (affectedWidgets.affected.length > 0) {
    warnings.push(`${affectedWidgets.affected.length} widget(s) will be resized to fit new layout`);
  }

  if (affectedWidgets.removed.length > 0) {
    warnings.push(`${affectedWidgets.removed.length} widget(s) will be removed due to layout constraints`);
  }

  // Recommendations
  if (affectedWidgets.removed.length > 0) {
    recommendations.push('Consider saving widget data before applying layout changes');
  }

  if (newLayout.columns < currentLayout.columns || newLayout.rows < currentLayout.rows) {
    recommendations.push('Reducing grid size may cause data loss - proceed with caution');
  }

  return { summary, warnings, recommendations };
}
