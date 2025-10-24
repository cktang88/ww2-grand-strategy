import { useState, useEffect } from "react";
import { useGameStore } from "../../store/gameStore";
import { getNeighbors } from "../../data/territoryAdjacency";

export function CombatMovePanel() {
  const territories = useGameStore((state) => state.territories);
  const nations = useGameStore((state) => state.nations);
  const currentNationId = useGameStore((state) => state.currentNationId);
  const selectedTerritoryId = useGameStore((state) => state.selectedTerritoryId);
  const pendingMoves = useGameStore((state) => state.pendingMoves);
  const addMove = useGameStore((state) => state.addMove);
  const cancelMove = useGameStore((state) => state.cancelMove);
  const clearMoves = useGameStore((state) => state.clearMoves);

  const [sourceTerritoryId, setSourceTerritoryId] = useState<string | null>(null);
  const [targetTerritoryId, setTargetTerritoryId] = useState<string | null>(null);
  const [troopsToMove, setTroopsToMove] = useState(0);

  // Sync with map selection
  useEffect(() => {
    if (selectedTerritoryId) {
      console.log('[COMBAT PANEL] Map selected:', selectedTerritoryId);
      const territory = territories[selectedTerritoryId];

      if (territory.owner === currentNationId) {
        // Selected own territory - set as source
        console.log('[COMBAT PANEL] Setting as source');
        setSourceTerritoryId(selectedTerritoryId);
        setTargetTerritoryId(null);
        setTroopsToMove(0);
      } else if (sourceTerritoryId) {
        // Selected other territory while source is set - try to set as target
        const validTargets = getNeighbors(sourceTerritoryId);
        if (validTargets.includes(selectedTerritoryId)) {
          console.log('[COMBAT PANEL] Setting as target');
          setTargetTerritoryId(selectedTerritoryId);
        } else {
          console.log('[COMBAT PANEL] Not adjacent to source');
        }
      }
    }
  }, [selectedTerritoryId, territories, currentNationId, sourceTerritoryId]);

  const sourceTerritory = sourceTerritoryId ? territories[sourceTerritoryId] : null;
  const targetTerritory = targetTerritoryId ? territories[targetTerritoryId] : null;

  // Get territories owned by current player
  const ownedTerritories = Object.values(territories).filter(
    (t) => t.owner === currentNationId
  );

  // Get valid targets (adjacent territories)
  const validTargets = sourceTerritoryId
    ? getNeighbors(sourceTerritoryId).map((id) => territories[id])
    : [];

  const handleExecuteMove = () => {
    if (!sourceTerritoryId || !targetTerritoryId || troopsToMove <= 0) return;

    addMove(sourceTerritoryId, targetTerritoryId, troopsToMove);

    // Reset for next move
    setTroopsToMove(0);
    setTargetTerritoryId(null);
    // Keep source selected for multiple moves
  };

  return (
    <div className="bg-gray-800 rounded-lg p-4 space-y-4">
      <h2 className="text-lg font-bold border-b border-gray-700 pb-2">
        Combat Movement
      </h2>

      {/* Source Territory Selection */}
      <div>
        <label className="text-xs text-gray-400 block mb-1">
          Move from (your territory)
        </label>
        <select
          value={sourceTerritoryId || ""}
          onChange={(e) => {
            setSourceTerritoryId(e.target.value || null);
            setTargetTerritoryId(null);
            setTroopsToMove(0);
          }}
          className="w-full bg-gray-700 text-white px-2 py-1 rounded text-sm"
        >
          <option value="">Select territory...</option>
          {ownedTerritories.map((t) => (
            <option key={t.id} value={t.id}>
              {t.name} ({t.troops} troops)
            </option>
          ))}
        </select>
      </div>

      {/* Troop Amount Slider */}
      {sourceTerritory && (
        <div>
          <label className="text-xs text-gray-400 block mb-1">
            Troops to move: {troopsToMove}
          </label>
          <input
            type="range"
            min="0"
            max={sourceTerritory.troops}
            value={troopsToMove}
            onChange={(e) => setTroopsToMove(Number(e.target.value))}
            className="w-full"
          />
          <div className="flex justify-between text-xs text-gray-500 mt-1">
            <span>0</span>
            <span>Available: {sourceTerritory.troops}</span>
          </div>
        </div>
      )}

      {/* Target Territory Selection */}
      {sourceTerritory && (
        <div>
          <label className="text-xs text-gray-400 block mb-1">
            Move to (adjacent territory)
          </label>
          <select
            value={targetTerritoryId || ""}
            onChange={(e) => setTargetTerritoryId(e.target.value || null)}
            className="w-full bg-gray-700 text-white px-2 py-1 rounded text-sm"
          >
            <option value="">Select target...</option>
            {validTargets.map((t) => {
              const owner = t.owner ? nations[t.owner]?.name : "Neutral";
              const isEnemy = t.owner !== currentNationId && t.owner !== null;
              return (
                <option key={t.id} value={t.id}>
                  {t.name} - {owner} ({t.troops} troops)
                  {isEnemy ? " ⚔️" : ""}
                </option>
              );
            })}
          </select>
        </div>
      )}

      {/* Combat Preview */}
      {targetTerritory && troopsToMove > 0 && (
        <div className="bg-gray-900 p-3 rounded text-sm">
          <div className="font-semibold mb-2">Move Summary:</div>
          <div className="space-y-1">
            <div className="flex justify-between">
              <span className="text-gray-400">From:</span>
              <span>{sourceTerritory?.name}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-400">To:</span>
              <span>{targetTerritory.name}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-400">Moving:</span>
              <span className="text-blue-400">{troopsToMove} troops</span>
            </div>
            {targetTerritory.owner !== currentNationId && (
              <div className="flex justify-between text-red-400 mt-2 pt-2 border-t border-gray-700">
                <span>Enemy troops:</span>
                <span>{targetTerritory.troops}</span>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Execute Button */}
      <button
        onClick={handleExecuteMove}
        disabled={!sourceTerritoryId || !targetTerritoryId || troopsToMove <= 0}
        className="w-full bg-blue-600 hover:bg-blue-500 disabled:bg-gray-700 disabled:text-gray-500 text-white py-2 rounded font-semibold"
      >
        Execute Move
      </button>

      {/* Pending Moves List */}
      {pendingMoves.length > 0 && (
        <div className="border-t border-gray-700 pt-3">
          <div className="flex justify-between items-center mb-2">
            <h3 className="text-sm font-semibold text-gray-400">
              Pending Moves ({pendingMoves.length})
            </h3>
            <button
              onClick={clearMoves}
              className="text-xs text-red-400 hover:text-red-300"
            >
              Clear All
            </button>
          </div>
          <div className="space-y-2 max-h-40 overflow-y-auto">
            {pendingMoves.map((move) => {
              const fromName = territories[move.from]?.name;
              const toName = territories[move.to]?.name;
              return (
                <div
                  key={move.id}
                  className="bg-gray-900 p-2 rounded text-xs flex justify-between items-center"
                >
                  <div>
                    <span className="text-white">
                      {fromName} → {toName}
                    </span>
                    <span className="text-blue-400 ml-2">
                      ({move.troops} troops)
                    </span>
                  </div>
                  <button
                    onClick={() => cancelMove(move.id)}
                    className="text-red-400 hover:text-red-300"
                  >
                    ✕
                  </button>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
