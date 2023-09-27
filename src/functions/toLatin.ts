import { preferNative as matchAll } from "string-match-all";
import { CarakanConst } from "../constants/constants";
import LatinHelper from "../helpers/LatinHelper";
import { SyllableBuilder2 } from "../helpers/SyllableBuilder";

/**
 * @function toLatin
 * @description Transliterate a string in Javanese characters into its corresponding form in Latin.
 * @param input The input string in Javanese script to be converted.
 * @returns The converted string in Latin.
 * @example
 * toLatin("ꦏꦂꦪ")
 * // => karya
 */
export const toLatin = (input: string, reversible: boolean = false): string => {
  /* Trim input */
  input = input.trim();

  /*
   * Here, we break down the input on a per-syllable basis using RegEx,
   * iterate and feed it into the syllable transliterator,
   * and append the result to the output string.
   */
  const syllables = [...matchAll(input, RegExp(CarakanConst.REGEX.CAPTURE_CARAKAN, "g"))];

  let output = "";
  if (syllables.length > 0) {
    for (const group of syllables) {
      output += getTransliteration(group, reversible);
    }
  }

  if (output !== "") return output.replace(/\s{2,}/g, " ");
  return input;
};

/**
 * @description Converts the already broken down syllable into Sundanese script
 */
const getTransliteration = (groups: RegExpMatchArray, reversible: boolean): string => {
  /* Assign each capture groups into variable names */
  const [
    space,
    angka,
    ngalagena,
    cecak_telu,
    pangkon,
    con_sign,
    sandhangan1,
    sandhangan2,
    sandhangan_final,
    swara,
    pada,
  ] = groups.slice(1, 12);
  // console.log(`sp: ${space}, ctl: ${cecak_telu}, agk: ${angka}, ng: ${ngalagena}, pgk: ${pangkon}, csg: ${con_sign}, san1: ${sandhangan1}, san2: ${sandhangan2}, sf: ${sandhangan_final}, sw: ${swara}, pd: ${pada}`)

  const builder = new SyllableBuilder2();

  /* Converts syllable containing numbers */
  if (angka != null) {
    return builder.build(LatinHelper.getNumber(angka));
  }

  /* Converts syllable containing letters */
  if (ngalagena != null) {
    /* Add cecak telu to get loan letter if cecak telu indeed exists in the syllable */
    builder.add(LatinHelper.getLetter(ngalagena + (cecak_telu ?? "")));

    /* if there's no pangkon, there might be consonant sign or sandhangan*/
    if (pangkon == null) {
      /* Converts consonant sign */
      if (con_sign != null) {
        builder.add(LatinHelper.getConsonantSign(con_sign));
      }

      /* Converts sandhangan */
      if (sandhangan1 != null && sandhangan2 == null) {
        let latin_vowel = LatinHelper.getSandhangan(sandhangan1);
        if (reversible && latin_vowel.charAt(latin_vowel.length - 1) == "e") {
          latin_vowel = latin_vowel.slice(0, -1) + "x";
        }
        if (reversible && latin_vowel.charAt(latin_vowel.length - 1) == "é") {
          latin_vowel = latin_vowel.slice(0, -1) + "e";
        }
        builder.add(latin_vowel);
      } else if (sandhangan1 != null && sandhangan2 != null) {
        /* Sandhangan2 in case of taling-tarung */
        builder.add(LatinHelper.getSandhangan(sandhangan1 + sandhangan2));
      } else {
        builder.add("a");
      }

      /* Converts final sandhangan */
      if (sandhangan_final != null) {
        builder.add(LatinHelper.getSandhangan(sandhangan_final));
      }
    }
  }

  if (swara != null) {
    /* Converts swara */
    builder.add(LatinHelper.getLetter(swara));
  }

  if (pada != null) {
    /* Converts pada */
    builder.add(LatinHelper.getPada(pada));
  }

  if (space != null) {
    /* Modern Carakan is not scriptio continuo, so add space if it exists */
    builder.add(" ");
  }

  return builder.build();
};

export default toLatin;
