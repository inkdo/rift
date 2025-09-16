import type { DashboardData, GridLayout, Widget, DashboardMetadata } from '@/artifacts/dashboard/types';

/**
 * Serializes dashboard data to JSON string
 */
export function serializeDashboard(dashboard: DashboardData): string {
  try {
    return JSON.stringify(dashboard, null, 2);
  } catch (error) {
    throw new Error(`Failed to serialize dashboard: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

/**
 * Deserializes JSON string to dashboard data
 */
export function deserializeDashboard(jsonString: string): DashboardData {
  try {
    const parsed = JSON.parse(jsonString);
    return validateAndNormalizeDashboard(parsed);
  } catch (error) {
    throw new Error(`Failed to deserialize dashboard: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

/**
 * Validates and normalizes dashboard data structure
 */
function validateAndNormalizeDashboard(data: any): DashboardData {
  // Validate required fields
  if (!data || typeof data !== 'object') {
    throw new Error('Invalid dashboard data: must be an object');
  }

  if (!data.version || typeof data.version !== 'string') {
    throw new Error('Invalid dashboard data: missing or invalid version');
  }

  if (!data.layout || typeof data.layout !== 'object') {
    throw new Error('Invalid dashboard data: missing or invalid layout');
  }

  if (!Array.isArray(data.widgets)) {
    throw new Error('Invalid dashboard data: widgets must be an array');
  }

  if (!data.metadata || typeof data.metadata !== 'object') {
    throw new Error('Invalid dashboard data: missing or invalid metadata');
  }

  // Normalize layout
  const layout: GridLayout = {
    columns: Math.max(1, Math.min(12, Number(data.layout.columns) || 4)),
    rows: Math.max(1, Math.min(12, Number(data.layout.rows) || 4)),
    cellSize: {
      width: Math.max(100, Math.min(500, Number(data.layout.cellSize?.width) || 200)),
      height: Math.max(100, Math.min(500, Number(data.layout.cellSize?.height) || 150)),
    },
  };

  // Normalize widgets
  const widgets: Widget[] = data.widgets.map((widget: any, index: number) => {
    if (!widget || typeof widget !== 'object') {
      throw new Error(`Invalid widget at index ${index}: must be an object`);
    }

    if (!widget.id || typeof widget.id !== 'string') {
      throw new Error(`Invalid widget at index ${index}: missing or invalid id`);
    }

    if (!widget.type || typeof widget.type !== 'string') {
      throw new Error(`Invalid widget at index ${index}: missing or invalid type`);
    }

    if (!widget.position || typeof widget.position !== 'object') {
      throw new Error(`Invalid widget at index ${index}: missing or invalid position`);
    }

    if (!widget.size || typeof widget.size !== 'object') {
      throw new Error(`Invalid widget at index ${index}: missing or invalid size`);
    }

    return {
      id: widget.id,
      type: widget.type as Widget['type'],
      position: {
        column: Math.max(0, Number(widget.position.column) || 0),
        row: Math.max(0, Number(widget.position.row) || 0),
      },
      size: {
        width: Math.max(1, Math.min(6, Number(widget.size.width) || 1)),
        height: Math.max(1, Math.min(6, Number(widget.size.height) || 1)),
      },
      content: widget.content || {},
      config: widget.config || {},
    };
  });

  // Normalize metadata
  const metadata: DashboardMetadata = {
    createdAt: data.metadata.createdAt || new Date().toISOString(),
    lastModified: data.metadata.lastModified || new Date().toISOString(),
    theme: data.metadata.theme || 'default',
    title: data.metadata.title || 'Untitled Dashboard',
    description: data.metadata.description || '',
  };

  return {
    version: data.version,
    layout,
    widgets,
    metadata,
  };
}

/**
 * Serializes dashboard to compact JSON (no formatting)
 */
export function serializeDashboardCompact(dashboard: DashboardData): string {
  try {
    return JSON.stringify(dashboard);
  } catch (error) {
    throw new Error(`Failed to serialize dashboard: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

/**
 * Deserializes dashboard from compact JSON
 */
export function deserializeDashboardCompact(jsonString: string): DashboardData {
  return deserializeDashboard(jsonString);
}

/**
 * Serializes only the layout portion of dashboard
 */
export function serializeLayout(layout: GridLayout): string {
  try {
    return JSON.stringify(layout, null, 2);
  } catch (error) {
    throw new Error(`Failed to serialize layout: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

/**
 * Deserializes layout from JSON string
 */
export function deserializeLayout(jsonString: string): GridLayout {
  try {
    const parsed = JSON.parse(jsonString);
    
    if (!parsed || typeof parsed !== 'object') {
      throw new Error('Invalid layout data: must be an object');
    }

    return {
      columns: Math.max(1, Math.min(12, Number(parsed.columns) || 4)),
      rows: Math.max(1, Math.min(12, Number(parsed.rows) || 4)),
      cellSize: {
        width: Math.max(100, Math.min(500, Number(parsed.cellSize?.width) || 200)),
        height: Math.max(100, Math.min(500, Number(parsed.cellSize?.height) || 150)),
      },
    };
  } catch (error) {
    throw new Error(`Failed to deserialize layout: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

/**
 * Serializes only the widgets array
 */
export function serializeWidgets(widgets: Widget[]): string {
  try {
    return JSON.stringify(widgets, null, 2);
  } catch (error) {
    throw new Error(`Failed to serialize widgets: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

/**
 * Deserializes widgets array from JSON string
 */
export function deserializeWidgets(jsonString: string): Widget[] {
  try {
    const parsed = JSON.parse(jsonString);
    
    if (!Array.isArray(parsed)) {
      throw new Error('Invalid widgets data: must be an array');
    }

    return parsed.map((widget: any, index: number) => {
      if (!widget || typeof widget !== 'object') {
        throw new Error(`Invalid widget at index ${index}: must be an object`);
      }

      return {
        id: widget.id || `widget-${index}`,
        type: widget.type || 'text',
        position: {
          column: Math.max(0, Number(widget.position?.column) || 0),
          row: Math.max(0, Number(widget.position?.row) || 0),
        },
        size: {
          width: Math.max(1, Math.min(6, Number(widget.size?.width) || 1)),
          height: Math.max(1, Math.min(6, Number(widget.size?.height) || 1)),
        },
        content: widget.content || {},
        config: widget.config || {},
      };
    });
  } catch (error) {
    throw new Error(`Failed to deserialize widgets: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

/**
 * Serializes only the metadata
 */
export function serializeMetadata(metadata: DashboardMetadata): string {
  try {
    return JSON.stringify(metadata, null, 2);
  } catch (error) {
    throw new Error(`Failed to serialize metadata: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

/**
 * Deserializes metadata from JSON string
 */
export function deserializeMetadata(jsonString: string): DashboardMetadata {
  try {
    const parsed = JSON.parse(jsonString);
    
    if (!parsed || typeof parsed !== 'object') {
      throw new Error('Invalid metadata: must be an object');
    }

    return {
      createdAt: parsed.createdAt || new Date().toISOString(),
      lastModified: parsed.lastModified || new Date().toISOString(),
      theme: parsed.theme || 'default',
      title: parsed.title || 'Untitled Dashboard',
      description: parsed.description || '',
    };
  } catch (error) {
    throw new Error(`Failed to deserialize metadata: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

/**
 * Validates JSON string without deserializing
 */
export function validateDashboardJSON(jsonString: string): { isValid: boolean; errors: string[] } {
  const errors: string[] = [];

  try {
    const parsed = JSON.parse(jsonString);
    validateAndNormalizeDashboard(parsed);
  } catch (error) {
    errors.push(error instanceof Error ? error.message : 'Unknown validation error');
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
}

/**
 * Creates a backup of dashboard data with timestamp
 */
export function createDashboardBackup(dashboard: DashboardData): { data: string; timestamp: string; filename: string } {
  const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
  const filename = `dashboard-backup-${timestamp}.json`;
  const data = serializeDashboard(dashboard);

  return {
    data,
    timestamp,
    filename,
  };
}
