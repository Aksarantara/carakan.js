/**
 * @function toStandardLatin
 * @description Transliterate a string in Javanese characters into its corresponding form in Latin.
 * @param input The input string in Javanese script to be converted.
 * @returns The converted string in Latin.
 * @example
 * toLatin("ꦏꦂꦪ")
 * // => karya
 */
export const toStandardLatin = (input: string): string => {
  /* Trim input */
  input = input.trim();

  return input.replace(/e/g, "é").replace(/x/g, "e");
};
