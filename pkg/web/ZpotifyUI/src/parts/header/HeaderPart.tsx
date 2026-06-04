import cls from "@/parts/header/HeaderPart.module.css";

import AnimatedZ from "@/assets/AnimatedZ.tsx";
import {useNavigate} from "react-router-dom";
import {Path} from "@/app/routing/Router.tsx";
import UserWidget from "@/widgets/User/UserWidget.tsx";
import AddTrackButton from "@/components/AddTrackButton/AddTrackButton.tsx";
import AddTrackDialog from "../../dialogs/AddTrack/AddTrackDialog.tsx";
import {useDialog} from "@/app/hooks/Dialog.tsx";

export default function HeaderPart() {
    const navigate = useNavigate();
    const {OpenDialog} = useDialog();

    function handleAddTrack() {
        OpenDialog(<AddTrackDialog/>);
    }

    return (
        <div className={cls.Header}>
            <div className={cls.LogoContainer} onClick={() => navigate(Path.HomePage)}>
                <div className={cls.Logo}>
                    <AnimatedZ/>
                </div>
                <span className={cls.Wordmark}>zpotify</span>
            </div>

            <div className={cls.SearchContainer}/>
            <div className={cls.UserContainer}>
                <AddTrackButton onClick={handleAddTrack}/>
                <UserWidget/>
            </div>

        </div>
    )
}
