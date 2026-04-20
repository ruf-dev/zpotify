import React, { useState, useEffect, useRef, useMemo } from "react";
import cn from "classnames";

import cls from "@/components/shared/MultiSelect.module.css";

import Chip from "@/components/shared/Chip.tsx";

export interface Option {
    id: string;
    label: string;
}

interface MultiSelectProps {
    label?: string;
    selectedIds: string[];
    onChange: (ids: string[]) => void;
    doList: (query: string) => Promise<Option[]>;
    onAdd?: (label: string) => Promise<Option>;
}

export default function MultiSelect({
    label,
    selectedIds,
    onChange,
    doList,
    onAdd
}: MultiSelectProps) {
    const [isOpen, setIsOpen] = useState(false);
    const [query, setQuery] = useState("");
    const [options, setOptions] = useState<Option[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [isFocused, setIsFocused] = useState(false);
    
    const containerRef = useRef<HTMLDivElement>(null);
    const inputRef = useRef<HTMLInputElement>(null);

    const displayChips = useMemo(() => {
        return selectedIds.map(id => {
            const opt = options.find(o => o.id === id);
            return opt || { id, label: id };
        });
    }, [options, selectedIds]);

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === "Backspace" && query === "" && selectedIds.length > 0) {
            onChange(selectedIds.slice(0, -1));
        }
        if (e.key === "Enter" && query.trim() !== "") {
            const exactMatch = options.find(o => o.label.toLowerCase() === query.toLowerCase());
            if (exactMatch) {
                toggleOption(exactMatch.id);
            } else if (onAdd) {
                handleAdd();
            }
        }
        if (e.key === "Escape") {
            setIsOpen(false);
        }
    };

    useEffect(() => {
        const fetchOptions = async () => {
            setIsLoading(true);
            try {
                const results = await doList(query);
                setOptions(results);
            } catch (error) {
                console.error("Failed to fetch options", error);
            } finally {
                setIsLoading(false);
            }
        };

        const timer = setTimeout(fetchOptions, 300);
        return () => clearTimeout(timer);
    }, [query, doList]);

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (isOpen && containerRef.current && !containerRef.current.contains(event.target as Node)) {
                setIsOpen(false);
                event.stopPropagation();
                event.preventDefault();
            }
        };
        document.addEventListener("mousedown", handleClickOutside, true);
        return () => document.removeEventListener("mousedown", handleClickOutside, true);
    }, [isOpen]);

    const toggleOption = (id: string) => {
        if (selectedIds.includes(id)) {
            onChange(selectedIds.filter(i => i !== id));
        } else {
            onChange([...selectedIds, id]);
        }
        setQuery("");
        inputRef.current?.focus();
    };

    const handleAdd = async () => {
        if (onAdd && query.trim()) {
            const newOpt = await onAdd(query.trim());
            setOptions(prev => [...prev, newOpt]);
            toggleOption(newOpt.id);
            setQuery("");
        }
    };

    const hasValue = selectedIds.length > 0 || query.length > 0 || isFocused;
    const showFloatingLabel = hasValue;

    return (
        <div className={cls.MultiSelectContainer} ref={containerRef}>
            <div 
                className={cls.Control} 
                onClick={() => {
                    setIsOpen(true);
                    inputRef.current?.focus();
                }}
            >
                <div className={cls.ChipsContainer}>
                    {displayChips.map(chip => (
                        <div className={cls.ChipContainer}>
                            <Chip
                                key={chip.id}
                                value={chip.label}
                                onClick={(e) => {
                                    // @ts-ignore
                                    e?.stopPropagation();
                                    toggleOption(chip.id);
                                }}
                            />
                        </div>
                    ))}
                    <input
                        ref={inputRef}
                        className={cls.Input}
                        value={query}
                        onChange={(e) => setQuery(e.target.value)}
                        onKeyDown={handleKeyDown}
                        onFocus={() => {
                            setIsFocused(true);
                            setIsOpen(true);
                        }}
                        onBlur={() => setIsFocused(false)}
                        placeholder={!showFloatingLabel ? label : ""}
                    />
                </div>
            </div>

            {label && (
                <label className={cn(cls.Label, { [cls.Floating]: showFloatingLabel })}>
                    {label}
                </label>
            )}

            {isOpen && (
                <div className={cls.Dropdown}>
                    {isLoading && options.length==0 && <div className={cls.Loading}>Loading...</div>}
                    {!isLoading && options.length === 0 && !onAdd && (
                        <div className={cls.NoOptions}>No options found</div>
                    )}
                    {options.map(option => (
                        <div
                            key={option.id}
                            className={cn(cls.Option, {
                                [cls.Selected]: selectedIds.includes(option.id)
                            })}
                            onClick={() => toggleOption(option.id)}
                        >
                            {option.label}
                        </div>
                    ))}
                    {onAdd && query.trim() && !options.find(o => o.label.toLowerCase() === query.toLowerCase()) && (
                        <div className={cn(cls.Option, cls.AddOption)} onClick={handleAdd}>
                            Add "{query}"
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}
