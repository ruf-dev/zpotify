import { useMemo, useState } from 'react';

import type { TorrentFileRow } from '@/dialogs/TorrentManage/processes/mergeTorrentFiles';
import cls from '@/dialogs/TorrentManage/components/TorrentFileStatusList/TorrentFileStatusList.module.css';
import TorrentFileStatusRow from '@/dialogs/TorrentManage/components/TorrentFileStatusList/components/TorrentFileStatusRow/TorrentFileStatusRow';
import TorrentFolderStatusNode from '@/dialogs/TorrentManage/components/TorrentFileStatusList/components/TorrentFolderStatusNode/TorrentFolderStatusNode';
import { buildTorrentFileTree } from '@/dialogs/TorrentManage/processes/buildTorrentFileTree';

interface TorrentFileStatusListProps {
    files: TorrentFileRow[];
}

export default function TorrentFileStatusList({ files }: TorrentFileStatusListProps) {
    const tree = useMemo(() => buildTorrentFileTree(files), [files]);
    const [collapsedPaths, setCollapsedPaths] = useState<Set<string>>(new Set());

    function handleToggle(path: string) {
        setCollapsedPaths((prev) => {
            const next = new Set(prev);
            if (next.has(path)) {
                next.delete(path);
            } else {
                next.add(path);
            }
            return next;
        });
    }

    return (
        <div className={cls.TorrentFileStatusListContainer}>
            {tree.children.map((node) => (
                <TorrentFolderStatusNode
                    key={node.path}
                    node={node}
                    collapsedPaths={collapsedPaths}
                    onToggle={handleToggle}
                />
            ))}
            {tree.items.map((file) => (
                <TorrentFileStatusRow key={file.path} file={file} />
            ))}
        </div>
    );
}
