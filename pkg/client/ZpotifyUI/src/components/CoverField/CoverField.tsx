import { useRef, useState } from 'react';
import cn from 'classnames';

import cls from '@/components/CoverField/CoverField.module.css';
import { UploadArrowIcon } from '@/assets/icons/UploadArrowIcon.tsx';
import { ZLogoIcon } from '@/assets/icons/ZLogoIcon.tsx';
import CoverUploadProgress from '@/components/CoverUploadProgress/CoverUploadProgress.tsx';

interface CoverFieldProps {
    onChange: (file: File) => void;
    existingCoverUrl?: string;
    uploadProgress?: number;
    disabled?: boolean;
}

export default function CoverField({ onChange, existingCoverUrl, uploadProgress, disabled }: CoverFieldProps) {
    const inputRef = useRef<HTMLInputElement>(null);
    const [hover, setHover] = useState(false);
    const [previewUrl, setPreviewUrl] = useState<string | undefined>();

    function handleClick() {
        if (disabled) return;
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

    const hasBaseImage = Boolean(existingCoverUrl);
    const hasImage = hasBaseImage || Boolean(previewUrl);

    return (
        <div
            className={cn(cls.CoverFieldContainer, hasImage ? cls.HasImage : cls.NoImage)}
            onClick={handleClick}
            onMouseEnter={handleMouseEnter}
            onMouseLeave={handleMouseLeave}
        >
            <input
                ref={inputRef}
                type="file"
                accept="image/*"
                className={cls.HiddenInput}
                onChange={handleChange}
                disabled={disabled}
            />

            {hasBaseImage ? (
                <img src={existingCoverUrl} alt="playlist cover" className={cls.CoverImage} />
            ) : (
                <ZLogoIcon />
            )}

            {previewUrl && (
                <img
                    key={previewUrl}
                    src={previewUrl}
                    alt="playlist cover"
                    className={cn(cls.CoverImage, cls.PreviewImage)}
                />
            )}

            {uploadProgress !== undefined && <CoverUploadProgress progress={uploadProgress} />}

            {hover && (
                <div className={cn(cls.HoverOverlay, hasImage ? cls.OverlayRounded : cls.OverlayCircle)}>
                    <UploadArrowIcon />
                    <span className={cls.OverlayLabel}>{hasImage ? 'change' : 'add cover'}</span>
                </div>
            )}
        </div>
    );
}
