'use client';

import React, { useMemo, useCallback } from 'react';
import { cn } from '@/lib/utils';
import type {
  GridLayout,
  GridPosition,
  GridSize,
  Widget,
  GridCoordinate,
  DashboardGridProps,
  DashboardCellProps,
  WidgetContainerProps,
} from '@/artifacts/dashboard/types';

// Utility functions for grid operations
const columnIndexToLetter = (index: number): string => {
  let result = '';
  let currentIndex = index;
  while (currentIndex >= 0) {
    result = String.fromCharCode(65 + (currentIndex % 26)) + result;
    currentIndex = Math.floor(currentIndex / 26) - 1;
  }
  return result;
};

const letterToColumnIndex = (letter: string): number => {
  let result = 0;
  for (let i = 0; i < letter.length; i++) {
    result = result * 26 + (letter.charCodeAt(i) - 64);
  }
  return result - 1;
};

const isPositionOccupied = (
  position: GridPosition,
  size: GridSize,
  widgets: Widget[],
  excludeWidgetId?: string,
): boolean => {
  return widgets.some((widget) => {
    if (excludeWidgetId && widget.id === excludeWidgetId) return false;

    const widgetEndCol = widget.position.column + widget.size.width;
    const widgetEndRow = widget.position.row + widget.size.height;
    const positionEndCol = position.column + size.width;
    const positionEndRow = position.row + size.height;

    return !(
      position.column >= widgetEndCol ||
      positionEndCol <= widget.position.column ||
      position.row >= widgetEndRow ||
      positionEndRow <= widget.position.row
    );
  });
};

// Individual grid cell component
const DashboardCell: React.FC<DashboardCellProps> = ({
  coordinate,
  position,
  size,
  isOccupied = false,
  widget,
  onClick,
  className,
}) => {
  const handleClick = useCallback(() => {
    if (onClick && !isOccupied) {
      onClick(position);
    }
  }, [onClick, position, isOccupied]);

  return (
    <div
      className={cn(
        'cursor-pointer border border-gray-300 bg-white transition-colors duration-200 hover:bg-gray-50',
        isOccupied && 'cursor-not-allowed bg-gray-100',
        className,
      )}
      style={{
        gridColumn: `${position.column + 1} / span ${size.width}`,
        gridRow: `${position.row + 1} / span ${size.height}`,
      }}
      onClick={handleClick}
      data-coordinate={`${coordinate.column}${coordinate.row}`}
      data-position={`${position.column},${position.row}`}
      role="button"
      tabIndex={0}
    >
      <div className="h-full w-full p-2">
        <div className="mb-1 text-gray-500 text-xs">
          {coordinate.column}
          {coordinate.row}
        </div>
        {widget && (
          <div className="truncate font-medium text-sm">{widget.type}</div>
        )}
      </div>
    </div>
  );
};

// Widget container component
const WidgetContainer: React.FC<WidgetContainerProps> = ({
  widget,
  gridLayout,
  onUpdate,
  onRemove,
  isEditable = false,
  className,
}) => {
  const handleUpdate = useCallback(
    (updates: Partial<Widget>) => {
      if (onUpdate) {
        onUpdate({ ...widget, ...updates });
      }
    },
    [widget, onUpdate],
  );

  const handleRemove = useCallback(() => {
    if (onRemove) {
      onRemove(widget.id);
    }
  }, [widget.id, onRemove]);

  return (
    <div
      className={cn(
        'rounded-lg border-2 border-blue-300 bg-blue-50 p-3 transition-all duration-200 hover:border-blue-400',
        isEditable && 'cursor-move',
        className,
      )}
      style={{
        gridColumn: `${widget.position.column + 1} / span ${widget.size.width}`,
        gridRow: `${widget.position.row + 1} / span ${widget.size.height}`,
      }}
      data-widget-id={widget.id}
    >
      <div className="mb-2 flex items-start justify-between">
        <div className="font-semibold text-blue-800 text-sm">
          {widget.type.toUpperCase()}
        </div>
        {isEditable && (
          <button
            type="button"
            onClick={handleRemove}
            className="text-red-500 text-xs hover:text-red-700"
            title="Remove widget"
          >
            ×
          </button>
        )}
      </div>

      <div className="text-gray-600 text-xs">
        {widget.size.width}×{widget.size.height}
      </div>

      {/* Widget content placeholder */}
      <div className="mt-2 text-sm">
        {JSON.stringify(widget.content, null, 2)}
      </div>
    </div>
  );
};

// Main DashboardGrid component
export const DashboardGrid: React.FC<DashboardGridProps> = ({
  layout,
  widgets,
  onLayoutChange,
  onWidgetUpdate,
  onWidgetAdd,
  onWidgetRemove,
  isEditable = false,
  className,
}) => {
  // Generate grid cells
  const gridCells = useMemo(() => {
    const cells: React.ReactNode[] = [];

    for (let row = 0; row < layout.rows; row++) {
      for (let col = 0; col < layout.columns; col++) {
        const position: GridPosition = { column: col, row };
        const coordinate: GridCoordinate = {
          column: columnIndexToLetter(col),
          row: row + 1,
        };

        // Check if this position is occupied by a widget
        const occupyingWidget = widgets.find((widget) => {
          const widgetEndCol = widget.position.column + widget.size.width;
          const widgetEndRow = widget.position.row + widget.size.height;

          return (
            col >= widget.position.column &&
            col < widgetEndCol &&
            row >= widget.position.row &&
            row < widgetEndRow
          );
        });

        // Only render cell if it's the top-left corner of a widget or empty
        const isTopLeft =
          !occupyingWidget ||
          (occupyingWidget.position.column === col &&
            occupyingWidget.position.row === row);

        if (isTopLeft) {
          cells.push(
            <DashboardCell
              key={`${col}-${row}`}
              coordinate={coordinate}
              position={position}
              size={{ width: 1, height: 1 }}
              isOccupied={!!occupyingWidget}
              widget={occupyingWidget}
              onClick={
                isEditable
                  ? (pos) => {
                      // Add a default widget at this position
                      if (onWidgetAdd) {
                        const newWidget: Widget = {
                          id: `widget-${Date.now()}`,
                          type: 'text',
                          position: pos,
                          size: { width: 1, height: 1 },
                          content: { text: 'New Widget' },
                          config: {},
                        };
                        onWidgetAdd(newWidget);
                      }
                    }
                  : undefined
              }
            />,
          );
        } else {
          // Render empty cells with just coordinate labels
          cells.push(
            <DashboardCell
              key={`${col}-${row}`}
              coordinate={coordinate}
              position={position}
              size={{ width: 1, height: 1 }}
              isOccupied={false}
              onClick={
                isEditable
                  ? (pos) => {
                      // Add a default widget at this position
                      if (onWidgetAdd) {
                        const newWidget: Widget = {
                          id: `widget-${Date.now()}`,
                          type: 'text',
                          position: pos,
                          size: { width: 1, height: 1 },
                          content: { text: 'New Widget' },
                          config: {},
                        };
                        onWidgetAdd(newWidget);
                      }
                    }
                  : undefined
              }
            />,
          );
        }
      }
    }

    return cells;
  }, [layout, widgets, isEditable, onWidgetAdd]);

  // Generate widget containers
  const widgetContainers = useMemo(() => {
    return widgets.map((widget) => (
      <WidgetContainer
        key={widget.id}
        widget={widget}
        gridLayout={layout}
        onUpdate={onWidgetUpdate}
        onRemove={onWidgetRemove}
        isEditable={isEditable}
      />
    ));
  }, [widgets, layout, onWidgetUpdate, onWidgetRemove, isEditable]);

  const gridStyle = {
    display: 'grid',
    gridTemplateColumns: `repeat(${layout.columns}, ${layout.cellSize.width}px)`,
    gridTemplateRows: `repeat(${layout.rows}, ${layout.cellSize.height}px)`,
    gap: '2px',
  };

  return (
    <div className={cn('dashboard-grid', className)}>
      {/* Grid header with dimensions info */}
      <div className="mb-4 rounded-lg bg-gray-50 p-3">
        <div className="flex items-center justify-between">
          <div className="font-medium text-gray-700 text-sm">
            Grid: {layout.columns}×{layout.rows} ({layout.cellSize.width}×
            {layout.cellSize.height}px)
          </div>
          <div className="text-gray-500 text-xs">
            {widgets.length} widget{widgets.length !== 1 ? 's' : ''}
          </div>
        </div>
      </div>

      {/* Grid container */}
      <div
        className="rounded-lg border-2 border-gray-400 bg-gray-200 p-2"
        style={gridStyle}
      >
        {gridCells}
        {widgetContainers}
      </div>

      {/* Grid controls (if editable) */}
      {isEditable && (
        <div className="mt-4 flex gap-2">
          <button
            type="button"
            onClick={() => {
              if (onLayoutChange) {
                onLayoutChange({
                  ...layout,
                  columns: Math.min(layout.columns + 1, 12),
                });
              }
            }}
            className="rounded bg-blue-500 px-3 py-1 text-sm text-white hover:bg-blue-600"
          >
            + Column
          </button>
          <button
            type="button"
            onClick={() => {
              if (onLayoutChange) {
                onLayoutChange({
                  ...layout,
                  rows: Math.min(layout.rows + 1, 12),
                });
              }
            }}
            className="rounded bg-blue-500 px-3 py-1 text-sm text-white hover:bg-blue-600"
          >
            + Row
          </button>
          <button
            type="button"
            onClick={() => {
              if (onLayoutChange) {
                onLayoutChange({
                  ...layout,
                  columns: Math.max(layout.columns - 1, 1),
                });
              }
            }}
            className="rounded bg-red-500 px-3 py-1 text-sm text-white hover:bg-red-600"
          >
            - Column
          </button>
          <button
            type="button"
            onClick={() => {
              if (onLayoutChange) {
                onLayoutChange({
                  ...layout,
                  rows: Math.max(layout.rows - 1, 1),
                });
              }
            }}
            className="rounded bg-red-500 px-3 py-1 text-sm text-white hover:bg-red-600"
          >
            - Row
          </button>
        </div>
      )}
    </div>
  );
};

export default DashboardGrid;
