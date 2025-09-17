import { useState, useEffect } from 'react';
import { useParams, useLocation } from 'react-router-dom';
import MonacoEditor from '@/components/MonacoEditor';
import FileExplorer from '@/components/FileExplorer';
import StepsPanel from '@/components/StepsPanel';
import { ResizableHandle, ResizablePanel, ResizablePanelGroup } from '@/components/ui/resizable';
import axios from 'axios';
import { backend_url } from '@/config';
import { Step, FileItem, StepType } from '../types/index';
import { parseXml } from '../steps';
import PreviewPanel from '@/components/PreviewPanel';

const findItemByPath = (items: FileItem[], path: string): FileItem | null => {
  for (const item of items) {
    if (item.path === path) {
      return item;
    }
    if (item.type === 'folder' && item.children) {
      const found = findItemByPath(item.children, path);
      if (found) {
        return found;
      }
    }
  }
  return null;
};

const updateFileContentByPath = (items: FileItem[], path: string, content: string): FileItem[] => {
  return items.map(item => {
    if (item.path === path && item.type === 'file') {
      return { ...item, content };
    }
    if (item.type === 'folder' && item.children) {
      return { ...item, children: updateFileContentByPath(item.children, path, content) };
    }
    return item;
  });
};

const deleteItemByPath = (items: FileItem[], path: string): FileItem[] => {
    return items.filter(item => item.path !== path).map(item => {
        if (item.type === 'folder' && item.children) {
            return { ...item, children: deleteItemByPath(item.children, path) };
        }
        return item;
    });
};

export default function EditorPage() {
  const { projectId } = useParams();
  const location = useLocation();
  const prompt = location.state?.prompt;

  const [isLoading, setIsLoading] = useState(false);
  const [files, setFiles] = useState<FileItem[]>([]);
  const [steps, setSteps] = useState<Step[]>([]);
  const [selectedFile, setSelectedFile] = useState<FileItem | null>(null);
  const [viewMode, setViewMode] = useState<'editor' | 'preview'>('editor');

  const canPreview = selectedFile?.path.endsWith('.html');

  useEffect(() => {
    setViewMode('editor');
  }, [selectedFile]);

  const handleCreateProject = async (promptText: string) => {
    if (!promptText) return;
    setIsLoading(true);
    try {
      const response = await axios.post(`${backend_url}/genai/template`, { prompt: promptText });
      const { prompts, uiPrompts } = response.data;
      
      setSteps(parseXml(uiPrompts[0]).map((x: Step) => ({
        ...x,
        status: "pending"
      })));

      await axios.post(`${backend_url}/genai/chat`, {
        messages: [...prompts, promptText].map(content => ({
          role: "user",
          content
        }))
      });

    } catch (error) {
      console.error("Failed to create project:", error);
    } finally {
      setIsLoading(false);
    }
  };
  
  useEffect(() => {
    if (prompt) {
      handleCreateProject(prompt);
    }
  }, [prompt]);

  useEffect(() => {
    const pendingSteps = steps.filter(
      (step) => step.status === "pending" && step.type === StepType.CreateFile
    );

    if (pendingSteps.length === 0) {
      return;
    }

    setFiles((currentFiles) => {
      let filesCopy = JSON.parse(JSON.stringify(currentFiles));

      pendingSteps.forEach((step) => {
        if (!step.path) return;
        const pathSegments = step.path.split('/').filter(Boolean);
        let currentLevel = filesCopy;
        let currentPath = "";

        pathSegments.forEach((segment, index) => {
          currentPath = currentPath ? `${currentPath}/${segment}` : segment;
          const isLastSegment = index === pathSegments.length - 1;
          let node = currentLevel.find((item) => item.name === segment);

          if (isLastSegment) {
            if (node && node.type === 'file') {
              node.content = step.code;
            } else if (!node) {
              currentLevel.push({
                name: segment,
                type: 'file',
                path: currentPath,
                content: step.code,
              });
            }
          } else {
            if (node && node.type === 'folder') {
              currentLevel = node.children!;
            } else if (!node) {
              const newFolder: FileItem = {
                name: segment,
                type: 'folder',
                path: currentPath,
                children: [],
              };
              currentLevel.push(newFolder);
              currentLevel = newFolder.children!;
            }
          }
        });
      });
      return filesCopy;
    });
    
    setSteps((prevSteps) =>
        prevSteps.map((s) =>
        pendingSteps.some((ps) => ps.id === s.id)
            ? { ...s, status: "completed" }
            : s
        )
    );

  }, [steps]);


  const handleFileChange = (content: string) => {
    if (!selectedFile) return;

    setFiles(prevFiles => updateFileContentByPath(prevFiles, selectedFile.path, content));
    setSelectedFile(prev => (prev ? { ...prev, content } : null));
  };

  const handleFileSelect = (path: string) => {
    const file = findItemByPath(files, path);
    if (file && file.type === 'file') {
      setSelectedFile(file);
    }
  };

  const handleNewFile = (filename: string) => {
    const newPath = filename.startsWith('/') ? filename.substring(1) : filename;
    if (findItemByPath(files, newPath)) {
        alert("A file with this name already exists at the root.");
        return;
    }
    const newFile: FileItem = {
      name: newPath,
      type: 'file',
      content: '',
      path: newPath,
    };
    setFiles(prev => [...prev, newFile]);
    setSelectedFile(newFile);
  };

  const handleDeleteFile = (path: string) => {
    setFiles(prev => deleteItemByPath(prev, path));
    if (selectedFile?.path === path) {
      setSelectedFile(null);
    }
  };
  
  if (isLoading) {
    return (
      <div className="h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Generating project, please wait...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-screen pt-16"> 
      <ResizablePanelGroup direction="horizontal" className="h-full w-full">
        <ResizablePanel defaultSize={20} minSize={15} maxSize={35}>
          <FileExplorer
            files={files}
            activeFile={selectedFile?.path ?? ''}
            onFileSelect={handleFileSelect}
            onNewFile={handleNewFile}
            onDeleteFile={handleDeleteFile}
          />
        </ResizablePanel>
        
        <ResizableHandle withHandle />
        
        <ResizablePanel defaultSize={55} minSize={30} className="flex flex-col">
          <div className="flex-none flex items-center justify-end gap-2 p-2 border-b">
              <button
                  onClick={() => setViewMode('editor')}
                  disabled={viewMode === 'editor'}
                  className="px-3 py-1 text-sm rounded-md disabled:bg-muted disabled:opacity-70 hover:bg-muted"
              >
                  Code
              </button>
              <button
                  onClick={() => setViewMode('preview')}
                  disabled={!canPreview || viewMode === 'preview'}
                  className="px-3 py-1 text-sm rounded-md disabled:bg-muted disabled:opacity-50 hover:bg-muted"
              >
                  Preview
              </button>
          </div>
          <div className="flex-1 overflow-auto">
              {viewMode === 'editor' || !canPreview ? (
                  <MonacoEditor
                      filename={selectedFile?.path ?? ''}
                      value={selectedFile?.content || ''}
                      onChange={(value) => handleFileChange(value || '')}
                  />
              ) : (
                  <PreviewPanel  />
              )}
          </div>
        </ResizablePanel>
        
        <ResizableHandle withHandle />
        
        <ResizablePanel defaultSize={25} minSize={15} maxSize={35}>
          <StepsPanel steps={steps} />
        </ResizablePanel>
      </ResizablePanelGroup>
    </div>
  );
}