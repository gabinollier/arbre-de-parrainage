"use client";

import { instance as createVizInstance } from "@viz-js/viz";
import {jsPDF, jsPDFOptions} from "jspdf";
import { CircleQuestionMark, Download, FileDown, Loader2, Upload } from "lucide-react";
import { useCallback, useState } from "react";
import { svg2pdf } from "svg2pdf.js";
import { useData } from "../context/DataContext";
import { useFamilyJsonUpload } from "../hooks/useFamilyJsonUpload";

function getFormattedDateTime() {
  const now = new Date();
  
  const day = String(now.getDate()).padStart(2, '0');
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const year = now.getFullYear();
  
  const hours = String(now.getHours()).padStart(2, '0');
  const minutes = String(now.getMinutes()).padStart(2, '0');
  
  return `${day}-${month}-${year}_${hours}h${minutes}`;
}

type EditorTopBarProps = {
  onOpenHowItWorks: () => void;
};

export default function EditorTopBar({ onOpenHowItWorks }: EditorTopBarProps) {
  const { familyData, dot, fileName } = useData();
  const [isExportingPdf, setIsExportingPdf] = useState(false);
  const { fileInputRef, openFileDialog, handleFileChange } = useFamilyJsonUpload();

  const handleDownload = useCallback(() => {
    if (!familyData) {
      return;
    }

    const dataStr = JSON.stringify(familyData, null, 2);
    const dataUri = `data:application/json;charset=utf-8,${encodeURIComponent(dataStr)}`;
    const exportName = `donnees_arbre_genealogique_${getFormattedDateTime()}.json`;

    const link = document.createElement("a");
    link.setAttribute("href", dataUri);
    link.setAttribute("download", exportName);
    link.click();
  }, [familyData]);

  const handleExportPdf = useCallback(async () => {
    if (!dot || isExportingPdf) {
      return;
    }

    try {
      setIsExportingPdf(true);
      const viz = await createVizInstance();
      const svgElement = await viz.renderSVGElement(dot);
      const workingSvg = svgElement.cloneNode(true) as SVGSVGElement;
      let svgWidth = 0;
      let svgHeight = 0;
      const viewBox = workingSvg.getAttribute("viewBox");
      if (viewBox) {
        const parts = viewBox.split(/\s+/).map(Number);
        if (parts.length === 4) {
          svgWidth = parts[2];
          svgHeight = parts[3];
        }
      }
      if (!svgWidth || !svgHeight) {
        svgWidth = parseFloat(workingSvg.getAttribute("width") ?? "0");
        svgHeight = parseFloat(workingSvg.getAttribute("height") ?? "0");
      }
      svgWidth = svgWidth || 1;
      svgHeight = svgHeight || 1;

      const orientation = svgWidth >= svgHeight ? "landscape" : "portrait";

      const margin = 0.2 * svgHeight;
      const widthWithMargin = svgWidth + 2 * margin;
      const heightWithMargin = svgHeight + 2 * margin;

      const jsPDFOptions: jsPDFOptions = {
        orientation,
        unit: "pt",
        format: [widthWithMargin, heightWithMargin]
      };

      const doc = new jsPDF(jsPDFOptions);
      await svg2pdf(workingSvg, doc, {
        x: margin,
        y: margin,
        width: svgWidth,
        height: svgHeight,
      });
      const exportName = `arbre_genealogique_${getFormattedDateTime()}.pdf`;
      doc.save(exportName);
    } catch (error) {
      console.error("Erreur lors de l'export PDF", error);
    } finally {
      setIsExportingPdf(false);
    }
  }, [dot, isExportingPdf]);

  return (
    <div className="sticky top-0 z-30 bg-green-600 text-white px-4 py-2 shadow-md">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <input
            ref={fileInputRef}
            type="file"
            accept=".json,application/json"
            onChange={handleFileChange}
            className="hidden"
          />
          {familyData ? (
            <>
              <button
                type="button"
                onClick={openFileDialog}
                className="text-sm flex items-center gap-2 px-3 py-2 bg-white text-green-700 hover:bg-green-100 rounded-lg transition-colors font-medium"
              >
                <Upload className="w-4 h-4" />
                Changer de fichier
              </button>
              <h1 className="text-sm">
                Fichier chargé : <span className="font-semibold">{fileName || "Aucun fichier"}</span>
              </h1>
            </>
          ) : (
            <button
              type="button"
              onClick={openFileDialog}
              className="text-sm flex items-center gap-2 px-4 py-2 bg-white text-green-700 hover:bg-green-100 rounded-lg transition-colors font-medium"
            >
              <Upload className="w-4 h-4" />
              Parcourir
            </button>
          )}
        </div>

        <div className="flex items-center gap-3">
          {familyData && (
            <button
              type="button"
              onClick={onOpenHowItWorks}
              className="text-sm text-green-600 flex items-center gap-2 px-3 py-2 bg-white hover:bg-white/90 rounded-lg transition-colors font-medium"
            >
              <CircleQuestionMark className="w-4 h-4" />
              Aide
            </button>
          )}

          <button
            onClick={handleDownload}
            disabled={!familyData}
            title="Sauvegarder le fichier contenant les données"
            className="text-sm flex items-center gap-2 px-4 py-2 bg-green-700 hover:bg-green-800 disabled:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed rounded-lg transition-colors font-medium"
          >
            <FileDown className="w-4 h-4" />
            Sauvegarder JSON
          </button>
          
          <button
            onClick={handleExportPdf}
            disabled={!dot || isExportingPdf}
            title="Exporter l'arbre au format PDF"
            className="text-sm flex items-center gap-2 px-4 py-2 bg-green-700 hover:bg-green-800 disabled:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed rounded-lg transition-colors font-medium"
          >
            {isExportingPdf ? <Loader2 className="w-4 h-4 animate-spin" /> : <Download className="w-4 h-4" />}
            {isExportingPdf ? "Export en cours" : "Exporter PDF"}
          </button>
        </div>
      </div>
    </div>
  );
}
