# Bolt's Performance Journal

## 2026-09-07 - React Multi-Select List Lookup & Grouping Optimization
**Learning:** In interactive React list/board components (like Kanban boards or multi-select data tables), checking `selectedIds.includes(id)` on every item or re-filtering lists per column (`filteredProspects.filter(p => p.stage === stage)`) scales linearly ($O(N \cdot K)$ and $O(S \cdot N)$ respectively). Converting selected ID state to an $O(1)$ `Set` via `useMemo` and performing a single-pass $O(N)$ bucket/grouping operation eliminates unnecessary quadratic iterations during frequent user selection and search state updates.
**Action:** Always memoize array selection state as a lookup `Set` (`const selectedSet = useMemo(() => new Set(selectedIds), [selectedIds])`) and bucket multi-column lists in a single `useMemo` pass before rendering grid/column components.
