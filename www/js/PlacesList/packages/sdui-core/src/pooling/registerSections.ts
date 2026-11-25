import type { PoolId, PoolSectionRegistration, RegisteredPoolSection, SectionId } from "./types";

/**
 * Registers the sections of a feed by creating two types of chains:
 * 1. Feed chains: all sections in a feed are linked together
 * 2. Pool chains: all sections with the same pool id are linked together
 *
 * Feed order
 * [A (Pool 1), B (Pool 2), *C (no pool)*, D (Pool 1), E (Pool 2), F (Pool 1)]
 *
 * Feed references after registration:
 * F (Pool 1) ──previous──▶ E (Pool 2) ──previous──▶ D (Pool 1)
 *                                                       │
 *                                                    previous
 *                                                       ▼
 * A (Pool 1) ◀──previous── B (Pool 2) ◀──previous── C (no pool)
 *
 * Pool chains after registration. C is absent because it has no pool id:
 * Pool 1: F ──previous──▶ D ──previous──▶ A
 * Pool 2: E ──previous──▶ B
 */
export function registerSections(
  sections: readonly PoolSectionRegistration[],
): readonly RegisteredPoolSection[] {
  const registeredSections: RegisteredPoolSection[] = [];
  const lastSectionIdByPoolId = new Map<PoolId, SectionId>();
  let lastFeedSectionId: SectionId | undefined;

  for (const section of sections) {
    const sectionToRegister: RegisteredPoolSection = { ...section };
    if (lastFeedSectionId) {
      sectionToRegister.previousFeedSectionId = lastFeedSectionId;
    }
    if (section.poolId) {
      const previousPoolSectionId = lastSectionIdByPoolId.get(section.poolId);
      if (previousPoolSectionId) {
        sectionToRegister.previousPoolSectionId = previousPoolSectionId;
      }
      lastSectionIdByPoolId.set(section.poolId, section.sectionId);
    }

    registeredSections.push(sectionToRegister);
    lastFeedSectionId = section.sectionId;
  }

  return registeredSections;
}
