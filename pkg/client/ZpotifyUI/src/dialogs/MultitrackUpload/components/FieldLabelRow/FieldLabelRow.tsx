import cls from '@/dialogs/MultitrackUpload/components/FieldLabelRow/FieldLabelRow.module.css';

interface FieldLabelRowProps {
    label: string;
    hint: string;
}

export default function FieldLabelRow({ label, hint }: FieldLabelRowProps) {
    return (
        <div className={cls.FieldLabelRowContainer}>
            <span className={cls.FieldLabel}>{label}</span>
            <span className={cls.FieldHint}>{hint}</span>
        </div>
    );
}
