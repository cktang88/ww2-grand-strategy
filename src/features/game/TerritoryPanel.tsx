import { useGameStore } from '../../store/gameStore'

export function TerritoryPanel() {
  const selectedTerritoryId = useGameStore((state) => state.selectedTerritoryId)
  const territories = useGameStore((state) => state.territories)
  const nations = useGameStore((state) => state.nations)
  const updateTerritory = useGameStore((state) => state.updateTerritory)
  const selectTerritory = useGameStore((state) => state.selectTerritory)

  if (!selectedTerritoryId) {
    return (
      <div className="bg-gray-800 rounded-lg p-4 text-gray-400 text-sm">
        Select a territory on the map to edit
      </div>
    )
  }

  const territory = territories[selectedTerritoryId]

  if (!territory) return null

  const handleChange = (field: keyof typeof territory, value: any) => {
    updateTerritory(selectedTerritoryId, { [field]: value })
  }

  const requiredSupply = territory.troops
  const isSupplied = territory.supply >= requiredSupply
  const unsupplied = Math.max(0, requiredSupply - territory.supply)

  return (
    <div className="bg-gray-800 rounded-lg p-4 space-y-4">
      <div className="flex justify-between items-start border-b border-gray-700 pb-2">
        <h2 className="text-xl font-bold">{territory.name}</h2>
        <button
          onClick={() => selectTerritory(null)}
          className="text-gray-400 hover:text-white"
        >
          ✕
        </button>
      </div>

      {/* Owner */}
      <div>
        <label className="text-xs text-gray-400 block mb-1">Owner</label>
        <select
          value={territory.owner || ''}
          onChange={(e) => handleChange('owner', e.target.value || null)}
          className="w-full bg-gray-700 text-white px-2 py-1 rounded text-sm"
        >
          <option value="">Neutral</option>
          {Object.values(nations).map((nation) => (
            <option key={nation.id} value={nation.id}>
              {nation.name}
            </option>
          ))}
        </select>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="text-xs text-gray-400 block mb-1">Infrastructure (I)</label>
          <input
            type="number"
            value={territory.infrastructure}
            onChange={(e) => handleChange('infrastructure', Number(e.target.value))}
            className="w-full bg-gray-700 text-white px-2 py-1 rounded text-sm"
            min="0"
          />
          <p className="text-xs text-gray-500 mt-1">Supply capacity per turn</p>
        </div>

        <div>
          <label className="text-xs text-gray-400 block mb-1">Troops (T)</label>
          <input
            type="number"
            value={territory.troops}
            onChange={(e) => handleChange('troops', Number(e.target.value))}
            className="w-full bg-gray-700 text-white px-2 py-1 rounded text-sm"
            min="0"
          />
        </div>

        <div>
          <label className="text-xs text-gray-400 block mb-1">Supply (S)</label>
          <input
            type="number"
            value={territory.supply}
            onChange={(e) => handleChange('supply', Number(e.target.value))}
            className="w-full bg-gray-700 text-white px-2 py-1 rounded text-sm"
            min="0"
            max={territory.infrastructure}
          />
          <p className="text-xs text-gray-500 mt-1">Capped by Infrastructure</p>
        </div>

        <div>
          <label className="text-xs text-gray-400 block mb-1">Resource Node</label>
          <label className="flex items-center cursor-pointer">
            <input
              type="checkbox"
              checked={territory.hasResourceNode}
              onChange={(e) => handleChange('hasResourceNode', e.target.checked)}
              className="mr-2"
            />
            <span className="text-sm text-white">Has resources</span>
          </label>
        </div>
      </div>

      {/* Supply Status */}
      <div className="border-t border-gray-700 pt-3">
        <h3 className="text-sm font-semibold text-gray-400 mb-2">Supply Status</h3>
        <div className="space-y-1 text-sm">
          <div className="flex justify-between">
            <span className="text-gray-400">Required:</span>
            <span className="text-white">{requiredSupply}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-400">Available:</span>
            <span className="text-white">{territory.supply}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-400">Status:</span>
            <span className={isSupplied ? 'text-green-400' : 'text-red-400'}>
              {isSupplied ? '✓ Fully Supplied' : `⚠ ${unsupplied} troops unsupplied`}
            </span>
          </div>
        </div>

        {!isSupplied && (
          <div className="mt-2 p-2 bg-red-900/30 border border-red-700/50 rounded text-xs text-red-300">
            Warning: {unsupplied} troops will suffer attrition during Consumption phase
          </div>
        )}
      </div>

      {/* Infrastructure Capacity Bar */}
      <div className="border-t border-gray-700 pt-3">
        <h3 className="text-sm font-semibold text-gray-400 mb-2">Infrastructure Usage</h3>
        <div className="w-full bg-gray-700 rounded-full h-4 overflow-hidden">
          <div
            className="bg-blue-500 h-full transition-all"
            style={{
              width: `${Math.min(100, (territory.supply / territory.infrastructure) * 100)}%`,
            }}
          />
        </div>
        <p className="text-xs text-gray-400 mt-1">
          {territory.supply} / {territory.infrastructure} capacity used
        </p>
      </div>
    </div>
  )
}
