import { useEffect, useRef, useState } from 'react';
import cn from 'classnames';

import cls from '@/components/EditableCoverWithFallback/EditableCoverWithFallback.module.css';
import CoverWithFallback from '@/components/CoverWithFallback/CoverWithFallback.tsx';
import CoverUploadProgress from '@/components/CoverUploadProgress/CoverUploadProgress.tsx';
import { UploadArrowIcon } from '@/assets/icons/UploadArrowIcon.tsx';
import { buildCoverUrl } from '@/shared/lib/coverUrl.ts';

export interface EditableCoverWithFallbackProps {
    coverFilePath?: string;
    uuid?: string;
    name?: string;
    isEditing: boolean;
    onFileSelect: (file: File) => void;
    uploadProgress?: number;
    disabled?: boolean;
    shape?: 'circle' | 'rect';
    className?: string;
}

export default function EditableCoverWithFallback(props: EditableCoverWithFallbackProps) {
    const [hover, setHover] = useState(false);
    const [previewUrl, setPreviewUrl] = useState<string | undefined>();
    const inputRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        if (props.isEditing) setPreviewUrl(undefined);
    }, [props.isEditing]);

    function handleMouseEnter() {
        setHover(true);
    }

    function handleMouseLeave() {
        setHover(false);
    }

    function handleClick() {
        if (!props.isEditing || props.disabled) return;
        inputRef.current?.click();
    }

    function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
        const file = e.target.files?.[0];
        if (!file) return;
        setPreviewUrl(URL.createObjectURL(file));
        props.onFileSelect(file);
    }

    return (
        <div
            className={cn(
                cls.Wrapper,
                { [cls.WrapperEditing]: props.isEditing, [cls.WrapperCircle]: props.shape === 'circle' },
                props.className,
            )}
            onMouseEnter={handleMouseEnter}
            onMouseLeave={handleMouseLeave}
            onClick={handleClick}
        >
            <CoverWithFallback
                coverUrl={buildCoverUrl(props.coverFilePath)}
                coverFilePath={props.coverFilePath}
                uuid={props.uuid}
                name={props.name}
            />
            {previewUrl && (
                <img key={previewUrl} src={previewUrl} alt={props.name ?? ''} className={cls.PreviewImage} />
            )}
            {props.uploadProgress !== undefined && <CoverUploadProgress progress={props.uploadProgress} />}
            {props.isEditing && hover && (
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
                disabled={props.disabled}
            />
        </div>
    );
}
