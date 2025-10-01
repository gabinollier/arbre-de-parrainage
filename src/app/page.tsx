"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import FamilyTreeEditor from "../components/FamilyTreeEditor";
import FamilyTreePreview from "../components/FamilyTreePreview";
import EditorTopBar from "../components/EditorTopBar";
import FileUploadPanel from "../components/FileUploadPanel";
import { DataProvider, useData } from "../context/DataContext";

export default function Home() {
  return (
    <DataProvider>
      <HomeContent />
    </DataProvider>
  );
}

function HomeContent() {
  const {
    familyData,
  } = useData();
  const [topPanelHeight, setTopPanelHeight] = useState(60); // Percentage
  const [isResizing, setIsResizing] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  // Handle resize start
  const handleResizeStart = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
    setIsResizing(true);
  }, []);

  // Handle resize
  const handleResize = useCallback((e: MouseEvent) => {
    if (!isResizing || !containerRef.current) return;

    const containerRect = containerRef.current.getBoundingClientRect();
    const relativeY = e.clientY - containerRect.top;
    const newTopPanelHeight = Math.min(Math.max((relativeY / containerRect.height) * 100, 20), 80);
    
    setTopPanelHeight(newTopPanelHeight);
  }, [isResizing]);

  // Handle resize end
  const handleResizeEnd = useCallback(() => {
    setIsResizing(false);
  }, []);

  // Global mouse event listeners for resizing
  useEffect(() => {
    if (!isResizing) {
      return;
    }

    const handleMouseMove = (event: MouseEvent) => {
      handleResize(event);
    };

    const handleMouseUp = () => {
      handleResizeEnd();
    };

    document.addEventListener("mousemove", handleMouseMove);
    document.addEventListener("mouseup", handleMouseUp);
    document.body.style.userSelect = "none";
    document.body.style.cursor = "ns-resize";

    return () => {
      document.removeEventListener("mousemove", handleMouseMove);
      document.removeEventListener("mouseup", handleMouseUp);
      document.body.style.userSelect = "";
      document.body.style.cursor = "";
    };
  }, [isResizing, handleResize, handleResizeEnd]);

  if (!familyData) {
    return <FileUploadPanel />;
  }

  return (
    <div className="font-sans min-h-screen bg-gray-50">
      <EditorTopBar />

      <div ref={containerRef} className="flex flex-col h-[calc(100vh-80px)]">
        <div 
          className="bg-white border-b border-gray-200"
          style={{ height: `${topPanelHeight}%` }}
        >
          <FamilyTreeEditor />
        </div>

        <div
          className="h-6 -my-2 bg-transparent cursor-ns-resize flex items-center justify-center"
          onMouseDown={handleResizeStart}
          title="Glisser pour redimensionner"
        >
          <div className="h-1 w-full bg-gray-100 "></div>
        </div>

        <div 
          className="bg-gray-50 flex flex-col"
          style={{ height: `${100 - topPanelHeight}%` }}
        >
          <FamilyTreePreview />
        </div>
      </div>
    </div>
  );  
}
