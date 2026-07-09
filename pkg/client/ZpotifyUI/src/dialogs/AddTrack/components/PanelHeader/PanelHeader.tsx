import { ModalClose } from '@vervstack/chures';

import cls from '@/dialogs/AddTrack/components/PanelHeader/PanelHeader.module.css';
import modalCloseCls from '@/shared/ui/ModalCloseButton.module.css';
import StepDots from '@/shared/ui/StepDots';
import BackButton from '@/shared/ui/BackButton';
import type { ModalStep } from '@/dialogs/AddTrack/AddTrackDialog';

const DOT_STEPS: ModalStep[] = ['choose', 'drop'];

const STEP_TITLES: Record<ModalStep, string> = {
    choose: 'add track(s)',
    drop: 'upload new track',
    pending: 'pending uploads',
};

interface PanelHeaderProps {
    step: ModalStep;
    backStep: ModalStep | undefined;
    uploading: boolean;
    onBack: () => void;
    onClose: () => void;
}

export default function PanelHeader({ step, backStep, uploading, onBack, onClose }: PanelHeaderProps) {
    return (
        <div className={cls.PanelHeaderContainer}>
            <div className={cls.HeaderLeft}>
                {backStep && !uploading && <BackButton onClick={onBack} />}
                <span className={cls.PanelTitle}>{STEP_TITLES[step]}</span>
            </div>

            <div className={cls.HeaderRight}>
                <StepDots steps={DOT_STEPS} currentStep={step} />

                <ModalClose className={modalCloseCls.ModalCloseButton} onClick={onClose} />
            </div>
        </div>
    );
}
