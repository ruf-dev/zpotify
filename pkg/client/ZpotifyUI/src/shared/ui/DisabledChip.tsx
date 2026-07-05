import cls from '@/shared/ui/DisabledChip.module.css';

interface DisabledChipProps {
    icon: React.ReactNode;
    label: string;
    value: string;
}

export default function DisabledChip({ icon, label, value }: DisabledChipProps) {
    return (
        <span className={cls.DisabledChipContainer} title={`${label} (calculated)`}>
            <span className={cls.Icon}>{icon}</span>
            <span className={cls.Label}>{label}</span>
            <span className={cls.Value}>{value}</span>
        </span>
    );
}
