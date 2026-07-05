import cls from '@/widgets/ManagementHomeSegment/ManagementHomeSegment.module.css';
import DisplayKeys from '@/widgets/ManagementHomeSegment/components/DisplayKeys/DisplayKeys';

export default function ManagementHomeSegment() {
    return (
        <div className={cls.ManagementHomeSegmentContainer}>
            <DisplayKeys />
        </div>
    );
}
