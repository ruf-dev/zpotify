import { useParams } from 'react-router-dom';

import useUser from '@/entities/user/useUser.ts';
import { Errors, ServiceError } from '@/shared/api/Errors.ts';
import { useArtistPage } from '@/pages/main/artist/useArtistPage.ts';
import ArtistScreenWidget from '@/widgets/ArtistScreen/ArtistScreenWidget.tsx';
import SkeletonLoadScreen from '@/widgets/ArtistScreen/screens/SkeletonLoadScreen/SkeletonLoadScreen.tsx';
import NotFoundScreen from '@/widgets/ArtistScreen/screens/NotFoundScreen/NotFoundScreen.tsx';

export default function ArtistPage() {
    const { id } = useParams<{ id: string }>();
    const userData = useUser((state) => state.userData);
    const { artistPage, isLoading, error } = useArtistPage(id);

    const isNotFound = error instanceof ServiceError && error.code === Errors.NOT_FOUND;

    if (!id || !userData) return null;

    if (isLoading) return <SkeletonLoadScreen />;

    if (isNotFound || !artistPage?.artist) return <NotFoundScreen />;

    return <ArtistScreenWidget artistPage={artistPage} />;
}
