import React, {useCallback, useEffect, useRef, useState} from "react";
import {createPortal} from "react-dom";
import cn from "classnames";

import cls from "@/components/shared/MultiSelect.module.css";

export interface Option {
    id: string;
    label: string;
}

interface MultiSelectProps {
    label?: string;
    placeholder?: string;
    selectedIds: string[];
    onChange: (ids: string[]) => void;
    doList: (query: string) => Promise<Option[]>;
    onAdd?: (label: string) => Promise<Option>;
    isMultiselect?: boolean;
}

export default function MultiSelect({
    label,
    placeholder,
    selectedIds,
    onChange,
    doList,
    onAdd,
    isMultiselect = true,
}: MultiSelectProps) {
    const [isOpen, setIsOpen] = useState(false);
    const [query, setQuery] = useState("");
    const [options, setOptions] = useState<Option[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [dropdownRect, setDropdownRect] = useState<DOMRect | null>(null);

    const containerRef = useRef<HTMLDivElement>(null);
    const dropdownRef = useRef<HTMLDivElement>(null);
    const searchRef = useRef<HTMLInputElement>(null);

    const selectedChips = selectedIds.map(
        id => options.find(o => o.id === id) ?? {id, label: id}
    );

    const singleSelected = !isMultiselect && selectedIds.length > 0
        ? (options.find(o => o.id === selectedIds[0]) ?? {id: selectedIds[0], label: selectedIds[0]})
        : null;

    useEffect(() => {
        let active = true;
        const timer = setTimeout(async () => {
            setIsLoading(true);
            try {
                const results = await doList(query);
                if (active) setOptions(results);
            } catch {
                // silent
            } finally {
                if (active) setIsLoading(false);
            }
        }, 300);
        return () => { active = false; clearTimeout(timer); };
    }, [query, doList]);

    useEffect(() => {
        const handleClickOutside = (e: MouseEvent) => {
            const target = e.target as Node;
            const inContainer = containerRef.current?.contains(target);
            const inDropdown = dropdownRef.current?.contains(target);
            if (isOpen && !inContainer && !inDropdown) {
                setIsOpen(false);
                e.stopPropagation();
                e.preventDefault();
            }
        };
        document.addEventListener("mousedown", handleClickOutside, true);
        return () => document.removeEventListener("mousedown", handleClickOutside, true);
    }, [isOpen]);

    useEffect(() => {
        if (isOpen) {
            setDropdownRect(containerRef.current?.getBoundingClientRect() ?? null);
            setTimeout(() => searchRef.current?.focus(), 0);
        } else {
            setQuery("");
        }
    }, [isOpen]);

    const toggleOption = useCallback((id: string) => {
        if (!isMultiselect) {
            onChange(selectedIds[0] === id ? [] : [id]);
            setIsOpen(false);
            return;
        }
        onChange(
            selectedIds.includes(id)
                ? selectedIds.filter(i => i !== id)
                : [...selectedIds, id]
        );
    }, [isMultiselect, onChange, selectedIds]);

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === "Enter" && query.trim()) {
            const exact = options.find(o => o.label.toLowerCase() === query.trim().toLowerCase());
            if (exact) {
                toggleOption(exact.id);
            } else if (onAdd) {
                handleAdd();
            }
        }
        if (e.key === "Escape") setIsOpen(false);
    };

    const handleAdd = async () => {
        if (!onAdd || !query.trim()) return;
        const newOpt = await onAdd(query.trim());
        setOptions(prev => [...prev, newOpt]);
        toggleOption(newOpt.id);
        setQuery("");
    };

    const trimmed = query.trim();
    const canCreate = onAdd && trimmed && !options.find(o => o.label.toLowerCase() === trimmed.toLowerCase());
    const showFloatingLabel = label && (isOpen || selectedIds.length > 0);

    return (
        <div className={cls.MultiSelectContainer} ref={containerRef}>
            <div
                className={cn(cls.Control, {
                    [cls.ControlOpen]: isOpen,
                    [cls.ControlFilled]: selectedIds.length > 0,
                })}
                onClick={() => setIsOpen(o => !o)}
            >
                {isMultiselect ? (
                    selectedChips.length > 0 ? (
                        <div className={cls.ChipsRow}>
                            {selectedChips.map(chip => (
                                <span key={chip.id} className={cls.Chip}>
                                    {chip.label}
                                    <button
                                        type="button"
                                        className={cls.ChipRemove}
                                        onClick={e => { e.stopPropagation(); toggleOption(chip.id); }}
                                    >×</button>
                                </span>
                            ))}
                        </div>
                    ) : (
                        <span className={cls.Placeholder}>{placeholder ?? label ?? "pick options…"}</span>
                    )
                ) : (
                    <span className={singleSelected ? cls.ControlValue : cls.Placeholder}>
                        {singleSelected ? singleSelected.label : (placeholder ?? label ?? "pick one…")}
                    </span>
                )}
                <svg
                    className={cn(cls.Chevron, {[cls.ChevronOpen]: isOpen})}
                    width="12" height="12" viewBox="0 0 12 12"
                    fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"
                >
                    <path d="M2 4l4 4 4-4"/>
                </svg>
            </div>

            {label && (
                <label className={cn(cls.Label, {[cls.LabelFloating]: showFloatingLabel})}>
                    {label}
                </label>
            )}

            {isOpen && dropdownRect && createPortal(
                <div
                    ref={dropdownRef}
                    className={cls.Dropdown}
                    style={{
                        position: 'fixed',
                        top: dropdownRect.bottom + 4,
                        left: dropdownRect.left,
                        width: dropdownRect.width,
                    }}
                >
                    <div className={cls.SearchRow}>
                        <input
                            ref={searchRef}
                            className={cls.SearchInput}
                            value={query}
                            onChange={e => setQuery(e.target.value)}
                            onKeyDown={handleKeyDown}
                            placeholder="search…"
                            onClick={e => e.stopPropagation()}
                        />
                    </div>

                    {isLoading && <div className={cls.StateHint}>loading…</div>}

                    {!isLoading && options.length === 0 && !trimmed && (
                        <div className={cls.StateHint}>
                            {onAdd ? "type to create one" : "no options"}
                        </div>
                    )}
                    {!isLoading && options.length === 0 && trimmed && !canCreate && (
                        <div className={cls.StateHint}>no results</div>
                    )}

                    {options.map(option => (
                        <div
                            key={option.id}
                            className={cn(cls.Option, {[cls.OptionSelected]: selectedIds.includes(option.id)})}
                            onClick={() => toggleOption(option.id)}
                        >
                            {isMultiselect ? (
                                <div className={cn(cls.Checkbox, {[cls.CheckboxChecked]: selectedIds.includes(option.id)})}>
                                    {selectedIds.includes(option.id) && (
                                        <svg width="9" height="9" viewBox="0 0 9 9" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                            <path d="M1.5 4.5L3.5 6.5L7.5 2.5"/>
                                        </svg>
                                    )}
                                </div>
                            ) : (
                                <div className={cn(cls.RadioDot, {[cls.RadioDotSelected]: selectedIds.includes(option.id)})}/>
                            )}
                            <span className={cn(cls.OptionLabel, {[cls.OptionLabelSelected]: selectedIds.includes(option.id)})}>
                                {option.label}
                            </span>
                        </div>
                    ))}

                    {canCreate && (
                        <div className={cn(cls.Option, cls.CreateOption)} onClick={handleAdd}>
                            <span className={cls.CreateLabel}>create "{trimmed}"</span>
                        </div>
                    )}
                </div>,
                document.body
            )}
        </div>
    );
}
