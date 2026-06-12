// SECURITY: This module MUST NOT import Prisma or perform any database operations.
// It is strictly an in-memory, ephemeral algorithm. Do NOT add `import prisma` or
// call any `prisma.*.create()` / `prisma.*.update()` methods here.
// Runtime guard: if a global `prisma` instance exists, throw to prevent accidental DB writes.
if (typeof globalThis !== 'undefined' && (globalThis as any).prisma) {
  throw new Error('Security: lib/bloodCalc must not access Prisma or perform DB operations')
}

export type ABO = 'A' | 'B' | 'AB' | 'O'
export type Rh = '+' | '-'
export type Kell = 'K+' | 'K-'

export type BloodPhenotype = {
  abo: ABO
  rh: Rh
  // Kell est optionnel dans le formulaire — null = non fourni, le locus est
  // alors ignoré par l'analyse (ABO + Rhésus restent obligatoires).
  kell: Kell | null
}

export class MotherChildIncompatibilityError extends Error {
  constructor(message: string) {
    super(message)
    this.name = 'MotherChildIncompatibilityError'
  }
}

// Return values
export type PaternityResult = 'EXCLUSION' | 'INCAPACITY_TO_EXCLUDE'

// Private helpers: all in-memory, no side effects, no logging
const allABOGenotypes: string[] = ['AA', 'AO', 'BB', 'BO', 'AB', 'OO']

function genotypesForABO(phen: ABO): string[] {
  switch (phen) {
    case 'A':
      return ['AA', 'AO']
    case 'B':
      return ['BB', 'BO']
    case 'AB':
      return ['AB']
    case 'O':
      return ['OO']
  }
}

function phenotypeFromABOAlleles(a: string, b: string): ABO {
  const alleles = [a, b]
  if (alleles.includes('A') && alleles.includes('B')) return 'AB'
  if (alleles.includes('A')) return 'A'
  if (alleles.includes('B')) return 'B'
  return 'O'
}

function possibleABOChildrenFromGenotypes(mg: string, fg: string): Set<ABO> {
  const result = new Set<ABO>()
  const mAlleles = mg.split('')
  const fAlleles = fg.split('')
  for (const ma of mAlleles) {
    for (const fa of fAlleles) {
      result.add(phenotypeFromABOAlleles(ma, fa))
    }
  }
  return result
}

function possibleABOChildren(motherPhen: ABO, fatherPhen: ABO | null): Set<ABO> {
  const result = new Set<ABO>()
  const motherGens = genotypesForABO(motherPhen)
  const fatherGens = fatherPhen === null ? allABOGenotypes : genotypesForABO(fatherPhen)
  for (const mg of motherGens) {
    for (const fg of fatherGens) {
      const set = possibleABOChildrenFromGenotypes(mg, fg)
      for (const p of set) result.add(p)
    }
  }
  return result
}

// Rh: '+' may be DD or Dd; '-' is dd. Only exclusion if both parents are '-' and child is '+'
function possibleRhChildren(mother: Rh, father: Rh | null): Set<Rh> {
  const result = new Set<Rh>()
  const motherPoss = mother === '+' ? ['D', 'd'] : ['d']
  const fatherPoss = father === null ? ['D', 'd'] : father === '+' ? ['D', 'd'] : ['d']
  for (const m of motherPoss) for (const f of fatherPoss) {
    const child = m === 'd' && f === 'd' ? '-' : '+'
    result.add(child as Rh)
  }
  return result
}

// Kell: K is dominant. K- = kk, K+ = Kk or KK.
function possibleKellChildren(mother: Kell, father: Kell | null): Set<Kell> {
  const result = new Set<Kell>()
  const motherPoss = mother === 'K+' ? ['K', 'k'] : ['k']
  const fatherPoss = father === null ? ['K', 'k'] : father === 'K+' ? ['K', 'k'] : ['k']
  for (const m of motherPoss) for (const f of fatherPoss) {
    const child = m === 'k' && f === 'k' ? 'K-' : 'K+'
    result.add(child as Kell)
  }
  return result
}

/**
 * Main paternity assessment function.
 * - Validates mother-child biological coherence first (throws MotherChildIncompatibilityError)
 * - Then checks if the provided father CAN be excluded (returns 'EXCLUSION')
 * - Otherwise returns 'INCAPACITY_TO_EXCLUDE'
 *
 * Important: purely in-memory, no logging, no global state, no DB access.
 */
export function assessPaternity(mother: BloodPhenotype, father: BloodPhenotype, child: BloodPhenotype): PaternityResult {
  // 1) Mother-child coherence check (ABO-focused). If impossible regardless of father -> throw.
  const possibleChildFromMotherWithAnyFather = possibleABOChildren(mother.abo, null)
  if (!possibleChildFromMotherWithAnyFather.has(child.abo)) {
    // Example: mother O cannot have child AB regardless of father
    throw new MotherChildIncompatibilityError(`Incompatible mother/child ABO phenotypes: mother=${mother.abo} child=${child.abo}`)
  }

  // 2) Check ABO compatibility with the provided father
  const possibleABOWithThisFather = possibleABOChildren(mother.abo, father.abo)
  const aboCompatible = possibleABOWithThisFather.has(child.abo)

  // 3) Check Rh compatibility: only exclusion if both parents '-' and child '+'
  const rhPossibleWithThisParents = possibleRhChildren(mother.rh, father.rh)
  const rhCompatible = rhPossibleWithThisParents.has(child.rh)

  // 4) Kell rule (only when the three phenotypes are provided):
  //    two K- parents cannot have K+ child
  const kellProvided = mother.kell !== null && father.kell !== null && child.kell !== null
  if (kellProvided && mother.kell === 'K-' && father.kell === 'K-' && child.kell === 'K+') {
    return 'EXCLUSION'
  }

  const kellPossible = !kellProvided ||
    possibleKellChildren(mother.kell as Kell, father.kell as Kell).has(child.kell as Kell)

  // If any of the loci are impossible with the provided father -> EXCLUSION
  if (!aboCompatible || !rhCompatible || !kellPossible) return 'EXCLUSION'

  // Otherwise we cannot exclude paternity based on these loci
  return 'INCAPACITY_TO_EXCLUDE'
}
