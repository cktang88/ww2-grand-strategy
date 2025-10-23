import { useState, useEffect } from "react";
import {
  ComposableMap,
  Geographies,
  Geography,
  ZoomableGroup,
} from "react-simple-maps";
import { useGameStore } from "../../store/gameStore";

const geoUrl = "https://cdn.jsdelivr.net/npm/world-atlas@2/countries-110m.json";

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

export function GameMap() {
  const territories = useGameStore((state) => state.territories);
  const nations = useGameStore((state) => state.nations);
  const selectedTerritoryId = useGameStore(
    (state) => state.selectedTerritoryId
  );
  const selectTerritory = useGameStore((state) => state.selectTerritory);

  const [position, setPosition] = useState({ coordinates: [0, 0], zoom: 1 });
  const [keysPressed, setKeysPressed] = useState<Set<string>>(new Set());

  const getTerritoryColor = (geoId: string) => {
    const territory = territories[geoId];
    if (!territory) return "#374151"; // gray for unassigned

    if (territory.owner) {
      const nation = nations[territory.owner];
      return nation ? nation.color : "#374151";
    }

    return "#6b7280"; // neutral gray
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
                      if (territory && geoId) {
                        selectTerritory(geoId);
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
        </ZoomableGroup>
      </ComposableMap>
    </div>
  );
}
