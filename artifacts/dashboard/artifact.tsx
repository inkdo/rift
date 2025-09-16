import { Artifact } from '@/components/create-artifact';
import { DocumentSkeleton } from '@/components/document-skeleton';
import DashboardGrid from '@/components/dashboard-grid';
import {
  CopyIcon,
  RedoIcon,
  UndoIcon,
  BoxIcon,
  MenuIcon,
  DownloadIcon,
} from '@/components/icons';
import { toast } from 'sonner';
import type { DashboardData, GridLayout, Widget } from './types';

interface DashboardArtifactMetadata {
  // Grid configuration
  layout: GridLayout;
  widgets: Widget[];

  // Visual settings
  theme: string;
  backgroundColor: string;
  gridColor: string;
  cellColor: string;

  // Dashboard properties
  title: string;
  description: string;
  version: string;

  // Timestamps
  createdAt: string;
  lastModified: string;
  lastViewed: string;

  // User preferences
  isEditable: boolean;
  showGridLines: boolean;
  showCoordinates: boolean;
  autoSave: boolean;

  // Layout preferences
  snapToGrid: boolean;
  gridSize: number;
  cellPadding: number;

  // Widget settings
  defaultWidgetSize: { width: number; height: number };
  maxWidgets: number;
  allowedWidgetTypes: string[];

  // Performance settings
  renderMode: 'full' | 'optimized' | 'minimal';
  cacheEnabled: boolean;

  // Collaboration settings
  isShared: boolean;
  permissions: {
    canEdit: boolean;
    canAddWidgets: boolean;
    canRemoveWidgets: boolean;
    canChangeLayout: boolean;
  };
}

export class DashboardArtifact extends Artifact<
  'dashboard',
  DashboardArtifactMetadata
> {
  constructor() {
    super({
      kind: 'dashboard',
      description:
        'Interactive dashboard with customizable grid layout and widgets',
      initialize: async ({ documentId, setMetadata }) => {
        // Initialize dashboard with default layout
        const defaultLayout: GridLayout = {
          columns: 4,
          rows: 4,
          cellSize: {
            width: 200,
            height: 150,
          },
        };

        const now = new Date().toISOString();

        setMetadata({
          // Grid configuration
          layout: defaultLayout,
          widgets: [],

          // Visual settings
          theme: 'default',
          backgroundColor: '#ffffff',
          gridColor: '#e5e7eb',
          cellColor: '#ffffff',

          // Dashboard properties
          title: 'New Dashboard',
          description: 'A customizable dashboard with grid layout',
          version: '1.0.0',

          // Timestamps
          createdAt: now,
          lastModified: now,
          lastViewed: now,

          // User preferences
          isEditable: true,
          showGridLines: true,
          showCoordinates: true,
          autoSave: true,

          // Layout preferences
          snapToGrid: true,
          gridSize: 2,
          cellPadding: 8,

          // Widget settings
          defaultWidgetSize: { width: 1, height: 1 },
          maxWidgets: 50,
          allowedWidgetTypes: ['text', 'metric', 'chart', 'image', 'table'],

          // Performance settings
          renderMode: 'optimized',
          cacheEnabled: true,

          // Collaboration settings
          isShared: false,
          permissions: {
            canEdit: true,
            canAddWidgets: true,
            canRemoveWidgets: true,
            canChangeLayout: true,
          },
        });
      },
      onStreamPart: ({ streamPart, setMetadata, setArtifact }) => {
        switch (streamPart.type) {
          case 'data-dashboardDelta': {
            try {
              const dashboardData: DashboardData = JSON.parse(streamPart.data);

              setMetadata((prevMetadata) => ({
                ...prevMetadata,
                layout: dashboardData.layout,
                widgets: dashboardData.widgets,
                theme: dashboardData.metadata.theme,
                lastModified: new Date().toISOString(),
              }));

              setArtifact((draftArtifact) => ({
                ...draftArtifact,
                content: streamPart.data,
                isVisible: true,
                status: 'streaming',
              }));
            } catch (error) {
              console.error('Error parsing dashboard data:', error);
            }
            break;
          }

          case 'data-dashboardLayoutChange': {
            try {
              const layoutChange: GridLayout = JSON.parse(streamPart.data);

              setMetadata((prevMetadata) => ({
                ...prevMetadata,
                layout: layoutChange,
                lastModified: new Date().toISOString(),
              }));

              // Update artifact content with new layout
              setArtifact((draftArtifact) => {
                try {
                  const currentData: DashboardData = JSON.parse(
                    draftArtifact.content || '{}',
                  );
                  const updatedData: DashboardData = {
                    ...currentData,
                    layout: layoutChange,
                    metadata: {
                      ...currentData.metadata,
                      lastModified: new Date().toISOString(),
                    },
                  };

                  return {
                    ...draftArtifact,
                    content: JSON.stringify(updatedData, null, 2),
                    isVisible: true,
                    status: 'streaming',
                  };
                } catch (error) {
                  console.error('Error updating layout in artifact:', error);
                  return draftArtifact;
                }
              });
            } catch (error) {
              console.error('Error parsing layout change data:', error);
            }
            break;
          }

          case 'data-dashboardWidgetAdd': {
            try {
              const newWidget: Widget = JSON.parse(streamPart.data);

              setMetadata((prevMetadata) => ({
                ...prevMetadata,
                widgets: [...prevMetadata.widgets, newWidget],
                lastModified: new Date().toISOString(),
              }));

              // Update artifact content with new widget
              setArtifact((draftArtifact) => {
                try {
                  const currentData: DashboardData = JSON.parse(
                    draftArtifact.content || '{}',
                  );
                  const updatedData: DashboardData = {
                    ...currentData,
                    widgets: [...currentData.widgets, newWidget],
                    metadata: {
                      ...currentData.metadata,
                      lastModified: new Date().toISOString(),
                    },
                  };

                  return {
                    ...draftArtifact,
                    content: JSON.stringify(updatedData, null, 2),
                    isVisible: true,
                    status: 'streaming',
                  };
                } catch (error) {
                  console.error('Error adding widget to artifact:', error);
                  return draftArtifact;
                }
              });
            } catch (error) {
              console.error('Error parsing widget add data:', error);
            }
            break;
          }

          case 'data-dashboardWidgetUpdate': {
            try {
              const widgetUpdate: Partial<Widget> & { id: string } = JSON.parse(
                streamPart.data,
              );

              setMetadata((prevMetadata) => ({
                ...prevMetadata,
                widgets: prevMetadata.widgets.map((widget) =>
                  widget.id === widgetUpdate.id
                    ? { ...widget, ...widgetUpdate }
                    : widget,
                ),
                lastModified: new Date().toISOString(),
              }));

              // Update artifact content with updated widget
              setArtifact((draftArtifact) => {
                try {
                  const currentData: DashboardData = JSON.parse(
                    draftArtifact.content || '{}',
                  );
                  const updatedData: DashboardData = {
                    ...currentData,
                    widgets: currentData.widgets.map((widget) =>
                      widget.id === widgetUpdate.id
                        ? { ...widget, ...widgetUpdate }
                        : widget,
                    ),
                    metadata: {
                      ...currentData.metadata,
                      lastModified: new Date().toISOString(),
                    },
                  };

                  return {
                    ...draftArtifact,
                    content: JSON.stringify(updatedData, null, 2),
                    isVisible: true,
                    status: 'streaming',
                  };
                } catch (error) {
                  console.error('Error updating widget in artifact:', error);
                  return draftArtifact;
                }
              });
            } catch (error) {
              console.error('Error parsing widget update data:', error);
            }
            break;
          }

          case 'data-dashboardWidgetRemove': {
            try {
              const widgetId: string = streamPart.data;

              setMetadata((prevMetadata) => ({
                ...prevMetadata,
                widgets: prevMetadata.widgets.filter(
                  (widget) => widget.id !== widgetId,
                ),
                lastModified: new Date().toISOString(),
              }));

              // Update artifact content by removing widget
              setArtifact((draftArtifact) => {
                try {
                  const currentData: DashboardData = JSON.parse(
                    draftArtifact.content || '{}',
                  );
                  const updatedData: DashboardData = {
                    ...currentData,
                    widgets: currentData.widgets.filter(
                      (widget) => widget.id !== widgetId,
                    ),
                    metadata: {
                      ...currentData.metadata,
                      lastModified: new Date().toISOString(),
                    },
                  };

                  return {
                    ...draftArtifact,
                    content: JSON.stringify(updatedData, null, 2),
                    isVisible: true,
                    status: 'streaming',
                  };
                } catch (error) {
                  console.error('Error removing widget from artifact:', error);
                  return draftArtifact;
                }
              });
            } catch (error) {
              console.error('Error parsing widget remove data:', error);
            }
            break;
          }

          case 'data-dashboardThemeChange': {
            try {
              const theme: string = streamPart.data;

              setMetadata((prevMetadata) => ({
                ...prevMetadata,
                theme,
                lastModified: new Date().toISOString(),
              }));

              // Update artifact content with new theme
              setArtifact((draftArtifact) => {
                try {
                  const currentData: DashboardData = JSON.parse(
                    draftArtifact.content || '{}',
                  );
                  const updatedData: DashboardData = {
                    ...currentData,
                    metadata: {
                      ...currentData.metadata,
                      theme,
                      lastModified: new Date().toISOString(),
                    },
                  };

                  return {
                    ...draftArtifact,
                    content: JSON.stringify(updatedData, null, 2),
                    isVisible: true,
                    status: 'streaming',
                  };
                } catch (error) {
                  console.error('Error updating theme in artifact:', error);
                  return draftArtifact;
                }
              });
            } catch (error) {
              console.error('Error parsing theme change data:', error);
            }
            break;
          }

          case 'data-dashboardReset': {
            try {
              const resetData: DashboardData = JSON.parse(streamPart.data);

              setMetadata((prevMetadata) => ({
                ...prevMetadata,
                layout: resetData.layout,
                widgets: resetData.widgets,
                theme: resetData.metadata.theme,
                lastModified: new Date().toISOString(),
              }));

              setArtifact((draftArtifact) => ({
                ...draftArtifact,
                content: JSON.stringify(resetData, null, 2),
                isVisible: true,
                status: 'streaming',
              }));
            } catch (error) {
              console.error('Error parsing dashboard reset data:', error);
            }
            break;
          }

          default:
            // Handle unknown stream types gracefully
            console.warn(`Unknown dashboard stream type: ${streamPart.type}`);
            break;
        }
      },
      content: ({
        mode,
        status,
        content,
        isCurrentVersion,
        currentVersionIndex,
        onSaveContent,
        getDocumentContentById,
        isLoading,
        metadata,
        setMetadata,
      }) => {
        if (isLoading) {
          return <DocumentSkeleton artifactKind="dashboard" />;
        }

        // Parse dashboard data from content
        let dashboardData: DashboardData | null = null;
        try {
          dashboardData = content ? JSON.parse(content) : null;
        } catch (error) {
          console.error('Error parsing dashboard content:', error);
        }

        const layout = dashboardData?.layout || metadata.layout;
        const widgets = dashboardData?.widgets || metadata.widgets;

        const handleLayoutChange = (newLayout: GridLayout) => {
          const updatedData: DashboardData = {
            version: '1.0',
            layout: newLayout,
            widgets,
            metadata: {
              createdAt: new Date().toISOString(),
              lastModified: new Date().toISOString(),
              theme: metadata.theme,
            },
          };

          setMetadata((prev) => ({
            ...prev,
            layout: newLayout,
            lastModified: new Date().toISOString(),
          }));

          onSaveContent(JSON.stringify(updatedData, null, 2), true);
        };

        const handleWidgetUpdate = (updatedWidget: Widget) => {
          const updatedWidgets = widgets.map((widget) =>
            widget.id === updatedWidget.id ? updatedWidget : widget,
          );

          const updatedData: DashboardData = {
            version: '1.0',
            layout,
            widgets: updatedWidgets,
            metadata: {
              createdAt: new Date().toISOString(),
              lastModified: new Date().toISOString(),
              theme: metadata.theme,
            },
          };

          setMetadata((prev) => ({
            ...prev,
            widgets: updatedWidgets,
            lastModified: new Date().toISOString(),
          }));

          onSaveContent(JSON.stringify(updatedData, null, 2), true);
        };

        const handleWidgetAdd = (newWidget: Widget) => {
          const updatedWidgets = [...widgets, newWidget];

          const updatedData: DashboardData = {
            version: '1.0',
            layout,
            widgets: updatedWidgets,
            metadata: {
              createdAt: new Date().toISOString(),
              lastModified: new Date().toISOString(),
              theme: metadata.theme,
            },
          };

          setMetadata((prev) => ({
            ...prev,
            widgets: updatedWidgets,
            lastModified: new Date().toISOString(),
          }));

          onSaveContent(JSON.stringify(updatedData, null, 2), true);
        };

        const handleWidgetRemove = (widgetId: string) => {
          const updatedWidgets = widgets.filter(
            (widget) => widget.id !== widgetId,
          );

          const updatedData: DashboardData = {
            version: '1.0',
            layout,
            widgets: updatedWidgets,
            metadata: {
              createdAt: new Date().toISOString(),
              lastModified: new Date().toISOString(),
              theme: metadata.theme,
            },
          };

          setMetadata((prev) => ({
            ...prev,
            widgets: updatedWidgets,
            lastModified: new Date().toISOString(),
          }));

          onSaveContent(JSON.stringify(updatedData, null, 2), true);
        };

        return (
          <div className="flex h-full flex-col p-4">
            <div className="mb-4 flex items-center justify-between">
              <div className="font-semibold text-lg">Dashboard Editor</div>
              <div className="text-gray-500 text-sm">
                {widgets.length} widget{widgets.length !== 1 ? 's' : ''}
              </div>
            </div>

            <div className="flex-1 overflow-auto">
              <DashboardGrid
                layout={layout}
                widgets={widgets}
                onLayoutChange={handleLayoutChange}
                onWidgetUpdate={handleWidgetUpdate}
                onWidgetAdd={handleWidgetAdd}
                onWidgetRemove={handleWidgetRemove}
                isEditable={mode === 'edit'}
              />
            </div>
          </div>
        );
      },
      actions: [
        {
          icon: <UndoIcon size={18} />,
          description: 'View Previous version',
          onClick: ({ handleVersionChange }) => {
            handleVersionChange('prev');
          },
          isDisabled: ({ currentVersionIndex }) => {
            return currentVersionIndex === 0;
          },
        },
        {
          icon: <RedoIcon size={18} />,
          description: 'View Next version',
          onClick: ({ handleVersionChange }) => {
            handleVersionChange('next');
          },
          isDisabled: ({ isCurrentVersion }) => {
            return isCurrentVersion;
          },
        },
        {
          icon: <CopyIcon size={18} />,
          description: 'Copy dashboard JSON',
          onClick: ({ content }) => {
            navigator.clipboard.writeText(content);
            toast.success('Dashboard JSON copied to clipboard!');
          },
        },
        {
          icon: <DownloadIcon size={18} />,
          description: 'Export dashboard',
          onClick: ({ content }) => {
            const blob = new Blob([content], { type: 'application/json' });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `dashboard-${new Date().toISOString().split('T')[0]}.json`;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            URL.revokeObjectURL(url);
            toast.success('Dashboard exported successfully!');
          },
        },
      ],
      toolbar: [
        {
          icon: <MenuIcon size={16} />,
          description: 'Change layout',
          onClick: ({ sendMessage }) => {
            sendMessage({
              role: 'user',
              parts: [
                {
                  type: 'text',
                  text: 'Please change the dashboard layout to a 6x4 grid.',
                },
              ],
            });
          },
        },
        {
          icon: <BoxIcon size={16} />,
          description: 'Reset dashboard',
          onClick: ({ sendMessage }) => {
            sendMessage({
              role: 'user',
              parts: [
                {
                  type: 'text',
                  text: 'Please reset the dashboard to default 4x4 layout.',
                },
              ],
            });
          },
        },
        {
          icon: <MenuIcon size={16} />,
          description: 'Dashboard settings',
          onClick: ({ sendMessage }) => {
            sendMessage({
              role: 'user',
              parts: [
                {
                  type: 'text',
                  text: 'Please open the dashboard settings panel.',
                },
              ],
            });
          },
        },
      ],
    });
  }

  // Additional methods specific to dashboard functionality
  public createDefaultWidget(
    type: string,
    position: { column: number; row: number },
  ): Widget {
    return {
      id: `widget-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      type: type as any,
      position,
      size: { width: 1, height: 1 },
      content: { text: `New ${type} widget` },
      config: {},
    };
  }

  public validateLayout(layout: GridLayout): boolean {
    return (
      layout.columns > 0 &&
      layout.columns <= 12 &&
      layout.rows > 0 &&
      layout.rows <= 12 &&
      layout.cellSize.width > 0 &&
      layout.cellSize.height > 0
    );
  }

  public getGridBounds(widgets: Widget[]): {
    minCol: number;
    maxCol: number;
    minRow: number;
    maxRow: number;
  } {
    if (widgets.length === 0) {
      return { minCol: 0, maxCol: 0, minRow: 0, maxRow: 0 };
    }

    const minCol = Math.min(...widgets.map((w) => w.position.column));
    const maxCol = Math.max(
      ...widgets.map((w) => w.position.column + w.size.width - 1),
    );
    const minRow = Math.min(...widgets.map((w) => w.position.row));
    const maxRow = Math.max(
      ...widgets.map((w) => w.position.row + w.size.height - 1),
    );

    return { minCol, maxCol, minRow, maxRow };
  }
}

// Export a singleton instance
export const dashboardArtifact = new DashboardArtifact();
