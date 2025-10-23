import { useGameStore } from '../../store/gameStore'

export function PlayerDashboard() {
  const currentNationId = useGameStore((state) => state.currentNationId)
  const nations = useGameStore((state) => state.nations)
  const updateNation = useGameStore((state) => state.updateNation)

  const currentNation = nations[currentNationId]

  if (!currentNation) return null

  const handleValueChange = (field: 'production' | 'resources' | 'manpower', value: number) => {
    updateNation(currentNationId, { [field]: value })
  }

  const handleWorkforceSplit = (industry: number) => {
    updateNation(currentNationId, {
      workforceSplit: {
        industry,
        military: 100 - industry,
      },
    })
  }

  const handleProductionAllocation = (field: 'supply' | 'infrastructure' | 'research', value: number) => {
    const allocation = { ...currentNation.productionAllocation, [field]: value }

    // Keep total at 100
    const total = allocation.supply + allocation.infrastructure + allocation.research
    if (total > 100) {
      // Reduce proportionally
      const excess = total - 100
      if (field !== 'supply') allocation.supply = Math.max(0, allocation.supply - excess / 2)
      if (field !== 'infrastructure') allocation.infrastructure = Math.max(0, allocation.infrastructure - excess / 2)
      if (field !== 'research') allocation.research = Math.max(0, allocation.research - excess / 2)
    }

    updateNation(currentNationId, { productionAllocation: allocation })
  }

  return (
    <div className="bg-gray-800 rounded-lg p-4 space-y-4">
      <div className="border-b border-gray-700 pb-2">
        <h2 className="text-xl font-bold" style={{ color: currentNation.color }}>
          {currentNation.name}
        </h2>
      </div>

      {/* Core Stats */}
      <div className="space-y-2">
        <h3 className="text-sm font-semibold text-gray-400">National Stats</h3>
        <div className="grid grid-cols-3 gap-2">
          <div>
            <label className="text-xs text-gray-400">Production (P)</label>
            <input
              type="number"
              value={currentNation.production}
              onChange={(e) => handleValueChange('production', Number(e.target.value))}
              className="w-full bg-gray-700 text-white px-2 py-1 rounded text-sm"
            />
          </div>
          <div>
            <label className="text-xs text-gray-400">Resources (R)</label>
            <input
              type="number"
              value={currentNation.resources}
              onChange={(e) => handleValueChange('resources', Number(e.target.value))}
              className="w-full bg-gray-700 text-white px-2 py-1 rounded text-sm"
            />
          </div>
          <div>
            <label className="text-xs text-gray-400">Manpower (M)</label>
            <input
              type="number"
              value={currentNation.manpower}
              onChange={(e) => handleValueChange('manpower', Number(e.target.value))}
              className="w-full bg-gray-700 text-white px-2 py-1 rounded text-sm"
            />
          </div>
        </div>
      </div>

      {/* Workforce Split */}
      <div className="space-y-2">
        <h3 className="text-sm font-semibold text-gray-400">Workforce Allocation</h3>
        <div className="space-y-1">
          <div className="flex justify-between text-xs text-gray-400">
            <span>Industry: {currentNation.workforceSplit.industry}%</span>
            <span>Military: {currentNation.workforceSplit.military}%</span>
          </div>
          <input
            type="range"
            min="0"
            max="100"
            value={currentNation.workforceSplit.industry}
            onChange={(e) => handleWorkforceSplit(Number(e.target.value))}
            className="w-full"
          />
        </div>
      </div>

      {/* Production Allocation */}
      <div className="space-y-2">
        <h3 className="text-sm font-semibold text-gray-400">Production Allocation</h3>

        <div className="space-y-2">
          <div>
            <div className="flex justify-between text-xs">
              <span className="text-gray-400">Supply</span>
              <span className="text-white">{currentNation.productionAllocation.supply}%</span>
            </div>
            <input
              type="range"
              min="0"
              max="100"
              value={currentNation.productionAllocation.supply}
              onChange={(e) => handleProductionAllocation('supply', Number(e.target.value))}
              className="w-full"
            />
          </div>

          <div>
            <div className="flex justify-between text-xs">
              <span className="text-gray-400">Infrastructure</span>
              <span className="text-white">{currentNation.productionAllocation.infrastructure}%</span>
            </div>
            <input
              type="range"
              min="0"
              max="100"
              value={currentNation.productionAllocation.infrastructure}
              onChange={(e) => handleProductionAllocation('infrastructure', Number(e.target.value))}
              className="w-full"
            />
          </div>

          <div>
            <div className="flex justify-between text-xs">
              <span className="text-gray-400">Research</span>
              <span className="text-white">{currentNation.productionAllocation.research}%</span>
            </div>
            <input
              type="range"
              min="0"
              max="100"
              value={currentNation.productionAllocation.research}
              onChange={(e) => handleProductionAllocation('research', Number(e.target.value))}
              className="w-full"
            />
          </div>
        </div>

        <div className="text-xs text-gray-400 pt-1 border-t border-gray-700">
          Total: {currentNation.productionAllocation.supply + currentNation.productionAllocation.infrastructure + currentNation.productionAllocation.research}%
        </div>
      </div>
    </div>
  )
}
