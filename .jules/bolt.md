# Bolt's Journal - Critical Learnings

## 2026-09-07 - Single-Pass Memoization for Multi-Filter UI Components
**Learning:** React components calculating derived state across lists with multiple filter predicates (e.g. category counts in NCAA eligibility tracking) re-evaluate $O(KN)$ array passes on every keystroke/render if unmemoized. Consolidating multi-attribute filtering into a single $O(N)$ pass inside `useMemo` eliminates redundant render loops while keeping input state changes smooth.
**Action:** Always wrap multi-filter category counts in `useMemo` and aggregate metrics in a single pass over the collection.
