Game Spec: Macro WW2 Strategy Game Prototype
1. Core Philosophy
	• Minimal terminology, only a few core variables.
	• No micro combat: success comes from balancing production, resources, manpower, and supply.
	• Regional focus: each country is split into regions, which consume and receive supply.
	• National focus: players allocate production and manpower globally via sliders/pie charts, then distribute supply to regions.
	• Combat is purely abstract: if a region’s troops aren’t fed enough supply, they weaken or collapse.

2. Core Variables
	• Production (P): How much output a country generates per turn.
		○ Base value per country.
		○ Modified by workforce allocation, bombing damage, etc.
	• Resources (R): Stockpile of materials (oil, steel, rubber, food, etc).
		○ Needed to convert Production into usable supply.
		○ If missing, Production is reduced.
	• Manpower (M): Pool of available workers/soldiers.
		○ Split each turn between Industry and Military.
	• Infrastructure (I): Value per region. Determines how much supply can actually enter/use in that region.
	• Troops (T): Number of military units stationed in each region.
	• Supply (S): Amount of resources+production delivered to a region each turn.

3. Turn Sequence
	1. <MOVE + COMBAT  MOVE + NONCOMBAT MOVE PHASES>
	2. Production Phase
		○ Calculate national Production (P).
		○ Modify by workforce allocation, bombing effects.
		○ Check Resources (R). If insufficient, reduce effective P.
	3. Allocation Phase
		○ Player chooses global % allocation:
			§ Supply
			§ Infrastructure Investment (increases regional Infrastructure (I) over time)
			§ Research (optional, adds multipliers later)
		○ Player also allocates manpower (M) between Industry vs Military.
	4. Supply Distribution Phase
		○ Player assigns how much Supply (S) goes to each region.
		○ Each region can only absorb up to its Infrastructure (I).
		○ Excess is wasted.
	5. Consumption Phase (Regions)
		○ Each region’s troops (T) require a minimum supply each turn.
		○ If S ≥ troop requirement, region operates normally.
		○ If S < troop requirement, excess troops suffer attrition (disbanded/die).
	6. Infrastructure Update
		○ If the player invested in Infra this turn, increase I in chosen regions.
		○ Enemy bombing or interdiction may reduce I.

4. Regional Model
Each region tracks:
	• Infrastructure (I): Throughput limit per turn.
	• Supply received (S): From national allocation, capped by I.
	• Troops (T): Units stationed in the region.
	• Resource Nodes (optional): If present, add R to national stockpile each turn.

5. Example Turn Walkthrough
	• National Production (P) = 100.
	• Workforce split: 70% Industry, 30% Military. → Effective P = 70.
	• Allocate: 50 → Supply, 20 → Infra. (can also choose to save up)
	• Player distributes:
		○ Region A: 30 supply, I=40, T=20 troops (need 20 supply) → OK.
		○ Region B: 20 supply, I=15 → capped to 15, T=20 troops (need 20) → 5 troops unsupplied → attrition.
	• Infra investment: +20 points spread into chosen regions (increasing I).

6. Victory / Defeat
	• Victory: capture all enemy territories

7. Implementation Notes
	• Keep the UI simple:
		○ National sliders (Production allocation, manpower split).
		○ Regional map: click a region to assign Supply.
		○ Visual bars: Infrastructure capacity, Troop requirement vs Supply delivered.
Only 5–6 core variables needed for computation each turn: P, R, M, I, S, T.