import { useNavigate } from 'react-router-dom';

import cls from '@/pages/segments/MobileNavSegment/components/MobileLogoButton/MobileLogoButton.module.css';
import { Path } from '@/app/routing/paths.ts';
import AnimatedZ from '@/assets/AnimatedZ.tsx';

export default function MobileLogoButton() {
    const navigate = useNavigate();

    function handleClick() {
        navigate(Path.HomePage);
    }

    return (
        <div className={cls.MobileLogoButtonContainer} onClick={handleClick}>
            <AnimatedZ />
        </div>
    );
}
