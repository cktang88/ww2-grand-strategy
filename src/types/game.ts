// Core game phases following the turn sequence from spec
export enum GamePhase {
  COMBAT_MOVE = 'COMBAT_MOVE',
  COMBAT = 'COMBAT',
  NONCOMBAT_MOVE = 'NONCOMBAT_MOVE',
  PRODUCTION = 'PRODUCTION',
  ALLOCATION = 'ALLOCATION',
  SUPPLY_DISTRIBUTION = 'SUPPLY_DISTRIBUTION',
  CONSUMPTION = 'CONSUMPTION',
  INFRASTRUCTURE_UPDATE = 'INFRASTRUCTURE_UPDATE',
}

// Territory represents a region on the map
export interface Territory {
  id: string // unique identifier (e.g., "USA", "Germany", "France")
  name: string // display name
  owner: string | null // nation ID that controls this territory

  // Core regional variables from spec
  infrastructure: number // (I) - throughput limit per turn
  troops: number // (T) - units stationed here
  supply: number // (S) - supply received this turn

  hasResourceNode: boolean // if true, adds to national resources each turn

  // For map rendering
  coordinates?: [number, number] // optional center point for display
}

// Nation represents a player/country
export interface Nation {
  id: string // unique identifier
  name: string
  color: string // for map display

  // Core national variables from spec
  production: number // (P) - output per turn
  resources: number // (R) - stockpile of materials
  manpower: number // (M) - available workers/soldiers

  // Allocation percentages (0-100)
  workforceSplit: {
    industry: number // % to industry
    military: number // % to military (should sum to 100)
  }

  productionAllocation: {
    supply: number // % to supply
    infrastructure: number // % to infrastructure
    research: number // % to research (should sum to 100)
  }
}

// Pending troop movement
export interface TroopMove {
  id: string // unique identifier for this move
  from: string // source territory ID
  to: string // destination territory ID
  troops: number // number of troops to move
}

// Main game state
export interface GameState {
  currentPhase: GamePhase
  currentTurn: number
  currentNationId: string // which nation is currently being controlled

  nations: Record<string, Nation> // keyed by nation ID
  territories: Record<string, Territory> // keyed by territory ID

  selectedTerritoryId: string | null // for UI
  pendingMoves: TroopMove[] // moves queued during COMBAT_MOVE/NONCOMBAT_MOVE
}

// State machine transitions
export const PHASE_ORDER: GamePhase[] = [
  GamePhase.COMBAT_MOVE,
  GamePhase.COMBAT,
  GamePhase.NONCOMBAT_MOVE,
  GamePhase.PRODUCTION,
  GamePhase.ALLOCATION,
  GamePhase.SUPPLY_DISTRIBUTION,
  GamePhase.CONSUMPTION,
  GamePhase.INFRASTRUCTURE_UPDATE,
]

export const PHASE_DISPLAY_NAMES: Record<GamePhase, string> = {
  [GamePhase.COMBAT_MOVE]: 'Combat Move',
  [GamePhase.COMBAT]: 'Combat Resolution',
  [GamePhase.NONCOMBAT_MOVE]: 'Non-Combat Move',
  [GamePhase.PRODUCTION]: 'Production',
  [GamePhase.ALLOCATION]: 'Allocation',
  [GamePhase.SUPPLY_DISTRIBUTION]: 'Supply Distribution',
  [GamePhase.CONSUMPTION]: 'Consumption',
  [GamePhase.INFRASTRUCTURE_UPDATE]: 'Infrastructure Update',
}
