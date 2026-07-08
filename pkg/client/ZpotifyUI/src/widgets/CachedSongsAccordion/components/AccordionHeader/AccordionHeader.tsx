import { Button, ChevronDownIcon } from '@vervstack/chures';
import cn from 'classnames';

import cls from '@/widgets/CachedSongsAccordion/components/AccordionHeader/AccordionHeader.module.css';

interface AccordionHeaderProps {
    label: string;
    count: number;
    expanded: boolean;
    onToggle: () => void;
}

export default function AccordionHeader({ label, count, expanded, onToggle }: AccordionHeaderProps) {
    return (
        <Button variant="ghost" className={cls.AccordionHeaderContainer} onClick={onToggle} aria-expanded={expanded}>
            <span className={cls.HeaderLabel}>{label}</span>
            <span className={cls.HeaderCount}>{count}</span>
            <span className={cn(cls.Chevron, expanded && cls.ChevronOpen)}>
                <ChevronDownIcon size={12} />
            </span>
        </Button>
    );
}
