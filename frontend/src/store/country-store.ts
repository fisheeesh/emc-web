import { create } from 'zustand';
import { immer } from "zustand/middleware/immer";
import { persist, createJSONStorage } from "zustand/middleware";

interface Country {
    name: string
    value: string
}

interface State {
    countries: Country[]
}

interface Action {
    setCountries: (countries: Country[]) => void
    clearCountries: () => void
}

const initialState: State = {
    countries: []
}

const useCountryStore = create<State & Action>()(
    persist(
        immer((set) => ({
            ...initialState,
            setCountries: (countries: Country[]) => set(state => {
                state.countries = countries
            }),
            clearCountries: () => set(initialState)
        })),
        {
            name: "countries",
            storage: createJSONStorage(() => sessionStorage)
        }
    )
)

export default useCountryStore