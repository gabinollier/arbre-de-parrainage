export function isNameValid(name: string, generationNames: string[]): { valid: boolean; error?: string } {
  if (name.trim() === "") {
    return { valid: false, error: "Le nom ne peut pas être vide." };
  }
  else if (name.includes(",")
    || name.includes(";")
    || name.includes(":")
    || name.includes("\"")
    || name.includes("\\")
    || name.includes("{")
    || name.includes("}")
    || name.includes("[")
    || name.includes("]")
    || name.includes("<")
    || name.includes(">")
    ) {
    return { valid: false, error: "Le nom contient des caractères invalides parmi , ; : \" \\ { } [ ] < >" };
  }
  else if (name.length > 100) {
    return { valid: false, error: "Le nom est trop long." };
  }
  else if (generationNames.includes(name)) {
    return { valid: false, error: "Ce nom est déjà utilisé dans cette génération." };
 }

  return { valid: true };
}

export const INVISIBLE_ROLE = "Invisible";

export function isInvisibleRole(title: string | null | undefined): boolean {
  return (title ?? "").trim().toLowerCase() === INVISIBLE_ROLE.toLowerCase();
}

/**
 * Vérifie qu'une personne peut recevoir le rôle "Invisible".
 * - Affiche un warning si la personne a 0 parent ou 0 enfant (elle
 *   n'apparaîtra pas reliée dans le graphe tant que ce n'est pas le cas).
 * - Plusieurs parents et enfants sont autorisés : le graphe relie alors
 *   chacun des parents à chacun des enfants.
 */
export function validateInvisibleRole(
  parentCount: number,
  childCount: number,
): { warning?: string } {
  const missing: string[] = [];
  if (parentCount === 0) {
    missing.push("pas de parrain/marraine");
  }
  if (childCount === 0) {
    missing.push("pas d'enfant");
  }

  if (missing.length > 0) {
    return {
      warning: `Le rôle "${INVISIBLE_ROLE}" rend la personne invisible dans le graphe et relie son parrain/sa marraine directement à son/sa biz. Attention : elle n'a ${missing.join(" et n'a ")}.`,
    };
  }

  return {};
}

export function isTitleValid(title: string): { valid: boolean; error?: string } {
  if (title.length > 100) {
    return { valid: false, error: "Le titre est trop long." };
  } else if (title.includes(",")
    || title.includes(";")
    || title.includes(":")
    || title.includes("\"")
    || title.includes("\\")
    || title.includes("{")
    || title.includes("}")
    || title.includes("[")
    || title.includes("]")
    || title.includes("<")
    || title.includes(">")
    ) {
    return { valid: false, error: "Le titre contient des caractères invalides parmi , ; : \" \\ { } [ ] < >" };
  }
  return { valid: true };
}