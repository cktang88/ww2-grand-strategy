import { create } from 'zustand'
import { GameState, GamePhase, PHASE_ORDER, Territory, Nation } from '../types/game'
import { createInitialGameState } from '../data/initialGameState'

interface GameStore extends GameState {
  // State machine actions
  nextPhase: () => void

  // Player actions
  switchPlayer: (nationId: string) => void

  // Territory selection
  selectTerritory: (territoryId: string | null) => void

  // Territory editing
  updateTerritory: (territoryId: string, updates: Partial<Territory>) => void

  // Nation editing
  updateNation: (nationId: string, updates: Partial<Nation>) => void

  // Supply distribution action (for SUPPLY_DISTRIBUTION phase)
  distributeSupply: (territoryId: string, amount: number) => void

  // Reset game
  resetGame: () => void
}

export const useGameStore = create<GameStore>((set, get) => ({
  ...createInitialGameState(),

  // State machine: advance to next phase
  nextPhase: () => {
    set((state) => {
      const currentIndex = PHASE_ORDER.indexOf(state.currentPhase)
      const nextIndex = (currentIndex + 1) % PHASE_ORDER.length
      const nextPhase = PHASE_ORDER[nextIndex]

      // If we're wrapping back to COMBAT_MOVE, increment turn
      const nextTurn = nextIndex === 0 ? state.currentTurn + 1 : state.currentTurn

      // Execute phase-specific logic BEFORE transitioning and get state updates
      const updates = executePhaseLogic(state.currentPhase, state)

      return {
        ...updates,
        currentPhase: nextPhase,
        currentTurn: nextTurn,
      }
    })
  },

  switchPlayer: (nationId: string) => {
    set({ currentNationId: nationId })
  },

  selectTerritory: (territoryId: string | null) => {
    set({ selectedTerritoryId: territoryId })
  },

  updateTerritory: (territoryId: string, updates: Partial<Territory>) => {
    set((state) => ({
      territories: {
        ...state.territories,
        [territoryId]: {
          ...state.territories[territoryId],
          ...updates,
        },
      },
    }))
  },

  updateNation: (nationId: string, updates: Partial<Nation>) => {
    set((state) => ({
      nations: {
        ...state.nations,
        [nationId]: {
          ...state.nations[nationId],
          ...updates,
        },
      },
    }))
  },

  distributeSupply: (territoryId: string, amount: number) => {
    const state = get()
    const territory = state.territories[territoryId]

    // Cap supply by infrastructure
    const actualSupply = Math.min(amount, territory.infrastructure)

    get().updateTerritory(territoryId, { supply: actualSupply })
  },

  resetGame: () => {
    set(createInitialGameState())
  },
}))

// Execute logic when exiting a phase (before transition) and return state updates
function executePhaseLogic(exitingPhase: GamePhase, state: GameState): Partial<GameState> {
  switch (exitingPhase) {
    case GamePhase.PRODUCTION:
      return executeProductionPhase(state)
    case GamePhase.CONSUMPTION:
      return executeConsumptionPhase(state)
    case GamePhase.INFRASTRUCTURE_UPDATE:
      return executeInfrastructureUpdate(state)
    default:
      // Other phases don't have automatic logic
      return {}
  }
}

// Production Phase: Calculate effective production and add resources
function executeProductionPhase(state: GameState): Partial<GameState> {
  const updatedNations = { ...state.nations }

  Object.keys(updatedNations).forEach((nationId) => {
    const nation = updatedNations[nationId]

    // Add resource nodes from territories
    let resourceGain = 0
    Object.values(state.territories).forEach((territory) => {
      if (territory.owner === nationId && territory.hasResourceNode) {
        resourceGain += 10 // arbitrary value per resource node per turn
      }
    })

    // Update nation resources
    updatedNations[nationId] = {
      ...nation,
      resources: nation.resources + resourceGain,
    }

    console.log(`${nation.name}: +${resourceGain} resources (total: ${nation.resources + resourceGain})`)
  })

  return { nations: updatedNations }
}

// Consumption Phase: Check if troops are supplied, apply attrition if not
function executeConsumptionPhase(state: GameState): Partial<GameState> {
  const updatedTerritories = { ...state.territories }

  Object.keys(updatedTerritories).forEach((territoryId) => {
    const territory = updatedTerritories[territoryId]

    // Each troop requires 1 supply (can be adjusted)
    const requiredSupply = territory.troops

    if (territory.supply < requiredSupply) {
      // Attrition: unsupplied troops die
      const unsupplied = requiredSupply - territory.supply
      const newTroops = Math.max(0, territory.troops - unsupplied)

      updatedTerritories[territoryId] = {
        ...territory,
        troops: newTroops,
      }

      console.log(`${territory.name}: ${unsupplied} troops lost to attrition (${newTroops} remaining)`)
    }
  })

  return { territories: updatedTerritories }
}

// Infrastructure Update: Apply infrastructure investments (simplified - just log for now)
function executeInfrastructureUpdate(state: GameState): Partial<GameState> {
  Object.keys(state.nations).forEach((nationId) => {
    const nation = state.nations[nationId]

    // Calculate how much was allocated to infrastructure
    const effectiveProduction = nation.production * (nation.workforceSplit.industry / 100)
    const infraBudget = effectiveProduction * (nation.productionAllocation.infrastructure / 100)

    console.log(`${nation.name} infrastructure budget: ${infraBudget}`)
    // In a full implementation, player would manually choose where to spend this
  })

  return {}
}
