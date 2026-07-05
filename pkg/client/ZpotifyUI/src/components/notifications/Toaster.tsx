import { motion, AnimatePresence } from 'framer-motion';

import cls from '@/components/notifications/Toaster.module.css';
import { useToaster } from '@/shared/lib/toaster/ToasterZ.ts';
import Toast from '@/components/notifications/components/Toast/Toast.tsx';

export default function Toaster() {
    const { toasts } = useToaster();

    return (
        <div className={cls.ToastContainer}>
            <AnimatePresence>
                {toasts.map((toast, idx) => (
                    <motion.div
                        key={idx}
                        layout
                        initial={{ opacity: 0, x: 100, y: 50 }} // slide in from right + slight bottom offset
                        animate={{ opacity: 1, x: 0, y: 0 }}
                        exit={{ opacity: 0, y: -50 }} // move up and fade out
                        transition={{ type: 'spring', stiffness: 300, damping: 20 }}
                    >
                        <Toast {...toast} />
                    </motion.div>
                ))}
            </AnimatePresence>
        </div>
    );
}
