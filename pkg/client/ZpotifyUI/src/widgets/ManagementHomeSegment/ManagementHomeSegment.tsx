import cn from 'classnames';

import cls from '@/widgets/ManagementHomeSegment/ManagementHomeSegment.module.css';


export default function ManagementHomeSegment() {
    return (
        <div className={cls.ManagementHomeSegmentContainer}>
            <DisplayKeys />
        </div>
    );
}

function DisplayKeys() {
    return (
        <div className={cls.KeysContainer}>
            <div className={cls.Row}>
                <div className={cls.Card}>Add playlist to home screen</div>
                <div
                    className={cn(cls.Card, {
                        [cls.inactive]: true,
                    })}
                    data-tooltip-id={'root-tooltip'}
                    data-tooltip-content={'Not available now'}
                >
                    Edit home segments
                </div>
            </div>
            <div className={cls.Row}>
                <div
                    className={cn(cls.Card, {
                        [cls.inactive]: true,
                    })}
                    data-tooltip-id={'root-tooltip'}
                    data-tooltip-content={'Not available now'}
                >
                    Upload songs
                </div>
                <div
                    className={cn(cls.Card, {
                        [cls.inactive]: true,
                    })}
                    data-tooltip-id={'root-tooltip'}
                    data-tooltip-content={'Not available now'}
                >
                    Search
                </div>
            </div>
        </div>
    );
}
