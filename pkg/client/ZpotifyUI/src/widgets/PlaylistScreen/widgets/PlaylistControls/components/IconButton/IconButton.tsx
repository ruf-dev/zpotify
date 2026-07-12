import { Button } from '@vervstack/chures';
import cn from 'classnames';

import cls from '@/widgets/PlaylistScreen/widgets/PlaylistControls/components/IconButton/IconButton.module.css';

export interface IconButtonProps {
    ariaLabel: string;
    onClick?: () => void;
    disabled?: boolean;
    active?: boolean;
    className?: string;
    style?: React.CSSProperties;
    children: React.ReactNode;
}

export default function IconButton(props: IconButtonProps) {
    return (
        <Button
            variant="unstyled"
            className={cn(cls.IconButton, props.active && cls.IconButtonActive, props.className)}
            aria-label={props.ariaLabel}
            onClick={props.onClick}
            disabled={props.disabled}
            // eslint-disable-next-line react/forbid-component-props -- style is a passthrough for runtime CSS vars (e.g. download progress); no static module class can express it
            style={props.style}
        >
            {props.children}
        </Button>
    );
}
