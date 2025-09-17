import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { 
  Save, 
  Download, 
  Share2, 
  Settings,
  Eye,
  Smartphone,
  Monitor,
  Tablet
} from 'lucide-react';
import { useState } from 'react';
import { Badge } from '@/components/ui/badge';

interface Project {
  id: string;
  name: string;
  files: { [key: string]: string };
  activeFile: string;
  steps: Array<{
    id: string;
    title: string;
    description: string;
    completed: boolean;
  }>;
}

interface ProjectToolbarProps {
  project: Project;
}

export default function ProjectToolbar({ project }: ProjectToolbarProps) {
  const [projectName, setProjectName] = useState(project.name);
  const [previewMode, setPreviewMode] = useState<'desktop' | 'tablet' | 'mobile'>('desktop');
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);

  const handleSave = () => {
    console.log('Saving project...', project);
    // Implement save functionality
  };

  const handlePreview = () => {
    setIsPreviewOpen(!isPreviewOpen);
    // Implement preview functionality
  };

  const handleDownload = () => {
    // Create and download project files
    const zip = Object.entries(project.files).reduce((acc, [filename, content]) => {
      acc[filename] = content;
      return acc;
    }, {} as { [key: string]: string });
    
    console.log('Downloading project files...', zip);
    // Implement download functionality
  };

  const handleShare = () => {
    // Generate shareable link
    const shareUrl = `${window.location.origin}/project/${project.id}`;
    navigator.clipboard.writeText(shareUrl);
    console.log('Project shared:', shareUrl);
  };

  const completedSteps = project.steps.filter(step => step.completed).length;
  const totalSteps = project.steps.length;

  return (
    <div className="h-14 bg-background border-b flex items-center justify-between px-4">
      <div className="flex items-center gap-4">
        <div className="flex items-center gap-2">
          <Input
            value={projectName}
            onChange={(e) => setProjectName(e.target.value)}
            className="text-sm font-medium bg-transparent border-none px-2 py-1 h-8 w-48"
          />
          <Badge variant="secondary" className="text-xs">
            {completedSteps}/{totalSteps} steps
          </Badge>
        </div>
      </div>

      <div className="flex items-center gap-2">
        {/* Preview Controls */}
        <div className="flex items-center gap-1 mr-2">
          <Button
            variant={previewMode === 'desktop' ? 'default' : 'ghost'}
            size="sm"
            onClick={() => setPreviewMode('desktop')}
            className="h-8 w-8 p-0"
          >
            <Monitor className="h-3 w-3" />
          </Button>
          <Button
            variant={previewMode === 'tablet' ? 'default' : 'ghost'}
            size="sm"
            onClick={() => setPreviewMode('tablet')}
            className="h-8 w-8 p-0"
          >
            <Tablet className="h-3 w-3" />
          </Button>
          <Button
            variant={previewMode === 'mobile' ? 'default' : 'ghost'}
            size="sm"
            onClick={() => setPreviewMode('mobile')}
            className="h-8 w-8 p-0"
          >
            <Smartphone className="h-3 w-3" />
          </Button>
        </div>

        <Button variant="ghost" size="sm" onClick={handleSave}>
          <Save className="h-4 w-4 mr-1" />
          Save
        </Button>

        <Button variant="ghost" size="sm" onClick={handlePreview}>
          <Eye className="h-4 w-4 mr-1" />
          Preview
        </Button>

        <Button variant="ghost" size="sm" onClick={handleDownload}>
          <Download className="h-4 w-4 mr-1" />
          Export
        </Button>

        <Button variant="ghost" size="sm" onClick={handleShare}>
          <Share2 className="h-4 w-4 mr-1" />
          Share
        </Button>

        <Button variant="outline" size="sm">
          <Settings className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}