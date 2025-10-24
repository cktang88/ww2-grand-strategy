import { GameMap } from './features/game/GameMap'
import { PlayerDashboard } from './features/game/PlayerDashboard'
import { TerritoryPanel } from './features/game/TerritoryPanel'
import { GameControls } from './features/game/GameControls'
import { CombatMovePanel } from './features/game/CombatMovePanel'
import { useGameStore } from './store/gameStore'
import { GamePhase } from './types/game'

function App() {
  const currentPhase = useGameStore((state) => state.currentPhase)

  // Show CombatMovePanel during movement phases
  const showCombatPanel =
    currentPhase === GamePhase.COMBAT_MOVE ||
    currentPhase === GamePhase.NONCOMBAT_MOVE

  return (
    <div className="min-h-screen bg-gray-900 text-white p-4">
      <header className="mb-4">
        <h1 className="text-3xl font-bold text-center">
          WW2 Grand Strategy Prototype
        </h1>
      </header>

      <div className="grid grid-cols-12 gap-4 h-[calc(100vh-8rem)]">
        {/* Left Sidebar - Player Dashboard */}
        <div className="col-span-3 space-y-4 overflow-y-auto">
          <PlayerDashboard />
          <GameControls />
        </div>

        {/* Center - Map */}
        <div className="col-span-6 h-full">
          <GameMap />
        </div>

        {/* Right Sidebar - Context Panel */}
        <div className="col-span-3 overflow-y-auto space-y-4">
          {showCombatPanel ? <CombatMovePanel /> : <TerritoryPanel />}
        </div>
      </div>
    </div>
  )
}

export default App
