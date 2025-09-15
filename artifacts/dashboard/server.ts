import { createDocumentHandler } from '@/lib/artifacts/server';

export const dashboardDocumentHandler = createDocumentHandler({
  kind: 'dashboard',
  onCreateDocument: async ({ content, title }) => {
    // Default dashboard content with 4x4 grid
    const defaultDashboard = {
      version: '1.0',
      layout: {
        columns: 4,
        rows: 4,
        cellSize: {
          width: 200,
          height: 150,
        },
      },
      widgets: [],
      metadata: {
        createdAt: new Date().toISOString(),
        lastModified: new Date().toISOString(),
        theme: 'default',
      },
    };

    return JSON.stringify(defaultDashboard, null, 2);
  },
});