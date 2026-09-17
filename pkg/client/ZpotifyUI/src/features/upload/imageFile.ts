const IMAGE_EXTENSIONS = ['.png', '.jpg', '.jpeg', '.gif', '.webp', '.bmp', '.svg'];

export function isImagePath(name: string): boolean {
    return IMAGE_EXTENSIONS.some((ext) => name.toLowerCase().endsWith(ext));
}

export function isImageFile(file: File): boolean {
    if (file.type) return file.type.startsWith('image/');
    return isImagePath(file.name);
}
