import { Artifact } from '@/components/create-artifact';
import { DocumentSkeleton } from '@/components/document-skeleton';
import {
  CopyIcon,
  RedoIcon,
  UndoIcon,
  BoxIcon,
  MenuIcon,
} from '@/components/icons';
import { toast } from 'sonner';

interface DashboardArtifactMetadata {
  // Placeholder for dashboard-specific metadata
}

export const dashboardArtifact = new Artifact<'dashboard', DashboardArtifactMetadata>({
  kind: 'dashboard',
  description: 'Interactive dashboard with customizable grid layout and widgets',
  initialize: async ({ documentId, setMetadata }) => {
    // Initialize dashboard metadata
    setMetadata({});
  },
  onStreamPart: ({ streamPart, setMetadata, setArtifact }) => {
    if (streamPart.type === 'data-dashboardDelta') {
      setArtifact((draftArtifact) => {
        return {
          ...draftArtifact,
          content: streamPart.data,
          isVisible: true,
          status: 'streaming',
        };
      });
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
  }) => {
    if (isLoading) {
      return <DocumentSkeleton artifactKind="dashboard" />;
    }

    // Placeholder dashboard content component
    return (
      <div className="flex flex-col h-full p-4">
        <div className="text-lg font-semibold mb-4">Dashboard Editor</div>
        <div className="flex-1 border-2 border-dashed border-gray-300 rounded-lg flex items-center justify-center">
          <div className="text-center text-gray-500">
            <BoxIcon size={48} />
            <p className="mt-2">Dashboard grid will be rendered here</p>
          </div>
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
        if (currentVersionIndex === 0) {
          return true;
        }
        return false;
      },
    },
    {
      icon: <RedoIcon size={18} />,
      description: 'View Next version',
      onClick: ({ handleVersionChange }) => {
        handleVersionChange('next');
      },
      isDisabled: ({ isCurrentVersion }) => {
        if (isCurrentVersion) {
          return true;
        }
        return false;
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
  ],
  toolbar: [
    {
      icon: <MenuIcon />,
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
      icon: <BoxIcon />,
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
  ],
});