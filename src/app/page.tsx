"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { generateDot } from "./utils/generateDot";
import { validateData } from "./utils/validateData";
import { Upload, X, AlertCircle, FileText, Download, FileDown } from "lucide-react";
import FamilyTreeEditor from "../components/FamilyTreeEditor";
import FamilyTreePreview from "../components/FamilyTreePreview";

export default function Home() { 
  const [dotInput, setDotInput] = useState("");
  const [error, setError] = useState<string>("");
  const [uploadedData, setUploadedData] = useState<any>(null);
  const [fileName, setFileName] = useState<string>("");
  const [isValidData, setIsValidData] = useState(false);
  const [isInitialLoad, setIsInitialLoad] = useState(true);
  const [topPanelHeight, setTopPanelHeight] = useState(60); // Percentage
  const [isResizing, setIsResizing] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (file.type !== "application/json") {
      setError("Veuillez sélectionner un fichier JSON valide.");
      return;
    }

    setFileName(file.name);
    const reader = new FileReader();
    
    reader.onload = (e) => {
      try {
        const jsonData = JSON.parse(e.target?.result as string);
        
        // Validate required properties
        if (!jsonData.children_tree) {
          setError("Le fichier JSON doit contenir une propriété 'children_tree'.");
          return;
        }
        
        if (jsonData.first_year === undefined || jsonData.first_year === null) {
          setError("Le fichier JSON doit contenir une propriété 'first_year'.");
          return;
        }
        
        if (typeof jsonData.first_year !== 'number' || !Number.isInteger(jsonData.first_year)) {
          setError("La propriété 'first_year' doit être un nombre entier.");
          return;
        }
        
        // Validate the children_tree structure
        const validation = validateData(jsonData.children_tree);
        if (!validation.isValid) {
          setError("Données invalides : " + validation.error);
          setIsValidData(false);
          return;
        }
        
        setUploadedData(jsonData);
        setIsValidData(true);
        setIsInitialLoad(true); // This is an initial load, reset zoom
        
        const generatedDot = generateDot(jsonData);
        setDotInput(generatedDot);
        
        setError("");
      } catch (err) {
        setError("Erreur lors de la lecture du fichier JSON : " + (err as Error).message);
      }
    };
    
    reader.onerror = () => {
      setError("Erreur lors de la lecture du fichier.");
    };
    
    reader.readAsText(file);
  };

  const clearUpload = () => {
    setUploadedData(null);
    setFileName("");
    setDotInput("");
    setError("");
    setIsValidData(false);
    setIsInitialLoad(true); // Reset for next file load
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };


  const handleDataChange = (newData: any) => {
    setUploadedData(newData);
    setIsInitialLoad(false);
    const generatedDot = generateDot(newData);
    setDotInput(generatedDot);
  };

  const downloadDataAsJson = () => {
    if (!uploadedData) return;
    
    const dataStr = JSON.stringify(uploadedData, null, 2);
    const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr);
    
    const exportFileDefaultName = fileName.replace('.json', '_edited.json');
    
    const linkElement = document.createElement('a');
    linkElement.setAttribute('href', dataUri);
    linkElement.setAttribute('download', exportFileDefaultName);
    linkElement.click();
  };

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

  const handleAutoFitComplete = useCallback(() => {
    setIsInitialLoad(false);
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

  // File upload view - shown when no valid data is loaded
  if (!isValidData) {
    return (
      <div className="font-sans flex flex-col items-center justify-center min-h-screen p-4 bg-gray-50">
        <div className="w-full max-w-2xl">
          <h1 className="text-3xl font-bold mb-8 text-center text-gray-800">
            Arbre Généalogique MIFF
          </h1>
          
          {/* File Upload Section */}
          <div className="p-8 border-2 border-dashed border-gray-300 rounded-xl bg-white shadow-md">
            <div className="text-center mb-6">
              <div className="w-16 h-16 mx-auto mb-4 bg-blue-100 rounded-full flex items-center justify-center">
                <Upload className="w-8 h-8 text-blue-600" />
              </div>
              <h2 className="text-xl font-semibold mb-2 text-gray-700">
                Télécharger un fichier JSON
              </h2>
              <p className="text-gray-500 text-sm">
                Sélectionnez votre fichier de données familiales
              </p>
            </div>
            
            <div className="flex flex-col items-center gap-4">
              <input
                ref={fileInputRef}
                type="file"
                accept=".json,application/json"
                onChange={handleFileUpload}
                className="file:mr-4 file:py-3 file:px-6 file:rounded-lg file:border-0 file:text-sm file:font-medium file:bg-blue-600 file:text-white hover:file:bg-blue-700 file:cursor-pointer cursor-pointer"
              />
              
              {fileName && !isValidData && !error && (
                <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                  <FileText className="w-4 h-4 text-gray-500" />
                  <span className="text-sm text-gray-700">{fileName}</span>
                  <button
                    onClick={clearUpload}
                    className="text-sm text-red-600 hover:text-red-800 font-medium flex items-center gap-1"
                  >
                    <X className="w-3 h-3" />
                    Effacer
                  </button>
                </div>
              )}
            </div>
          </div>

          {error && (
            <div className="mt-6 p-4 bg-red-50 border border-red-200 text-red-700 rounded-lg">
              <div className="flex items-start gap-3">
                <AlertCircle className="w-5 h-5 text-red-500 mt-0.5 flex-shrink-0" />
                <div>
                  <h3 className="font-medium text-red-800 mb-1">Erreur de validation</h3>
                  <p className="text-sm">{error}</p>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    );
  }

  // Main editor view - shown when valid data is loaded
  return (
    <div className="font-sans min-h-screen bg-gray-50">
      <div className="bg-green-600 text-white px-2 py-2 shadow-md">
        <div className="flex items-center justify-between ml-4">
          <div className="flex items-center gap-4">
            <h1 className="text-sm">
              Fichier chargé : <span className="font-semibold">{fileName}</span>
            </h1>
          </div>
          
          <div className="flex items-center gap-3">
            <button
              onClick={downloadDataAsJson}
              className="text-sm flex items-center gap-2 px-4 py-2 bg-green-700 hover:bg-green-800 rounded-lg transition-colors font-medium"
            >
              <Download className="w-4 h-4" />
              Exporter JSON
            </button>
            
            <button
              disabled
              className="text-sm flex items-center gap-2 px-4 py-2 bg-gray-500 rounded-lg transition-colors font-medium cursor-not-allowed opacity-50"
            >
              <FileDown className="w-4 h-4" />
              Exporter PDF
            </button>
          </div>
        </div>
      </div>

      <div ref={containerRef} className="flex flex-col h-[calc(100vh-80px)]">
        <div 
          className="bg-white border-b border-gray-200"
          style={{ height: `${topPanelHeight}%` }}
        >
          <FamilyTreeEditor 
            data={uploadedData}
            onDataChange={handleDataChange}
          />
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
          <FamilyTreePreview
            dotInput={dotInput}
            shouldAutoFit={isInitialLoad}
            onAutoFitComplete={handleAutoFitComplete}
          />
        </div>
      </div>
    </div>
  );  
}
