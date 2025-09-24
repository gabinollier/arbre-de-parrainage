export interface PersonData {
  children: string[];
  title?: string;
}

export interface Generation {
  [personName: string]: PersonData;
}

export interface FamilyData {
  first_year: number;
  children_tree: ChildrenTree;
}

export type ChildrenTree = Generation[];

export interface ValidationResult {
  isValid: boolean;
  error: string | null;
}