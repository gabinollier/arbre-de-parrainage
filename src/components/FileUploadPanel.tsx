"use client";

import { useRef } from "react";
import { Upload, X, AlertCircle, FileText } from "lucide-react";
import { validateData } from "../utils/validateData";
import { useData } from "../context/DataContext";
import { FamilyData } from "../types/familyTree";

export default function FileUploadPanel() {
  const {
    familyData,
    setFamilyData,
    clearData,
    fileName,
    setFileName,
    error,
    setError,
    setIsInitialLoad,
  } = useData();

  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) {
      return;
    }

    if (file.type !== "application/json") {
      setError("Veuillez sélectionner un fichier JSON valide.");
      setFileName("");
      return;
    }

    setFileName(file.name);
    const reader = new FileReader();

    reader.onload = (loadEvent) => {
      try {
        const jsonData = JSON.parse(loadEvent.target?.result as string) as FamilyData;

        if (!jsonData.children_tree) {
          setError("Le fichier JSON doit contenir une propriété 'children_tree'.");
          return;
        }

        if (jsonData.first_year === undefined || jsonData.first_year === null) {
          setError("Le fichier JSON doit contenir une propriété 'first_year'.");
          return;
        }

        if (typeof jsonData.first_year !== "number" || !Number.isInteger(jsonData.first_year)) {
          setError("La propriété 'first_year' doit être un nombre entier.");
          return;
        }

        const validation = validateData(jsonData.children_tree);
        if (!validation.isValid) {
          setError(`Données invalides : ${validation.error}`);
          return;
        }

        setFamilyData(jsonData);
        setIsInitialLoad(true);
        setError("");
      } catch (err) {
        setError(`Erreur lors de la lecture du fichier JSON : ${(err as Error).message}`);
      }
    };

    reader.onerror = () => {
      setError("Erreur lors de la lecture du fichier.");
    };

    reader.readAsText(file);
  };

  const handleClear = () => {
    clearData();
    setIsInitialLoad(true);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  return (
    <div className="font-sans flex flex-col items-center justify-center min-h-screen p-4 bg-gray-50">
      <div className="w-full max-w-4xl">
        <h1 className="text-4xl font-bold mb-8 text-center text-gray-800">
          Outil de création d'Arbre Généalogique de Miff
        </h1>

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
              className="file:mr-4 file:py-3 file:px-6 file:rounded-xl file:border-0 file:text-sm file:font-medium file:bg-blue-600 file:text-white hover:file:bg-blue-700 file:cursor-pointer cursor-pointer"
            />

            {fileName && !familyData && !error && (
              <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl">
                <FileText className="w-4 h-4 text-gray-500" />
                <span className="text-sm text-gray-700">{fileName}</span>
                <button
                  onClick={handleClear}
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
          <div className="mt-6 p-4 bg-red-50 border border-red-200 text-red-700 rounded-xl">
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
