import type { TypeCode } from "../types";

export interface CharacterAsset {
  code: TypeCode;
  src: string;
  official: boolean;
}

const officialCodes = new Set<TypeCode>([
  "VOMS", "VOME", "VONS", "VONE", "VPMS", "VPME", "VPNS", "VPNE",
  "FOMS", "FOME", "FONS", "FONE", "FPMS", "FPME", "FPNS", "FPNE"
]);

export const ASSETS_VERSION = "20260720v2";

export const characterAssets = Object.fromEntries(
  ["VOMS", "VOME", "VONS", "VONE", "VPMS", "VPME", "VPNS", "VPNE", "FOMS", "FOME", "FONS", "FONE", "FPMS", "FPME", "FPNS", "FPNE"].map((code) => [
    code,
    { code, src: `/characters/${code.toLowerCase()}.webp?v=${ASSETS_VERSION}`, official: officialCodes.has(code as TypeCode) }
  ])
) as Record<TypeCode, CharacterAsset>;

export function getCharacterAsset(code: TypeCode): CharacterAsset {
  return characterAssets[code];
}
