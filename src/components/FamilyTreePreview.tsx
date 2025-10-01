"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { instance as createVizInstance } from "@viz-js/viz";
import { BarChart3, Loader2, Network, RotateCcw } from "lucide-react";
import { useData } from "../context/DataContext";

export default function FamilyTreePreview() {
  const { dot, isInitialLoad, setIsInitialLoad } = useData();
  const [isLoading, setIsLoading] = useState(false);
  const [zoom, setZoom] = useState(1);
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [lastMousePos, setLastMousePos] = useState({ x: 0, y: 0 });

  const graphRef = useRef<HTMLDivElement>(null);
  const graphContainerRef = useRef<HTMLDivElement>(null);

  const renderGraph = useCallback(
    async (resetZoom: boolean) => {
      if (!dot) {
        return;
      }

      setIsLoading(true);

      try {
        const viz = await createVizInstance();
        const element = await viz.renderSVGElement(dot);

        if (!graphRef.current) {
          return;
        }

        graphRef.current.innerHTML = "";
        graphRef.current.appendChild(element);

        if (resetZoom) {
          const container = graphContainerRef.current;
          if (container) {
            const containerRect = container.getBoundingClientRect();
            let svgWidth = 0;
            let svgHeight = 0;
            const viewBox = element.getAttribute("viewBox");

            if (viewBox) {
              const [, , width, height] = viewBox.split(" ");
              svgWidth = parseFloat(width);
              svgHeight = parseFloat(height);
            } else {
              svgWidth = parseFloat(element.getAttribute("width") || "0");
              svgHeight = parseFloat(element.getAttribute("height") || "0");
            }

            const zoomX = containerRect.width / svgWidth;
            const zoomY = containerRect.height / svgHeight;
            const optimalZoom = Number.isFinite(Math.min(zoomX, zoomY)) ? Math.min(zoomX, zoomY, 1) : 1;
            const panX = (containerRect.width - svgWidth * optimalZoom) / 2;
            const panY = (containerRect.height - svgHeight * optimalZoom) / 2;

            setZoom(optimalZoom);
            setPan({ x: panX, y: panY });
          } else {
            setZoom(1);
            setPan({ x: 0, y: 0 });
          }
        }
      } catch (error) {
        console.error("Erreur lors du rendu :", error);
      } finally {
        setIsLoading(false);
      }
    },
    [dot]
  );

  useEffect(() => {
    if (!dot) {
      return;
    }

    let cancelled = false;

    const run = async () => {
      await renderGraph(isInitialLoad);
      if (!cancelled && isInitialLoad) {
        setIsInitialLoad(false);
      }
    };

    void run();

    return () => {
      cancelled = true;
    };
  }, [dot, isInitialLoad, setIsInitialLoad, renderGraph]);

  const handleWheel = useCallback(
    (event: React.WheelEvent) => {
      event.preventDefault();
      const container = graphContainerRef.current;
      if (!container) {
        return;
      }

      const rect = container.getBoundingClientRect();
      const mouseX = event.clientX - rect.left;
      const mouseY = event.clientY - rect.top;
      const pointBeforeZoom = {
        x: (mouseX - pan.x) / zoom,
        y: (mouseY - pan.y) / zoom,
      };

      const delta = event.deltaY * -0.002;
      const newZoom = Math.min(Math.max(0.05, zoom * (1 + delta)), 50);
      const newPan = {
        x: mouseX - pointBeforeZoom.x * newZoom,
        y: mouseY - pointBeforeZoom.y * newZoom,
      };

      setZoom(newZoom);
      setPan(newPan);

      if (graphRef.current) {
        const svgElement = graphRef.current.querySelector("svg");
        if (svgElement) {
          const originalOpacity = svgElement.style.opacity;
          svgElement.style.opacity = "0.999";
          requestAnimationFrame(() => {
            svgElement.style.opacity = originalOpacity;
          });
        }
      }
    },
    [pan, zoom]
  );

  const handleMouseDown = useCallback((event: React.MouseEvent) => {
    event.preventDefault();
    setIsDragging(true);
    setLastMousePos({ x: event.clientX, y: event.clientY });
  }, []);

  const handleDoubleClick = useCallback(() => {
    void renderGraph(true);
  }, [renderGraph]);

  useEffect(() => {
    if (!isDragging) {
      return;
    }

    const handleMouseMove = (event: MouseEvent) => {
      const deltaX = event.clientX - lastMousePos.x;
      const deltaY = event.clientY - lastMousePos.y;

      setPan((previous) => ({
        x: previous.x + deltaX,
        y: previous.y + deltaY,
      }));

      setLastMousePos({ x: event.clientX, y: event.clientY });

      if (graphRef.current) {
        const svgElement = graphRef.current.querySelector("svg");
        if (svgElement) {
          svgElement.style.transform = "translateZ(0)";
        }
      }
    };

    const handleMouseUp = () => {
      setIsDragging(false);
    };

    document.addEventListener("mousemove", handleMouseMove);
    document.addEventListener("mouseup", handleMouseUp);
    document.body.style.userSelect = "none";
    document.body.style.cursor = "grabbing";

    return () => {
      document.removeEventListener("mousemove", handleMouseMove);
      document.removeEventListener("mouseup", handleMouseUp);
      document.body.style.userSelect = "";
      document.body.style.cursor = "";
    };
  }, [isDragging, lastMousePos]);

  const zoomControls = useMemo(
    () => (
      <div className="absolute top-4 right-4 flex flex-col gap-2">
        <button
          onClick={() => {
            const newZoom = Math.min(50, zoom * 1.3);
            setZoom(newZoom);
            if (graphRef.current) {
              const svgElement = graphRef.current.querySelector("svg");
              if (svgElement) {
                const originalOpacity = svgElement.style.opacity;
                svgElement.style.opacity = "0.999";
                requestAnimationFrame(() => {
                  svgElement.style.opacity = originalOpacity;
                });
              }
            }
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
            if (graphRef.current) {
              const svgElement = graphRef.current.querySelector("svg");
              if (svgElement) {
                const originalOpacity = svgElement.style.opacity;
                svgElement.style.opacity = "0.999";
                requestAnimationFrame(() => {
                  svgElement.style.opacity = originalOpacity;
                });
              }
            }
          }}
          className="w-8 h-8 bg-white border border-gray-300 rounded flex items-center justify-center hover:bg-gray-50 shadow-md"
          title="Zoom arrière"
        >
          <span className="text-lg font-bold">−</span>
        </button>
        <button
          onClick={() => {
            void renderGraph(true);
          }}
          className="w-8 h-8 bg-white border border-gray-300 rounded flex items-center justify-center hover:bg-gray-50 shadow-md"
          title="Recentrer"
        >
          <RotateCcw className="w-4 h-4" />
        </button>
      </div>
    ),
    [renderGraph, zoom]
  );

  return (
    <div className="bg-gradient-to-b from-gray-50 via-white to-gray-50 flex flex-col h-full">
      <div className="px-6 py-3 min-h-[56px] bg-white/80 backdrop-blur flex items-center justify-between">
        <h2 className="text-base font-semibold tracking-tight text-slate-900 flex items-center gap-2">
          <Network className="w-5 h-5" />
          Aperçu du graphique
        </h2>
        {isLoading && (
          <div className="flex items-center gap-2 text-blue-600">
            <Loader2 className="w-4 h-4 animate-spin" />
            <span className="text-sm font-medium">Génération...</span>
          </div>
        )}
      </div>

      <div className="flex-1 bg-white overflow-hidden relative">
        {!dot && (
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
          style={{ cursor: isDragging ? "grabbing" : "grab" }}
        >
          <div
            ref={graphRef}
            className="w-fit h-fit"
            style={{
              transform: `translate(${pan.x}px, ${pan.y}px) scale(${zoom})`,
              transformOrigin: "0 0",
              transition: isDragging ? "none" : "transform 0.1s ease-out",
              imageRendering: zoom > 1 ? "auto" : "auto",
              backfaceVisibility: "hidden",
              willChange: "transform",
            }}
          />
        </div>

        {dot && zoomControls}

        {dot && (
          <div className="absolute bottom-4 right-4 bg-black bg-opacity-75 text-white px-2 py-1 rounded text-xs">
            {Math.round(zoom * 100)}%
          </div>
        )}
      </div>
    </div>
  );
};
