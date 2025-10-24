import { create } from 'zustand';
import { immer } from "zustand/middleware/immer";
import { persist, createJSONStorage } from "zustand/middleware";

interface Notification {
    id: number,
    content: string,
    status: "SENT" | "READ",
    avatar: string,
    type: string,
    createdAt: string
}

interface State {
    notifications: Notification[]
}

interface Action {
    setNotis: (notis: Notification[]) => void,
    updateNotificationStatus: (id: number, status: "SENT" | "READ") => void,
    deleteNotification: (id: number) => void,
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
            updateNotificationStatus: (id: number, status: "SENT" | "READ") => set(state => {
                const notification = state.notifications.find(noti => noti.id === id)
                if (notification) {
                    notification.status = status
                }
            }),
            deleteNotification: (id: number) => set(state => {
                state.notifications = state.notifications.filter(noti => noti.id !== id)
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