import EditableText from '@/widgets/PlaylistScreen/components/EditableText/EditableText.tsx';
import cls from '@/widgets/ArtistScreen/components/EditableArtistName/EditableArtistName.module.css';

export interface EditableArtistNameProps {
    displayValue: string;
    isEditing: boolean;
    onChange: (value: string) => void;
}

export default function EditableArtistName({ displayValue, isEditing, onChange }: EditableArtistNameProps) {
    return (
        <EditableText
            displayValue={displayValue}
            editValue={displayValue}
            isEditing={isEditing}
            onChange={onChange}
            displayClassName={cls.Display}
            inputClassName={cls.Input}
            placeholder="artist name…"
            displayAs="h1"
        />
    );
}
