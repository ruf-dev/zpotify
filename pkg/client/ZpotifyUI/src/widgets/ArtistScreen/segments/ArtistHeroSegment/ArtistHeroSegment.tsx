import cls from '@/widgets/ArtistScreen/segments/ArtistHeroSegment/ArtistHeroSegment.module.css';
import type { Artist } from '@/app/api/zpotify';
import BackButton from '@/shared/ui/BackButton.tsx';
import EditableCoverWithFallback from '@/components/EditableCoverWithFallback/EditableCoverWithFallback.tsx';
import EditControls from '@/components/EditControls/EditControls.tsx';
import EditableArtistName from '@/widgets/ArtistScreen/components/EditableArtistName/EditableArtistName.tsx';
import { useArtistHeroSegment } from '@/widgets/ArtistScreen/segments/ArtistHeroSegment/useArtistHeroSegment.ts';

export interface ArtistHeroSegmentProps {
    artist: Artist;
    onBack: () => void;
    editMode: boolean;
    onEnterEditMode: () => void;
    onExitEditMode: () => void;
}

export default function ArtistHeroSegment(props: ArtistHeroSegmentProps) {
    const { onBack } = props;
    const context = useArtistHeroSegment(props);

    return (
        <div className={cls.ArtistHeroContainer}>
            <div className={cls.CoverWrapper}>
                <EditableCoverWithFallback {...context.backgroundCoverProps} className={cls.CoverInner} />
                <div className={cls.CoverDissolve} />
            </div>

            <div className={cls.BackButtonWrapper}>
                <BackButton onClick={onBack} />
            </div>

            <div className={cls.HeroContent}>
                <div className={cls.AvatarWrapper}>
                    <EditableCoverWithFallback {...context.avatarProps} />
                </div>

                <div className={cls.NameRow}>
                    <EditableArtistName {...context.nameProps} />
                    <div className={cls.EditControlsWrapper}>
                        <EditControls {...context.editControlsProps} />
                    </div>
                    {/* TODO: artist bio/description once Artist API exposes a description field */}
                </div>
            </div>
        </div>
    );
}
