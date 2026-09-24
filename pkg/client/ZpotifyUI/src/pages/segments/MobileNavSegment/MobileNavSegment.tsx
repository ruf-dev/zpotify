import UserWidget from '@/widgets/User/UserWidget.tsx';
import SidebarToggleButton from '@/pages/segments/MobileNavSegment/components/SidebarToggleButton/SidebarToggleButton.tsx';
import MobileSearchButton from '@/pages/segments/MobileNavSegment/components/MobileSearchButton/MobileSearchButton.tsx';
import MobileLogoButton from '@/pages/segments/MobileNavSegment/components/MobileLogoButton/MobileLogoButton.tsx';
import { useUISettings } from '@/entities/ui-settings/useUISettings.ts';
import cls from '@/pages/segments/MobileNavSegment/MobileNavSegment.module.css';

export default function MobileNavSegment() {
    const showSidebar = useUISettings((state) => state.showSidebar);

    return (
        <div className={cls.MobileNavContainer}>
            <MobileLogoButton />
            <div className={cls.RightGroup}>
                <MobileSearchButton />
                <UserWidget dropdownDirection="up" showUsername={false} />
                {showSidebar && <SidebarToggleButton />}
            </div>
        </div>
    );
}
