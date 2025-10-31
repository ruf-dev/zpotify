import {create} from "zustand";
import {ErrorReason, ServiceError} from "@/processes/Errors.ts";

export interface Toast {
    title: string;
    description: string

    level?: 'Error' | 'Warn' | 'Info'

    isDismissable?: boolean;
}

export interface Toaster {
    toasts: Toast[];

    bake: (t: Toast) => void;
    dismiss: (title: string) => void;

    catch: (e: ServiceError) => void
}

export const useToaster = create<Toaster>(
    (set, get) => ({
        toasts: [],

        bake: (newToast: Toast) => {

            const oldToast = get().toasts.find((t: Toast) => t.title === newToast.title)
            if (oldToast) {
                console.error(`Toast with title ${newToast.title} already exists`)
                return
            }
            set((state: Toaster) => ({toasts: [...state.toasts, newToast]}));

            setTimeout(() => {
                get().dismiss(newToast.title);
            }, 5000);
        },

        dismiss: (title: string) => {
            set((state) => ({
                toasts: state.toasts.filter((t: Toast) => t.title !== title),
            }));
        },

        catch: (e: ServiceError) => {
            if (e.reason && internalErrors.includes(e.reason)) return

            console.log(e)

            get().bake({
                title: e.title,
                description: e.details,
                level: 'Error',
                isDismissable: true,
            } as Toast)
        }
    }));


const internalErrors: ErrorReason[] = [
    ErrorReason.ACCESS_TOKEN_NOT_FOUND,
    ErrorReason.REFRESH_TOKEN_NOT_FOUND,
]
