import { ChildrenTree, Generation, PersonData, ValidationResult } from '../types/familyTree';
import { getFrenchOrdinalName } from './frenchUtils';

export function validateData(childrenTree: ChildrenTree): ValidationResult {
  if (!Array.isArray(childrenTree)) {
    return { isValid: false, error: "'children_tree' doit être une liste." };
  }

  // Vérifier que chaque génération est un dictionnaire avec des clés et des valeurs correctes
  for (let idx = 0; idx < childrenTree.length; idx++) {
    const generation = childrenTree[idx];
    const nextGenNames = new Set(
      idx < childrenTree.length - 1 ? Object.keys(childrenTree[idx + 1]) : []
    );

    if (typeof generation !== 'object' || generation === null || Array.isArray(generation)) {
      return {
        isValid: false,
        error: `La génération à la ${getFrenchOrdinalName(idx + 1)} génération. Ce n'est pas un dictionnaire.`
      };
    }

    for (const [key, personData] of Object.entries(generation)) {
      if (typeof key !== 'string') {
        return {
          isValid: false,
          error: `La clé '${key}' dans la ${getFrenchOrdinalName(idx + 1)} génération n'est pas une chaîne de caractères.`
        };
      }

      if (typeof personData !== 'object' || personData === null || Array.isArray(personData)) {
        return {
          isValid: false,
          error: `La valeur associée à '${key}' dans la ${getFrenchOrdinalName(idx + 1)} génération n'est pas un dictionnaire.`
        };
      }

      if (!('children' in personData)) {
        return {
          isValid: false,
          error: `La clé 'children' manque pour '${key}' dans la ${getFrenchOrdinalName(idx + 1)} génération.`
        };
      }

      const children = personData.children;
      if (!Array.isArray(children)) {
        return {
          isValid: false,
          error: `La valeur 'children' pour '${key}' dans la ${getFrenchOrdinalName(idx + 1)} génération n'est pas une liste.`
        };
      }

      for (const child of children) {
        if (typeof child !== 'string') {
          return {
            isValid: false,
            error: `L'élément '${child}' dans la liste 'children' de '${key}' dans la ${getFrenchOrdinalName(idx + 1)} génération n'est pas une chaîne de caractères.`
          };
        }

        if (!nextGenNames.has(child)) {
          return {
            isValid: false,
            error: `Le nom '${child}' (biz de '${key}' dans la ${getFrenchOrdinalName(idx + 1)} génération) n'apparaît pas parmi les clés de la ${getFrenchOrdinalName(idx + 2)} génération.`
          };
        }
      }
    }
  }

  return { isValid: true, error: null };
}