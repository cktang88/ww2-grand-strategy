import { useState, useEffect } from "react";
import {
  ComposableMap,
  Geographies,
  Geography,
  ZoomableGroup,
  Marker,
} from "react-simple-maps";
import { useGameStore } from "../../store/gameStore";

const geoUrl = "https://cdn.jsdelivr.net/npm/world-atlas@2/countries-110m.json";

type MapViewMode = "ownership" | "supply" | "strength";

// Map country names from world-atlas to our territory IDs
const NAME_TO_TERRITORY_ID: Record<string, string> = {
  "United States of America": "USA",
  "United Kingdom": "GBR",
  India: "IND",
  Canada: "CAN",
  Australia: "AUS",
  Germany: "DEU",
  France: "FRA",
  Poland: "POL",
  Italy: "ITA",
  Russia: "RUS",
  China: "CHN",
  Japan: "JPN",
  Brazil: "BRA",
  Mexico: "MEX",
  Spain: "ESP",
  Turkey: "TUR",
  Egypt: "EGY",
  "South Africa": "ZAF",
};

// Approximate center coordinates for troop labels
const TERRITORY_CENTERS: Record<string, [number, number]> = {
  USA: [-95, 37],
  GBR: [-2, 54],
  IND: [78, 22],
  CAN: [-100, 60],
  AUS: [133, -27],
  DEU: [10, 51],
  FRA: [2, 47],
  POL: [19, 52],
  ITA: [12, 43],
  RUS: [100, 60],
  CHN: [105, 35],
  JPN: [138, 36],
  BRA: [-52, -10],
  MEX: [-102, 23],
  ESP: [-4, 40],
  TUR: [35, 39],
  EGY: [30, 26],
  ZAF: [25, -29],
};

export function GameMap() {
  const territories = useGameStore((state) => state.territories);
  const nations = useGameStore((state) => state.nations);
  const currentNationId = useGameStore((state) => state.currentNationId);
  const selectedTerritoryId = useGameStore(
    (state) => state.selectedTerritoryId
  );
  const selectTerritory = useGameStore((state) => state.selectTerritory);

  const [position, setPosition] = useState({ coordinates: [0, 0], zoom: 1 });
  const [keysPressed, setKeysPressed] = useState<Set<string>>(new Set());
  const [viewMode, setViewMode] = useState<MapViewMode>("ownership");

  const getTerritoryColor = (geoId: string) => {
    const territory = territories[geoId];
    if (!territory) return "#374151"; // gray for unassigned

    switch (viewMode) {
      case "ownership":
        if (territory.owner) {
          const nation = nations[territory.owner];
          return nation ? nation.color : "#374151";
        }
        return "#6b7280"; // neutral gray

      case "supply": {
        // Only color current player's territories
        if (territory.owner !== currentNationId) {
          return "#6b7280"; // gray for other territories
        }

        const requiredSupply = territory.troops;
        const supplyRatio = requiredSupply > 0 ? territory.supply / requiredSupply : 1;
        if (supplyRatio >= 1) return "#22c55e"; // green - fully supplied
        if (supplyRatio >= 0.5) return "#eab308"; // yellow - partially supplied
        return "#ef4444"; // red - critically undersupplied
      }

      case "strength": {
        // Only color current player's territories
        if (territory.owner !== currentNationId) {
          return "#6b7280"; // gray for other territories
        }

        // Find max troops among current player's territories
        const ownedTerritories = Object.values(territories).filter(t => t.owner === currentNationId);
        const maxTroops = Math.max(...ownedTerritories.map(t => t.troops), 1);
        const intensity = territory.troops / maxTroops;
        const gray = Math.floor(100 + intensity * 155); // 100-255
        return `rgb(${gray}, ${gray}, ${gray})`;
      }

      default:
        return "#374151";
    }
  };

  const isSelected = (geoId: string) => selectedTerritoryId === geoId;

  const handleZoomIn = () => {
    setPosition((pos) => ({ ...pos, zoom: Math.min(pos.zoom * 1.5, 8) }));
  };

  const handleZoomOut = () => {
    setPosition((pos) => ({ ...pos, zoom: Math.max(pos.zoom / 1.5, 1) }));
  };

  // WASD panning
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const key = e.key.toLowerCase();
      if (["w", "a", "s", "d"].includes(key)) {
        e.preventDefault();
        setKeysPressed((prev) => new Set(prev).add(key));
      }
    };

    const handleKeyUp = (e: KeyboardEvent) => {
      const key = e.key.toLowerCase();
      if (["w", "a", "s", "d"].includes(key)) {
        setKeysPressed((prev) => {
          const next = new Set(prev);
          next.delete(key);
          return next;
        });
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    window.addEventListener("keyup", handleKeyUp);

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      window.removeEventListener("keyup", handleKeyUp);
    };
  }, []);

  // Pan based on keys pressed
  useEffect(() => {
    if (keysPressed.size === 0) return;

    const interval = setInterval(() => {
      setPosition((pos) => {
        const panSpeed = 20 / pos.zoom;
        const [x, y] = pos.coordinates;
        let newX = x;
        let newY = y;

        if (keysPressed.has("w")) newY += panSpeed;
        if (keysPressed.has("s")) newY -= panSpeed;
        if (keysPressed.has("a")) newX -= panSpeed;
        if (keysPressed.has("d")) newX += panSpeed;

        return { ...pos, coordinates: [newX, newY] };
      });
    }, 50);

    return () => clearInterval(interval);
  }, [keysPressed]);

  return (
    <div className="w-full h-full bg-gray-800 rounded-lg overflow-hidden relative">
      {/* View Mode Selector */}
      <div className="absolute top-4 left-4 z-10">
        <select
          value={viewMode}
          onChange={(e) => setViewMode(e.target.value as MapViewMode)}
          className="bg-gray-700 hover:bg-gray-600 text-white px-3 py-2 rounded text-sm"
        >
          <option value="ownership">Ownership</option>
          <option value="supply">Supply Status</option>
          <option value="strength">Combat Strength</option>
        </select>
      </div>

      {/* Zoom Controls */}
      <div className="absolute top-4 right-4 z-10 flex flex-col gap-2">
        <button
          onClick={handleZoomIn}
          className="bg-gray-700 hover:bg-gray-600 text-white w-10 h-10 rounded flex items-center justify-center font-bold text-xl"
          title="Zoom In"
        >
          +
        </button>
        <button
          onClick={handleZoomOut}
          className="bg-gray-700 hover:bg-gray-600 text-white w-10 h-10 rounded flex items-center justify-center font-bold text-xl"
          title="Zoom Out"
        >
          −
        </button>
      </div>

      {/* WASD Hint */}
      <div className="absolute bottom-4 right-4 z-10 bg-gray-900/80 text-gray-400 text-xs px-3 py-2 rounded">
        Use WASD to pan
      </div>

      <ComposableMap
        projection="geoMercator"
        style={{ width: "100%", height: "100%" }}
      >
        <ZoomableGroup
          center={position.coordinates as [number, number]}
          zoom={position.zoom}
          onMoveEnd={(newPosition) => setPosition(newPosition)}
        >
          <Geographies geography={geoUrl}>
            {({ geographies }) =>
              geographies.map((geo) => {
                // Map country name to our territory ID
                const countryName = geo.properties.name;
                const geoId = NAME_TO_TERRITORY_ID[countryName];
                const territory = geoId ? territories[geoId] : undefined;

                return (
                  <Geography
                    key={geo.rsmKey}
                    geography={geo}
                    onClick={() => {
                      console.log('[MAP CLICK]', {
                        countryName,
                        geoId,
                        hasTerritory: !!territory,
                        territoryData: territory
                      });
                      if (territory && geoId) {
                        console.log('[MAP] Selecting territory:', geoId);
                        selectTerritory(geoId);
                      } else {
                        console.log('[MAP] No territory found for:', countryName);
                      }
                    }}
                    style={{
                      default: {
                        fill: getTerritoryColor(geoId),
                        stroke: "#1f2937",
                        strokeWidth: 0.5,
                        outline: "none",
                      },
                      hover: {
                        fill: territory ? "#fbbf24" : "#374151",
                        stroke: "#1f2937",
                        strokeWidth: 0.5,
                        outline: "none",
                        cursor: territory ? "pointer" : "default",
                      },
                      pressed: {
                        fill: "#f59e0b",
                        stroke: "#1f2937",
                        strokeWidth: 0.5,
                        outline: "none",
                      },
                    }}
                    className={isSelected(geoId) ? "brightness-125" : ""}
                  />
                );
              })
            }
          </Geographies>

          {/* Troop Count Labels */}
          {Object.entries(territories).map(([territoryId, territory]) => {
            const coords = TERRITORY_CENTERS[territoryId];
            if (!coords) return null;

            return (
              <Marker key={`marker-${territoryId}`} coordinates={coords}>
                <text
                  textAnchor="middle"
                  style={{
                    fill: "#ffffff",
                    stroke: "#000000",
                    strokeWidth: 0.5,
                    fontSize: `${14 / position.zoom}px`,
                    fontWeight: "bold",
                    pointerEvents: "none",
                  }}
                >
                  {territory.troops}
                </text>
              </Marker>
            );
          })}
        </ZoomableGroup>
      </ComposableMap>
    </div>
  );
}
