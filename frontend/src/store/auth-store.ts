import { create } from 'zustand';
import { immer } from "zustand/middleware/immer";
import { persist, createJSONStorage } from "zustand/middleware";

export const Status = {
    otp: 'otp',
    reset: 'reset',
    none: 'none'
}

export type Status = typeof Status[keyof typeof Status];

type State = {
    email: string | null,
    token: string | null,
    status: Status
}

type Actions = {
    setAuth: (email: string, token: string, status: string) => void
    clearAuth: () => void
}

const intitalState = {
    email: null,
    token: null,
    status: Status.none
}

const useAuthStore = create<State & Actions>()(
    persist(
        immer((set) => ({
            ...intitalState,
            setAuth: (email, token, status) => set(state => {
                state.email = email
                state.token = token
                state.status = status
            }),
            clearAuth: () => set(intitalState)
        })),
        {
            name: "auth-credentials",
            storage: createJSONStorage(() => sessionStorage)
        }
    )
)

export default useAuthStore