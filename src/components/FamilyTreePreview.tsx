"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { instance as createVizInstance } from "@viz-js/viz";
import { BarChart3, Loader2, Network, RotateCcw, Shuffle } from "lucide-react";
import { useData } from "../context/DataContext";
import { Generation } from "../types/familyTree";

function shuffleArray<T>(items: T[]): T[] {
  const copy = [...items];
  for (let index = copy.length - 1; index > 0; index -= 1) {
    const randomIndex = Math.floor(Math.random() * (index + 1));
    [copy[index], copy[randomIndex]] = [copy[randomIndex], copy[index]];
  }
  return copy;
}

function darkenHexColor(hex: string, amount: number): string {
  const normalized = hex.trim();
  if (!normalized.startsWith("#") || (normalized.length !== 7 && normalized.length !== 4)) {
    return hex;
  }

  const expandShortHex = (value: string) =>
    value
      .split("")
      .map((char) => char + char)
      .join("");

  const hexValue = normalized.length === 4 ? expandShortHex(normalized.slice(1)) : normalized.slice(1);

  const factor = Math.max(0, Math.min(1, 1 - amount));

  const toChannel = (start: number) => {
    const channel = parseInt(hexValue.slice(start, start + 2), 16);
    const adjusted = Math.max(0, Math.min(255, Math.round(channel * factor)));
    return adjusted.toString(16).padStart(2, "0");
  };

  const r = toChannel(0);
  const g = toChannel(2);
  const b = toChannel(4);

  return `#${r}${g}${b}`;
}

export default function FamilyTreePreview() {
  const { dot, isInitialLoad, setIsInitialLoad, peopleTrees, updateFamilyData } = useData();
  const [isLoading, setIsLoading] = useState(false);
  const [zoom, setZoom] = useState(1);
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [lastMousePos, setLastMousePos] = useState({ x: 0, y: 0 });

  const graphRef = useRef<HTMLDivElement>(null);
  const graphContainerRef = useRef<HTMLDivElement>(null);
  const detachNodeListenersRef = useRef<(() => void) | null>(null);

  const handleShuffleTree = useCallback(
    (treeIndex: number) => {
      const treeGenerations = peopleTrees[treeIndex];
      if (!treeGenerations || treeGenerations.length === 0) {
        return;
      }

      const generationNameSets = treeGenerations.map((generation) => new Set(generation.map((person) => person.name)));

      updateFamilyData((previous) => {
        const updatedChildrenTree = previous.children_tree.map((generation, generationIndex) => {
          const nameSet = generationNameSets[generationIndex];
          if (!nameSet || nameSet.size <= 1) {
            return generation;
          }

          const entries = Object.entries(generation);
          const inTreeEntries = entries.filter(([name]) => nameSet.has(name));
          if (inTreeEntries.length <= 1) {
            return generation;
          }

          const shuffledTreeEntries = shuffleArray(inTreeEntries);
          let pointer = 0;

          const remappedEntries = entries.map(([name, value]) => {
            if (!nameSet.has(name)) {
              return [name, value] as [string, typeof value];
            }

            const nextEntry = shuffledTreeEntries[pointer++];
            if (!nextEntry) {
              return [name, value] as [string, typeof value];
            }

            return nextEntry;
          });

          return Object.fromEntries(remappedEntries) as Generation;
        });

        return {
          ...previous,
          children_tree: updatedChildrenTree,
        };
      });
    },
    [peopleTrees, updateFamilyData]
  );

  const attachNodeListeners = useCallback(
    (svgElement: SVGSVGElement) => {
      if (detachNodeListenersRef.current) {
        detachNodeListenersRef.current();
        detachNodeListenersRef.current = null;
      }

      const anchors = Array.from(svgElement.querySelectorAll("a")) as unknown as SVGElement[];
      const listeners: Array<{
        target: SVGElement;
        clickHandler: EventListener;
        downHandler: EventListener;
        enterHandler?: EventListener;
        leaveHandler?: EventListener;
        pathElement?: SVGElement;
        originalFill?: string;
      }> = [];

      anchors.forEach((anchor) => {
        const title = anchor.getAttribute("xlink:title") ?? anchor.getAttribute("title");
        if (!title) {
          return;
        }

        const match = title.match(/Lignée n°(\d+)/i);
        if (!match) {
          return;
        }

        const treeIndex = Number.parseInt(match[1], 10) - 1;
        if (!Number.isFinite(treeIndex) || treeIndex < 0) {
          return;
        }

        const clickHandler: EventListener = (event) => {
          event.preventDefault();
          event.stopPropagation();
          handleShuffleTree(treeIndex);
        };

        const downHandler: EventListener = (event) => {
          event.stopPropagation();
        };

  const pathElement = anchor.querySelector("path") as SVGElement | null;
  const originalFill = pathElement?.getAttribute("fill") ?? null;
        let darkerFill: string | null = null;

        if (originalFill && originalFill.startsWith("#")) {
          darkerFill = darkenHexColor(originalFill, 0.15);
          if (pathElement) {
            pathElement.style.transition = "fill 150ms ease";
          }
        }

        const enterHandler: EventListener | undefined = darkerFill
          ? () => {
              if (pathElement) {
                pathElement.setAttribute("fill", darkerFill!);
              }
            }
          : undefined;

        const leaveHandler: EventListener | undefined = darkerFill
          ? () => {
              if (pathElement && originalFill) {
                pathElement.setAttribute("fill", originalFill);
              }
            }
          : undefined;

        anchor.addEventListener("click", clickHandler);
        anchor.addEventListener("mousedown", downHandler);
        if (enterHandler) {
          anchor.addEventListener("mouseenter", enterHandler);
        }
        if (leaveHandler) {
          anchor.addEventListener("mouseleave", leaveHandler);
        }
        anchor.style.cursor = "pointer";
        anchor.setAttribute("xlink:title", `Cliquez pour réorganiser la lignée n°${treeIndex + 1}`);
        anchor.classList.add("transition-transform", "duration-150", "active:scale-95");
        anchor.style.transformOrigin = "center";
        anchor.style.setProperty("transform-box", "fill-box");
        listeners.push({ target: anchor, clickHandler, downHandler, enterHandler, leaveHandler, pathElement: pathElement ?? undefined, originalFill: originalFill ?? undefined });
      });

      detachNodeListenersRef.current = () => {
        listeners.forEach(({ target, clickHandler, downHandler, enterHandler, leaveHandler, pathElement, originalFill }) => {
          target.removeEventListener("click", clickHandler);
          target.removeEventListener("mousedown", downHandler);
          if (enterHandler) {
            target.removeEventListener("mouseenter", enterHandler);
          }
          if (leaveHandler) {
            target.removeEventListener("mouseleave", leaveHandler);
          }
          if (pathElement && originalFill) {
            pathElement.setAttribute("fill", originalFill);
          }
        });
      };
    },
    [handleShuffleTree]
  );

  const renderGraph = useCallback(
    async (resetZoom: boolean) => {
      if (!dot) {
        return;
      }

      setIsLoading(true);

      try {
        const viz = await createVizInstance();
        const element = (await viz.renderSVGElement(dot)) as SVGSVGElement;

        if (!graphRef.current) {
          return;
        }

        graphRef.current.innerHTML = "";
        graphRef.current.appendChild(element);
        attachNodeListeners(element);

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
    [dot, attachNodeListeners]
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

  useEffect(() => {
    return () => {
      if (detachNodeListenersRef.current) {
        detachNodeListenersRef.current();
        detachNodeListenersRef.current = null;
      }
    };
  }, []);

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
    const anchor = (event.target as Element | null)?.closest("a");
    if (anchor) {
      return;
    }

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
      <div className="px-6 py-3 min-h-[56px] bg-white flex items-center justify-between gap-4 shadow-sm">
        <h2 className="text-base font-semibold tracking-tight text-slate-900 flex items-center gap-2 flex-shrink-0 -mt-3">
          <Network className="w-5 h-5" />
          Aperçu du graphique
        </h2>

        {isLoading && (
          <div className="flex items-center gap-2 text-blue-600 text-sm font-medium">
            <Loader2 className="w-4 h-4 animate-spin" />
            Génération...
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
