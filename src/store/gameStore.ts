import { create } from 'zustand'
import { GameState, GamePhase, PHASE_ORDER, Territory, Nation, TroopMove } from '../types/game'
import { createInitialGameState } from '../data/initialGameState'
import { areAdjacent } from '../data/territoryAdjacency'

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

  // Troop movement actions
  addMove: (from: string, to: string, troops: number) => void
  cancelMove: (moveId: string) => void
  clearMoves: () => void

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
    console.log('[STORE] selectTerritory called:', territoryId);
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

  addMove: (from: string, to: string, troops: number) => {
    console.log('[STORE] addMove called:', { from, to, troops });
    const state = get()
    const fromTerritory = state.territories[from]

    // Validate move
    if (!fromTerritory) {
      console.error(`[STORE] Invalid source territory: ${from}`)
      return
    }

    if (fromTerritory.troops < troops) {
      console.error(`[STORE] Not enough troops in ${from}: has ${fromTerritory.troops}, trying to move ${troops}`)
      return
    }

    if (!areAdjacent(from, to)) {
      console.error(`[STORE] Territories ${from} and ${to} are not adjacent`)
      return
    }

    // Create move
    const move: TroopMove = {
      id: `${from}-${to}-${Date.now()}`,
      from,
      to,
      troops,
    }

    console.log('[STORE] Move validated, adding:', move);

    // Deduct troops from source immediately
    get().updateTerritory(from, { troops: fromTerritory.troops - troops })

    // Add to pending moves
    set((state) => ({
      pendingMoves: [...state.pendingMoves, move],
    }))
  },

  cancelMove: (moveId: string) => {
    set((state) => {
      const move = state.pendingMoves.find(m => m.id === moveId)
      if (!move) return state

      // Return troops to source territory
      const fromTerritory = state.territories[move.from]
      const updatedTerritories = {
        ...state.territories,
        [move.from]: {
          ...fromTerritory,
          troops: fromTerritory.troops + move.troops,
        },
      }

      return {
        territories: updatedTerritories,
        pendingMoves: state.pendingMoves.filter(m => m.id !== moveId),
      }
    })
  },

  clearMoves: () => {
    set((state) => {
      // Return all troops to their source territories
      const updatedTerritories = { ...state.territories }

      state.pendingMoves.forEach(move => {
        const fromTerritory = updatedTerritories[move.from]
        updatedTerritories[move.from] = {
          ...fromTerritory,
          troops: fromTerritory.troops + move.troops,
        }
      })

      return {
        territories: updatedTerritories,
        pendingMoves: [],
      }
    })
  },

  resetGame: () => {
    set(createInitialGameState())
  },
}))

// Execute logic when exiting a phase (before transition) and return state updates
function executePhaseLogic(exitingPhase: GamePhase, state: GameState): Partial<GameState> {
  switch (exitingPhase) {
    case GamePhase.COMBAT_MOVE:
      return executeCombatMoves(state)
    case GamePhase.COMBAT:
      return resolveCombat(state)
    case GamePhase.NONCOMBAT_MOVE:
      return executeNonCombatMoves(state)
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

// Execute combat moves - moves troops and stages battles
function executeCombatMoves(state: GameState): Partial<GameState> {
  // Just move troops to staging positions during COMBAT_MOVE
  // Actual combat happens in COMBAT phase
  return {
    pendingMoves: state.pendingMoves, // Keep moves for combat phase
  }
}

// Execute non-combat moves (reinforcements to friendly territories)
function executeNonCombatMoves(state: GameState): Partial<GameState> {
  const updatedTerritories = { ...state.territories }

  state.pendingMoves.forEach((move) => {
    const targetTerritory = updatedTerritories[move.to]

    // Just add troops (no combat in non-combat move)
    updatedTerritories[move.to] = {
      ...targetTerritory,
      troops: targetTerritory.troops + move.troops,
    }

    console.log(`Non-combat move: ${move.troops} troops from ${move.from} to ${move.to}`)
  })

  return {
    territories: updatedTerritories,
    pendingMoves: [],
  }
}

// Resolve combat - compare troop counts and determine winners
function resolveCombat(state: GameState): Partial<GameState> {
  const updatedTerritories = { ...state.territories }

  // Group moves by destination territory to handle multiple attacks
  const movesByDestination = new Map<string, typeof state.pendingMoves>()
  state.pendingMoves.forEach((move) => {
    const existing = movesByDestination.get(move.to) || []
    movesByDestination.set(move.to, [...existing, move])
  })

  // Resolve each battle
  movesByDestination.forEach((moves, territoryId) => {
    const territory = updatedTerritories[territoryId]
    const attackingTroops = moves.reduce((sum, move) => sum + move.troops, 0)
    const defendingTroops = territory.troops
    const attacker = state.territories[moves[0].from].owner // Assumes all attackers are same nation

    console.log(`Battle at ${territory.name}: ${attackingTroops} attackers vs ${defendingTroops} defenders`)

    if (attackingTroops > defendingTroops) {
      // Attackers win
      const survivors = attackingTroops - defendingTroops
      updatedTerritories[territoryId] = {
        ...territory,
        owner: attacker,
        troops: survivors,
      }
      console.log(`  Attackers win! ${survivors} troops remaining, territory captured`)
    } else if (defendingTroops > attackingTroops) {
      // Defenders win
      const survivors = defendingTroops - attackingTroops
      updatedTerritories[territoryId] = {
        ...territory,
        troops: survivors,
      }
      console.log(`  Defenders win! ${survivors} troops remaining`)
    } else {
      // Tie - both sides eliminated
      updatedTerritories[territoryId] = {
        ...territory,
        troops: 0,
      }
      console.log(`  Both sides eliminated!`)
    }
  })

  return {
    territories: updatedTerritories,
    pendingMoves: [],
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
