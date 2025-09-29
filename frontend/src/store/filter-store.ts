import { create } from 'zustand';
import { immer } from "zustand/middleware/immer";
import { persist, createJSONStorage } from "zustand/middleware";

interface Filters {
    departments: Filter[]
}

interface State {
    filters: Filters
}

interface Action {
    setFilters: (filters: Filters) => void
    clearFilters: () => void
}

const inititalState: State = {
    filters: {
        departments: []
    }
}

const useFilterStore = create<State & Action>()(
    persist(
        immer((set) => ({
            ...inititalState,
            setFilters: (filters: Filters) => set(state => {
                state.filters = filters
            }),
            clearFilters: () => set(inititalState)
        })),
        {
            name: "filters",
            storage: createJSONStorage(() => sessionStorage)
        }
    )
)

export default useFilterStore