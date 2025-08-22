import cn from "classnames";

import cls from "@/components/menu/Menu.module.css"
import {useState} from "react";

interface MenuProps {
    options: MenuOption[]
}

interface MenuOption {
    label?: string
    onClick?: () => void
    disabled?: boolean
}

export default function Menu({options}: MenuProps) {
    return (
        <div className={cls.MenuContainer}>
            {
                options.map((op, index) => {
                    return (
                        <div key={index}>
                            {op.label ?
                                <MenuOption props={op}/> :
                                <div className={cls.Separator}/>}
                        </div>
                    )
                })
            }
        </div>
    )
}


function MenuOption({props}: { props: MenuOption }) {
    const [isSelected, setIsSelected] = useState<boolean>(false)

    return (
        <div
            className={cn(cls.Option, {
                [cls.Selected]: isSelected,
                [cls.Disabled]: props.disabled,
            })}
            onPointerEnter={() => setIsSelected(true)}
            onPointerLeave={() => setIsSelected(false)}
            onClick={props.onClick}
        >
            {props.label}
        </div>
    )
}
