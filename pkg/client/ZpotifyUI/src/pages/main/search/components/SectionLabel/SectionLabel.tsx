import cls from '@/pages/main/search/components/SectionLabel/SectionLabel.module.css';

interface SectionLabelProps {
    label: string;
    count: number;
}

export default function SectionLabel({ label, count }: SectionLabelProps) {
    return (
        <div className={cls.SectionLabelContainer}>
            <span className={cls.Label}>{label}</span>
            <span className={cls.Count}>{count}</span>
            <div className={cls.Divider} />
        </div>
    );
}
