import { FamilyData } from "../../types/familyTree";
import { validateData } from "./validateData";

export async function parseFamilyDataFile(file: File): Promise<FamilyData> {
  const hasJsonExtension = file.name.toLowerCase().endsWith(".json");
  const isJsonMimeType = file.type === "application/json" || file.type === "";

  if (!hasJsonExtension && !isJsonMimeType) {
    throw new Error("Veuillez sélectionner un fichier JSON valide.");
  }

  let rawContent = "";
  try {
    rawContent = await file.text();
  } catch {
    throw new Error("Erreur lors de la lecture du fichier.");
  }

  let parsedContent: FamilyData;
  try {
    parsedContent = JSON.parse(rawContent) as FamilyData;
  } catch (error) {
    throw new Error(`Erreur lors de la lecture du fichier JSON : ${(error as Error).message}`);
  }

  if (!parsedContent.children_tree) {
    throw new Error("Le fichier JSON doit contenir une propriété 'children_tree'.");
  }

  if (parsedContent.first_year === undefined || parsedContent.first_year === null) {
    throw new Error("Le fichier JSON doit contenir une propriété 'first_year'.");
  }

  if (typeof parsedContent.first_year !== "number" || !Number.isInteger(parsedContent.first_year)) {
    throw new Error("La propriété 'first_year' doit être un nombre entier.");
  }

  const validation = validateData(parsedContent.children_tree);
  if (!validation.isValid) {
    throw new Error(`Données invalides : ${validation.error}`);
  }

  return parsedContent;
}
