import { z } from 'zod';
import { streamObject } from 'ai';
import { myProvider } from '@/lib/ai/providers';
import { createDocumentHandler } from '@/lib/artifacts/server';
import { updateDocumentPrompt } from '@/lib/ai/prompts';
import type { DashboardData, GridLayout, Widget } from './types';

// Dashboard schema for AI generation
const DashboardSchema = z.object({
  layout: z.object({
    columns: z.number().min(1).max(12),
    rows: z.number().min(1).max(12),
    cellSize: z.object({
      width: z.number().min(100).max(500),
      height: z.number().min(100).max(500),
    }),
  }),
  widgets: z.array(
    z.object({
      id: z.string(),
      type: z.enum(['text', 'metric', 'chart', 'image', 'table']),
      position: z.object({
        column: z.number().min(0),
        row: z.number().min(0),
      }),
      size: z.object({
        width: z.number().min(1).max(6),
        height: z.number().min(1).max(6),
      }),
      content: z.record(z.any()),
      config: z.record(z.any()),
    })
  ),
  metadata: z.object({
    createdAt: z.string(),
    lastModified: z.string(),
    theme: z.string(),
    title: z.string(),
    description: z.string(),
  }),
});

const dashboardPrompt = `You are a dashboard creation assistant. Create interactive dashboards with customizable grid layouts and widgets.

When creating a dashboard:
1. Use a logical grid layout (typically 4x4, 6x4, or 8x6)
2. Add relevant widgets based on the request
3. Position widgets logically within the grid
4. Use appropriate widget types (text, metric, chart, image, table)
5. Provide meaningful content for each widget
6. Set reasonable cell sizes (200x150px is standard)

Widget types and their typical content:
- text: Display information, labels, or descriptions
- metric: Show key performance indicators or statistics
- chart: Visualize data (specify chart type in content)
- image: Display images or visual content
- table: Show tabular data

Always ensure widgets fit within the grid boundaries and don't overlap.`;

export const dashboardDocumentHandler = createDocumentHandler<'dashboard'>({
  kind: 'dashboard',
  onCreateDocument: async ({ title, dataStream }) => {
    let draftContent = '';

    const { fullStream } = streamObject({
      model: myProvider.languageModel('artifact-model'),
      system: dashboardPrompt,
      prompt: `Create a dashboard for: ${title}`,
      schema: DashboardSchema,
    });

    for await (const delta of fullStream) {
      const { type } = delta;

      if (type === 'object') {
        const { object } = delta;
        
        if (object && object.layout && object.widgets && object.metadata) {
          const dashboardData: DashboardData = {
            version: '1.0',
            layout: object.layout as GridLayout,
            widgets: object.widgets as Widget[],
            metadata: {
              createdAt: new Date().toISOString(),
              lastModified: new Date().toISOString(),
              theme: object.metadata.theme || 'default',
              title: object.metadata.title || 'New Dashboard',
              description: object.metadata.description || 'A customizable dashboard',
            },
          };

          const content = JSON.stringify(dashboardData, null, 2);
          
          dataStream.write({
            type: 'data-dashboardDelta',
            data: content,
            transient: true,
          });

          draftContent = content;
        }
      }
    }

    // If no content was generated, return default dashboard
    if (!draftContent) {
      const defaultDashboard: DashboardData = {
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
          title: title || 'New Dashboard',
          description: 'A customizable dashboard with grid layout',
        },
      };

      draftContent = JSON.stringify(defaultDashboard, null, 2);
      
      dataStream.write({
        type: 'data-dashboardDelta',
        data: draftContent,
        transient: true,
      });
    }

    return draftContent;
  },
  onUpdateDocument: async ({ document, description, dataStream }) => {
    let draftContent = '';

    try {
      const currentDashboard: DashboardData = JSON.parse(document.content || '{}');
      
      const { fullStream } = streamObject({
        model: myProvider.languageModel('artifact-model'),
        system: `${updateDocumentPrompt(document.content, 'dashboard')}\n\n${dashboardPrompt}`,
        prompt: `Update the dashboard: ${description}`,
        schema: DashboardSchema,
      });

      for await (const delta of fullStream) {
        const { type } = delta;

        if (type === 'object') {
          const { object } = delta;
          
          if (object && object.layout && object.widgets && object.metadata) {
            const updatedDashboard: DashboardData = {
              version: '1.0',
              layout: object.layout as GridLayout,
              widgets: object.widgets as Widget[],
              metadata: {
                createdAt: currentDashboard.metadata.createdAt,
                lastModified: new Date().toISOString(),
                theme: object.metadata.theme || currentDashboard.metadata.theme,
                title: object.metadata.title || currentDashboard.metadata.title,
                description: object.metadata.description || currentDashboard.metadata.description,
              },
            };

            const content = JSON.stringify(updatedDashboard, null, 2);
            
            dataStream.write({
              type: 'data-dashboardDelta',
              data: content,
              transient: true,
            });

            draftContent = content;
          }
        }
      }
    } catch (error) {
      console.error('Error parsing existing dashboard:', error);
      
      // Fallback to creating a new dashboard
      const fallbackDashboard: DashboardData = {
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
          title: document.title,
          description: 'A customizable dashboard with grid layout',
        },
      };

      draftContent = JSON.stringify(fallbackDashboard, null, 2);
      
      dataStream.write({
        type: 'data-dashboardDelta',
        data: draftContent,
        transient: true,
      });
    }

    return draftContent;
  },
});