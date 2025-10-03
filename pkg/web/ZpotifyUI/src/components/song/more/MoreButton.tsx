import cls from "@/components/song/more/MoreButton.module.css"

import MoreDots from "@/assets/MoreDots.tsx";

interface MoreButtonProps {
}

export default function MoreButton({}: MoreButtonProps) {
    return (
        <div className={cls.MoreButtonContainer}>
            <MoreDots/>
        </div>
    )
}
