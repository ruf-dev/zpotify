import {createBrowserRouter} from "react-router-dom";
import HomePage from "@/pages/home/HomePage.tsx";
import ErrorPage from "@/pages/error/ErrorPage.tsx";

const router = createBrowserRouter([
    {
        path: "/*",
        element: (<HomePage/>),
        errorElement: (<ErrorPage/>)
    },
]);


export default router
