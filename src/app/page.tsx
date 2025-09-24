"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { instance } from "@viz-js/viz";
import { generateDot } from "./utils/generateDot";
import { validateData } from "./utils/validateData";
import { 
  Upload, 
  X, 
  AlertCircle, 
  FileText, 
  Download, 
  FileDown, 
  BarChart3, 
  Loader2,
  RotateCcw,
  Network
} from "lucide-react";
import { FamilyData, } from "../types/familyTree";
import GenerationsPanel from "../components/GenerationsPanel";
import GenerationPanel from "../components/GenerationPanel";
import AddPersonModal from "@/components/modals/AddPersonModal";
import PersonPanel from "../components/PersonPanel";



function FamilyTreeEditor({ data, onDataChange }: {
  data: FamilyData;
  onDataChange: (newData: FamilyData) => void;
}) {
  const [selectedGeneration, setSelectedGeneration] = useState<number | null>(null);
  const [selectedPerson, setSelectedPerson] = useState<string | null>(null);
  const [showAddPersonModal, setShowAddPersonModal] = useState(false);

  const handleSelectGeneration = (index: number) => {
    setSelectedGeneration(index);
    setSelectedPerson(null);
  };

  const handleSelectPerson = (generationIndex: number | null, personName: string | null) => {
    setSelectedGeneration(generationIndex);
    setSelectedPerson(personName);
  };

  const handleAddGeneration = () => {
    const newData = { ...data };
    newData.children_tree.push({});
    onDataChange(newData);
    setSelectedGeneration(newData.children_tree.length - 1);
  };

  const handleAddPerson = (name: string, title: string) => {
    if (selectedGeneration === null) return;
    
    const newData = { ...data };
    const generation = { ...newData.children_tree[selectedGeneration] };
    generation[name] = {
      children: [],
      ...(title && { title })
    };
    newData.children_tree[selectedGeneration] = generation;
    onDataChange(newData);
    setSelectedPerson(name);
  };

  const currentGeneration = selectedGeneration !== null ? data.children_tree[selectedGeneration] : null;

  return (
    <div className="h-full flex">
      <GenerationsPanel
        data={data}
        selectedGeneration={selectedGeneration}
        onSelectGeneration={handleSelectGeneration}
        onAddGeneration={handleAddGeneration}
      />
      
      <GenerationPanel
        generation={currentGeneration}
        generationIndex={selectedGeneration}
        selectedPerson={selectedPerson}
        onSelectPerson={setSelectedPerson}
        onAddPerson={() => setShowAddPersonModal(true)}
        onDeleteGeneration={(index) => {
          const newData = { ...data };
          newData.children_tree.splice(index, 1);
          onDataChange(newData);
        }}
      />
      
      <PersonPanel
        data={data}
        generationIndex={selectedGeneration}
        personName={selectedPerson}
        onDataChange={onDataChange}
        onSelectPerson={handleSelectPerson}
      />

      <AddPersonModal
        isOpen={showAddPersonModal}
        onClose={() => setShowAddPersonModal(false)}
        onAdd={handleAddPerson}
      />
    </div>
  );
}

export default function Home() { 
  const [dotInput, setDotInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string>("");
  const [uploadedData, setUploadedData] = useState<any>(null);
  const [fileName, setFileName] = useState<string>("");
  const [isValidData, setIsValidData] = useState(false);
  const [isInitialLoad, setIsInitialLoad] = useState(true);
  const [zoom, setZoom] = useState(1);
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [lastMousePos, setLastMousePos] = useState({ x: 0, y: 0 });
  const [topPanelHeight, setTopPanelHeight] = useState(60); // Percentage
  const [isResizing, setIsResizing] = useState(false);
  const graphRef = useRef<HTMLDivElement>(null);
  const graphContainerRef = useRef<HTMLDivElement>(null);
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
    setIsInitialLoad(false); // This is an edit, preserve zoom
    
    // Generate new DOT
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

  const renderGraph = async (resetZoom: boolean = true) => {
    if (!dotInput) return;
    setIsLoading(true);

    try {
      const viz = await instance();
      const element = await viz.renderSVGElement(dotInput);

      if (graphRef.current) {
        graphRef.current.innerHTML = "";
        graphRef.current.appendChild(element);

        // Ajuste le zoom et le centrage au premier rendu
        if (resetZoom) {
          // Récupère la taille du conteneur et du SVG
          const container = graphContainerRef.current;
          const svg = element;
          if (container && svg) {
            // Prend la taille du conteneur
            const containerRect = container.getBoundingClientRect();
            // Prend la taille du SVG (via viewBox ou width/height)
            let svgWidth = 0, svgHeight = 0;
            const vb = svg.getAttribute('viewBox');
            if (vb) {
              const vbParts = vb.split(' ');
              svgWidth = parseFloat(vbParts[2]);
              svgHeight = parseFloat(vbParts[3]);
            } else {
              svgWidth = parseFloat(svg.getAttribute('width') || '0');
              svgHeight = parseFloat(svg.getAttribute('height') || '0');
            }
            // Calcule le zoom optimal
            const zoomX = containerRect.width / svgWidth;
            const zoomY = containerRect.height / svgHeight;
            const optimalZoom = Math.min(zoomX, zoomY, 1); // max 1 pour éviter le zoom excessif
            // Calcule le pan pour centrer
            const panX = (containerRect.width - svgWidth * optimalZoom) / 2;
            const panY = (containerRect.height - svgHeight * optimalZoom) / 2;
            setZoom(optimalZoom);
            setPan({ x: panX, y: panY });
          } else {
            setZoom(1);
            setPan({ x: 0, y: 0 });
          }
        }
      }
    } catch (err: any) {
      console.error("Erreur lors du rendu : " + err.message);
    } finally {
      setIsLoading(false);
    }
  };

  // Handle mouse wheel zoom
  const handleWheel = (e: React.WheelEvent) => {
    e.preventDefault();
    
    const container = graphContainerRef.current;
    if (!container) return;
    
    const rect = container.getBoundingClientRect();
    const mouseX = e.clientX - rect.left;
    const mouseY = e.clientY - rect.top;
    
    // Calculate the point in the current coordinate system
    const pointBeforeZoom = {
      x: (mouseX - pan.x) / zoom,
      y: (mouseY - pan.y) / zoom
    };
    
    const delta = e.deltaY * -0.002;
    const newZoom = Math.min(Math.max(0.05, zoom * (1 + delta)), 50);
    
    // Calculate new pan to keep the mouse point fixed
    const newPan = {
      x: mouseX - pointBeforeZoom.x * newZoom,
      y: mouseY - pointBeforeZoom.y * newZoom
    };
    
    setZoom(newZoom);
    setPan(newPan);
    
    // Force re-render of SVG to prevent pixelization
    if (graphRef.current) {
      const svgElement = graphRef.current.querySelector('svg');
      if (svgElement) {
        // Trigger a repaint by slightly modifying and restoring a CSS property
        const originalOpacity = svgElement.style.opacity;
        svgElement.style.opacity = '0.999';
        requestAnimationFrame(() => {
          svgElement.style.opacity = originalOpacity;
        });
      }
    }
  };

  // Handle mouse down for panning
  const handleMouseDown = (e: React.MouseEvent) => {
    e.preventDefault();
    setIsDragging(true);
    setLastMousePos({ x: e.clientX, y: e.clientY });
  };

  // Handle double click to reset zoom and pan
  const handleDoubleClick = () => {
    setZoom(1);
    setPan({ x: 0, y: 0 });
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

  // Auto-render graph when dotInput changes and data is valid
  useEffect(() => {
    if (isValidData && dotInput) {
      renderGraph(isInitialLoad);
      if (isInitialLoad) {
        setIsInitialLoad(false);
      }
    }
  }, [dotInput, isValidData, isInitialLoad]);

  // Global mouse event listeners for smoother dragging and resizing
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (isDragging) {
        const deltaX = e.clientX - lastMousePos.x;
        const deltaY = e.clientY - lastMousePos.y;
        
        setPan(prev => ({
          x: prev.x + deltaX,
          y: prev.y + deltaY
        }));
        
        setLastMousePos({ x: e.clientX, y: e.clientY });
        
        // Force SVG re-render during drag to prevent pixelization
        if (graphRef.current) {
          const svgElement = graphRef.current.querySelector('svg');
          if (svgElement) {
            svgElement.style.transform = 'translateZ(0)'; // Force hardware acceleration
          }
        }
      } else if (isResizing) {
        handleResize(e);
      }
    };

    const handleMouseUp = () => {
      setIsDragging(false);
      handleResizeEnd();
    };

    if (isDragging || isResizing) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
      document.body.style.userSelect = 'none'; // Prevent text selection while dragging/resizing
      if (isResizing) {
        document.body.style.cursor = 'ns-resize';
      }
    }

    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
      document.body.style.userSelect = '';
      document.body.style.cursor = '';
    };
  }, [isDragging, lastMousePos, isResizing, handleResize, handleResizeEnd]);

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
      {/* Top Bar */}
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

      {/* Main Content Area */}
      <div ref={containerRef} className="flex flex-col h-[calc(100vh-80px)]">
        {/* Top Panel - Data Editor */}
        <div 
          className="bg-white border-b border-gray-200"
          style={{ height: `${topPanelHeight}%` }}
        >
          <FamilyTreeEditor 
            data={uploadedData}
            onDataChange={handleDataChange}
          />
        </div>

        {/* Resize Handle */}
        <div
          className="h-6 -my-2 bg-transparent cursor-ns-resize flex items-center justify-center"
          onMouseDown={handleResizeStart}
          title="Glisser pour redimensionner"
        >
          <div className="h-1 w-full bg-gray-100 "></div>
        </div>

        {/* Bottom Panel - Graph Preview */}
        <div 
          className="bg-gray-50 flex flex-col"
          style={{ height: `${100 - topPanelHeight}%` }}
        >
          {/* Title bar */}
          <div className="bg-white px-6 py-2 flex items-center justify-between shadow-md z-100">
            <h2 className="text-lg font-semibold text-gray-800">
              <Network className="w-5 h-5 inline-block mr-1" />
              Aperçu du graphique
            </h2>
            {isLoading && (
              <div className="flex items-center gap-2 text-blue-600">
                <Loader2 className="w-4 h-4 animate-spin" />
                <span className="text-sm font-medium">Génération...</span>
              </div>
            )}
          </div>
          {/* Graph container taking full remaining space */}
          <div className="flex-1 bg-white overflow-hidden relative">
              {!dotInput && (
                <div className="absolute inset-0 flex items-center justify-center text-gray-400 text-center">
                  <div>
                    <BarChart3 className="w-16 h-16 mx-auto mb-4 text-gray-200" />
                    <p>Chargement du graphique...</p>
                  </div>
                </div>
              )}
              <div
                ref={graphContainerRef}
                className="w-full h-full overflow-hidden"
                onWheel={handleWheel}
                onMouseDown={handleMouseDown}
                onDoubleClick={handleDoubleClick}
                style={{ cursor: isDragging ? 'grabbing' : 'grab' }}
              >
                <div
                  ref={graphRef}
                  className="w-fit h-fit"
                  style={{
                    transform: `translate(${pan.x}px, ${pan.y}px) scale(${zoom})`,
                    transformOrigin: '0 0',
                    transition: isDragging ? 'none' : 'transform 0.1s ease-out',
                    imageRendering: zoom > 1 ? 'auto' : 'auto',
                    backfaceVisibility: 'hidden',
                    willChange: 'transform'
                  }}
                >
                </div>
              </div>
              
              {/* Zoom controls */}
              {dotInput && (
                <div className="absolute top-4 right-4 flex flex-col gap-2">
                  <button
                    onClick={() => {
                      const newZoom = Math.min(50, zoom * 1.3);
                      setZoom(newZoom);
                      // Force SVG re-render to prevent pixelization
                      setTimeout(() => {
                        if (graphRef.current) {
                          const svgElement = graphRef.current.querySelector('svg');
                          if (svgElement) {
                            const originalOpacity = svgElement.style.opacity;
                            svgElement.style.opacity = '0.999';
                            requestAnimationFrame(() => {
                              svgElement.style.opacity = originalOpacity;
                            });
                          }
                        }
                      }, 0);
                    }}
                    className="w-8 h-8 bg-white border border-gray-300 rounded flex items-center justify-center hover:bg-gray-50 shadow-md"
                    title="Zoom avant"
                  >
                    <span className="text-lg font-bold">+</span>
                  </button>
                  <button
                    onClick={() => {
                      const newZoom = Math.max(0.05, zoom / 1.3);
                      setZoom(newZoom);
                      // Force SVG re-render to prevent pixelization
                      setTimeout(() => {
                        if (graphRef.current) {
                          const svgElement = graphRef.current.querySelector('svg');
                          if (svgElement) {
                            const originalOpacity = svgElement.style.opacity;
                            svgElement.style.opacity = '0.999';
                            requestAnimationFrame(() => {
                              svgElement.style.opacity = originalOpacity;
                            });
                          }
                        }
                      }, 0);
                    }}
                    className="w-8 h-8 bg-white border border-gray-300 rounded flex items-center justify-center hover:bg-gray-50 shadow-md"
                    title="Zoom arrière"
                  >
                    <span className="text-lg font-bold">−</span>
                  </button>
                  <button
                    onClick={() => renderGraph(true)}
                    className="w-8 h-8 bg-white border border-gray-300 rounded flex items-center justify-center hover:bg-gray-50 shadow-md"
                    title="Recentrer"
                  >
                    <RotateCcw className="w-4 h-4" />
                  </button>
                </div>
              )}
              
              {/* Zoom indicator */}
              {dotInput && (
                <div className="absolute bottom-4 right-4 bg-black bg-opacity-75 text-white px-2 py-1 rounded text-xs">
                  {Math.round(zoom * 100)}%
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
  );  
}
