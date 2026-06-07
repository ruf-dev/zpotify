import {useState} from 'react';
import cn from 'classnames';
import {useNavigate} from 'react-router-dom';

import cls from '@/widgets/PlaylistHomeSegment/PlaylistHomeSegment.module.css';
import Pen from '@/assets/pen.svg';
import {playlistPath} from '@/app/routing/paths.ts';
import LazyLoadSongsList from '@/widgets/TrackList/LazyLoadSongsList.tsx';
import IconButton from '@/shared/ui/IconButton.tsx';
import GhostSong from '@/entities/song/GhostSong.tsx';

interface DisplayPlaylistSegmentProps {
    playlistUuid: string;
}

export default function PlaylistHomeSegment({playlistUuid}: DisplayPlaylistSegmentProps) {
    const navigate = useNavigate();
    const [isEditing, setEditing] = useState(false);
    const [totalCount, setTotalCount] = useState<number | null>(null);

    return (
        <div className={cls.PlaylistSegmentContainer}>
            <div className={cls.Header}>
                <span className={cls.Title} onClick={() => navigate(playlistPath(playlistUuid))}>
                    Global queue
                </span>
                <div className={cls.HeaderRight}>
                    {totalCount !== null && <span className={cls.TrackCount}>{totalCount} tracks</span>}
                    <IconButton onClick={() => setEditing(!isEditing)} iconPath={Pen}/>
                </div>
            </div>

            <LazyLoadSongsList
                playlistId={playlistUuid}
                onTotal={setTotalCount}/>

            <div
                className={cn(cls.GhostButtonWrapper, {
                    [cls.hidden]: !isEditing,
                })}
            >
                <GhostSong/>
            </div>
        </div>
    );
}
