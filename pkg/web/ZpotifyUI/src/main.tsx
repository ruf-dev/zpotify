import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import {RouterProvider} from "react-router-dom";

import '@/index.module.css'
import router from "@/app/routing/router.tsx";

createRoot(document.getElementById('root')!).render(
    <StrictMode>
      <link href="https://fonts.googleapis.com/icon?family=Comfortaa" rel="stylesheet"/>
      <RouterProvider
          router={router}/>
    </StrictMode>
)
