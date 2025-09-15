// Basic tests for grid coordinate utilities
import {
  indexToLetter,
  letterToIndex,
  positionToCoordinate,
  coordinateToPosition,
  formatCoordinate,
  parseCoordinate,
  isValidPosition,
  isValidWidgetPlacement,
  doWidgetsOverlap,
  validateDashboardData,
} from './utils';
import type { GridLayout, Widget } from './types';

// Test data
const testLayout: GridLayout = {
  columns: 4,
  rows: 4,
  cellSize: { width: 200, height: 150 },
};

const testWidget: Widget = {
  id: 'test-widget',
  type: 'text',
  position: { column: 0, row: 0 },
  size: { width: 2, height: 1 },
  content: { text: 'Test' },
  config: {},
};

// Test functions
console.log('Testing grid coordinate utilities...');

// Test indexToLetter
console.assert(indexToLetter(0) === 'A', 'indexToLetter(0) should be A');
console.assert(indexToLetter(1) === 'B', 'indexToLetter(1) should be B');
console.assert(indexToLetter(25) === 'Z', 'indexToLetter(25) should be Z');
console.assert(indexToLetter(26) === 'AA', 'indexToLetter(26) should be AA');

// Test letterToIndex
console.assert(letterToIndex('A') === 0, 'letterToIndex(A) should be 0');
console.assert(letterToIndex('B') === 1, 'letterToIndex(B) should be 1');
console.assert(letterToIndex('Z') === 25, 'letterToIndex(Z) should be 25');
console.assert(letterToIndex('AA') === 26, 'letterToIndex(AA) should be 26');

// Test positionToCoordinate
const coord = positionToCoordinate({ column: 0, row: 0 });
console.assert(coord.column === 'A' && coord.row === 1, 'positionToCoordinate should convert correctly');

// Test coordinateToPosition
const pos = coordinateToPosition({ column: 'A', row: 1 });
console.assert(pos.column === 0 && pos.row === 0, 'coordinateToPosition should convert correctly');

// Test formatCoordinate
console.assert(formatCoordinate({ column: 'A', row: 1 }) === 'A1', 'formatCoordinate should format correctly');

// Test parseCoordinate
const parsed = parseCoordinate('A1');
console.assert(parsed.column === 'A' && parsed.row === 1, 'parseCoordinate should parse correctly');

// Test isValidPosition
console.assert(isValidPosition({ column: 0, row: 0 }, testLayout), 'Position (0,0) should be valid');
console.assert(!isValidPosition({ column: 4, row: 0 }, testLayout), 'Position (4,0) should be invalid');

// Test isValidWidgetPlacement
console.assert(isValidWidgetPlacement(testWidget, testLayout), 'Test widget should fit in layout');

// Test doWidgetsOverlap
const widget2: Widget = {
  ...testWidget,
  id: 'test-widget-2',
  position: { column: 1, row: 0 },
};
console.assert(doWidgetsOverlap(testWidget, widget2), 'Overlapping widgets should be detected');

const widget3: Widget = {
  ...testWidget,
  id: 'test-widget-3',
  position: { column: 2, row: 0 },
};
console.assert(!doWidgetsOverlap(testWidget, widget3), 'Non-overlapping widgets should not overlap');

console.log('All tests passed!');

export {}; // Make this a module