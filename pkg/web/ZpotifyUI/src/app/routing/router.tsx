import {createBrowserRouter} from "react-router-dom";
import InitPage from "@/pages/init/InitPage.tsx";
import ErrorPage from "@/pages/error/ErrorPage.tsx";

const router = createBrowserRouter([
    {
        path: "/*",
        element: (<InitPage/>),
        errorElement: (<ErrorPage/>)
    },
]);


export default router
