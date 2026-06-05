import cls from "@/shared/ui/IconButton.module.css";

interface ActionButtonProps {
    iconPath: string
    alt?: string
    onClick?: () => void

    tooltip?: string
}

export default function IconButton({iconPath, alt, onClick, tooltip}: ActionButtonProps) {
    return (
        <div className={cls.AddButton}
             onClick={onClick}
             data-tooltip-id={"root-tooltip"}
             data-tooltip-content={tooltip}
             data-tooltip-place="left"
        >
            <img src={iconPath}
                 alt={alt || iconPath}/>
        </div>
    )
}
