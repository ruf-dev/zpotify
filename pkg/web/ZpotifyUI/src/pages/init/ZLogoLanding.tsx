import { useRef, useState } from 'react';
import cn from 'classnames';

import cls from '@/pages/init/ZLogoLanding.module.css';

export default function ZLogoLanding() {
    const [spinning, setSpinning] = useState(false);
    const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

    function handleClick() {
        setSpinning(true);
        if (timerRef.current) clearTimeout(timerRef.current);
        timerRef.current = setTimeout(() => setSpinning(false), 8000);
    }

    return (
        <svg
            className={cn(cls.Logo, { [cls.spinning]: spinning })}
            onClick={handleClick}
            viewBox="0 0 914 914"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
        >
            <defs>
                <clipPath id="lzcl1">
                    <rect id="lz-top" x="0" y="0" width="914" height="914" />
                </clipPath>
                <clipPath id="lzcl2">
                    <rect id="lz-mid" x="0" y="0" width="914" height="914" />
                </clipPath>
                <clipPath id="lzcl3">
                    <rect id="lz-bot" x="0" y="0" width="914" height="914" />
                </clipPath>
                <clipPath id="lzcl0">
                    <rect width="914" height="914" />
                </clipPath>
            </defs>
            <g clipPath="url(#lzcl0)">
                <path
                    d="M914 457C914 709.394 709.394 914 457 914C204.606 914 0 709.394 0 457C0 204.606 204.606 0 457 0C709.394 0 914 204.606 914 457Z"
                    fill="#D9007F"
                />
                <g clipPath="url(#lzcl1)">
                    <path
                        d="M730.708 429.918C586.777 337.574 341.371 319.798 199.718 358.625C188.954 361.324 177.565 359.772 167.916 354.292C158.266 348.812 151.1 339.825 147.904 329.198C145.151 318.42 146.672 306.995 152.149 297.312C157.626 287.629 166.634 280.439 177.29 277.245C342.041 234.713 610.435 253.246 776.865 360.368C797.107 372.536 803.04 400.361 790.826 420.602C778.77 436.291 750.995 442.133 730.708 429.918Z"
                        fill="black"
                    />
                </g>
                <g clipPath="url(#lzcl2)">
                    <path
                        d="M781.897 401.637C779.902 421.55 765.291 438.049 745.32 436.14C598.271 432.556 421.488 507.636 317.887 621.206C304.192 634.542 281.29 636.96 268.035 623.218C254.605 609.362 252.234 586.54 265.993 573.221C387.431 444.085 581.539 361.582 750.563 366.079C766.127 365.103 783.789 381.73 781.897 401.637Z"
                        fill="black"
                    />
                </g>
                <g clipPath="url(#lzcl3)">
                    <path
                        d="M731.655 680.383C722.218 693.54 706.291 697.54 693.043 688.101C589.494 619.078 457.194 600.925 298.385 631.421C282.546 635.469 269.423 623.734 265.392 610.015C261.392 594.088 273.124 581.055 286.844 576.978C459.159 544.654 607.192 565.656 721.68 641.782C737.214 649.046 738.839 667.101 731.655 680.383Z"
                        fill="black"
                    />
                </g>
            </g>
        </svg>
    );
}
