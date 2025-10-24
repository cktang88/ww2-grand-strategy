// Defines which territories are adjacent (can move troops between them)
// This is a simplified adjacency map for the prototype
export const TERRITORY_ADJACENCY: Record<string, string[]> = {
  USA: ["MEX", "CAN"],
  CAN: ["USA", "GBR"], // Trans-Atlantic connection
  MEX: ["USA", "BRA"],
  BRA: ["MEX", "ZAF"], // Trans-Atlantic connection

  GBR: ["CAN", "FRA", "ESP"],
  FRA: ["GBR", "DEU", "ITA", "ESP"],
  ESP: ["GBR", "FRA", "EGY"], // Mediterranean connection
  DEU: ["FRA", "POL", "ITA"],
  POL: ["DEU", "RUS"],
  ITA: ["FRA", "DEU", "EGY", "TUR"],

  RUS: ["POL", "TUR", "CHN"],
  TUR: ["ITA", "RUS", "EGY"],
  EGY: ["ESP", "ITA", "TUR", "ZAF"],
  ZAF: ["BRA", "EGY", "AUS"],

  CHN: ["RUS", "JPN", "IND"],
  JPN: ["CHN"],
  IND: ["CHN", "AUS"],
  AUS: ["IND", "ZAF"],
};

// Helper function to check if two territories are adjacent
export function areAdjacent(territoryA: string, territoryB: string): boolean {
  return TERRITORY_ADJACENCY[territoryA]?.includes(territoryB) ?? false;
}

// Get all neighbors of a territory
export function getNeighbors(territoryId: string): string[] {
  return TERRITORY_ADJACENCY[territoryId] ?? [];
}
