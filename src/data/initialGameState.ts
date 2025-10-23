import { GameState, GamePhase, Nation, Territory } from '../types/game'

// Initial nations (simplified WW2 powers)
export const initialNations: Record<string, Nation> = {
  usa: {
    id: 'usa',
    name: 'United States',
    color: '#3b82f6', // blue
    production: 100,
    resources: 100,
    manpower: 100,
    workforceSplit: {
      industry: 70,
      military: 30,
    },
    productionAllocation: {
      supply: 50,
      infrastructure: 30,
      research: 20,
    },
  },
  germany: {
    id: 'germany',
    name: 'Germany',
    color: '#ef4444', // red
    production: 100,
    resources: 100,
    manpower: 100,
    workforceSplit: {
      industry: 70,
      military: 30,
    },
    productionAllocation: {
      supply: 50,
      infrastructure: 30,
      research: 20,
    },
  },
  ussr: {
    id: 'ussr',
    name: 'Soviet Union',
    color: '#dc2626', // darker red
    production: 100,
    resources: 100,
    manpower: 100,
    workforceSplit: {
      industry: 70,
      military: 30,
    },
    productionAllocation: {
      supply: 50,
      infrastructure: 30,
      research: 20,
    },
  },
  uk: {
    id: 'uk',
    name: 'United Kingdom',
    color: '#10b981', // green
    production: 100,
    resources: 100,
    manpower: 100,
    workforceSplit: {
      industry: 70,
      military: 30,
    },
    productionAllocation: {
      supply: 50,
      infrastructure: 30,
      research: 20,
    },
  },
}

// Initial territories mapped to ISO country codes for react-simple-maps
// Using ISO codes that match the world-110m topology
export const initialTerritories: Record<string, Territory> = {
  // USA territories
  USA: {
    id: 'USA',
    name: 'United States',
    owner: 'usa',
    infrastructure: 40,
    troops: 20,
    supply: 0,
    hasResourceNode: true,
  },

  // UK territories
  GBR: {
    id: 'GBR',
    name: 'Great Britain',
    owner: 'uk',
    infrastructure: 30,
    troops: 15,
    supply: 0,
    hasResourceNode: true,
  },
  IND: {
    id: 'IND',
    name: 'India',
    owner: 'uk',
    infrastructure: 20,
    troops: 10,
    supply: 0,
    hasResourceNode: false,
  },
  CAN: {
    id: 'CAN',
    name: 'Canada',
    owner: 'uk',
    infrastructure: 25,
    troops: 10,
    supply: 0,
    hasResourceNode: true,
  },
  AUS: {
    id: 'AUS',
    name: 'Australia',
    owner: 'uk',
    infrastructure: 20,
    troops: 10,
    supply: 0,
    hasResourceNode: false,
  },

  // Germany territories
  DEU: {
    id: 'DEU',
    name: 'Germany',
    owner: 'germany',
    infrastructure: 35,
    troops: 25,
    supply: 0,
    hasResourceNode: true,
  },
  FRA: {
    id: 'FRA',
    name: 'France',
    owner: 'germany',
    infrastructure: 30,
    troops: 15,
    supply: 0,
    hasResourceNode: true,
  },
  POL: {
    id: 'POL',
    name: 'Poland',
    owner: 'germany',
    infrastructure: 20,
    troops: 10,
    supply: 0,
    hasResourceNode: false,
  },
  ITA: {
    id: 'ITA',
    name: 'Italy',
    owner: 'germany',
    infrastructure: 25,
    troops: 15,
    supply: 0,
    hasResourceNode: false,
  },

  // USSR territories
  RUS: {
    id: 'RUS',
    name: 'Soviet Union',
    owner: 'ussr',
    infrastructure: 35,
    troops: 30,
    supply: 0,
    hasResourceNode: true,
  },

  // Neutral territories
  CHN: {
    id: 'CHN',
    name: 'China',
    owner: null,
    infrastructure: 15,
    troops: 5,
    supply: 0,
    hasResourceNode: false,
  },
  JPN: {
    id: 'JPN',
    name: 'Japan',
    owner: null,
    infrastructure: 30,
    troops: 20,
    supply: 0,
    hasResourceNode: true,
  },
  BRA: {
    id: 'BRA',
    name: 'Brazil',
    owner: null,
    infrastructure: 15,
    troops: 5,
    supply: 0,
    hasResourceNode: false,
  },
  MEX: {
    id: 'MEX',
    name: 'Mexico',
    owner: null,
    infrastructure: 10,
    troops: 5,
    supply: 0,
    hasResourceNode: false,
  },
  ESP: {
    id: 'ESP',
    name: 'Spain',
    owner: null,
    infrastructure: 15,
    troops: 5,
    supply: 0,
    hasResourceNode: false,
  },
  TUR: {
    id: 'TUR',
    name: 'Turkey',
    owner: null,
    infrastructure: 15,
    troops: 5,
    supply: 0,
    hasResourceNode: false,
  },
  EGY: {
    id: 'EGY',
    name: 'Egypt',
    owner: null,
    infrastructure: 10,
    troops: 5,
    supply: 0,
    hasResourceNode: false,
  },
  ZAF: {
    id: 'ZAF',
    name: 'South Africa',
    owner: null,
    infrastructure: 15,
    troops: 5,
    supply: 0,
    hasResourceNode: false,
  },
}

export const createInitialGameState = (): GameState => ({
  currentPhase: GamePhase.COMBAT_MOVE,
  currentTurn: 1,
  currentNationId: 'usa',
  nations: initialNations,
  territories: initialTerritories,
  selectedTerritoryId: null,
})
