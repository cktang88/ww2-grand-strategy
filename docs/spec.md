Game Spec: Macro WW2 Strategy Game Prototype

## 1. Core Philosophy

- Minimal terminology, only a few core variables.
- No micro combat: success comes from balancing production, resources, manpower, and supply.
- Regional focus: each country is split into regions, which consume and receive supply.
- National focus: players allocate production and manpower globally via sliders/pie charts, then distribute supply to regions.
- Combat is abstract and supply-driven: undersupplied troops fight at reduced effectiveness (50%), creating strategic tension around logistics without unrealistic "starvation" mechanics.

## 2. Core Variables

- **Production (P)**: How much output a country generates per turn.
  - Base value per country.
  - Modified by workforce allocation, bombing damage, etc.
- **Resources (R)**: Stockpile of materials (oil, steel, rubber, food, etc).
  - Needed to convert Production into usable supply.
  - If missing, Production is reduced.
- **Manpower (M)**: Pool of available workers/soldiers.
  - Split each turn between Industry and Military.
- **Infrastructure (I)**: Value per region. Determines how much supply can actually enter/use in that region.
- **Troops (T)**: Number of military units stationed in each region.
- **Supply (S)**: Amount of resources+production delivered to a region each turn.

## 3. Turn Sequence

1. **Combat Move Phase**
   - Players order troops to attack enemy territories.
2. **Combat Resolution Phase**
   - Battles resolved using effective combat strength.
   - Undersupplied troops (supply < troops) fight at reduced effectiveness.
   - Combat strength calculation:
     - Fully supplied: 1:1 (e.g., 20 troops = 20 strength)
     - Undersupplied: supplied at 100%, unsupplied at 50%
     - Example: 20 troops, 15 supply → 15 + (5 × 0.5) = 17.5 effective strength
3. **Non-Combat Move Phase**
   - Players move troops to friendly territories (reinforcement).
4. **Production Phase**
   - Calculate national Production (P).
   - Modify by workforce allocation, bombing effects.
   - Check Resources (R). If insufficient, reduce effective P.
5. **Allocation Phase**
   - Player chooses global % allocation:
     - Supply
     - Infrastructure Investment (increases regional Infrastructure (I) over time)
     - Research (optional, adds multipliers later)
   - Player also allocates manpower (M) between Industry vs Military.
6. **Supply Distribution Phase**
   - Player assigns how much Supply (S) goes to each region.
   - Each region can only absorb up to its Infrastructure (I).
   - Excess is wasted.
7. **Consumption Phase**
   - No mechanical effect - supply shortfalls are tracked for combat effectiveness.
   - Troops do not die from lack of supply; undersupply only affects combat performance.
8. **Infrastructure Update**
   - If the player invested in Infra this turn, increase I in chosen regions.
   - Enemy bombing or interdiction may reduce I.

## 4. Regional Model

Each region tracks:

- **Infrastructure (I)**: Throughput limit per turn.
- **Supply received (S)**: From national allocation, capped by I.
- **Troops (T)**: Units stationed in the region.
- **Resource Nodes (optional)**: If present, add R to national stockpile each turn.

## 5. Example Turn Walkthrough

- National Production (P) = 100.
- Workforce split: 70% Industry, 30% Military. → Effective P = 70.
- Allocate: 50 → Supply, 20 → Infra. (can also choose to save up)
- Player distributes:
  - Region A: 30 supply, I=40, T=20 troops (need 20 supply) → Fully supplied, 20 combat strength.
  - Region B: 20 supply, I=15 → capped to 15, T=20 troops (need 20) → 5 troops undersupplied → 17.5 effective combat strength (15 + 5×0.5).
- Combat: Region B attacks with 20 troops but only 17.5 effective strength due to supply shortfall.
- Infra investment: +20 points spread into chosen regions (increasing I).

## 6. Victory / Defeat

- **Victory**: capture all enemy territories

## 7. Implementation Notes

- Keep the UI simple:
  - National sliders (Production allocation, manpower split).
  - Regional map: click a region to assign Supply.
  - Visual bars: Infrastructure capacity, Troop requirement vs Supply delivered.
- Only 5–6 core variables needed for computation each turn: P, R, M, I, S, T.
