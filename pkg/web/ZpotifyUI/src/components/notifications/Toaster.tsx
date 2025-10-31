import cls from '@/components/notifications/Toast.module.css';
import cn from "classnames";
import {Toast as ToastProp, useToaster} from "@/hooks/toaster/ToasterZ.ts";

export default function Toaster() {
    const {toasts} = useToaster();

    return (
        <div className={cls.ToastContainer}>
            {toasts.map((toast, idx) => (
                <div key={idx}>
                    <Toast {...toast}/>
                </div>
            ))}
        </div>
    )
}


function Toast({title, description}: ToastProp) {
    return (
        <div
            className={cn(cls.Toast, {
                [cls.error]: title === 'Error',
                [cls.warn]: title === 'Warn',
                [cls.info]: title == undefined || title === 'Info',
            })}>
            <div>{title}</div>
            <div className={cls.Description}> {description}</div>
        </div>
    )
}
