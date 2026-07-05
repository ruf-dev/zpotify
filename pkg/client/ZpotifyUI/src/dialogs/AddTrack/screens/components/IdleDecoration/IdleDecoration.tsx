import cls from '@/dialogs/AddTrack/screens/components/IdleDecoration/IdleDecoration.module.css';

export default function IdleDecoration() {
    return (
        <>
            <svg className={cls.Ring1} width="176" height="176" viewBox="0 0 176 176" fill="none">
                <circle
                    cx="88"
                    cy="88"
                    r="82"
                    stroke="currentColor"
                    strokeWidth="1.5"
                    strokeDasharray="10 8"
                    strokeLinecap="round"
                />
            </svg>
            <svg className={cls.Ring2} width="128" height="128" viewBox="0 0 128 128" fill="none">
                <circle
                    cx="64"
                    cy="64"
                    r="58"
                    stroke="currentColor"
                    strokeWidth="1"
                    strokeDasharray="4 14"
                    strokeLinecap="round"
                />
            </svg>
        </>
    );
}
