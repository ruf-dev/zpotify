import { useEffect, useState } from 'react';
import { ModalActions, ModalClose } from '@vervstack/chures';
import ReactMarkdown from 'react-markdown';
import rehypeSanitize from 'rehype-sanitize';

import cls from '@/dialogs/Notification/NotificationDialog.module.css';
import modalCloseCls from '@/shared/ui/ModalCloseButton.module.css';
import { useDialog } from '@/app/hooks/Dialog.tsx';
import { useToaster } from '@/shared/lib/toaster/ToasterZ.ts';
import { ServiceError } from '@/shared/api/Errors.ts';
import useNotifications from '@/entities/notification/useNotifications.ts';
import type { Notification } from '@/app/api/zpotify';

interface NotificationDialogProps {
    notification: Notification;
}

export default function NotificationDialog({ notification }: NotificationDialogProps) {
    const { CloseDialog, LockClosing, UnlockClosing } = useDialog();
    const toaster = useToaster();
    const consent = useNotifications((s) => s.consent);

    const [isConsented, setIsConsented] = useState(Boolean(notification.consented));
    const [isSubmitting, setIsSubmitting] = useState(false);

    const needsConsent = Boolean(notification.requiresConsent) && !isConsented;

    useEffect(() => {
        if (needsConsent) LockClosing();
        return () => UnlockClosing();
    }, []);

    function handleAgree() {
        if (isSubmitting || !notification.id) return;
        setIsSubmitting(true);

        consent(notification.id)
            .then(() => {
                setIsConsented(true);
                UnlockClosing();
                CloseDialog();
            })
            .catch((err: unknown) => toaster.catch(err as ServiceError))
            .finally(() => setIsSubmitting(false));
    }

    return (
        <div className={cls.NotificationDialogContainer}>
            <div className={cls.PanelHeader}>
                <span className={cls.PanelTitle}>{notification.title}</span>
                {!needsConsent && <ModalClose className={modalCloseCls.ModalCloseButton} onClick={CloseDialog} />}
            </div>

            <div className={cls.PanelBody}>
                <div className={cls.MarkdownBody}>
                    <ReactMarkdown rehypePlugins={[rehypeSanitize]}>{notification.bodyMarkdown ?? ''}</ReactMarkdown>
                </div>

                {needsConsent && (
                    <ModalActions
                        buttons={[
                            {
                                label: isSubmitting ? 'Agreeing…' : 'I Agree',
                                onClick: handleAgree,
                                className: cls.AgreeButton,
                                disabled: isSubmitting,
                            },
                        ]}
                    />
                )}
            </div>
        </div>
    );
}
