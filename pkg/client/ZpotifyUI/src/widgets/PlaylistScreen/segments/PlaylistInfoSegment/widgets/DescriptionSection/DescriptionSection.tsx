import { Button } from '@vervstack/chures';
import cn from 'classnames';

import cls from '@/widgets/PlaylistScreen/segments/PlaylistInfoSegment/widgets/DescriptionSection/DescriptionSection.module.css';

export interface DescriptionSectionProps {
    editMode: boolean;
    description?: string;
    editDesc: string;
    setEditDesc: (value: string) => void;
    aboutExpanded: boolean;
    handleToggleAbout: () => void;
}

export default function DescriptionSection({
    editMode,
    description,
    editDesc,
    setEditDesc,
    aboutExpanded,
    handleToggleAbout,
}: DescriptionSectionProps) {
    if (editMode) {
        return (
            <div className={cn(cls.EditSection, cls.FadeIn)}>
                <span className={cls.EditSectionLabel}>description</span>
                <textarea
                    className={cls.EditTextarea}
                    value={editDesc}
                    onChange={(e) => setEditDesc(e.target.value)}
                    placeholder="add a description…"
                    rows={3}
                />
            </div>
        );
    }

    if (!description) return null;

    return (
        <div className={cn(cls.AboutSection, cls.FadeIn)}>
            <span className={cls.SectionLabel}>about</span>
            <p className={cn(cls.AboutBody, !aboutExpanded && cls.AboutBodyClamped)}>{description}</p>
            <Button variant="ghost" className={cls.ReadMoreToggle} onClick={handleToggleAbout}>
                {aboutExpanded ? 'show less' : 'read more'}
            </Button>
        </div>
    );
}
