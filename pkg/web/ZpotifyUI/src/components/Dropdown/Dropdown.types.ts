export type DropdownOption = string | { id: string; name: string };

export function getOptionId(opt: DropdownOption): string {
    return typeof opt === 'string' ? opt : opt.id;
}

export function getOptionLabel(opt: DropdownOption): string {
    return typeof opt === 'string' ? opt : opt.name;
}
