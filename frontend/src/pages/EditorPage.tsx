import { useState, useEffect, useCallback, useRef } from 'react';
import { useLocation } from 'react-router-dom';
import MonacoEditor from '@/components/MonacoEditor';
import FileExplorer from '@/components/FileExplorer';
import StepsPanel from '@/components/StepsPanel';
import { ResizableHandle, ResizablePanel, ResizablePanelGroup } from '@/components/ui/resizable';
import axios from 'axios';
import { backend_url } from '@/config';
import { Step, FileItem, StepType } from '../types/index';
import { parseXml } from '../steps';
import PreviewPanel from '@/components/PreviewPanel';
import { useWebContainer } from '@/hooks/web-container';
import ChatPanel from '@/components/ChatAssistant';

// Helper functions (unchanged)
const findItemByPath = (items: FileItem[], path: string): FileItem | null => {
  for (const item of items) {
    if (item.path === path) return item;
    if (item.type === 'folder' && item.children) {
      const found = findItemByPath(item.children, path);
      if (found) return found;
    }
  }
  return null;
};

const updateFileContentByPath = (items: FileItem[], path: string, content: string): FileItem[] => {
  return items.map(item => {
    if (item.path === path && item.type === 'file') return { ...item, content };
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
  const location = useLocation();
  const prompt = location.state?.prompt;
  const  webcontainer = useWebContainer();

  const [isLoading, setIsLoading] = useState(false);
  const [files, setFiles] = useState<FileItem[]>([]);
  const [steps, setSteps] = useState<Step[]>([]);
  const [selectedFile, setSelectedFile] = useState<FileItem | null>(null);
  const [viewMode, setViewMode] = useState<'editor' | 'preview'>('editor');
  const [llmMessages, setLlmMessages] = useState<{role: "user" | "assistant", content: string;}[]>([]);

  const initRan = useRef(false);

  const handleSendMessage = async (userPrompt: string) => {
    if (!userPrompt.trim()) return;

    const newMessage = { 
       role: "user" as "user",
       content: userPrompt 
      };

    setIsLoading(true);

    try {
      const stepsResponse = await axios.post(`${backend_url}/genai/chat`, {
        messages: [...llmMessages, newMessage],
      });

      const responseContent = stepsResponse.data.response;

      setLlmMessages(prev => [...prev, { role: "assistant", content: responseContent }]);

      const newSteps = parseXml(responseContent).map((x: Step) => ({
        ...x,
        status: "pending" as const,
      }));

      setSteps(s => [...s, ...newSteps]);
    } catch (error) {
      console.error("Failed to get chat response:", error);
      // Optionally add an error message to the chat
      setLlmMessages(prev => [...prev, { role: "assistant", content: "Sorry, I encountered an error." }]);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    setViewMode('editor');
  }, [selectedFile]);
  
  useEffect(() => {
    const pendingSteps = steps.filter(({ status }) => status === "pending");
    if (pendingSteps.length === 0) return;

    setFiles(currentFiles => {
      const newFiles = JSON.parse(JSON.stringify(currentFiles));
      pendingSteps.forEach(step => {
        if (step?.type === StepType.CreateFile && step.path) {
          const pathSegments = step.path.replace(/^\//, '').split('/');
          let currentLevel = newFiles;
          let currentPath = '';
          pathSegments.forEach((segment, index) => {
            const isLastSegment = index === pathSegments.length - 1;
            currentPath = currentPath ? `${currentPath}/${segment}` : segment;
            let item = currentLevel.find((i:any) => i.name === segment);
            if (isLastSegment) {
              if (item) item.content = step.code;
              else currentLevel.push({ name: segment, type: 'file', path: currentPath, content: step.code });
            } else {
              if (!item) {
                item = { name: segment, type: 'folder', path: currentPath, children: [] };
                currentLevel.push(item);
              }
              currentLevel = item.children!;
            }
          });
        }
      });
      return newFiles;
    });

    setSteps(currentSteps =>
      currentSteps.map(s => (s.status === "pending" ? { ...s, status: "completed" } : s))
    );
  }, [steps]);

  const init = useCallback(async () => {
    if (!prompt) return;
    setIsLoading(true);

    try {
      const templateResponse = await axios.post(`${backend_url}/genai/template`, { prompt: prompt.trim() });
      const { prompts, uiPrompts } = templateResponse.data;
      
      const initialSteps = parseXml(uiPrompts[0]).map((x: Step) => ({ ...x, status: "pending" as const }));
      setSteps(initialSteps);

       const stepsResponse = await axios.post(`${backend_url}/genai/chat`, { messages: [...prompts, prompt].map(content => ({ role: "user", content })) });

       const responseText = stepsResponse.data.response;
      //const responseText = response.candidates?.[0]?.content?.parts?.[0]?.text; // Using mock response from debug.ts

      console.log("Response:", responseText);

      setSteps(s => [...s, ...parseXml(responseText).map(x => ({ ...x, status: "pending" as const }))]);
      
      setLlmMessages([
        ...[...prompts, prompt].map(content => ({ role: "user" as const, content })),
        { role: "assistant" as const, content: responseText }
      ]);
    } catch (error) {
      console.error("Failed to initialize project:", error);
    } finally {
      setIsLoading(false);
    }
  }, [prompt]);

  useEffect(() => {
    if (initRan.current) return;
    initRan.current = true;
    init();
  }, [init]);

   useEffect(() => {
    const createMountStructure = (files: FileItem[]): Record<string, any> => {
      const mountStructure: Record<string, any> = {};
  
      const processFile = (file: FileItem, isRootFolder: boolean) => {  
        if (file.type === 'folder') {
          // For folders, create a directory entry
          mountStructure[file.name] = {
            directory: file.children ? 
              Object.fromEntries(
                file.children.map(child => [child.name, processFile(child, false)])
              ) 
              : {}
          };
        } else if (file.type === 'file') {
          if (isRootFolder) {
            mountStructure[file.name] = {
              file: {
                contents: file.content || ''
              }
            };
          } else {
            // For files, create a file entry with contents
            return {
              file: {
                contents: file.content || ''
              }
            };
          }
        }
  
        return mountStructure[file.name];
      };
  
      // Process each top-level file/folder
      files.forEach(file => processFile(file, true));
  
      return mountStructure;
    };
  
    const mountStructure = createMountStructure(files);
  
    // Mount the structure if WebContainer is available
    console.log(mountStructure);
    webcontainer?.mount(mountStructure);
  }, [files, webcontainer]);

  const handleFileChange = (content: string) => {
    if (!selectedFile) return;
    setFiles(prevFiles => updateFileContentByPath(prevFiles, selectedFile.path, content));
    setSelectedFile(prev => (prev ? { ...prev, content } : null));
  };

  const handleFileSelect = (path: string) => {
    const file = findItemByPath(files, path);
    if (file && file.type === 'file') setSelectedFile(file);
  };

  const handleNewFile = (filename: string) => {
    const newPath = filename.startsWith('/') ? filename.substring(1) : filename;
    if (findItemByPath(files, newPath)) {
        alert("A file with this name already exists at the root.");
        return;
    }
    const newFile: FileItem = { name: newPath, type: 'file', content: '', path: newPath };
    setFiles(prev => [...prev, newFile]);
    setSelectedFile(newFile);
  };

  const handleDeleteFile = (path: string) => {
    setFiles(prev => deleteItemByPath(prev, path));
    if (selectedFile?.path === path) setSelectedFile(null);
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
        <button onClick={() => setViewMode('editor')} disabled={viewMode === 'editor'} className="px-3 py-1 text-sm rounded-md disabled:bg-muted disabled:opacity-70 hover:bg-muted">Code</button>
        <button onClick={() => setViewMode('preview')} disabled={viewMode === 'preview'} className="px-3 py-1 text-sm rounded-md disabled:bg-muted disabled:opacity-70 hover:bg-muted">Preview</button>
      </div>

      {isLoading ? (
        <div className="flex-1 flex items-center justify-center">
          🚀 Booting WebContainer...
        </div>
      ) : (
        <div className="flex-1 overflow-auto h-full">
        {/* --- Editor View --- */}
        {/* This div is only visible when viewMode is 'editor' */}
        <div className="h-full" hidden={viewMode !== 'editor'}>
          <MonacoEditor
            filename={selectedFile?.path ?? ''}
            value={selectedFile?.content || ''}
            onChange={(value) => handleFileChange(value || '')}
          />
        </div>
        <div className="h-full" hidden={viewMode !== 'preview'}>
          {webcontainer && (
            <PreviewPanel webContainer={webcontainer} />
          )}
        </div>
      </div>
      )}
    </ResizablePanel>
    <ResizableHandle withHandle />

  
    <ResizablePanel defaultSize={25} minSize={15} maxSize={40}>
      <ResizablePanelGroup direction="vertical">
        <ResizablePanel defaultSize={50} minSize={25}>
          <StepsPanel steps={steps} />
        </ResizablePanel>
        <ResizableHandle withHandle />
        <ResizablePanel defaultSize={50} minSize={25}>
          <ChatPanel
            messages={llmMessages}
            isLoading={isLoading}
            onSubmit={handleSendMessage}
          />
        </ResizablePanel>
      </ResizablePanelGroup>
    </ResizablePanel>
  </ResizablePanelGroup>
</div>
  );
}