import telegramAuth from '@use-telegram-auth/client';

export default function TelegramCustomLoginButton() {
     async function auth () {
        const result = await telegramAuth(
            "7563259368",
            // {
            //     requestAccess: 'write', // optional
            // },
        );
        console.log(result)
    }

    return (
        <button
            onClick={auth}
            style={{padding: '10px 20px', fontSize: '16px', borderRadius: '8px'}}
        >
            Login
        </button>
    );
}
