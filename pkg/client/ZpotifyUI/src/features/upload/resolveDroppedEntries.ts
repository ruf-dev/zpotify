import { isSupportedAudioFile } from '@/features/upload/supportedAudio.ts';

export interface DroppedFolder {
    name: string;
    files: File[];
}

export interface DroppedGroups {
    looseFiles: File[];
    folders: DroppedFolder[];
    ignoredNestedCount: number;
}

function readEntryFile(entry: FileSystemFileEntry): Promise<File> {
    return new Promise((resolve, reject) => {
        entry.file(resolve, reject);
    });
}

function readAllDirectoryEntries(reader: FileSystemDirectoryReader): Promise<FileSystemEntry[]> {
    return reader.readEntries === undefined
        ? Promise.resolve([])
        : new Promise<FileSystemEntry[]>((resolve, reject) => {
              reader.readEntries(resolve, reject);
          }).then((batch) => {
              if (batch.length === 0) return [];
              return readAllDirectoryEntries(reader).then((rest) => [...batch, ...rest]);
          });
}

function resolveFolder(
    entry: FileSystemDirectoryEntry,
): Promise<{ folder: DroppedFolder; ignoredNestedCount: number }> {
    const reader = entry.createReader();

    return readAllDirectoryEntries(reader).then((children) => {
        const childFiles = children.filter((child): child is FileSystemFileEntry => child.isFile);
        const childDirs = children.filter((child) => child.isDirectory);

        return Promise.all(childFiles.map(readEntryFile)).then((files) => {
            const folder: DroppedFolder = {
                name: entry.name,
                files: files.filter(isSupportedAudioFile),
            };
            return { folder, ignoredNestedCount: childDirs.length };
        });
    });
}

export function resolveDroppedEntries(entries: FileSystemEntry[]): Promise<DroppedGroups> {
    const fileEntries = entries.filter((entry): entry is FileSystemFileEntry => entry.isFile);
    const dirEntries = entries.filter((entry): entry is FileSystemDirectoryEntry => entry.isDirectory);

    const looseFilesPromise = Promise.all(fileEntries.map(readEntryFile)).then((files) =>
        files.filter(isSupportedAudioFile),
    );
    const foldersPromise = Promise.all(dirEntries.map(resolveFolder));

    return Promise.all([looseFilesPromise, foldersPromise]).then(([looseFiles, resolvedFolders]) => {
        const folders = resolvedFolders.filter((r) => r.folder.files.length > 0).map((r) => r.folder);
        const ignoredNestedCount = resolvedFolders.reduce((sum, r) => sum + r.ignoredNestedCount, 0);

        return { looseFiles, folders, ignoredNestedCount };
    });
}
