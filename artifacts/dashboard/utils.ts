import type { GridCoordinate, GridPosition, GridBounds, GridLayout, Widget } from './types';

/**
 * Converts a column index (0-based) to a letter (A, B, C, etc.)
 * @param index - 0-based column index
 * @returns Letter representation (A, B, C, etc.)
 */
export function indexToLetter(index: number): string {
  if (index < 0) {
    throw new Error('Column index must be non-negative');
  }
  
  let result = '';
  while (index >= 0) {
    result = String.fromCharCode(65 + (index % 26)) + result;
    index = Math.floor(index / 26) - 1;
  }
  return result;
}

/**
 * Converts a letter (A, B, C, etc.) to a column index (0-based)
 * @param letter - Letter representation (A, B, C, etc.)
 * @returns 0-based column index
 */
export function letterToIndex(letter: string): number {
  if (!letter || typeof letter !== 'string') {
    throw new Error('Letter must be a non-empty string');
  }
  
  const upperLetter = letter.toUpperCase();
  let result = 0;
  
  for (let i = 0; i < upperLetter.length; i++) {
    const charCode = upperLetter.charCodeAt(i);
    if (charCode < 65 || charCode > 90) {
      throw new Error('Letter must contain only alphabetic characters');
    }
    result = result * 26 + (charCode - 64);
  }
  
  return result - 1;
}

/**
 * Converts a grid position (0-based indices) to a coordinate (letter + number)
 * @param position - Grid position with 0-based indices
 * @returns Grid coordinate with letter and 1-based row number
 */
export function positionToCoordinate(position: GridPosition): GridCoordinate {
  return {
    column: indexToLetter(position.column),
    row: position.row + 1, // Convert to 1-based row number
  };
}

/**
 * Converts a coordinate (letter + number) to a grid position (0-based indices)
 * @param coordinate - Grid coordinate with letter and 1-based row number
 * @returns Grid position with 0-based indices
 */
export function coordinateToPosition(coordinate: GridCoordinate): GridPosition {
  return {
    column: letterToIndex(coordinate.column),
    row: coordinate.row - 1, // Convert to 0-based row index
  };
}

/**
 * Formats a grid coordinate as a string (e.g., "A1", "B2", "C3")
 * @param coordinate - Grid coordinate
 * @returns Formatted coordinate string
 */
export function formatCoordinate(coordinate: GridCoordinate): string {
  return `${coordinate.column}${coordinate.row}`;
}

/**
 * Parses a coordinate string (e.g., "A1", "B2", "C3") into a grid coordinate
 * @param coordinateString - Formatted coordinate string
 * @returns Grid coordinate object
 */
export function parseCoordinate(coordinateString: string): GridCoordinate {
  if (!coordinateString || typeof coordinateString !== 'string') {
    throw new Error('Coordinate string must be a non-empty string');
  }
  
  const match = coordinateString.match(/^([A-Z]+)(\d+)$/);
  if (!match) {
    throw new Error('Invalid coordinate format. Expected format: A1, B2, etc.');
  }
  
  const [, column, rowStr] = match;
  const row = parseInt(rowStr, 10);
  
  if (row < 1) {
    throw new Error('Row number must be greater than 0');
  }
  
  return { column, row };
}

/**
 * Validates if a position is within the grid bounds
 * @param position - Grid position to validate
 * @param layout - Grid layout defining the bounds
 * @returns True if position is valid, false otherwise
 */
export function isValidPosition(position: GridPosition, layout: GridLayout): boolean {
  return (
    position.column >= 0 &&
    position.column < layout.columns &&
    position.row >= 0 &&
    position.row < layout.rows
  );
}

/**
 * Validates if a widget fits within the grid bounds
 * @param widget - Widget to validate
 * @param layout - Grid layout defining the bounds
 * @returns True if widget fits, false otherwise
 */
export function isValidWidgetPlacement(widget: Widget, layout: GridLayout): boolean {
  const endColumn = widget.position.column + widget.size.width - 1;
  const endRow = widget.position.row + widget.size.height - 1;
  
  return (
    widget.position.column >= 0 &&
    widget.position.row >= 0 &&
    endColumn < layout.columns &&
    endRow < layout.rows
  );
}

/**
 * Checks if two widgets overlap
 * @param widget1 - First widget
 * @param widget2 - Second widget
 * @returns True if widgets overlap, false otherwise
 */
export function doWidgetsOverlap(widget1: Widget, widget2: Widget): boolean {
  if (widget1.id === widget2.id) {
    return false; // Same widget, no overlap
  }
  
  const w1EndCol = widget1.position.column + widget1.size.width - 1;
  const w1EndRow = widget1.position.row + widget1.size.height - 1;
  const w2EndCol = widget2.position.column + widget2.size.width - 1;
  const w2EndRow = widget2.position.row + widget2.size.height - 1;
  
  return !(
    w1EndCol < widget2.position.column ||
    widget1.position.column > w2EndCol ||
    w1EndRow < widget2.position.row ||
    widget1.position.row > w2EndRow
  );
}

/**
 * Gets the bounds of a widget (start and end positions)
 * @param widget - Widget to get bounds for
 * @returns Grid bounds object
 */
export function getWidgetBounds(widget: Widget): GridBounds {
  return {
    minColumn: widget.position.column,
    maxColumn: widget.position.column + widget.size.width - 1,
    minRow: widget.position.row,
    maxRow: widget.position.row + widget.size.height - 1,
  };
}

/**
 * Generates a unique widget ID
 * @returns Unique widget ID string
 */
export function generateWidgetId(): string {
  return `widget-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
}

/**
 * Validates dashboard data structure
 * @param data - Dashboard data to validate
 * @returns True if valid, throws error if invalid
 */
export function validateDashboardData(data: any): boolean {
  if (!data || typeof data !== 'object') {
    throw new Error('Dashboard data must be an object');
  }
  
  if (!data.version || typeof data.version !== 'string') {
    throw new Error('Dashboard data must have a version string');
  }
  
  if (!data.layout || typeof data.layout !== 'object') {
    throw new Error('Dashboard data must have a layout object');
  }
  
  if (typeof data.layout.columns !== 'number' || data.layout.columns < 1) {
    throw new Error('Layout must have a positive number of columns');
  }
  
  if (typeof data.layout.rows !== 'number' || data.layout.rows < 1) {
    throw new Error('Layout must have a positive number of rows');
  }
  
  if (!Array.isArray(data.widgets)) {
    throw new Error('Dashboard data must have a widgets array');
  }
  
  // Validate each widget
  for (const widget of data.widgets) {
    if (!widget.id || typeof widget.id !== 'string') {
      throw new Error('Each widget must have a string ID');
    }
    
    if (!isValidWidgetPlacement(widget, data.layout)) {
      throw new Error(`Widget ${widget.id} is placed outside grid bounds`);
    }
  }
  
  // Check for widget overlaps
  for (let i = 0; i < data.widgets.length; i++) {
    for (let j = i + 1; j < data.widgets.length; j++) {
      if (doWidgetsOverlap(data.widgets[i], data.widgets[j])) {
        throw new Error(`Widgets ${data.widgets[i].id} and ${data.widgets[j].id} overlap`);
      }
    }
  }
  
  return true;
}