import { useRef, useState } from 'react';
import cn from 'classnames';

import cls from '@/components/CoverField/CoverField.module.css';
import { UploadArrowIcon } from '@/assets/icons/UploadArrowIcon.tsx';
import { ZLogoIcon } from '@/assets/icons/ZLogoIcon.tsx';

interface CoverFieldProps {
    cover?: File;
    onChange: (file: File) => void;
    existingCoverUrl?: string;
}

export default function CoverField({ cover, onChange, existingCoverUrl }: CoverFieldProps) {
    const inputRef = useRef<HTMLInputElement>(null);
    const [hover, setHover] = useState(false);
    const [previewUrl, setPreviewUrl] = useState<string | undefined>();

    function handleClick() {
        inputRef.current?.click();
    }

    function handleMouseEnter() {
        setHover(true);
    }

    function handleMouseLeave() {
        setHover(false);
    }

    function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
        const file = e.target.files?.[0];
        if (!file) return;
        onChange(file);
        const url = URL.createObjectURL(file);
        setPreviewUrl(url);
    }

    const hasImage = Boolean((cover && previewUrl) || existingCoverUrl);
    const displayUrl = previewUrl ?? existingCoverUrl;

    return (
        <div
            className={cn(cls.CoverFieldContainer, hasImage ? cls.HasImage : cls.NoImage)}
            onClick={handleClick}
            onMouseEnter={handleMouseEnter}
            onMouseLeave={handleMouseLeave}
        >
            <input ref={inputRef} type="file" accept="image/*" className={cls.HiddenInput} onChange={handleChange} />

            {hasImage ? <img src={displayUrl} alt="playlist cover" className={cls.CoverImage} /> : <ZLogoIcon />}

            {hover && (
                <div className={cn(cls.HoverOverlay, hasImage ? cls.OverlayRounded : cls.OverlayCircle)}>
                    <UploadArrowIcon />
                    <span className={cls.OverlayLabel}>{hasImage ? 'change' : 'add cover'}</span>
                </div>
            )}
        </div>
    );
}
