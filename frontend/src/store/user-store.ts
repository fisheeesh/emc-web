import { create } from "zustand"
import { createJSONStorage, persist } from "zustand/middleware"
import { immer } from "zustand/middleware/immer"

interface User {
    id: number,
    fullName: string,
    email: string,
    avatar: string,
    role: string,
    departmentId: number
}

interface State {
    user: User | null
}

interface Action {
    setUser: (user: User) => void
    clearUser: () => void
}

const initialState: State = {
    user: null
}

const useUserStore = create<State & Action>()(
    persist(
        immer((set) => ({
            ...initialState,
            setUser: (user: User) => set(state => {
                state.user = user
            }),
            clearUser: () => set(initialState)
        })),
        {
            name: "current-user",
            storage: createJSONStorage(() => sessionStorage)
        }
    )
)

export default useUserStore