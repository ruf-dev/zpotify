import '@/index.css';

import { createRoot } from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

import Router from '@/app/routing/Router.tsx';

const queryClient = new QueryClient();

createRoot(document.getElementById('root')!).render(
    <BrowserRouter>
        <QueryClientProvider client={queryClient}>
            <link href="https://fonts.googleapis.com/icon?family=Comfortaa" rel="stylesheet" />
            <Router />
        </QueryClientProvider>
    </BrowserRouter>,
);
