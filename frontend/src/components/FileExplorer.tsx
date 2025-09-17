import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  ContextMenu,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuTrigger,
} from '@/components/ui/context-menu';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { 
  FileText, 
  Folder as FolderIcon,
  FolderOpen, 
  Plus, 
  Trash2,
  Code,
  Palette,
  Settings,
  ChevronRight,
  ChevronDown
} from 'lucide-react';
import { cn } from '@/lib/utils';

// This is the expected structure for a file or folder item
interface FileItem {
  name: string;
  type: 'file' | 'folder';
  path: string;
  children?: FileItem[];
}

interface FileExplorerProps {
  files: FileItem[];
  activeFile: string;
  onFileSelect: (path: string) => void;
  onNewFile: (filename: string) => void;
  onDeleteFile: (path: string) => void;
}

const getFileIcon = (filename: string) => {
  const extension = filename.split('.').pop()?.toLowerCase();
  switch (extension) {
    case 'html':
    case 'htm':
      return <Code className="h-4 w-4 text-orange-500 flex-shrink-0" />;
    case 'css':
      return <Palette className="h-4 w-4 text-blue-500 flex-shrink-0" />;
    case 'js':
    case 'jsx':
    case 'ts':
    case 'tsx':
      return <FileText className="h-4 w-4 text-yellow-500 flex-shrink-0" />;
    case 'json':
      return <Settings className="h-4 w-4 text-green-500 flex-shrink-0" />;
    default:
      return <FileText className="h-4 w-4 text-gray-500 flex-shrink-0" />;
  }
};

export default function FileExplorer({ 
  files, 
  activeFile, 
  onFileSelect, 
  onNewFile, 
  onDeleteFile 
}: FileExplorerProps) {
  const [newFileName, setNewFileName] = useState('');
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [expandedFolders, setExpandedFolders] = useState<Record<string, boolean>>({});

  const toggleFolder = (path: string) => {
    setExpandedFolders(prev => ({ ...prev, [path]: !prev[path] }));
  };

  const handleCreateFile = () => {
    if (newFileName.trim()) {
      onNewFile(newFileName.trim());
      setNewFileName('');
      setIsDialogOpen(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleCreateFile();
    }
  };

  const renderTree = (items: FileItem[], level = 0) => {
    // Sort to show folders before files
    const sortedItems = [...items].sort((a, b) => {
      if (a.type === 'folder' && b.type === 'file') return -1;
      if (a.type === 'file' && b.type === 'folder') return 1;
      return a.name.localeCompare(b.name);
    });

    return sortedItems.map((item) => {
      const isExpanded = expandedFolders[item.path] === true;

      if (item.type === 'folder') {
        return (
          <div key={item.path}>
            <div
              className="flex items-center gap-2 px-2 py-1.5 rounded-md cursor-pointer text-sm transition-colors hover:bg-accent"
              style={{ paddingLeft: `${level * 1 + 0.5}rem` }}
              onClick={() => toggleFolder(item.path)}
            >
              {isExpanded ? <ChevronDown className="h-4 w-4 flex-shrink-0" /> : <ChevronRight className="h-4 w-4 flex-shrink-0" />}
              <FolderIcon className="h-4 w-4 text-sky-500 flex-shrink-0" />
              <span className="truncate">{item.name}</span>
            </div>
            {isExpanded && item.children && renderTree(item.children, level + 1)}
          </div>
        );
      }

      return (
        <ContextMenu key={item.path}>
          <ContextMenuTrigger>
            <div
              className={cn(
                "flex items-center gap-2 px-2 py-1.5 rounded-md cursor-pointer text-sm transition-colors hover:bg-accent",
                activeFile === item.path && "bg-accent text-accent-foreground"
              )}
              style={{ paddingLeft: `${level * 1 + 0.5}rem` }}
              onClick={() => onFileSelect(item.path)}
            >
              {getFileIcon(item.name)}
              <span className="truncate">{item.name}</span>
            </div>
          </ContextMenuTrigger>
          <ContextMenuContent>
            <ContextMenuItem
              onClick={() => onDeleteFile(item.path)}
              className="text-destructive focus:text-destructive"
            >
              <Trash2 className="h-4 w-4 mr-2" />
              Delete
            </ContextMenuItem>
          </ContextMenuContent>
        </ContextMenu>
      );
    });
  };

  return (
    <div className="h-full bg-muted/30 border-r flex flex-col">
      <div className="flex-none h-10 bg-muted/50 border-b flex items-center justify-between px-3">
        <div className="flex items-center gap-2">
          <FolderOpen className="h-4 w-4" />
          <span className="text-sm font-medium">Files</span>
        </div>
        
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button variant="ghost" size="sm" className="h-6 w-6 p-0">
              <Plus className="h-3 w-3" />
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>Create New File</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 py-2">
              <Input
                placeholder="Enter file name (e.g., style.css)"
                value={newFileName}
                onChange={(e) => setNewFileName(e.target.value)}
                onKeyPress={handleKeyPress}
                autoFocus
              />
              <div className="flex justify-end space-x-2">
                <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
                  Cancel
                </Button>
                <Button onClick={handleCreateFile}>Create</Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <ScrollArea className="flex-1">
        <div className="p-2 space-y-1">
          {files.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <FolderOpen className="h-8 w-8 mx-auto mb-2 opacity-50" />
              <p className="text-sm">No files in project</p>
              <p className="text-xs">Click the '+' icon to add a new file</p>
            </div>
          ) : (
            renderTree(files)
          )}
        </div>
      </ScrollArea>
    </div>
  );
}