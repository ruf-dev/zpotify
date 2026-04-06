import '@/index.css'

import {createRoot} from 'react-dom/client'

import Router from "@/app/routing/Router.tsx";
import {BrowserRouter} from "react-router-dom";

createRoot(document.getElementById('root')!).render(
    <BrowserRouter>
        <link href="https://fonts.googleapis.com/icon?family=Comfortaa" rel="stylesheet"/>
        <Router/>
    </BrowserRouter>
)
