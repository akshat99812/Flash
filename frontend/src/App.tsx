import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { ThemeProvider } from '@/components/theme-provider';
import { Toaster } from '@/components/ui/sonner';
import HomePage from '@/pages/HomePage';
import EditorPage from '@/pages/EditorPage';
import Navigation from '@/components/Navigation';
import './App.css';

function App() {
  return (
    <ThemeProvider defaultTheme="dark" storageKey="flash-ui-theme">
      <Router>
        <div className="min-h-screen bg-background text-foreground">
          <Navigation />
          <div className="pt-16"> {/* This pushes content below the navbar */}
            <Routes>
              <Route path="/" element={<HomePage />} />
              <Route path="/editor" element={<EditorPage />} />
              <Route path="/editor/:projectId" element={<EditorPage />} />
            </Routes>
          </div>
          <Toaster />
        </div>
      </Router>
    </ThemeProvider>
  );
}


export default App;