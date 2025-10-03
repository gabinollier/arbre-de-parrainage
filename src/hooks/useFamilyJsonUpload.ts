'use client';

import { ChangeEvent, useCallback, useRef } from "react";
import { parseFamilyDataFile } from "../utils/parseFamilyDataFile";
import { useData } from "../context/DataContext";

export function useFamilyJsonUpload() {
  const { setFamilyData, clearData, setFileName, setError, setIsInitialLoad } = useData();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const resetInput = useCallback(() => {
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  }, []);

  const openFileDialog = useCallback(() => {
    fileInputRef.current?.click();
  }, []);

  const handleFileChange = useCallback(
    async (event: ChangeEvent<HTMLInputElement>) => {
      const file = event.target.files?.[0];
      if (!file) {
        return;
      }

      try {
        const parsedContent = await parseFamilyDataFile(file);
        setFamilyData(parsedContent);
        setFileName(file.name);
  setIsInitialLoad(true);
  setError("");
      } catch (error) {
        setError((error as Error).message);
        setFileName("");
      } finally {
        resetInput();
      }
    },
    [resetInput, setError, setFamilyData, setFileName, setIsInitialLoad],
  );

  const handleClear = useCallback(() => {
    clearData();
    setIsInitialLoad(true);
    resetInput();
  }, [clearData, resetInput, setIsInitialLoad]);

  return {
    fileInputRef,
    openFileDialog,
    handleFileChange,
    handleClear,
  };
}
