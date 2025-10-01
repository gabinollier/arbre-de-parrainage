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