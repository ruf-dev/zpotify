import { SidebarToggleIcon } from '@/assets/icons/SidebarToggleIcon.tsx';
import { useSidebarUI } from '@/shared/model/sidebarUIStore.ts';
import cls from '@/pages/segments/MobileNavSegment/components/SidebarToggleButton/SidebarToggleButton.module.css';

export default function SidebarToggleButton() {
    const isDrawerOpen = useSidebarUI((state) => state.isDrawerOpen);
    const toggle = useSidebarUI((state) => state.toggleDrawer);

    return (
        <button type="button" className={cls.SidebarToggleButtonContainer} onClick={toggle}>
            <SidebarToggleIcon isOpen={isDrawerOpen} />
        </button>
    );
}
