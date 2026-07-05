import { useRef, useState } from 'react';
import cn from 'classnames';

import cls from '@/components/CoverField/CoverField.module.css';
import { UploadArrowIcon } from '@/assets/icons/UploadArrowIcon.tsx';

interface CoverFieldProps {
    cover?: File;
    onChange: (file: File) => void;
    existingCoverUrl?: string;
}

function ZLogoIcon() {
    return (
        <svg width="40" height="40" viewBox="0 0 40 40" fill="none">
            <path d="M8 10h24L8 30h24" stroke="white" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
    );
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
