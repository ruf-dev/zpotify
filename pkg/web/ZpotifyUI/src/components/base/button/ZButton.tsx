import cls from "@/components/base/button/ZButton.module.css"

interface ZButtonProps {
    title: string;
    onClick: () => void;
}

export default function ZButton({title, onClick}: ZButtonProps) {
    return (
        <div
            className={cls.ZButton}
            onClick={onClick}
        >
            {title}
        </div>
    )
}
