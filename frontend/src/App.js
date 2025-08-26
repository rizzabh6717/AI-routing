import React from "react";
import "./App.css";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Dashboard from "./pages/Dashboard";

function App() {
  return (
    <div className="App">
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/incidents" element={<Dashboard />} />
          <Route path="/fleet" element={<Dashboard />} />
          <Route path="/routes" element={<Dashboard />} />
          <Route path="/map" element={<Dashboard />} />
          <Route path="/comms" element={<Dashboard />} />
          <Route path="/analytics" element={<Dashboard />} />
          <Route path="/personnel" element={<Dashboard />} />
        </Routes>
      </BrowserRouter>
    </div>
  );
}

export default App;
