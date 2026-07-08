import { useEffect, useRef, useState } from 'react';
import cn from 'classnames';

import cls from '@/widgets/PlaylistScreen/components/EditableCoverWithFallback/EditableCoverWithFallback.module.css';
import CoverWithFallback from '@/components/CoverWithFallback/CoverWithFallback.tsx';
import { UploadArrowIcon } from '@/assets/icons/UploadArrowIcon.tsx';
import { buildCoverUrl } from '@/shared/lib/coverUrl.ts';

export interface EditableCoverWithFallbackProps {
    coverFilePath?: string;
    uuid?: string;
    name?: string;
    isEditing: boolean;
    onFileSelect: (file: File) => void;
}

export default function EditableCoverWithFallback({
    coverFilePath,
    uuid,
    name,
    isEditing,
    onFileSelect,
}: EditableCoverWithFallbackProps) {
    const [hover, setHover] = useState(false);
    const [previewUrl, setPreviewUrl] = useState<string | undefined>();
    const inputRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        if (isEditing) setPreviewUrl(undefined);
    }, [isEditing]);

    function handleMouseEnter() {
        setHover(true);
    }

    function handleMouseLeave() {
        setHover(false);
    }

    function handleClick() {
        if (!isEditing) return;
        inputRef.current?.click();
    }

    function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
        const file = e.target.files?.[0];
        if (!file) return;
        setPreviewUrl(URL.createObjectURL(file));
        onFileSelect(file);
    }

    return (
        <div
            className={cn(cls.Wrapper, { [cls.WrapperEditing]: isEditing })}
            onMouseEnter={handleMouseEnter}
            onMouseLeave={handleMouseLeave}
            onClick={handleClick}
        >
            <CoverWithFallback
                coverUrl={previewUrl ?? buildCoverUrl(coverFilePath)}
                coverFilePath={coverFilePath}
                uuid={uuid}
                name={name}
            />
            {isEditing && hover && (
                <div className={cls.ChangeOverlay}>
                    <UploadArrowIcon />
                    <span>Change</span>
                </div>
            )}
            {/* TODO: chures Input only supports type text|password|email|number — no file picker, so this stays a raw input */}
            <input
                ref={inputRef}
                type="file"
                accept="image/*"
                className={cls.HiddenInput}
                onChange={handleFileChange}
            />
        </div>
    );
}
