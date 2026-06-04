/* ═══════════════════════════════════════════════════════════
   Multitrack Upload — shared parts
   Exports to window: ZLogo, Checkbox, IconBtn, ArtistDropdown,
                      ArtistChipsField, CoverField, TrackRow,
                      fmtTime, fmtBytes
   ═══════════════════════════════════════════════════════════ */
const { useState, useEffect, useRef, useCallback, useMemo } = React;

/* ── helpers ─────────────────────────────────────────────── */
function fmtTime(sec) {
  if (sec == null || !isFinite(sec)) return '—';
  sec = Math.round(sec);
  const h = Math.floor(sec / 3600);
  const m = Math.floor((sec % 3600) / 60);
  const s = sec % 60;
  if (h) return `${h}:${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
  return `${m}:${String(s).padStart(2, '0')}`;
}
function fmtBytes(b) {
  if (!b) return '—';
  if (b < 1024 * 1024) return `${(b / 1024).toFixed(0)} KB`;
  return `${(b / 1024 / 1024).toFixed(1)} MB`;
}
function cleanFilename(name) {
  return name.replace(/\.[^/.]+$/, '').replace(/[-_]+/g, ' ').trim();
}

/* ── ZLogo (compact) ─────────────────────────────────────── */
function ZLogo({ size = 40, pulsing = false }) {
  return (
    <svg style={{ width: size, height: size, borderRadius: '50%', display: 'block', flexShrink: 0,
      animation: pulsing ? 'logoPulse 2.2s ease-in-out infinite' : 'none' }}
      viewBox="0 0 914 914" fill="none">
      <circle cx="457" cy="457" r="457" fill="#D9007F"/>
      <path d="M730.708 429.918C586.777 337.574 341.371 319.798 199.718 358.625C188.954 361.324 177.565 359.772 167.916 354.292C158.266 348.812 151.1 339.825 147.904 329.198C145.151 318.42 146.672 306.995 152.149 297.312C157.626 287.629 166.634 280.439 177.29 277.245C342.041 234.713 610.435 253.246 776.865 360.368C797.107 372.536 803.04 400.361 790.826 420.602C778.77 436.291 750.995 442.133 730.708 429.918Z" fill="black"/>
      <path d="M781.897 401.637C779.902 421.55 765.291 438.049 745.32 436.14C598.271 432.556 421.488 507.636 317.887 621.206C304.192 634.542 281.29 636.96 268.035 623.218C254.605 609.362 252.234 586.54 265.993 573.221C387.431 444.085 581.539 361.582 750.563 366.079C766.127 365.103 783.789 381.73 781.897 401.637Z" fill="black"/>
      <path d="M731.655 680.383C722.218 693.54 706.291 697.54 693.043 688.101C589.494 619.078 457.194 600.925 298.385 631.421C282.546 635.469 269.423 623.734 265.392 610.015C261.392 594.088 273.124 581.055 286.844 576.978C459.159 544.654 607.192 565.656 721.68 641.782C737.214 649.046 738.839 667.101 731.655 680.383Z" fill="black"/>
    </svg>
  );
}

/* ── Checkbox ────────────────────────────────────────────── */
function Checkbox({ checked, onChange, label, sub }) {
  const [hov, setHov] = useState(false);
  return (
    <div onClick={() => onChange(!checked)}
      onMouseEnter={() => setHov(true)} onMouseLeave={() => setHov(false)}
      style={{ display: 'flex', alignItems: 'flex-start', gap: '0.625rem', cursor: 'pointer',
        padding: '0.5rem 0.625rem', borderRadius: 'var(--radius-sm)',
        background: hov ? 'var(--bg-hover)' : 'transparent',
        transition: 'background var(--dur-fast) ease', userSelect: 'none' }}>
      <div style={{ width: '1.125rem', height: '1.125rem', flexShrink: 0, borderRadius: '0.3125rem',
        border: `1.5px solid ${checked ? 'var(--pink)' : hov ? 'var(--border-bright)' : 'var(--border-mid)'}`,
        background: checked ? 'var(--pink)' : 'transparent',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        transition: 'all var(--dur-fast) ease', marginTop: '0.0625rem',
        boxShadow: checked ? '0 0 12px var(--pink-shadow)' : 'none' }}>
        {checked && (
          <svg width="11" height="11" viewBox="0 0 12 12" fill="none" stroke="white"
            strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round"
            style={{ strokeDasharray: 20, strokeDashoffset: 0, animation: 'checkIn 0.2s ease both' }}>
            <polyline points="2 6 5 9 10 3"/>
          </svg>
        )}
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.125rem', minWidth: 0 }}>
        <span style={{ fontSize: 'var(--text-md)', fontWeight: 600,
          color: checked ? 'var(--text-primary)' : 'var(--text-secondary)' }}>{label}</span>
        {sub && <span style={{ fontSize: 'var(--text-xs)', color: 'var(--text-muted)', lineHeight: 1.5 }}>{sub}</span>}
      </div>
    </div>
  );
}

/* ── IconBtn (square ghost) ──────────────────────────────── */
function IconBtn({ children, onClick, title, size = 24, danger = false }) {
  const [hov, setHov] = useState(false);
  return (
    <div onClick={onClick} title={title}
      onMouseEnter={() => setHov(true)} onMouseLeave={() => setHov(false)}
      style={{ width: size, height: size, display: 'flex', alignItems: 'center', justifyContent: 'center',
        borderRadius: 'var(--radius-circle)', cursor: 'pointer', flexShrink: 0,
        color: hov ? (danger ? 'var(--color-error)' : 'var(--text-primary)') : 'var(--text-muted)',
        background: hov ? (danger ? 'rgba(193,37,61,0.12)' : 'var(--bg-hover-mid)') : 'transparent',
        transition: 'all var(--dur-fast) ease' }}>
      {children}
    </div>
  );
}

/* ── ArtistDropdown ──────────────────────────────────────── */
function ArtistDropdown({ allOptions, excluded, onPick, onCreate, onClose, anchorRect }) {
  const [q, setQ] = useState('');
  const inputRef = useRef(null);
  const popRef = useRef(null);

  useEffect(() => { setTimeout(() => inputRef.current?.focus(), 10); }, []);
  useEffect(() => {
    const handler = (e) => {
      if (popRef.current && !popRef.current.contains(e.target)) onClose();
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [onClose]);

  const filtered = useMemo(() => {
    const qq = q.trim().toLowerCase();
    return allOptions
      .filter(o => !excluded.includes(o))
      .filter(o => !qq || o.toLowerCase().includes(qq))
      .slice(0, 8);
  }, [q, allOptions, excluded]);

  const exact = q.trim() && allOptions.some(o => o.toLowerCase() === q.trim().toLowerCase());
  const canCreate = q.trim() && !exact;

  return (
    <div ref={popRef}
      style={{ position: 'absolute', top: anchorRect?.top || 'calc(100% + 0.375rem)',
        left: anchorRect?.left || 0, width: anchorRect?.width || '18rem', zIndex: 600,
        background: 'var(--bg-elevated)', border: '1px solid var(--border-bright)',
        borderRadius: 'var(--radius-md)', overflow: 'hidden',
        boxShadow: '0 16px 48px rgba(0,0,0,0.8)',
        animation: 'modalPanelIn 0.14s ease both' }}>
      <div style={{ padding: '0.5rem', borderBottom: '1px solid var(--border-dim)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem',
          background: 'var(--bg-base)', borderRadius: 'var(--radius-sm)',
          padding: '0.4rem 0.625rem', border: '1px solid var(--border-dim)' }}>
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor"
            strokeWidth="2.5" style={{ color: 'var(--text-muted)', flexShrink: 0 }}>
            <circle cx="11" cy="11" r="7"/><line x1="20" y1="20" x2="16.5" y2="16.5"/>
          </svg>
          <input ref={inputRef} value={q} onChange={e => setQ(e.target.value)}
            onKeyDown={e => {
              if (e.key === 'Escape') onClose();
              if (e.key === 'Enter') {
                if (filtered[0]) onPick(filtered[0]);
                else if (canCreate) onCreate(q.trim());
              }
            }}
            placeholder="search or add new…"
            style={{ flex: 1, background: 'transparent', border: 'none', outline: 'none',
              color: 'var(--text-primary)', fontFamily: 'var(--font)', fontSize: 'var(--text-sm)' }}/>
        </div>
      </div>
      <div style={{ maxHeight: '13rem', overflowY: 'auto' }}>
        {filtered.length === 0 && !canCreate && (
          <div style={{ padding: '0.875rem', fontSize: 'var(--text-sm)',
            color: 'var(--text-muted)', textAlign: 'center' }}>no artists</div>
        )}
        {filtered.map(name => (
          <DropdownRow key={name} label={name} onClick={() => onPick(name)}/>
        ))}
        {canCreate && (
          <div onClick={() => onCreate(q.trim())}
            style={{ display: 'flex', alignItems: 'center', gap: '0.625rem',
              padding: '0.55rem 0.875rem', cursor: 'pointer',
              borderTop: filtered.length ? '1px solid var(--border-dim)' : 'none',
              background: 'var(--pink-dim)',
              transition: 'background var(--dur-fast) ease' }}
            onMouseEnter={e => e.currentTarget.style.background = 'rgba(217,0,127,0.2)'}
            onMouseLeave={e => e.currentTarget.style.background = 'var(--pink-dim)'}>
            <div style={{ width: '1.25rem', height: '1.25rem', borderRadius: '50%',
              background: 'var(--pink)', display: 'flex', alignItems: 'center',
              justifyContent: 'center', flexShrink: 0 }}>
              <svg width="9" height="9" viewBox="0 0 12 12" fill="none" stroke="white" strokeWidth="2.6" strokeLinecap="round">
                <line x1="6" y1="1.5" x2="6" y2="10.5"/><line x1="1.5" y1="6" x2="10.5" y2="6"/>
              </svg>
            </div>
            <span style={{ fontSize: 'var(--text-sm)', color: 'var(--text-primary)', fontWeight: 600 }}>
              create "{q.trim()}"
            </span>
          </div>
        )}
      </div>
    </div>
  );
}
function DropdownRow({ label, onClick }) {
  const [hov, setHov] = useState(false);
  return (
    <div onClick={onClick}
      onMouseEnter={() => setHov(true)} onMouseLeave={() => setHov(false)}
      style={{ padding: '0.55rem 0.875rem', cursor: 'pointer',
        background: hov ? 'var(--bg-hover-mid)' : 'transparent',
        fontSize: 'var(--text-sm)', color: hov ? 'var(--text-primary)' : 'var(--text-secondary)',
        transition: 'background var(--dur-fast) ease' }}>
      {label}
    </div>
  );
}

/* ── ArtistChip (single chip, draggable, optional locked variant) ── */
function ArtistChip({ name, onRemove, locked = false, dragHandlers, isDragging, isDragOver }) {
  const [hov, setHov] = useState(false);
  return (
    <span
      {...(dragHandlers || {})}
      onMouseEnter={() => setHov(true)} onMouseLeave={() => setHov(false)}
      style={{
        display: 'inline-flex', alignItems: 'center', gap: '0.3125rem',
        padding: locked ? '0.2rem 0.55rem 0.2rem 0.4rem' : '0.2rem 0.3rem 0.2rem 0.55rem',
        borderRadius: 'var(--radius-pill)',
        background: locked ? 'rgba(217,0,127,0.18)' : 'var(--pink-dim)',
        border: `1px solid ${locked ? 'var(--pink-border)' : (hov ? 'var(--pink-border)' : 'rgba(217,0,127,0.22)')}`,
        fontSize: 'var(--text-xs)', color: 'var(--text-primary)', fontWeight: 600,
        cursor: locked ? 'default' : 'grab',
        opacity: isDragging ? 0.35 : 1,
        boxShadow: isDragOver ? '0 0 0 2px var(--pink-glow)' : 'none',
        transition: 'box-shadow var(--dur-fast) ease, background var(--dur-fast) ease',
        animation: 'pillPop 0.18s ease both',
        userSelect: 'none',
        whiteSpace: 'nowrap'
      }}>
      {locked && (
        <svg width="9" height="9" viewBox="0 0 24 24" fill="none" stroke="currentColor"
          strokeWidth="2.4" style={{ color: 'var(--pink)', flexShrink: 0 }}>
          <rect x="5" y="11" width="14" height="10" rx="2"/>
          <path d="M8 11V7a4 4 0 0 1 8 0v4"/>
        </svg>
      )}
      <span>{name}</span>
      {!locked && (
        <span onClick={(e) => { e.stopPropagation(); onRemove(); }}
          onMouseDown={e => e.stopPropagation()}
          style={{ width: '1rem', height: '1rem', display: 'inline-flex',
            alignItems: 'center', justifyContent: 'center', borderRadius: '50%',
            cursor: 'pointer', color: 'var(--text-secondary)',
            transition: 'all var(--dur-fast) ease',
            background: hov ? 'rgba(0,0,0,0.35)' : 'transparent' }}>
          <svg width="8" height="8" viewBox="0 0 12 12" fill="none" stroke="currentColor"
            strokeWidth="2.4" strokeLinecap="round">
            <line x1="2" y1="2" x2="10" y2="10"/><line x1="10" y1="2" x2="2" y2="10"/>
          </svg>
        </span>
      )}
    </span>
  );
}

/* ── ArtistChipsField (chips + reorder + + button + dropdown) ── */
function ArtistChipsField({ artists, setArtists, allOptions, onCreate, locked = [], placeholder = 'add artist…', dense = false }) {
  const [open, setOpen] = useState(false);
  const [dragIdx, setDragIdx] = useState(null);
  const [overIdx, setOverIdx] = useState(null);
  const wrapRef = useRef(null);
  const addBtnRef = useRef(null);

  const chipDragHandlers = (idx) => ({
    draggable: true,
    onDragStart: (e) => {
      setDragIdx(idx);
      e.dataTransfer.effectAllowed = 'move';
      try { e.dataTransfer.setData('text/plain', String(idx)); } catch {}
    },
    onDragOver: (e) => { e.preventDefault(); if (overIdx !== idx) setOverIdx(idx); },
    onDrop: (e) => {
      e.preventDefault();
      if (dragIdx != null && dragIdx !== idx) {
        const next = [...artists];
        const [moved] = next.splice(dragIdx, 1);
        next.splice(idx, 0, moved);
        setArtists(next);
      }
      setDragIdx(null); setOverIdx(null);
    },
    onDragEnd: () => { setDragIdx(null); setOverIdx(null); },
  });

  return (
    <div ref={wrapRef} style={{ position: 'relative' }}>
      <div
        onDragOver={e => { if (dragIdx != null) e.preventDefault(); }}
        style={{
          display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: '0.3125rem',
          padding: dense ? '0.25rem 0.3125rem' : '0.4375rem 0.5rem',
          minHeight: dense ? '1.875rem' : '2.375rem',
          background: 'transparent',
          border: '1px dashed var(--border-mid)',
          borderRadius: 'var(--radius-sm)',
          transition: 'border-color var(--dur-fast) ease'
        }}>
        {/* locked first */}
        {locked.map(name => (
          <ArtistChip key={'lock-' + name} name={name} locked />
        ))}
        {artists.map((name, i) => (
          <ArtistChip key={name + '-' + i} name={name}
            onRemove={() => setArtists(artists.filter((_, j) => j !== i))}
            dragHandlers={chipDragHandlers(i)}
            isDragging={dragIdx === i}
            isDragOver={overIdx === i && dragIdx !== i}/>
        ))}
        {artists.length === 0 && locked.length === 0 && (
          <span style={{ fontSize: 'var(--text-xs)', color: 'var(--text-muted)',
            fontStyle: 'italic', marginLeft: '0.25rem' }}>{placeholder}</span>
        )}
        {/* + add button */}
        <button ref={addBtnRef} onClick={() => setOpen(o => !o)}
          style={{ marginLeft: 'auto',
            display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
            width: '1.375rem', height: '1.375rem', borderRadius: '50%',
            background: open ? 'var(--pink)' : 'var(--bg-elevated)',
            border: `1px solid ${open ? 'var(--pink)' : 'var(--border-mid)'}`,
            color: open ? 'white' : 'var(--text-secondary)',
            cursor: 'pointer', transition: 'all var(--dur-fast) ease',
            flexShrink: 0 }}
          onMouseEnter={e => { if (!open) { e.currentTarget.style.background = 'var(--bg-hover-mid)'; e.currentTarget.style.color = 'var(--text-primary)'; } }}
          onMouseLeave={e => { if (!open) { e.currentTarget.style.background = 'var(--bg-elevated)'; e.currentTarget.style.color = 'var(--text-secondary)'; } }}>
          <svg width="10" height="10" viewBox="0 0 12 12" fill="none" stroke="currentColor"
            strokeWidth="2.4" strokeLinecap="round">
            <line x1="6" y1="1.5" x2="6" y2="10.5"/><line x1="1.5" y1="6" x2="10.5" y2="6"/>
          </svg>
        </button>
      </div>
      {open && (
        <ArtistDropdown
          allOptions={allOptions}
          excluded={[...locked, ...artists]}
          onPick={(name) => { setArtists([...artists, name]); setOpen(false); }}
          onCreate={(name) => { onCreate?.(name); setArtists([...artists, name]); setOpen(false); }}
          onClose={() => setOpen(false)}/>
      )}
    </div>
  );
}

/* ── CoverField (default circle Z; uploaded → square album) ── */
function CoverField({ src, onChange, large = false }) {
  const [hov, setHov] = useState(false);
  const inputRef = useRef(null);
  const size = large ? '5.25rem' : '4rem';
  const hasImage = !!src;
  return (
    <div onClick={() => inputRef.current?.click()}
      onMouseEnter={() => setHov(true)} onMouseLeave={() => setHov(false)}
      style={{
        width: size, height: size, flexShrink: 0,
        position: 'relative', cursor: 'pointer', overflow: 'hidden',
        borderRadius: hasImage ? 'var(--radius-md)' : '50%',
        background: hasImage ? 'transparent' : 'var(--pink)',
        border: hasImage ? '1px solid var(--border-mid)' : 'none',
        boxShadow: hasImage ? 'none' : (hov ? '0 0 24px var(--pink-glow)' : '0 0 16px var(--pink-shadow)'),
        transition: 'all var(--dur-mid) var(--ease-snap)',
        display: 'flex', alignItems: 'center', justifyContent: 'center'
      }}>
      <input ref={inputRef} type="file" accept="image/*"
        onChange={e => { if (e.target.files[0]) onChange(e.target.files[0]); }}
        style={{ display: 'none' }}/>
      {hasImage ? (
        <img src={src} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}/>
      ) : (
        <ZLogo size={parseFloat(size) * 16}/>
      )}
      {/* hover overlay */}
      <div style={{
        position: 'absolute', inset: 0, borderRadius: hasImage ? 'var(--radius-md)' : '50%',
        background: 'rgba(0,0,0,0.6)', display: 'flex', flexDirection: 'column',
        alignItems: 'center', justifyContent: 'center', gap: '0.25rem',
        opacity: hov ? 1 : 0, transition: 'opacity var(--dur-fast) ease',
        pointerEvents: 'none' }}>
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white"
          strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
          <polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/>
        </svg>
        <span style={{ fontSize: '0.625rem', color: 'white', fontWeight: 600,
          letterSpacing: '0.04em', textTransform: 'uppercase' }}>
          {hasImage ? 'change' : 'add cover'}
        </span>
      </div>
    </div>
  );
}

/* ── EditableTitle (click to rename inline) ──────────────── */
function EditableTitle({ value, onChange, placeholder = 'untitled', large = false }) {
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(value);
  const inputRef = useRef(null);

  useEffect(() => { if (!editing) setDraft(value); }, [value, editing]);
  useEffect(() => { if (editing) { inputRef.current?.focus(); inputRef.current?.select(); } }, [editing]);

  const commit = () => {
    const v = draft.trim() || value;
    onChange(v);
    setEditing(false);
  };

  if (editing) {
    return (
      <input ref={inputRef} value={draft}
        onChange={e => setDraft(e.target.value)}
        onBlur={commit}
        onKeyDown={e => {
          if (e.key === 'Enter') commit();
          if (e.key === 'Escape') { setDraft(value); setEditing(false); }
        }}
        style={{
          width: '100%', background: 'var(--bg-base)',
          border: '1px solid var(--pink-border)', outline: 'none',
          borderRadius: 'var(--radius-sm)',
          padding: large ? '0.4rem 0.625rem' : '0.25rem 0.4375rem',
          color: 'var(--text-primary)', fontFamily: 'var(--font)',
          fontSize: large ? 'var(--text-xl)' : 'var(--text-md)',
          fontWeight: large ? 700 : 600,
          boxShadow: '0 0 0 3px var(--pink-shadow)'
        }}/>
    );
  }
  return (
    <span onClick={() => setEditing(true)}
      title="click to rename"
      style={{
        display: 'inline-block', maxWidth: '100%',
        padding: large ? '0.4rem 0.625rem' : '0.25rem 0.4375rem',
        margin: large ? '0 0 0 -0.625rem' : '0 0 0 -0.4375rem',
        borderRadius: 'var(--radius-sm)',
        fontSize: large ? 'var(--text-xl)' : 'var(--text-md)',
        fontWeight: large ? 700 : 600,
        color: value ? 'var(--text-primary)' : 'var(--text-muted)',
        cursor: 'text',
        whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis',
        transition: 'background var(--dur-fast) ease',
        borderBottom: '1px dashed transparent'
      }}
      onMouseEnter={e => {
        e.currentTarget.style.background = 'var(--bg-hover)';
        e.currentTarget.style.borderBottomColor = 'var(--border-mid)';
      }}
      onMouseLeave={e => {
        e.currentTarget.style.background = 'transparent';
        e.currentTarget.style.borderBottomColor = 'transparent';
      }}>
      {value || placeholder}
    </span>
  );
}

/* ── DragHandle ──────────────────────────────────────────── */
function DragHandle({ dragging }) {
  return (
    <div style={{
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      width: '1.25rem', height: '1.25rem', cursor: 'grab',
      color: dragging ? 'var(--pink)' : 'var(--text-muted)',
      opacity: dragging ? 1 : 0.7, transition: 'color var(--dur-fast) ease' }}>
      <svg width="10" height="14" viewBox="0 0 10 14" fill="currentColor">
        <circle cx="2" cy="2" r="1.2"/><circle cx="8" cy="2" r="1.2"/>
        <circle cx="2" cy="7" r="1.2"/><circle cx="8" cy="7" r="1.2"/>
        <circle cx="2" cy="12" r="1.2"/><circle cx="8" cy="12" r="1.2"/>
      </svg>
    </div>
  );
}

/* ── TrackRow ────────────────────────────────────────────── */
function TrackRow({
  track, num, onTitleChange, onArtistsChange, onRemove,
  allArtists, onCreateArtist, lockedArtists,
  rowRef, onHandlePointerDown, dragStyle, isDragging, anyDragging
}) {
  const [hov, setHov] = useState(false);
  const showHover = hov && !anyDragging;
  return (
    <div
      ref={rowRef}
      onMouseEnter={() => setHov(true)} onMouseLeave={() => setHov(false)}
      style={{
        display: 'grid',
        gridTemplateColumns: '1.5rem 1.5rem 1fr auto auto',
        alignItems: 'start', columnGap: '0.625rem', rowGap: '0.375rem',
        padding: '0.625rem 0.625rem 0.625rem 0.375rem',
        borderRadius: 'var(--radius-md)',
        background: showHover ? 'var(--bg-hover)' : 'var(--bg-card)',
        border: `1px solid ${showHover ? 'var(--border-mid)' : 'var(--border-dim)'}`,
        boxShadow: '0 1px 0 rgba(0,0,0,0.35), 0 1px 2px rgba(0,0,0,0.18)',
        transition: 'background var(--dur-fast) ease, border-color var(--dur-fast) ease',
        position: 'relative',
        userSelect: isDragging ? 'none' : 'auto',
        ...(dragStyle || {})
      }}>
      {/* drag handle */}
      <div
        onPointerDown={onHandlePointerDown}
        style={{
          alignSelf: 'center', display: 'flex', justifyContent: 'center',
          touchAction: 'none',
          cursor: isDragging ? 'grabbing' : 'grab'
        }}>
        <DragHandle dragging={isDragging}/>
      </div>
      {/* num */}
      <div style={{ alignSelf: 'center', textAlign: 'right',
        fontSize: 'var(--text-sm)', color: 'var(--text-muted)',
        fontVariantNumeric: 'tabular-nums' }}>
        {String(num).padStart(2, '0')}
      </div>
      {/* title + artists (col span 1, row 2 for artists) */}
      <div style={{ minWidth: 0, display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
        <EditableTitle value={track.title} onChange={onTitleChange}/>
        <ArtistChipsField
          artists={track.artists}
          setArtists={onArtistsChange}
          allOptions={allArtists}
          onCreate={onCreateArtist}
          locked={lockedArtists}
          dense
          placeholder="add artist…"/>
      </div>
      {/* duration */}
      <div style={{ alignSelf: 'center',
        fontSize: 'var(--text-sm)', color: 'var(--text-muted)',
        fontVariantNumeric: 'tabular-nums',
        padding: '0.25rem 0.5rem',
        background: 'var(--bg-elevated)', border: '1px solid var(--border-dim)',
        borderRadius: 'var(--radius-pill)' }}>
        {fmtTime(track.duration)}
      </div>
      {/* remove */}
      <div style={{ alignSelf: 'center', opacity: hov ? 1 : 0.4, transition: 'opacity var(--dur-fast) ease' }}>
        <IconBtn onClick={onRemove} title="remove" danger size={22}>
          <svg width="11" height="11" viewBox="0 0 12 12" fill="none" stroke="currentColor"
            strokeWidth="2.2" strokeLinecap="round">
            <line x1="2.5" y1="2.5" x2="9.5" y2="9.5"/>
            <line x1="9.5" y1="2.5" x2="2.5" y2="9.5"/>
          </svg>
        </IconBtn>
      </div>
    </div>
  );
}

/* ── DisabledChip (read-only meta chip) ──────────────────── */
function DisabledChip({ icon, label, value }) {
  return (
    <span style={{
      display: 'inline-flex', alignItems: 'center', gap: '0.4rem',
      padding: '0.3rem 0.6rem 0.3rem 0.5rem',
      borderRadius: 'var(--radius-pill)',
      background: 'var(--bg-base)',
      border: '1px dashed var(--border-mid)',
      fontSize: 'var(--text-xs)', color: 'var(--text-muted)',
      fontVariantNumeric: 'tabular-nums', cursor: 'not-allowed', userSelect: 'none'
    }} title={`${label} (calculated)`}>
      {icon}
      <span style={{ textTransform: 'uppercase', letterSpacing: '0.06em', fontWeight: 700,
        fontSize: '0.5625rem', color: 'var(--text-disabled)' }}>{label}</span>
      <span style={{ fontWeight: 600, color: 'var(--text-secondary)' }}>{value}</span>
    </span>
  );
}

Object.assign(window, {
  ZLogo, Checkbox, IconBtn, ArtistDropdown, ArtistChipsField,
  CoverField, TrackRow, EditableTitle, DragHandle, DisabledChip,
  fmtTime, fmtBytes, cleanFilename
});
