# Graph Report - ZpotifyUI  (2026-07-15)

## Corpus Check
- 298 files · ~53,123 words
- Verdict: corpus is large enough that graph structure adds value.

## Summary
- 1316 nodes · 2765 edges · 89 communities (79 shown, 10 thin omitted)
- Extraction: 100% EXTRACTED · 0% INFERRED · 0% AMBIGUOUS · INFERRED: 3 edges (avg confidence: 0.6)
- Token cost: 0 input · 0 output

## Graph Freshness
- Built from commit: `cf25abf5`
- Run `git rev-parse HEAD` and compare to check if the graph is stale.
- Run `graphify update .` after code changes (no API cost).

## Community Hubs (Navigation)
- zpotify_service_files.pb.ts
- Dropdown.tsx
- HomePage.ts
- MainLayout.tsx
- fetch.pb.ts
- usePlayer.ts
- AudioPlayerImpl
- useToaster
- Auth.ts
- DropZoneScreen.tsx
- compilerOptions
- CLAUDE.md
- devDependencies
- zpotify_service_auth.pb.ts
- useUser
- useSearchPage.ts
- SongEditDialog.tsx
- usePlaylistInfoSegment.ts
- ArtistsService.ts
- FilesList.tsx
- MultitrackUploadModal.tsx
- ArtistItem
- zpotify_service_playlist.pb.ts
- PlaylistService.ts
- useDialog
- CachedSongsAccordion.tsx
- useTrackDrafts.ts
- PlaylistsLibrarySegment.tsx
- dependencies
- index.ts
- useUser.ts
- CommentsSection.tsx
- audioCacheStore.ts
- zpotify_service_feature_flags.pb.ts
- ChooseScreen.tsx
- TrackRow.tsx
- WebApi.ts
- ArtistChipsField.tsx
- PlaylistAPI
- SongsService
- LazyLoadSongsList.tsx
- MainContent.tsx
- InfoControls.tsx
- UserWidget.tsx
- BaseService.ts
- AlbumTag
- usePendingFiles.tsx
- zpotify_service_artists.pb.ts
- PlaylistControls.tsx
- MoreButton.tsx
- CoverWithFallback.tsx
- InitPage.tsx
- ChipsField.tsx
- PrivateLockWidget.tsx
- IPlaylistService
- .ListLibrary
- TrackList.tsx
- PlaylistScreenWidget.tsx
- HeaderSearchInput.tsx
- SearchPage.tsx
- EditableArtistPicker.tsx
- scripts
- PlayButton.tsx
- UploadStatusChip.tsx
- AddTrackDialog.tsx
- PlayerBarSegment.tsx
- compilerOptions
- zpotify_common.pb.ts
- supportedAudio.ts
- ZpotifyUI Development Manifesto
- AudioScreen.tsx
- LibraryGridScreenSkeleton.tsx
- package.json
- AuthAPI
- Link.ts
- EditableText.tsx
- React + TypeScript + Vite
- Carousel.tsx
- Song.ts
- eslint.config.js

## God Nodes (most connected - your core abstractions)
1. `useToaster()` - 52 edges
2. `useDialog` - 45 edges
3. `SongBase` - 38 edges
4. `useUser` - 35 edges
5. `AudioPlayerImpl` - 34 edges
6. `ArtistItem` - 31 edges
7. `PlaylistService` - 29 edges
8. `compilerOptions` - 21 edges
9. `BaseService` - 18 edges
10. `Playlist` - 17 edges

## Surprising Connections (you probably didn't know these)
- `EditTrackDialogProps` --references--> `SongBase`  [EXTRACTED]
  src/dialogs/EditTrack/EditTrackDialog.tsx → src/app/api/zpotify/zpotify_common.pb.ts
- `SongSearchBoxProps` --references--> `SongBase`  [EXTRACTED]
  src/widgets/SongSearchBox/SongSearchBox.tsx → src/app/api/zpotify/zpotify_common.pb.ts
- `FilesList()` --calls--> `useDialog`  [EXTRACTED]
  src/dialogs/FileList/FilesList.tsx → src/app/hooks/Dialog.tsx
- `LogPassAuth()` --calls--> `useDialog`  [EXTRACTED]
  src/features/auth/LogPassAuth.tsx → src/app/hooks/Dialog.tsx
- `HeaderPart()` --calls--> `useDialog`  [EXTRACTED]
  src/widgets/Header/HeaderPart.tsx → src/app/hooks/Dialog.tsx

## Import Cycles
- 3-file cycle: `src/entities/artist/useLikedArtists.ts -> src/shared/api/ArtistsService.ts -> src/widgets/ArtistField/ArtistChipsField.tsx -> src/entities/artist/useLikedArtists.ts`

## Communities (89 total, 10 thin omitted)

### Community 0 - "zpotify_service_files.pb.ts"
Cohesion: 0.06
Nodes (34): BatchDeleteFiles, BatchDeleteFilesRequest, BatchDeleteFilesResponse, CheckFilesByHashes, CheckFilesByHashesFoundFileByHash, CheckFilesByHashesRequest, CheckFilesByHashesResponse, DeleteFile (+26 more)

### Community 1 - "Dropdown.tsx"
Cohesion: 0.06
Nodes (34): SearchIcon(), UploadArrowIcon(), ZLogoIcon(), CoverFieldProps, CoverUploadProgress(), CoverUploadProgressProps, Dropdown(), DropdownProps (+26 more)

### Community 2 - "HomePage.ts"
Cohesion: 0.05
Nodes (33): GetUserSettings, GetUserSettingsRequest, GetUserSettingsResponse, Me, MeRequest, MeResponse, UserAPI, UserData (+25 more)

### Community 3 - "MainLayout.tsx"
Cohesion: 0.06
Nodes (31): MainLayout(), AnimatedZ(), HomeIcon(), NavSearchIcon(), SidebarToggleIcon(), UploadsIcon(), SegmentCarousel(), SegmentCarouselProps (+23 more)

### Community 4 - "fetch.pb.ts"
Cohesion: 0.05
Nodes (35): b64, b64Encode(), fetchStreamingRequest(), FlattenedRequestPayload, flattenRequestPayload(), getNewLineDelimitedJSONDecodingStream(), getNotifyEntityArrivalSink(), isPlainObject() (+27 more)

### Community 5 - "usePlayer.ts"
Cohesion: 0.10
Nodes (18): VolumeControlProps, VolumeBarProps, VolumeDisplayProps, PlayPauseButton(), PlayPauseButtonProps, ShuffleTracksButton(), ShuffleTracksButtonProps, TrackProgressControls() (+10 more)

### Community 7 - "useToaster"
Cohesion: 0.15
Nodes (17): GripIcon(), PlayTriangleIcon(), EditTrackDialog(), EditTrackDialogProps, useListSongs(), UseListSongsOptions, SongListRefreshState, useSongListRefresh (+9 more)

### Community 8 - "Auth.ts"
Cohesion: 0.16
Nodes (14): AuthData, User, apiPrefix(), InitReq, options, AuthMiddleware, AuthService, AuthViaTelegram() (+6 more)

### Community 9 - "DropZoneScreen.tsx"
Cohesion: 0.11
Nodes (15): DashedRingIcon(), DashedRingIconProps, DropZoneTargetIcon(), DropZoneTargetIconProps, DropZoneUploadIcon(), DropZoneUploadIconProps, SpinnerIcon(), DragOverDecoration() (+7 more)

### Community 10 - "compilerOptions"
Cohesion: 0.08
Nodes (24): compilerOptions, allowImportingTsExtensions, allowJs, allowSyntheticDefaultImports, esModuleInterop, forceConsistentCasingInFileNames, isolatedModules, jsx (+16 more)

### Community 11 - "CLAUDE.md"
Cohesion: 0.09
Nodes (22): Architecture — Feature Slice Design, Async style, Barrel / index.ts, Coding rules, Commands, Error and Confirmation Handling, Exploration Rules, Export conventions (+14 more)

### Community 12 - "devDependencies"
Cohesion: 0.09
Nodes (23): devDependencies, eslint, eslint-config-prettier, eslint-import-resolver-typescript, @eslint/js, eslint-plugin-import, eslint-plugin-prettier, eslint-plugin-react (+15 more)

### Community 13 - "zpotify_service_auth.pb.ts"
Cohesion: 0.09
Nodes (21): Absent, Auth, AuthLogPass, AuthRequest, AuthResponse, AuthTelegramOAuth, AuthViaAsync, AuthViaAsyncRequest (+13 more)

### Community 14 - "useUser"
Cohesion: 0.23
Nodes (12): albumPath(), Path, usePlaylistSongs(), User(), useUser, EarlyAccessPage(), ErrorPage(), AlbumPage() (+4 more)

### Community 15 - "useSearchPage.ts"
Cohesion: 0.16
Nodes (16): FILTER_LABELS, FilterChipsProps, FilterKey, EMPTY_RESPONSE, UseSearchPageResult, ISearchService, MOCK_ALBUMS, MOCK_ARTISTS (+8 more)

### Community 16 - "SongEditDialog.tsx"
Cohesion: 0.13
Nodes (14): ModalStep, DOT_STEPS, PanelHeader(), PanelHeaderProps, STEP_TITLES, SongEditDialogProps, BackButton(), BackButtonProps (+6 more)

### Community 17 - "usePlaylistInfoSegment.ts"
Cohesion: 0.18
Nodes (11): EditableAlbumName(), EditableAlbumNameProps, EditableYearProps, TrackCountLabel(), TrackCountLabelProps, PlaylistInfoSegment(), usePlaylistInfoSegment(), ArtistOrOwnerRow() (+3 more)

### Community 18 - "ArtistsService.ts"
Cohesion: 0.15
Nodes (6): Paging, ArtistsAPI, ListArtistRequest, ListArtistResponse, ArtistsService, IArtistsService

### Community 19 - "FilesList.tsx"
Cohesion: 0.13
Nodes (10): FilesList(), FilesListProps, SongEditDialog(), LogPassAuth(), Button(), ButtonProps, InputProps, StyleProps (+2 more)

### Community 20 - "MultitrackUploadModal.tsx"
Cohesion: 0.15
Nodes (13): CheckIcon(), ChevronRightIcon(), RetryAllIcon(), MultitrackUploadModal(), MultitrackUploadModalProps, TargetPlaylist, PlaylistToggleRow(), PlaylistToggleRowProps (+5 more)

### Community 21 - "ArtistItem"
Cohesion: 0.16
Nodes (15): PlaylistDetailsPanelProps, TrackListProps, TrackDraft, MultitrackSubmitParams, MultitrackSubmitState, ToCreateTrack, MultitrackSummary, MultitrackSummaryParams (+7 more)

### Community 22 - "zpotify_service_playlist.pb.ts"
Cohesion: 0.11
Nodes (17): AddSongsToPlaylist, AddSongsToPlaylistResponse, AddSongToPlaylist, AddSongToPlaylistResponse, ChangeSongsOrder, ChangeSongsOrderResponse, CreatePlaylist, DeleteSong (+9 more)

### Community 23 - "PlaylistService.ts"
Cohesion: 0.14
Nodes (17): AddSongsToPlaylistRequest, AddSongToPlaylistRequest, ChangeSongsOrderRequest, CreatePlaylistRequest, DeleteSongRequest, FollowPlaylistRequest, GetPlaylistRequest, ListPlaylistsRequest (+9 more)

### Community 24 - "useDialog"
Cohesion: 0.18
Nodes (9): DialogManager, useDialog, PlusIcon(), PlusIconProps, AddTrackDialog(), SettingsDialog(), GhostSong(), Dialog() (+1 more)

### Community 25 - "CachedSongsAccordion.tsx"
Cohesion: 0.20
Nodes (12): RemoveTrackIcon(), CachedSongEntry, useCachedSongs(), AlbumGroup, CachedSongsAccordion(), groupSongsByAlbum(), matchesQuery(), AccordionHeader() (+4 more)

### Community 26 - "useTrackDrafts.ts"
Cohesion: 0.22
Nodes (16): buildNewTracksFromFresh(), ClassifiedFile, classifyIncomingFiles(), createInitialTracks(), InitialTrackMeta, loadInitialTrackMeta(), mapArtists(), mergeInitialTrack() (+8 more)

### Community 27 - "PlaylistsLibrarySegment.tsx"
Cohesion: 0.19
Nodes (11): AlbumCard(), TrackRow(), TrackRowProps, PlaylistCardWide(), AlbumCardProps, LibraryItem, PlaylistCardWideProps, TrackPreview (+3 more)

### Community 28 - "dependencies"
Cohesion: 0.12
Nodes (17): dependencies, classnames, framer-motion, grpc-web, @hookstate/core, music-metadata-browser, react, react-dom (+9 more)

### Community 29 - "index.ts"
Cohesion: 0.24
Nodes (13): Playlist, SongBase, DownloadIcon(), useDownloadProgress(), Props, PlaylistInfoSegmentProps, UsePlaylistInfoSegmentParams, InfoControlsProps (+5 more)

### Community 30 - "useUser.ts"
Cohesion: 0.21
Nodes (9): Router(), queryClient, ErrorReason, Errors, GrpcErrorDetails, ServiceError, UserService, UserInfo (+1 more)

### Community 31 - "CommentsSection.tsx"
Cohesion: 0.16
Nodes (11): HeartIcon(), HeartIconProps, CommentsSectionProps, MOCK_COMMENTS, MockComment, TODO: implement comments API — no backend endpoint exists yet, TODO: implement comments API — no backend endpoint exists yet, SaveButtonWidget() (+3 more)

### Community 32 - "audioCacheStore.ts"
Cohesion: 0.19
Nodes (13): cacheAudio(), cacheAudioUncoordinated(), cacheTracks(), clearAudioCache(), getCachedAudio(), getTrackUrl(), inFlightCacheRequests, listCachedUrls() (+5 more)

### Community 33 - "zpotify_service_feature_flags.pb.ts"
Cohesion: 0.21
Nodes (10): FeatureFlag, FeatureFlagId, FeatureFlagsAPI, GetFeatureFlags, GetFeatureFlagsRequest, GetFeatureFlagsResponse, FeatureFlagsStore, useFeatureFlags (+2 more)

### Community 34 - "ChooseScreen.tsx"
Cohesion: 0.17
Nodes (8): CreatePlaylistIcon(), UploadArrowLargeIcon(), ChooseScreen(), CreatePlaylistCard(), CreatePlaylistCardProps, LibraryCard(), LibraryCardProps, UploadCardProps

### Community 35 - "TrackRow.tsx"
Cohesion: 0.17
Nodes (10): DragHandleIcon(), EditableTitleProps, TODO: switch to chures Input once it supports ref/onKeyDown, TODO: Make editable here and send update name for such files if changed, TrackRow(), TrackRowProps, cleanTrackNumber(), formatBytes() (+2 more)

### Community 36 - "WebApi.ts"
Cohesion: 0.24
Nodes (10): isHttpCodeRetryable(), WithDescription(), WithHttpStatus(), WithIsNonRetryable(), WithStatusCode(), WithTitle(), ServiceErrorFromHttp(), WebApi (+2 more)

### Community 37 - "ArtistChipsField.tsx"
Cohesion: 0.21
Nodes (9): ArtistBase, LikedArtistsState, useLikedArtists, ArtistRowProps, SidebarArtistsWidget(), SidebarArtistsWidgetProps, uuidToHslSeed(), ArtistChipsField() (+1 more)

### Community 39 - "SongsService"
Cohesion: 0.21
Nodes (3): SongAPI, ISongsService, SongsService

### Community 40 - "LazyLoadSongsList.tsx"
Cohesion: 0.21
Nodes (9): playlistPath(), ActionButtonProps, IconButton(), ZButton(), ZButtonProps, DisplayPlaylistSegmentProps, PlaylistHomeSegment(), InfiniteSongsListProps (+1 more)

### Community 41 - "MainContent.tsx"
Cohesion: 0.23
Nodes (9): ClockIcon(), selectFlagEnabled(), LikedSongsState, useLikedSongs, SongListPermissions, Drag, MainContent(), SongListWidget() (+1 more)

### Community 42 - "InfoControls.tsx"
Cohesion: 0.24
Nodes (7): ShareIcon(), RandomArrows(), IconButton(), IconButtonProps, InfoControls(), ShareButton(), ShuffleButton()

### Community 43 - "UserWidget.tsx"
Cohesion: 0.22
Nodes (9): AvatarProps, generateColor(), GeneratedAvatar(), generateHash(), AddTrackButton(), AddTrackButtonProps, HeaderPart(), UserWidget() (+1 more)

### Community 44 - "BaseService.ts"
Cohesion: 0.27
Nodes (9): InitReq, BaseService, getAuth(), setAuthMiddleware(), WebApiParams, withRetries(), GrpcError, isReason() (+1 more)

### Community 45 - "AlbumTag"
Cohesion: 0.21
Nodes (5): AlbumTag, CreatePlaylistResponse, UpdatePlaylistResponse, GenreChipsRow(), GenreChipsRowProps

### Community 46 - "usePendingFiles.tsx"
Cohesion: 0.27
Nodes (8): SongFile, MusicFileIcon(), MusicFileIconProps, AddTrackContext, FileItem(), FileItemProps, PendingFilesScreen(), usePendingFiles()

### Community 47 - "zpotify_service_artists.pb.ts"
Cohesion: 0.17
Nodes (11): CreateArtist, CreateArtistRequest, CreateArtistResponse, LikeArtist, LikeArtistRequest, LikeArtistResponse, ListArtist, ListArtistFilters (+3 more)

### Community 48 - "PlaylistControls.tsx"
Cohesion: 0.23
Nodes (6): EditIcon(), EditIconProps, RemoveIcon(), SaveIcon(), EditControls(), EditControlsProps

### Community 49 - "MoreButton.tsx"
Cohesion: 0.30
Nodes (8): MoreDots(), MenuOption(), MenuOptionProps, Menu(), MenuOption, MenuProps, MoreButton(), MoreButtonProps

### Community 50 - "CoverWithFallback.tsx"
Cohesion: 0.21
Nodes (9): CoverWithFallback(), CoverWithFallbackProps, GenerativeCover(), GenerativeCoverProps, PALETTES, ShapeFn, SHAPES, CoverSeedSource (+1 more)

### Community 51 - "InitPage.tsx"
Cohesion: 0.26
Nodes (7): LoginViaPass(), TelegramAuth(), InitPage(), ZLogoLanding(), GetTelegramBotId(), AuthButton(), AuthButtonProps

### Community 52 - "ChipsField.tsx"
Cohesion: 0.22
Nodes (7): AlbumTagKind, LockIcon(), Chip(), ChipProps, CHIP_KIND_LABELS, CHIP_KINDS, ChipsFieldProps

### Community 53 - "PrivateLockWidget.tsx"
Cohesion: 0.25
Nodes (7): PrivateLockIcon(), PrivateLockIconProps, PrivatePlaylistIndicator(), PrivateLockWidget(), PrivateLockWidgetProps, usePrivateLockWidget(), UsePrivateLockWidgetParams

### Community 55 - ".ListLibrary"
Cohesion: 0.20
Nodes (3): ListPlaylistsResponse, ListSongsResponse, mapToTrackPreviews()

### Community 56 - "TrackList.tsx"
Cohesion: 0.31
Nodes (7): TrackList(), computeGhostStyle(), computeRowStyle(), Drag, TrackDragApi, useTrackDrag(), canCleanTrackNumbers()

### Community 57 - "PlaylistScreenWidget.tsx"
Cohesion: 0.36
Nodes (7): isAlbum(), joinArtistNames(), toQueueTracks(), QueueTrack, computeTotalDuration(), mapPlaylistArtists(), PlaylistScreenWidget()

### Community 58 - "HeaderSearchInput.tsx"
Cohesion: 0.24
Nodes (8): SearchQueryState, useSearchQuery, SearchPage(), matchesAlbum(), matchesArtist(), matchesPlaylist(), useSearchPage(), HeaderSearchInput()

### Community 59 - "SearchPage.tsx"
Cohesion: 0.27
Nodes (6): ArtistCard(), ArtistCardProps, EmptyState(), EmptyStateProps, SectionLabel(), SectionLabelProps

### Community 60 - "EditableArtistPicker.tsx"
Cohesion: 0.31
Nodes (6): EditableArtistPickerContext, FADE_TRANSITION, HEIGHT_TRANSITION, PlaylistOwnerLabel(), PlaylistOwnerLabelProps, ArtistOrOwnerRowProps

### Community 61 - "scripts"
Cohesion: 0.22
Nodes (9): scripts, build, dev, gen, lint, lint:css, lint:fix, lint:js (+1 more)

### Community 62 - "PlayButton.tsx"
Cohesion: 0.28
Nodes (6): PauseIcon(), PauseIconProps, PlayIcon(), PlayIconProps, PlayButton(), PlayButtonProps

### Community 63 - "UploadStatusChip.tsx"
Cohesion: 0.31
Nodes (5): UploadArrowSmallIcon(), UploadDoneIcon(), UploadErrorIcon(), UploadStatusChip(), UploadStatusChipProps

### Community 64 - "AddTrackDialog.tsx"
Cohesion: 0.36
Nodes (5): BACK_STEPS, SCREENS, MetaDialog(), MetaDialogProps, AudioFile

### Community 65 - "PlayerBarSegment.tsx"
Cohesion: 0.36
Nodes (7): computeCoverColor(), COVER_COLORS, formatTime(), PlayerBarSegment(), useIsSongCached(), CachedIndicator(), useAudioPlayer()

### Community 66 - "compilerOptions"
Cohesion: 0.22
Nodes (8): compilerOptions, allowSyntheticDefaultImports, composite, module, moduleResolution, skipLibCheck, strict, include

### Community 67 - "zpotify_common.pb.ts"
Cohesion: 0.25
Nodes (7): Absent, AlbumVersionMetadata, AlbumVersionMetadataVersionKind, BaseAlbumTag, OneOf, SongTag, SongTagKind

### Community 68 - "supportedAudio.ts"
Cohesion: 0.43
Nodes (5): DropZone(), DropZoneProps, AUDIO_ACCEPT, isSupportedAudioFile(), SUPPORTED_AUDIO_EXTENSIONS

### Community 69 - "ZpotifyUI Development Manifesto"
Cohesion: 0.33
Nodes (5): AI Assistant Guidelines, Development Principles, Styling, Tech Stack & Architecture, ZpotifyUI Development Manifesto

### Community 70 - "AudioScreen.tsx"
Cohesion: 0.53
Nodes (4): AudioSettings, useAudioSettings, useAudioCacheStore, AudioScreen()

### Community 71 - "LibraryGridScreenSkeleton.tsx"
Cohesion: 0.47
Nodes (3): AlbumCardSkeleton(), PlaylistCardWideSkeleton(), LibraryGridScreenSkeleton()

### Community 72 - "package.json"
Cohesion: 0.40
Nodes (4): name, private, type, version

## Knowledge Gaps
- **347 isolated node(s):** `localPlugin`, `name`, `private`, `version`, `type` (+342 more)
  These have ≤1 connection - possible missing edges or undocumented components.
- **10 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `useToaster()` connect `useToaster` to `Dropdown.tsx`, `HomePage.ts`, `useUser`, `SongEditDialog.tsx`, `usePlaylistInfoSegment.ts`, `FilesList.tsx`, `MultitrackUploadModal.tsx`, `ArtistItem`, `useDialog`, `CachedSongsAccordion.tsx`, `useTrackDrafts.ts`, `PlaylistsLibrarySegment.tsx`, `index.ts`, `CommentsSection.tsx`, `MainContent.tsx`, `usePendingFiles.tsx`, `InitPage.tsx`, `PrivateLockWidget.tsx`, `AddTrackDialog.tsx`, `AudioScreen.tsx`?**
  _High betweenness centrality (0.040) - this node is a cross-community bridge._
- **Why does `SongBase` connect `index.ts` to `audioCacheStore.ts`, `Dropdown.tsx`, `zpotify_common.pb.ts`, `useToaster`, `SongsService`, `MainContent.tsx`, `InfoControls.tsx`, `BaseService.ts`, `PlaylistControls.tsx`, `usePlaylistInfoSegment.ts`, `ArtistItem`, `TrackList.tsx`, `PlaylistScreenWidget.tsx`, `useTrackDrafts.ts`?**
  _High betweenness centrality (0.028) - this node is a cross-community bridge._
- **Why does `useDialog` connect `useDialog` to `AddTrackDialog.tsx`, `AudioScreen.tsx`, `useToaster`, `UserWidget.tsx`, `usePendingFiles.tsx`, `SongEditDialog.tsx`, `InitPage.tsx`, `FilesList.tsx`, `MultitrackUploadModal.tsx`, `CachedSongsAccordion.tsx`, `index.ts`?**
  _High betweenness centrality (0.025) - this node is a cross-community bridge._
- **What connects `localPlugin`, `name`, `private` to the rest of the system?**
  _353 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `zpotify_service_files.pb.ts` be split into smaller, more focused modules?**
  _Cohesion score 0.061581920903954805 - nodes in this community are weakly interconnected._
- **Should `Dropdown.tsx` be split into smaller, more focused modules?**
  _Cohesion score 0.06397306397306397 - nodes in this community are weakly interconnected._
- **Should `HomePage.ts` be split into smaller, more focused modules?**
  _Cohesion score 0.05241090146750524 - nodes in this community are weakly interconnected._