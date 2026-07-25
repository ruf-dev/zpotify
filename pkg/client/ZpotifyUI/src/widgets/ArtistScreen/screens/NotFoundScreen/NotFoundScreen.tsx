import cls from '@/widgets/ArtistScreen/ArtistScreenWidget.module.css';
import notFoundCls from '@/widgets/ArtistScreen/screens/NotFoundScreen/NotFoundScreen.module.css';

export default function NotFoundScreen() {
    return (
        <div className={cls.ArtistScreenContainer}>
            <div className={notFoundCls.NotFoundContainer}>
                <span className={notFoundCls.NotFoundText}>
                    Can&apos;t find this artist. Maybe they don&apos;t exist or you don&apos;t have access
                </span>
            </div>
        </div>
    );
}
