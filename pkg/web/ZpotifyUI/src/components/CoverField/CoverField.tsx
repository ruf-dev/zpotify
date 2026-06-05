import { useRef, useState } from 'react';

import cls from './CoverField.module.css';

interface CoverFieldProps {
    cover?: File;
    onChange: (file: File) => void;
}

function UploadArrowIcon() {
    return (
        <svg
            width="16"
            height="16"
            viewBox="0 0 16 16"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
        >
            <path d="M8 12V4M4 8l4-4 4 4" />
            <path d="M2 14h12" />
        </svg>
    );
}

function ZLogoIcon() {
    return (
        <svg width="40" height="40" viewBox="0 0 40 40" fill="none">
            <path d="M8 10h24L8 30h24" stroke="white" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
    );
}

export default function CoverField({ cover, onChange }: CoverFieldProps) {
    const inputRef = useRef<HTMLInputElement>(null);
    const [hover, setHover] = useState(false);
    const [previewUrl, setPreviewUrl] = useState<string | undefined>();

    function handleClick() {
        inputRef.current?.click();
    }

    function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
        const file = e.target.files?.[0];
        if (!file) return;
        onChange(file);
        const url = URL.createObjectURL(file);
        setPreviewUrl(url);
    }

    const hasImage = Boolean(cover && previewUrl);

    return (
        <div
            className={`${cls.CoverFieldContainer} ${hasImage ? cls.HasImage : cls.NoImage}`}
            onClick={handleClick}
            onMouseEnter={() => setHover(true)}
            onMouseLeave={() => setHover(false)}
        >
            <input ref={inputRef} type="file" accept="image/*" className={cls.HiddenInput} onChange={handleChange} />

            {hasImage ? <img src={previewUrl} alt="playlist cover" className={cls.CoverImage} /> : <ZLogoIcon />}

            {hover && (
                <div className={`${cls.HoverOverlay} ${hasImage ? cls.OverlayRounded : cls.OverlayCircle}`}>
                    <UploadArrowIcon />
                    <span className={cls.OverlayLabel}>{hasImage ? 'change' : 'add cover'}</span>
                </div>
            )}
        </div>
    );
}
