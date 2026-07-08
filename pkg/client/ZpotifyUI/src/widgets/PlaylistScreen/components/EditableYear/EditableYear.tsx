import cls from '@/widgets/PlaylistScreen/components/EditableYear/EditableYear.module.css';

export interface EditableYearProps {
    displayValue: string;
    isEditing: boolean;
    onChange: (value: string) => void;
}

export default function EditableYear({ displayValue, isEditing, onChange }: EditableYearProps) {
    function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
        onChange(e.target.value);
    }

    if (isEditing) {
        return (
            // eslint-disable-next-line no-restricted-syntax -- inline meta-row editing; chures Input always renders a floating label, which breaks this UX
            <input
                type="number"
                className={cls.Input}
                value={displayValue}
                onChange={handleChange}
                placeholder="year…"
            />
        );
    }

    return <span className={cls.Display}>{displayValue}</span>;
}
