import React, { useState } from "react";
import "./App.css";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Sidebar from "./components/Layout/Sidebar";
import Header from "./components/Layout/Header";
import Dashboard from "./pages/Dashboard";
import { Toaster } from "./components/ui/toaster";

function App() {
  const [currentPath, setCurrentPath] = useState('/');

  const handleNavigate = (path) => {
    setCurrentPath(path);
    // For now, we'll just update state. In a real app, you'd use React Router
    console.log('Navigating to:', path);
  };

  return (
    <div className="App">
      <BrowserRouter>
        <div className="flex h-screen bg-slate-50">
          {/* Sidebar */}
          <Sidebar currentPath={currentPath} onNavigate={handleNavigate} />
          
          {/* Main Content */}
          <div className="flex-1 flex flex-col overflow-hidden">
            <Header />
            <main className="flex-1 overflow-y-auto">
              <Routes>
                <Route path="/" element={<Dashboard />} />
                <Route path="/incidents" element={<Dashboard />} />
                <Route path="/fleet" element={<Dashboard />} />
                <Route path="/routes" element={<Dashboard />} />
                <Route path="/map" element={<Dashboard />} />
                <Route path="/activity" element={<Dashboard />} />
                <Route path="/team" element={<Dashboard />} />
              </Routes>
            </main>
          </div>
        </div>
        <Toaster />
      </BrowserRouter>
    </div>
  );
}

export default App;
