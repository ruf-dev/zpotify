import {Outlet} from "react-router-dom";

import Toaster from "@/components/notifications/Toaster.tsx";
import Dialog from "@/pages/segments/Dialog.tsx";

// import Settings from "@/segments/Settings.tsx";

export default function MainLayout() {
    return (
        <div
            style={{
                display: "flex",
                flexDirection: "column-reverse",
            }}
        >
            <Outlet/>
            {/*<Settings/>*/}
            {/**/}
            <Dialog/>
            <Toaster/>
        </div>
    )
}
