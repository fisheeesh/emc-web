import { create } from "zustand"
import { createJSONStorage, persist } from "zustand/middleware"
import { immer } from "zustand/middleware/immer"

interface User {
    id: number,
    fullName: string,
    email: string,
    avatar: string,
    role: string
}

interface State {
    user: User | null
}

interface Action {
    setUser: (user: User) => void
    clearUser: () => void
}

const inititalState: State = {
    user: null
}

const useUserStore = create<State & Action>()(
    persist(
        immer((set) => ({
            ...inititalState,
            setUser: (user: User) => set(state => {
                state.user = user
            }),
            clearUser: () => set(inititalState)
        })),
        {
            name: "current-user",
            storage: createJSONStorage(() => sessionStorage)
        }
    )
)

export default useUserStore