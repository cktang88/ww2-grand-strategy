import { useGameStore } from '../../store/gameStore'
import { PHASE_DISPLAY_NAMES, GamePhase, PHASE_ORDER } from '../../types/game'

export function GameControls() {
  const currentPhase = useGameStore((state) => state.currentPhase)
  const currentTurn = useGameStore((state) => state.currentTurn)
  const currentNationId = useGameStore((state) => state.currentNationId)
  const nations = useGameStore((state) => state.nations)
  const nextPhase = useGameStore((state) => state.nextPhase)
  const switchPlayer = useGameStore((state) => state.switchPlayer)

  const isLastPhase = currentPhase === PHASE_ORDER[PHASE_ORDER.length - 1]

  return (
    <div className="bg-gray-800 rounded-lg p-4 space-y-4">
      {/* Turn and Phase Display */}
      <div className="border-b border-gray-700 pb-3">
        <div className="text-2xl font-bold text-white mb-1">Turn {currentTurn}</div>
        <div className="text-sm text-gray-400">
          Phase: <span className="text-blue-400 font-semibold">{PHASE_DISPLAY_NAMES[currentPhase]}</span>
        </div>
      </div>

      {/* Phase Progress */}
      <div>
        <div className="text-xs text-gray-400 mb-2">Phase Progress</div>
        <div className="space-y-1">
          {PHASE_ORDER.map((phase, index) => {
            const isCurrent = phase === currentPhase
            const isPast = PHASE_ORDER.indexOf(currentPhase) > index
            return (
              <div
                key={phase}
                className={`text-xs px-2 py-1 rounded ${
                  isCurrent
                    ? 'bg-blue-600 text-white font-semibold'
                    : isPast
                    ? 'bg-gray-700 text-gray-400 line-through'
                    : 'bg-gray-900 text-gray-500'
                }`}
              >
                {index + 1}. {PHASE_DISPLAY_NAMES[phase]}
              </div>
            )
          })}
        </div>
      </div>

      {/* Phase Control */}
      <div className="border-t border-gray-700 pt-3">
        <button
          onClick={nextPhase}
          className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-4 rounded transition-colors"
        >
          {isLastPhase ? '➔ Next Turn' : '➔ Next Phase'}
        </button>
      </div>

      {/* Player Switch */}
      <div className="border-t border-gray-700 pt-3">
        <div className="text-xs text-gray-400 mb-2">Switch Player</div>
        <div className="grid grid-cols-2 gap-2">
          {Object.values(nations).map((nation) => (
            <button
              key={nation.id}
              onClick={() => switchPlayer(nation.id)}
              className={`px-3 py-2 rounded text-sm font-medium transition-colors ${
                currentNationId === nation.id
                  ? 'ring-2 ring-white'
                  : 'opacity-60 hover:opacity-100'
              }`}
              style={{
                backgroundColor: nation.color,
                color: 'white',
              }}
            >
              {nation.name}
            </button>
          ))}
        </div>
      </div>
    </div>
  )
}
