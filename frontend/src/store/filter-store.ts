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

const initialState: State = {
    filters: {
        departments: []
    }
}

const useFilterStore = create<State & Action>()(
    persist(
        immer((set) => ({
            ...initialState,
            setFilters: (filters: Filters) => set(state => {
                state.filters = filters
            }),
            clearFilters: () => set(initialState)
        })),
        {
            name: "filters",
            storage: createJSONStorage(() => sessionStorage)
        }
    )
)

export default useFilterStore