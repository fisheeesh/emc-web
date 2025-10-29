import { create } from 'zustand';
import { immer } from "zustand/middleware/immer";
import { persist, createJSONStorage } from "zustand/middleware";

interface SystemSettings {
    positiveMin: number,
    positiveMax: number,
    neutralMin: number,
    neutralMax: number,
    negativeMin: number,
    negativeMax: number,
    criticalMin: number,
    criticalMax: number,
    watchlistTrackMin: number
}

interface State {
    settings: SystemSettings
}

interface Actions {
    setSystemSettings: (sys: SystemSettings) => void,
    clearSystemSettings: () => void
}
const initialState: State = {
    settings: {
        positiveMin: 0.4,
        positiveMax: 1.0,
        neutralMin: -0.3,
        neutralMax: 0.3,
        negativeMin: -0.7,
        negativeMax: -0.4,
        criticalMin: -1.0,
        criticalMax: -0.8,
        watchlistTrackMin: 14
    }
}

const useSystemStore = create<State & Actions>()(
    persist(
        immer((set) => ({
            ...initialState,
            setSystemSettings: (settings: SystemSettings) => set(state => {
                state.settings = settings
            }),
            clearSystemSettings: () => set(initialState)
        })),
        {
            name: "filters",
            storage: createJSONStorage(() => sessionStorage)
        }
    )
)

export default useSystemStore