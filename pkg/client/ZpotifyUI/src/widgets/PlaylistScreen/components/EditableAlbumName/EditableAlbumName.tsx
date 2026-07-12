import { Input } from '@vervstack/chures';

import cls from '@/widgets/PlaylistScreen/components/EditableAlbumName/EditableAlbumName.module.css';

export interface EditableAlbumNameProps {
    displayValue: string;
    isEditing: boolean;
    onChange: (value: string) => void;
}

export default function EditableAlbumName({ displayValue, isEditing, onChange }: EditableAlbumNameProps) {
    if (isEditing) {
        return <Input value={displayValue} setValue={onChange} placeholder="name…" inputClassName={cls.Input} />;
    }

    return <h1 className={cls.Display}>{displayValue}</h1>;
}
