import { createRoot } from 'react-dom/client'
import {RouterProvider} from "react-router-dom";

import '@/index.css'
import router from "@/app/routing/router.tsx";

createRoot(document.getElementById('root')!).render(
    <div>
      <link href="https://fonts.googleapis.com/icon?family=Comfortaa" rel="stylesheet"/>
      <RouterProvider
          router={router}/>
    </div>
)
