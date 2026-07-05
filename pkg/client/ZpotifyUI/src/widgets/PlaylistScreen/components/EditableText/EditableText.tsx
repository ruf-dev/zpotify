interface EditableTextProps {
    displayValue: string;
    editValue: string;
    isEditing: boolean;
    onChange: (v: string) => void;
    displayClassName: string;
    inputClassName: string;
    placeholder?: string;
    displayAs?: 'h1' | 'span';
    type?: 'text' | 'number';
    readOnly?: boolean;
}

export default function EditableText({
    displayValue,
    editValue,
    isEditing,
    onChange,
    displayClassName,
    inputClassName,
    placeholder,
    displayAs = 'span',
    type = 'text',
    readOnly = false,
}: EditableTextProps) {
    function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
        onChange(e.target.value);
    }

    if (isEditing) {
        return (
            <input
                type={type}
                className={inputClassName}
                value={editValue}
                onChange={handleChange}
                placeholder={placeholder}
                readOnly={readOnly}
            />
        );
    }

    if (displayAs === 'h1') {
        return <h1 className={displayClassName}>{displayValue}</h1>;
    }
    return <span className={displayClassName}>{displayValue}</span>;
}
