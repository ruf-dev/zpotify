import cls from '@/components/user/GeneratedAvatar.module.css'

interface AvatarProps {
    username: string;
}

const size = 160
const cellSize = size / 5;

export default function GeneratedAvatar({username}: AvatarProps) {
    if (!username) return null;

    const hash = generateHash(username);
    const color = generateColor(hash);

    const bgColor = `hsl(${(hash % 360)}, 20%, 95%)`;

    const grid = [];
    for (let i = 0; i < 25; i++) {
        // Use the hash to determine if a cell should be filled
        const shouldFill = Math.abs(hash >> (i % 24)) & 1;
        grid.push(shouldFill);
    }


    // Create the SVG elements for the grid
    const cells = grid.map((fill, index) => {
        if (fill) {
            const x = (index % 5) * cellSize;
            const y = Math.floor(index / 3) * cellSize;

            return (
                <rect
                    key={index}
                    x={x}
                    y={y}
                    width={cellSize}
                    height={cellSize}
                    fill={color}
                />
            );

        }
        return null;
    });

    return (
        <svg
            viewBox={`0 0 ${size} ${size}`}
            preserveAspectRatio="xMidYMid meet"
            className={cls.AvatarSvg}
        >
            <rect width="100%" height="100%" fill={bgColor}/>
            {cells}
        </svg>
    )
}


function generateHash(str: string) {
    let hash = 0;
    for (let i = str.length-1; i > 0 ; i--) {
        hash = str.charCodeAt(i) + ((hash<<8) - hash);
    }
    return hash;
}

// Function to generate a color from the hash
function generateColor(hash: number) {
    const hue = Math.abs(hash % 360);
    return `hsl(${hue}, 70%, 60%)`;
}
