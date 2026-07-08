import '@/index.css';

import { createRoot } from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

import Router from '@/app/routing/Router.tsx';
import { ServiceError } from '@/shared/api/Errors.ts';

const queryClient = new QueryClient({
    defaultOptions: {
        queries: {
            retry: (failureCount, error) => {
                if (error instanceof ServiceError && error.isNonRetryable) return false;
                return failureCount < 3;
            },
        },
    },
});

createRoot(document.getElementById('root')!).render(
    <BrowserRouter>
        <QueryClientProvider client={queryClient}>
            <link href="https://fonts.googleapis.com/icon?family=Comfortaa" rel="stylesheet" />
            <Router />
        </QueryClientProvider>
    </BrowserRouter>,
);
