import { ComposableMap, Geographies, Geography } from 'react-simple-maps'
import { useGameStore } from '../../store/gameStore'

const geoUrl = 'https://cdn.jsdelivr.net/npm/world-atlas@2/countries-110m.json'

export function GameMap() {
  const territories = useGameStore((state) => state.territories)
  const nations = useGameStore((state) => state.nations)
  const selectedTerritoryId = useGameStore((state) => state.selectedTerritoryId)
  const selectTerritory = useGameStore((state) => state.selectTerritory)

  const getTerritoryColor = (geoId: string) => {
    const territory = territories[geoId]
    if (!territory) return '#374151' // gray for unassigned

    if (territory.owner) {
      const nation = nations[territory.owner]
      return nation ? nation.color : '#374151'
    }

    return '#6b7280' // neutral gray
  }

  const isSelected = (geoId: string) => selectedTerritoryId === geoId

  return (
    <div className="w-full h-full bg-gray-800 rounded-lg overflow-hidden">
      <ComposableMap
        projection="geoMercator"
        projectionConfig={{
          scale: 120,
        }}
        style={{ width: '100%', height: '100%' }}
      >
        <Geographies geography={geoUrl}>
          {({ geographies }) =>
            geographies.map((geo) => {
              const geoId = geo.id // ISO 3-letter code
              const territory = territories[geoId]

              return (
                <Geography
                  key={geo.rsmKey}
                  geography={geo}
                  onClick={() => {
                    if (territory) {
                      selectTerritory(geoId)
                    }
                  }}
                  style={{
                    default: {
                      fill: getTerritoryColor(geoId),
                      stroke: '#1f2937',
                      strokeWidth: 0.5,
                      outline: 'none',
                    },
                    hover: {
                      fill: territory ? '#fbbf24' : '#374151',
                      stroke: '#1f2937',
                      strokeWidth: 0.5,
                      outline: 'none',
                      cursor: territory ? 'pointer' : 'default',
                    },
                    pressed: {
                      fill: '#f59e0b',
                      stroke: '#1f2937',
                      strokeWidth: 0.5,
                      outline: 'none',
                    },
                  }}
                  className={isSelected(geoId) ? 'brightness-125' : ''}
                />
              )
            })
          }
        </Geographies>
      </ComposableMap>
    </div>
  )
}
