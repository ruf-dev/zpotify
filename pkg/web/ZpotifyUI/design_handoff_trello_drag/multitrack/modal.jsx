/* ═══════════════════════════════════════════════════════════
   MultitrackModal — depends on window: ZLogo, Checkbox, IconBtn,
   ArtistChipsField, CoverField, TrackRow, EditableTitle,
   DisabledChip, fmtTime, fmtBytes, cleanFilename
   Exports: MultitrackModal
   ═══════════════════════════════════════════════════════════ */
const { useState: useStateM, useEffect: useEffectM, useRef: useRefM, useMemo: useMemoM, useCallback: useCallbackM } = React;

function MultitrackModal({
  initialTracks,
  initialPlaylist,
  initialCoverSrc,
  isPlaylistMode,
  setPlaylistMode,
  allArtists,
  onCreateArtist,
  onClose,
  onSubmit,
}) {
  const [tracks, setTracks] = useStateM(initialTracks);
  const [playlistName, setPlaylistName] = useStateM(initialPlaylist || '');
  const [albumArtists, setAlbumArtists] = useStateM([]);
  const [coverSrc, setCoverSrc] = useStateM(initialCoverSrc || null);

  // ── Trello-style pointer drag ───────────────────────────
  // drag = { id, fromIdx, startY, dy, height, settling }
  const [drag, setDrag] = useStateM(null);
  const [dropIdx, setDropIdx] = useStateM(null);
  const dropIdxRef = useRefM(null);
  const rowRefs = useRefM({});
  useEffectM(() => { dropIdxRef.current = dropIdx; }, [dropIdx]);

  // sync external prop changes (Tweaks)
  useEffectM(() => {
    setTracks(initialTracks);
    setDrag(null); setDropIdx(null);
  }, [initialTracks]);
  useEffectM(() => { setCoverSrc(initialCoverSrc || null); }, [initialCoverSrc]);

  const totalDuration = useMemoM(
    () => tracks.reduce((s, t) => s + (t.duration || 0), 0),
    [tracks]
  );
  const totalSize = useMemoM(
    () => tracks.reduce((s, t) => s + (t.size || 0), 0),
    [tracks]
  );

  // ── pointer-based reorder (Trello feel) ──
  const startDrag = (e, idx, id) => {
    if (drag) return;
    if (e.button != null && e.button !== 0) return;
    const rowEl = rowRefs.current[id];
    if (!rowEl) return;
    const rect = rowEl.getBoundingClientRect();
    // row gap is 0.375rem ≈ 6px
    const gap = 6;
    const height = rect.height + gap;
    setDrag({ id, fromIdx: idx, startY: e.clientY, dy: 0, height, settling: false });
    setDropIdx(idx);
    // suppress any text-selection that starts on pointer down
    e.preventDefault();
    try { e.currentTarget.setPointerCapture?.(e.pointerId); } catch {}
  };

  useEffectM(() => {
    if (!drag || drag.settling) return;
    const count = tracks.length;
    const onMove = (ev) => {
      const dy = ev.clientY - drag.startY;
      // snap target index based on whole-row offsets
      const delta = Math.round(dy / drag.height);
      const newDropIdx = Math.max(0, Math.min(count - 1, drag.fromIdx + delta));
      setDrag(d => d ? ({ ...d, dy }) : null);
      setDropIdx(newDropIdx);
    };
    const onUp = () => {
      const fromIdx = drag.fromIdx;
      const toIdx = dropIdxRef.current ?? fromIdx;
      // settle: animate dragged row to its destination slot, then commit
      const targetDy = (toIdx - fromIdx) * drag.height;
      setDrag(d => d ? ({ ...d, dy: targetDy, settling: true }) : null);
      setTimeout(() => {
        if (toIdx !== fromIdx) {
          setTracks(ts => {
            const next = [...ts];
            const [moved] = next.splice(fromIdx, 1);
            next.splice(toIdx, 0, moved);
            return next;
          });
        }
        setDrag(null);
        setDropIdx(null);
      }, 230);
    };
    window.addEventListener('pointermove', onMove);
    window.addEventListener('pointerup', onUp);
    window.addEventListener('pointercancel', onUp);
    return () => {
      window.removeEventListener('pointermove', onMove);
      window.removeEventListener('pointerup', onUp);
      window.removeEventListener('pointercancel', onUp);
    };
  }, [drag, tracks.length]);

  const getRowDragStyle = (idx) => {
    if (!drag || dropIdx == null) return null;
    if (idx === drag.fromIdx) {
      // The lifted card
      return {
        transform: `translateY(${drag.dy}px) rotate(2.2deg) scale(1.025)`,
        boxShadow: '0 18px 40px rgba(0,0,0,0.7), 0 0 0 1px var(--pink-border), 0 0 32px var(--pink-shadow)',
        background: 'var(--bg-elevated)',
        borderColor: 'var(--pink-border)',
        zIndex: 20,
        cursor: 'grabbing',
        transition: drag.settling
          ? 'transform 0.23s cubic-bezier(0.2, 0.9, 0.3, 1.2), box-shadow 0.23s ease, border-color 0.23s ease'
          : 'box-shadow 0.15s ease, border-color 0.15s ease',
        willChange: 'transform',
      };
    }
    // Displaced neighbors slide to make room
    let dy = 0;
    if (drag.fromIdx < dropIdx) {
      if (idx > drag.fromIdx && idx <= dropIdx) dy = -drag.height;
    } else if (drag.fromIdx > dropIdx) {
      if (idx >= dropIdx && idx < drag.fromIdx) dy = drag.height;
    }
    return {
      transform: `translateY(${dy}px)`,
      transition: 'transform 0.24s cubic-bezier(0.2, 0.8, 0.2, 1)',
      willChange: 'transform',
    };
  };

  const updateTrack = (id, patch) =>
    setTracks(ts => ts.map(t => t.id === id ? { ...t, ...patch } : t));
  const removeTrack = (id) =>
    setTracks(ts => ts.filter(t => t.id !== id));

  const handleCoverFile = (file) => {
    const reader = new FileReader();
    reader.onload = () => setCoverSrc(reader.result);
    reader.readAsDataURL(file);
  };

  const isMulti = tracks.length > 1;
  const submitLabel = isPlaylistMode && isMulti ? 'create playlist' : 'upload tracks';
  const canSubmit = tracks.length > 0 && (!isPlaylistMode || playlistName.trim().length > 0);

  return (
    <div onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
      style={{
        position: 'fixed', inset: 0, zIndex: 500,
        background: 'rgba(0,0,0,0.78)',
        backdropFilter: 'blur(6px)', WebkitBackdropFilter: 'blur(6px)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        animation: 'modalOverlayIn 0.2s ease both', padding: '1.25rem'
      }}>
      <div style={{
        width: '100%', maxWidth: '44rem', maxHeight: 'calc(100vh - 2.5rem)',
        background: 'var(--bg-elevated)',
        border: '1px solid var(--border-mid)',
        borderRadius: 'var(--radius-lg)',
        boxShadow: '0 24px 64px rgba(0,0,0,0.85), 0 0 0 1px rgba(255,255,255,0.04)',
        display: 'flex', flexDirection: 'column', overflow: 'hidden',
        animation: 'modalPanelIn 0.25s var(--ease-snap) both'
      }}>

        {/* ── Header ──────────────────────────────────────────── */}
        <div style={{
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          padding: '0.875rem 1rem 0.875rem 1.125rem',
          borderBottom: '1px solid var(--border-dim)',
          flexShrink: 0
        }}>
          <div style={{ display: 'flex', alignItems: 'baseline', gap: '0.5rem', minWidth: 0 }}>
            <span style={{ fontSize: 'var(--text-lg)', fontWeight: 700, color: 'var(--text-primary)' }}>
              {isPlaylistMode && isMulti ? 'new playlist' : 'upload tracks'}
            </span>
            <span style={{ fontSize: 'var(--text-xs)', color: 'var(--text-muted)' }}>
              {tracks.length} file{tracks.length === 1 ? '' : 's'} · {fmtBytes(totalSize)}
            </span>
          </div>
          <IconBtn onClick={onClose} title="close" size={26}>
            <svg width="13" height="13" viewBox="0 0 12 12" fill="none" stroke="currentColor"
              strokeWidth="2.2" strokeLinecap="round">
              <line x1="2.5" y1="2.5" x2="9.5" y2="9.5"/>
              <line x1="9.5" y1="2.5" x2="2.5" y2="9.5"/>
            </svg>
          </IconBtn>
        </div>

        {/* ── Body (scrollable) ───────────────────────────────── */}
        <div style={{ flex: 1, overflowY: 'auto', padding: '1rem 1rem 0.5rem' }}>

          {/* Playlist mode toggle (only if multi) */}
          {isMulti && (
            <div style={{
              border: `1px solid ${isPlaylistMode ? 'var(--pink-border)' : 'var(--border-dim)'}`,
              background: isPlaylistMode ? 'rgba(217,0,127,0.05)' : 'var(--bg-card)',
              borderRadius: 'var(--radius-md)',
              transition: 'all var(--dur-fast) ease',
              marginBottom: '0.875rem'
            }}>
              <Checkbox
                checked={isPlaylistMode}
                onChange={setPlaylistMode}
                label="create playlist from these tracks"
                sub="group them as an album with shared cover, name, and artists"/>
            </div>
          )}

          {/* Playlist details section */}
          {isPlaylistMode && isMulti && (
            <div style={{
              padding: '1rem',
              background: 'var(--bg-card)',
              border: '1px solid var(--border-dim)',
              borderRadius: 'var(--radius-md)',
              marginBottom: '0.875rem',
              display: 'flex', gap: '1rem', alignItems: 'flex-start',
              animation: 'fadeUp 0.25s var(--ease-snap) both'
            }}>
              <CoverField large src={coverSrc} onChange={handleCoverFile}/>

              <div style={{ flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column', gap: '0.625rem' }}>
                {/* Playlist name */}
                <FieldGroup label="playlist name" required={!playlistName}>
                  <input
                    value={playlistName}
                    onChange={e => setPlaylistName(e.target.value)}
                    placeholder="untitled playlist"
                    style={{
                      width: '100%', background: 'var(--bg-elevated)',
                      border: `1px solid ${playlistName ? 'var(--border-mid)' : 'var(--border-mid)'}`,
                      borderRadius: 'var(--radius-sm)',
                      padding: '0.4375rem 0.625rem', outline: 'none',
                      color: 'var(--text-primary)', fontFamily: 'var(--font)',
                      fontSize: 'var(--text-md)', fontWeight: 600
                    }}
                    onFocus={e => e.currentTarget.style.borderColor = 'var(--border-bright)'}
                    onBlur={e => e.currentTarget.style.borderColor = 'var(--border-mid)'}/>
                </FieldGroup>

                {/* Album artists */}
                <FieldGroup label="album artists" hint="appear on every track">
                  <ArtistChipsField
                    artists={albumArtists}
                    setArtists={setAlbumArtists}
                    allOptions={allArtists}
                    onCreate={onCreateArtist}
                    placeholder="add album artist…"/>
                </FieldGroup>

                {/* Total duration */}
                <div style={{ display: 'flex', gap: '0.4rem', flexWrap: 'wrap' }}>
                  <DisabledChip
                    label="total"
                    value={fmtTime(totalDuration)}
                    icon={
                      <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
                        <circle cx="12" cy="12" r="9"/>
                        <polyline points="12 7 12 12 15.5 14"/>
                      </svg>
                    }/>
                  <DisabledChip
                    label="tracks"
                    value={tracks.length}
                    icon={
                      <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
                        <path d="M9 17V5l12-2v12"/>
                        <circle cx="6" cy="18" r="3"/><circle cx="18" cy="16" r="3"/>
                      </svg>
                    }/>
                </div>
              </div>
            </div>
          )}

          {/* Tracks list */}
          <div>
            <div style={{
              display: 'flex', alignItems: 'baseline', justifyContent: 'space-between',
              padding: '0 0.375rem 0.5rem', marginTop: isMulti ? 0 : '0.25rem'
            }}>
              <span style={{
                fontSize: 'var(--text-xs)', fontWeight: 700,
                color: 'var(--text-muted)', letterSpacing: '0.08em', textTransform: 'uppercase'
              }}>
                {isMulti ? 'tracks' : 'track'} · {tracks.length}
              </span>
              <span style={{
                fontSize: 'var(--text-xs)', color: 'var(--text-disabled)',
                fontStyle: 'italic'
              }}>
                drag rows to reorder · click name to rename
              </span>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.375rem' }}>
              {tracks.map((t, idx) => (
                <TrackRow
                  key={t.id}
                  track={t}
                  num={idx + 1}
                  onTitleChange={(title) => updateTrack(t.id, { title })}
                  onArtistsChange={(artists) => updateTrack(t.id, { artists })}
                  onRemove={() => removeTrack(t.id)}
                  allArtists={allArtists}
                  onCreateArtist={onCreateArtist}
                  lockedArtists={isPlaylistMode && isMulti ? albumArtists : []}
                  rowRef={(el) => { if (el) rowRefs.current[t.id] = el; else delete rowRefs.current[t.id]; }}
                  onHandlePointerDown={(e) => startDrag(e, idx, t.id)}
                  dragStyle={getRowDragStyle(idx)}
                  isDragging={drag?.fromIdx === idx}
                  anyDragging={!!drag}/>
              ))}
              {tracks.length === 0 && (
                <div style={{
                  padding: '2rem', textAlign: 'center',
                  background: 'var(--bg-card)', border: '1px dashed var(--border-mid)',
                  borderRadius: 'var(--radius-md)',
                  fontSize: 'var(--text-sm)', color: 'var(--text-muted)'
                }}>
                  no tracks left — drop more files or close
                </div>
              )}
            </div>
          </div>

        </div>

        {/* ── Footer ──────────────────────────────────────────── */}
        <div style={{
          flexShrink: 0,
          padding: '0.875rem 1rem',
          borderTop: '1px solid var(--border-dim)',
          background: 'var(--bg-elevated)',
          display: 'flex', alignItems: 'center', gap: '0.75rem'
        }}>
          <div style={{ flex: 1, minWidth: 0, display: 'flex',
            alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap' }}>
            {isPlaylistMode && isMulti && !playlistName.trim() && (
              <span style={{ fontSize: 'var(--text-xs)', color: 'var(--text-muted)' }}>
                name the playlist to continue
              </span>
            )}
          </div>
          <SubmitButton
            label={submitLabel}
            enabled={canSubmit}
            onClick={() => onSubmit({
              playlistMode: isPlaylistMode && isMulti,
              playlistName, albumArtists, coverSrc, tracks
            })}/>
        </div>
      </div>
    </div>
  );
}

/* ── FieldGroup ──────────────────────────────────────────── */
function FieldGroup({ label, hint, required, children }) {
  return (
    <div>
      <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between',
        marginBottom: '0.25rem' }}>
        <span style={{
          fontSize: '0.5625rem', fontWeight: 700,
          color: required ? 'var(--text-secondary)' : 'var(--text-muted)',
          letterSpacing: '0.08em', textTransform: 'uppercase'
        }}>
          {label}{required && <span style={{ color: 'var(--pink)', marginLeft: '0.25rem' }}>*</span>}
        </span>
        {hint && (
          <span style={{ fontSize: 'var(--text-xs)', color: 'var(--text-disabled)', fontStyle: 'italic' }}>
            {hint}
          </span>
        )}
      </div>
      {children}
    </div>
  );
}

/* ── SubmitButton ────────────────────────────────────────── */
function SubmitButton({ label, enabled, onClick }) {
  const [hov, setHov] = useStateM(false);
  return (
    <button onClick={enabled ? onClick : undefined}
      onMouseEnter={() => setHov(true)} onMouseLeave={() => setHov(false)}
      disabled={!enabled}
      style={{
        padding: '0.625rem 1.25rem',
        borderRadius: 'var(--radius-pill)',
        border: `1px solid ${enabled ? 'var(--pink)' : 'var(--border-dim)'}`,
        background: enabled ? 'var(--pink)' : 'var(--bg-card)',
        color: enabled ? 'white' : 'var(--text-disabled)',
        fontFamily: 'var(--font)', fontSize: 'var(--text-md)', fontWeight: 700,
        letterSpacing: '0.02em',
        cursor: enabled ? 'pointer' : 'not-allowed',
        transform: enabled && hov ? 'scale(1.03)' : 'scale(1)',
        boxShadow: enabled
          ? (hov ? '0 6px 28px var(--pink-glow)' : '0 4px 20px var(--pink-shadow)')
          : 'none',
        transition: 'all var(--dur-fast) ease',
        outline: 'none', flexShrink: 0,
        display: 'inline-flex', alignItems: 'center', gap: '0.5rem'
      }}>
      <span>{label}</span>
      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor"
        strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
        <polyline points="9 6 15 12 9 18"/>
      </svg>
    </button>
  );
}

window.MultitrackModal = MultitrackModal;
