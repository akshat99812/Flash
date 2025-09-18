import { WebContainer } from '@webcontainer/api';
import React, { useEffect, useState, useRef } from 'react';

interface PreviewFrameProps {
  webContainer: WebContainer;
}

// Enum for clear status tracking
enum Status {
  Idle,
  Installing,
  Starting,
  Ready,
  Error,
}

export default function PreviewFrame({ webContainer }: PreviewFrameProps) {
  const [url, setUrl] = useState("");
  const [status, setStatus] = useState<Status>(Status.Idle);
  const hasStartedRef = useRef(false); // Ref to prevent multiple runs

  useEffect(() => {
    // Ensure this effect runs only once
    if (!webContainer || hasStartedRef.current) {
      return;
    }
    hasStartedRef.current = true;

    const startDevServer = async () => {
      try {
        // --- 1. Set up the server-ready listener ---
        // It's crucial to set this up before spawning processes to avoid race conditions.
        webContainer.on('server-ready', (port, url) => {
          console.log(`Server ready at port ${port}: ${url}`);
          setUrl(url);
          setStatus(Status.Ready);
        });

        // --- 2. Run npm install ---
        setStatus(Status.Installing);
        const installProcess = await webContainer.spawn('npm', ['install']);

        // Optional: Pipe output to console for debugging
        installProcess.output.pipeTo(new WritableStream({
          write(data) {
            console.log('[install]', data);
          }
        }));

        const installExitCode = await installProcess.exit;
        if (installExitCode !== 0) {
          console.error('Installation failed with exit code:', installExitCode);
          setStatus(Status.Error);
          return; // Stop the process if installation fails
        }

        // --- 3. Run npm run dev ---
        setStatus(Status.Starting);
        const devProcess = await webContainer.spawn('npm', ['run', 'dev']);

        // Optional: Pipe output for debugging
        devProcess.output.pipeTo(new WritableStream({
            write(data) {
                console.log('[dev]', data);
            }
        }));

      } catch (error) {
        console.error("An error occurred while starting the dev server:", error);
        setStatus(Status.Error);
      }
    };

    startDevServer();

  }, [webContainer]); // Dependency on webContainer

  const renderStatusMessages = () => {
    switch (status) {
      case Status.Installing:
        return <p>Installing dependencies...</p>;
      case Status.Starting:
        return <p>Starting dev server...</p>;
      case Status.Error:
        return <p className="text-red-500">Error starting server. Check console for details.</p>;
      default:
        return <p>Loading...</p>;
    }
  };

  return (
    <div className="h-full w-full bg-gray-900">
      {status === Status.Ready && url ? (
        <iframe
          className="w-full h-full border-0"
          src={url}
          title="Preview"
        />
      ) : (
        <div className="h-full w-full flex items-center justify-center text-gray-400">
          <div className="text-center">
            {renderStatusMessages()}
          </div>
        </div>
      )}
    </div>
  );
}

