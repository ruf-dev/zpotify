import { DashedRingIcon } from '@/assets/icons/DashedRingIcon';
import cls from '@/dialogs/AddTrack/screens/components/IdleDecoration/IdleDecoration.module.css';

export default function IdleDecoration() {
    return (
        <>
            <DashedRingIcon size={176} radius={82} strokeWidth={1.5} dashArray="10 8" className={cls.Ring1} />
            <DashedRingIcon size={128} radius={58} strokeWidth={1} dashArray="4 14" className={cls.Ring2} />
        </>
    );
}
