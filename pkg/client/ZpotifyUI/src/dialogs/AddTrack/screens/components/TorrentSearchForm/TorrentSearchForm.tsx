import { useState, type FormEvent } from 'react';
import { Button } from '@vervstack/chures';

import cls from '@/dialogs/AddTrack/screens/components/TorrentSearchForm/TorrentSearchForm.module.css';
import Input from '@/shared/ui/Input.tsx';

interface TorrentSearchFormProps {
    isDisabled: boolean;
    initialValue?: string;
    onSearch: (query: string) => void;
}

export default function TorrentSearchForm({ isDisabled, initialValue, onSearch }: TorrentSearchFormProps) {
    const [draft, setDraft] = useState(initialValue ?? '');

    function handleSubmit(event: FormEvent<HTMLFormElement>) {
        event.preventDefault();
        onSearch(draft.trim());
    }

    return (
        <form className={cls.TorrentSearchFormContainer} onSubmit={handleSubmit}>
            <div className={cls.InputWrapper}>
                <Input label="Artist, album or track" inputValue={draft} onChange={setDraft} disabled={isDisabled} />
            </div>
            <Button type="submit" variant="primary" disabled={isDisabled || draft.trim() === ''}>
                Search
            </Button>
        </form>
    );
}
