import { create } from 'zustand';
import { immer } from "zustand/middleware/immer";
import { persist, createJSONStorage } from "zustand/middleware";

interface Notification {
    id: number,
    content: string,
    status: string,
    avatar: string,
    type: string,
    createdAt: string
}

interface State {
    notifications: Notification[]
}

interface Action {
    setNotis: (notis: Notification[]) => void,
    clearNotis: () => void
}

const initialState: State = {
    notifications: []
}

const useNotiStore = create<State & Action>()(
    persist(
        immer((set) => ({
            ...initialState,
            setNotis: (notis: Notification[]) => set(state => {
                state.notifications = notis
            }),
            clearNotis: () => set(initialState)
        })),
        {
            name: "notis",
            storage: createJSONStorage(() => sessionStorage)
        }
    )
)

export default useNotiStore