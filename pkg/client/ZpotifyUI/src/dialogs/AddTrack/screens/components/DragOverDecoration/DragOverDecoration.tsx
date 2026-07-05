import cn from 'classnames';

import cls from '@/dialogs/AddTrack/screens/components/DragOverDecoration/DragOverDecoration.module.css';

export default function DragOverDecoration() {
    return (
        <>
            <div className={cls.DragBorder} />
            <div className={cls.RadarPulse} />
            <div className={cn(cls.RadarPulse, cls.RadarPulse2)} />
            <div className={cn(cls.RadarPulse, cls.RadarPulse3)} />
        </>
    );
}
