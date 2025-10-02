"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import FamilyTreeEditor from "../components/FamilyTreeEditor";
import FamilyTreePreview from "../components/FamilyTreePreview";
import EditorTopBar from "../components/EditorTopBar";
import HowItWorks from "../components/HowItWorks";
import HowItWorksModal from "../components/modals/HowItWorksModal";
import { AlertCircle } from "lucide-react";
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
    error,
  } = useData();
  const [topPanelHeight, setTopPanelHeight] = useState(60); // Percentage
  const [isResizing, setIsResizing] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const [isHowItWorksOpen, setIsHowItWorksOpen] = useState(false);

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

  return (
    <div className="font-sans min-h-screen bg-gray-50 flex flex-col">
      <EditorTopBar onOpenHowItWorks={() => setIsHowItWorksOpen(true)} />
      <HowItWorksModal isOpen={isHowItWorksOpen} onClose={() => setIsHowItWorksOpen(false)} />

      {!familyData ? (
        <div className="flex flex-1 flex-col items-center justify-center gap-6 px-6 pb-10">
          <h2 className="text-3xl font-semibold text-center text-gray-900">Comment ça fonctionne ?</h2>
          <HowItWorks />
          {error && (
            <div className="w-full max-w-4xl flex gap-3 rounded-2xl border border-red-200 bg-red-50 px-6 py-4 text-red-700 shadow-sm">
              <AlertCircle className="w-5 h-5 flex-shrink-0" />
              <div className="flex flex-col gap-1">
                <span className="font-semibold text-red-800">Erreur de validation</span>
                <p className="text-sm leading-relaxed">{error}</p>
              </div>
            </div>
          )}
        </div>
      ) : (
        <div className="flex flex-col h-[calc(100vh-52px)] overflow-hidden">
          {error && (
            <div className="px-6 pt-4 flex justify-center flex-shrink-0">
              <div className="w-full max-w-4xl flex gap-3 rounded-2xl border border-red-200 bg-red-50 px-6 py-4 text-red-700 shadow-sm">
                <AlertCircle className="w-5 h-5 flex-shrink-0" />
                <div className="flex flex-col gap-1">
                  <span className="font-semibold text-red-800">Erreur de validation</span>
                  <p className="text-sm leading-relaxed">{error}</p>
                </div>
              </div>
            </div>
          )}
          <div ref={containerRef} className="flex-1 flex flex-col overflow-hidden">
            <div
              className="bg-white border-b border-gray-200 flex-shrink-0 overflow-hidden"
              style={{ flexGrow: topPanelHeight, flexBasis: 0 }}
            >
              <div className="h-full overflow-auto">
                <FamilyTreeEditor />
              </div>
            </div>

            <div
              className="h-6 -my-2 bg-transparent cursor-ns-resize flex items-center justify-center flex-shrink-0"
              onMouseDown={handleResizeStart}
              title="Glisser pour redimensionner"
            >
              <div className="h-1 w-full bg-gray-100"></div>
            </div>

            <div
              className="bg-gray-50 flex flex-col overflow-hidden flex-shrink-0"
              style={{ flexGrow: 100 - topPanelHeight, flexBasis: 0 }}
            >
              <FamilyTreePreview />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
