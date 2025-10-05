"use client";

import { createContext, useCallback, useContext, useMemo, useState } from "react";
import type { Person } from "../types/Person";
import { FamilyData } from "../types/familyTree";
import { generateDotData } from "../utils/generateDot";

type DataContextValue = {
  familyData: FamilyData | null;
  setFamilyData: React.Dispatch<React.SetStateAction<FamilyData | null>>;
  updateFamilyData: (updater: (data: FamilyData) => FamilyData) => void;
  clearData: () => void;
  fileName: string;
  setFileName: React.Dispatch<React.SetStateAction<string>>;
  error: string;
  setError: React.Dispatch<React.SetStateAction<string>>;
  dot: string;
  peopleTrees: Person[][][];
  isInitialLoad: boolean;
  setIsInitialLoad: React.Dispatch<React.SetStateAction<boolean>>;
};

const DataContext = createContext<DataContextValue | undefined>(undefined);

type DataProviderProps = {
  children: React.ReactNode;
};

export function DataProvider({ children }: DataProviderProps) {
  const [familyData, setFamilyData] = useState<FamilyData | null>(null);
  const [fileName, setFileName] = useState("");
  const [error, setError] = useState("");
  const [isInitialLoad, setIsInitialLoad] = useState(false);

  const { dot, trees: peopleTrees } = useMemo(
    () => (familyData ? generateDotData(familyData) : { dot: "", trees: [] }),
    [familyData]
  );

  const updateFamilyData = useCallback((updater: (data: FamilyData) => FamilyData) => {
    setFamilyData((previous) => {
      if (!previous) {
        return previous;
      }
      return updater(previous);
    });
  }, []);

  const clearData = useCallback(() => {
    setFamilyData(null);
    setFileName("");
    setError("");
    setIsInitialLoad(false);
  }, []);

  const value = useMemo(
    () => ({
      familyData,
      setFamilyData,
      updateFamilyData,
      clearData,
      fileName,
      setFileName,
      error,
      setError,
      dot,
      peopleTrees,
      isInitialLoad,
      setIsInitialLoad,
    }),
    [
      familyData,
      setFamilyData,
      updateFamilyData,
      clearData,
      fileName,
      setFileName,
      error,
      setError,
      dot,
      peopleTrees,
      isInitialLoad,
      setIsInitialLoad,
    ]
  );

  return <DataContext.Provider value={value}>{children}</DataContext.Provider>;
}

export function useData() {
  const context = useContext(DataContext);
  if (!context) {
    throw new Error("useFamilyTreeData must be used within a FamilyTreeDataProvider");
  }
  return context;
}
