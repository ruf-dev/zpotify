import cls from '@/widgets/PlaylistScreen/PlaylistScreenWidget.module.css';
import notFoundCls from '@/widgets/PlaylistScreen/screens/NotFoundScreen/NotFoundScreen.module.css';

export default function NotFoundScreen() {
    return (
        <div className={cls.PlaylistScreenContainer}>
            <div className={cls.AmbientWash} />
            <div className={notFoundCls.NotFoundContainer}>
                <span className={notFoundCls.NotFoundText}>
                    Can&apos;t find this playlist. Maybe it doesn&apos;t exist or you don&apos;t have an access
                </span>
            </div>
        </div>
    );
}
