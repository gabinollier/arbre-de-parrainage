export function getFrenchOrdinalName(number: number, isFeminine: boolean = true): string {
  if (number === 1 && !isFeminine) {
    return "1er";
  } else if (number === 1 && isFeminine) {
    return "1ère";
  } else {
    return `${number}ème`;
  }
}