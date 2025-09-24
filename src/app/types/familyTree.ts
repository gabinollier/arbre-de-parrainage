export interface PersonData {
  children: string[];
  title?: string;
}

export interface Generation {
  [personName: string]: PersonData;
}

export type ChildrenTree = Generation[];

export interface ValidationResult {
  isValid: boolean;
  error: string | null;
}