import cls from '@/widgets/PlaylistScreen/components/EditableAlbumName/EditableAlbumName.module.css';

export interface EditableAlbumNameProps {
    displayValue: string;
    isEditing: boolean;
    onChange: (value: string) => void;
}

export default function EditableAlbumName({ displayValue, isEditing, onChange }: EditableAlbumNameProps) {
    function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
        onChange(e.target.value);
    }

    if (isEditing) {
        return (
            // eslint-disable-next-line no-restricted-syntax -- swaps a heading for inline editing; chures Input always renders a floating label, which breaks this UX
            <input className={cls.Input} value={displayValue} onChange={handleChange} placeholder="name…" />
        );
    }

    return <h1 className={cls.Display}>{displayValue}</h1>;
}
