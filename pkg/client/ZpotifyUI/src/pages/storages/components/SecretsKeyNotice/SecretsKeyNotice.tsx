import cls from '@/pages/storages/components/SecretsKeyNotice/SecretsKeyNotice.module.css';

export default function SecretsKeyNotice() {
    return (
        <div className={cls.SecretsKeyNoticeContainer}>
            <span className={cls.Title}>Remote storages are locked</span>
            <p className={cls.Text}>
                Set a secrets key to enable S3, WebDAV and Google Drive storages. Generate one with{' '}
                <code className={cls.Command}>openssl rand -base64 32</code>, put it in the{' '}
                <code className={cls.Command}>ENVIRONMENT_STORAGE_SECRETS_KEY</code> environment variable and restart
                the server.
            </p>
        </div>
    );
}
