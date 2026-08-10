# Graph Report - ZpotifyUI  (2026-07-24)

## Corpus Check
- 314 files · ~55,751 words
- Verdict: corpus is large enough that graph structure adds value.

## Summary
- 1402 nodes · 2990 edges · 87 communities (78 shown, 9 thin omitted)
- Extraction: 100% EXTRACTED · 0% INFERRED · 0% AMBIGUOUS · INFERRED: 7 edges (avg confidence: 0.54)
- Token cost: 0 input · 0 output

## Graph Freshness
- Built from commit: `5bf1f8eb`
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
- LibraryGridScreenSkeleton.tsx
- package.json
- Link.ts
- EditableText.tsx
- React + TypeScript + Vite
- Carousel.tsx
- Song.ts
- eslint.config.js

## God Nodes (most connected - your core abstractions)
1. `useToaster()` - 56 edges
2. `useDialog` - 49 edges
3. `SongBase` - 38 edges
4. `useUser` - 35 edges
5. `AudioPlayerImpl` - 35 edges
6. `ArtistItem` - 31 edges
7. `PlaylistService` - 29 edges
8. `BaseService` - 22 edges
9. `compilerOptions` - 21 edges
10. `Playlist` - 17 edges

## Surprising Connections (you probably didn't know these)
- `EditTrackDialogProps` --references--> `SongBase`  [EXTRACTED]
  src/dialogs/EditTrack/EditTrackDialog.tsx → src/app/api/zpotify/zpotify_common.pb.ts
- `SongSearchBoxProps` --references--> `SongBase`  [EXTRACTED]
  src/widgets/SongSearchBox/SongSearchBox.tsx → src/app/api/zpotify/zpotify_common.pb.ts
- `MobileCreateButton()` --calls--> `useDialog`  [EXTRACTED]
  src/pages/segments/MobileNavSegment/components/MobileCreateButton/MobileCreateButton.tsx → src/app/hooks/Dialog.tsx
- `PlaylistHomeSegment()` --calls--> `playlistPath()`  [EXTRACTED]
  src/widgets/PlaylistHomeSegment/PlaylistHomeSegment.tsx → src/app/routing/paths.ts
- `UploadStatusChipProps` --references--> `TrackDraft`  [EXTRACTED]
  src/dialogs/MultitrackUpload/components/UploadStatusChip/UploadStatusChip.tsx → src/dialogs/MultitrackUpload/TrackRow.tsx

## Import Cycles
- 3-file cycle: `src/entities/artist/useLikedArtists.ts -> src/shared/api/ArtistsService.ts -> src/widgets/ArtistField/ArtistChipsField.tsx -> src/entities/artist/useLikedArtists.ts`

## Communities (87 total, 9 thin omitted)

### Community 0 - "zpotify_service_files.pb.ts"
Cohesion: 0.09
Nodes (23): BatchDeleteFiles, BatchDeleteFilesRequest, BatchDeleteFilesResponse, CheckFilesByHashes, CheckFilesByHashesFoundFileByHash, CheckFilesByHashesRequest, CheckFilesByHashesResponse, DeleteFile (+15 more)

### Community 1 - "Dropdown.tsx"
Cohesion: 0.19
Nodes (13): Dropdown(), DropdownProps, useDropdownClose(), useSearchResults(), DropdownOption, getOptionId(), getOptionLabel(), DropdownCreateRow() (+5 more)

### Community 2 - "HomePage.ts"
Cohesion: 0.11
Nodes (10): SegmentTabBarProps, Tab, HomePage(), FeedSegmentInfo, HomeSegment, LibrarySegmentInfo, ManagementSegmentInfo, PlaylistSegmentInfo (+2 more)

### Community 3 - "MainLayout.tsx"
Cohesion: 0.07
Nodes (42): MainLayout(), albumPath(), Path, playlistPath(), Router(), SidebarToggleIcon(), SegmentCarousel(), SegmentCarouselProps (+34 more)

### Community 4 - "fetch.pb.ts"
Cohesion: 0.05
Nodes (35): b64, b64Encode(), fetchStreamingRequest(), FlattenedRequestPayload, flattenRequestPayload(), getNewLineDelimitedJSONDecodingStream(), getNotifyEntityArrivalSink(), isPlainObject() (+27 more)

### Community 5 - "usePlayer.ts"
Cohesion: 0.13
Nodes (12): AnimatedZ(), RandomArrows(), LogoRow(), LogoRowProps, VolumeBarProps, VolumeDisplayProps, ShuffleTracksButton(), ShuffleTracksButtonProps (+4 more)

### Community 7 - "useToaster"
Cohesion: 0.38
Nodes (5): EditTrackDialog(), EditTrackDialogProps, SongListRefreshState, useSongListRefresh, AddTracksPanel()

### Community 8 - "Auth.ts"
Cohesion: 0.11
Nodes (17): AuthAPI, AuthData, GetAuthMethodsRequest, RefreshRequest, User, apiPrefix(), InitReq, options (+9 more)

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
Cohesion: 0.19
Nodes (11): MetaDialog(), MultitrackSubmitState, ToCreateTrack, useMultitrackSubmit(), FeedRefreshState, useFeedRefresh, webApiService, internalErrors (+3 more)

### Community 15 - "useSearchPage.ts"
Cohesion: 0.08
Nodes (31): SearchIcon(), SearchQueryState, useSearchQuery, ArtistCard(), ArtistCardProps, EmptyState(), EmptyStateProps, FILTER_LABELS (+23 more)

### Community 16 - "SongEditDialog.tsx"
Cohesion: 0.24
Nodes (7): SongEditDialogProps, BackButton(), BackButtonProps, Chip(), ChipProps, NotFoundPlaylistInfoSegment(), NotFoundPlaylistInfoSegmentProps

### Community 17 - "usePlaylistInfoSegment.ts"
Cohesion: 0.23
Nodes (10): EditableAlbumName(), EditableAlbumNameProps, EditableYearProps, TrackCountLabel(), TrackCountLabelProps, PlaylistInfoSegment(), usePlaylistInfoSegment(), ArtistOrOwnerRow() (+2 more)

### Community 18 - "ArtistsService.ts"
Cohesion: 0.16
Nodes (5): ArtistsAPI, ListArtistRequest, ListArtistResponse, ArtistsService, IArtistsService

### Community 19 - "FilesList.tsx"
Cohesion: 0.05
Nodes (39): DialogManager, useDialog, BellIcon(), BellIconProps, FilesList(), NotificationDialog(), SettingsDialog(), SongEditDialog() (+31 more)

### Community 20 - "MultitrackUploadModal.tsx"
Cohesion: 0.19
Nodes (9): CheckIcon(), ChevronRightIcon(), RetryAllIcon(), MultitrackUploadModal(), MultitrackUploadModalProps, PlaylistToggleRow(), PlaylistToggleRowProps, ArtistLookup (+1 more)

### Community 21 - "ArtistItem"
Cohesion: 0.21
Nodes (14): TargetPlaylist, PlaylistDetailsPanelProps, TrackListProps, TrackDraft, MultitrackSubmitParams, buildValidationHint(), MultitrackSummary, MultitrackSummaryParams (+6 more)

### Community 22 - "zpotify_service_playlist.pb.ts"
Cohesion: 0.08
Nodes (30): AddSongsToPlaylist, AddSongsToPlaylistRequest, AddSongsToPlaylistResponse, AddSongToPlaylist, AddSongToPlaylistRequest, AddSongToPlaylistResponse, ChangeSongsOrder, ChangeSongsOrderRequest (+22 more)

### Community 23 - "PlaylistService.ts"
Cohesion: 0.14
Nodes (19): FeedDay, GetFeed, GetFeedRequest, GetFeedResponse, HomeAPI, FeedService, IFeedService, toFeedArtistItem() (+11 more)

### Community 24 - "useDialog"
Cohesion: 0.38
Nodes (4): PlusIcon(), PlusIconProps, MobileCreateButton(), ArtistChipsFieldProps

### Community 25 - "CachedSongsAccordion.tsx"
Cohesion: 0.07
Nodes (28): SongFile, CreatePlaylistIcon(), MusicFileIcon(), MusicFileIconProps, RemoveTrackIcon(), UploadArrowLargeIcon(), AddTrackContext, ChooseScreen() (+20 more)

### Community 26 - "useTrackDrafts.ts"
Cohesion: 0.22
Nodes (16): buildNewTracksFromFresh(), ClassifiedFile, classifyIncomingFiles(), createInitialTracks(), InitialTrackMeta, loadInitialTrackMeta(), mapArtists(), mergeInitialTrack() (+8 more)

### Community 27 - "PlaylistsLibrarySegment.tsx"
Cohesion: 0.19
Nodes (11): AlbumCard(), TrackRow(), TrackRowProps, PlaylistCardWide(), AlbumCardProps, LibraryItem, PlaylistCardWideProps, TrackPreview (+3 more)

### Community 28 - "dependencies"
Cohesion: 0.11
Nodes (19): dependencies, classnames, framer-motion, grpc-web, @hookstate/core, music-metadata-browser, react, react-dom (+11 more)

### Community 29 - "index.ts"
Cohesion: 0.18
Nodes (11): Playlist, SongBase, DownloadIcon(), Props, PlaylistInfoSegmentProps, UsePlaylistInfoSegmentParams, InfoControlsProps, PlaylistControlsProps (+3 more)

### Community 30 - "useUser.ts"
Cohesion: 0.17
Nodes (10): GetUserSettings, GetUserSettingsRequest, GetUserSettingsResponse, Me, MeRequest, MeResponse, UserAPI, UserData (+2 more)

### Community 31 - "CommentsSection.tsx"
Cohesion: 0.14
Nodes (14): Absent, BaseHomePageSegment, HomePageSegment, HomePageSegmentFeedSegment, HomePageSegmentLibrarySegment, HomePageSegmentManagement, HomePageSegmentPlaylistSegment, OneOf (+6 more)

### Community 32 - "audioCacheStore.ts"
Cohesion: 0.14
Nodes (20): GripIcon(), PlayTriangleIcon(), cacheAudio(), cacheAudioUncoordinated(), cacheTracks(), clearAudioCache(), getTrackUrl(), inFlightCacheRequests (+12 more)

### Community 33 - "zpotify_service_feature_flags.pb.ts"
Cohesion: 0.21
Nodes (10): FeatureFlag, FeatureFlagId, FeatureFlagsAPI, GetFeatureFlags, GetFeatureFlagsRequest, GetFeatureFlagsResponse, FeatureFlagsStore, useFeatureFlags (+2 more)

### Community 34 - "ChooseScreen.tsx"
Cohesion: 0.23
Nodes (10): PlaylistListRefreshState, usePlaylistListRefresh, PlaylistRow(), PlaylistRowData, PlaylistRowProps, PlaylistItem, SidebarPlaylistsWidget(), SidebarPlaylistsWidgetProps (+2 more)

### Community 35 - "TrackRow.tsx"
Cohesion: 0.17
Nodes (10): DragHandleIcon(), EditableTitleProps, TODO: switch to chures Input once it supports ref/onKeyDown, TODO: Make editable here and send update name for such files if changed, TrackRow(), TrackRowProps, cleanTrackNumber(), formatBytes() (+2 more)

### Community 36 - "WebApi.ts"
Cohesion: 0.14
Nodes (21): InitReq, queryClient, getAuth(), WebApiParams, withRetries(), ErrorReason, GrpcError, GrpcErrorDetails (+13 more)

### Community 37 - "ArtistChipsField.tsx"
Cohesion: 0.23
Nodes (8): ArtistBase, LikedArtistsState, useLikedArtists, ArtistRowProps, SidebarArtistsWidget(), SidebarArtistsWidgetProps, uuidToHslSeed(), ArtistChipsField()

### Community 38 - "PlaylistAPI"
Cohesion: 0.13
Nodes (3): PlaylistAPI, mapToTrackPreviews(), PlaylistService

### Community 40 - "LazyLoadSongsList.tsx"
Cohesion: 0.12
Nodes (17): useListSongs(), UseListSongsOptions, SongListPermissions, UserPermissions, ActionButtonProps, IconButton(), ZButton(), ZButtonProps (+9 more)

### Community 41 - "MainContent.tsx"
Cohesion: 0.33
Nodes (6): ClockIcon(), selectFlagEnabled(), LikedSongsState, useLikedSongs, Drag, MainContent()

### Community 42 - "InfoControls.tsx"
Cohesion: 0.20
Nodes (10): ShareIcon(), IconButton(), IconButtonProps, InfoControls(), ShareButton(), ShuffleButton(), SaveButtonWidget(), SaveButtonWidgetProps (+2 more)

### Community 43 - "UserWidget.tsx"
Cohesion: 0.21
Nodes (7): MiniClockIcon(), MiniDiscIcon(), FieldLabelRow(), FieldLabelRowProps, formatTotalDuration(), PlaylistDetailsPanel(), DisabledChipProps

### Community 44 - "BaseService.ts"
Cohesion: 0.23
Nodes (7): UploadArrowIcon(), ZLogoIcon(), CoverFieldProps, CoverUploadProgress(), CoverUploadProgressProps, EditableCoverWithFallback(), EditableCoverWithFallbackProps

### Community 45 - "AlbumTag"
Cohesion: 0.21
Nodes (5): AlbumTag, CreatePlaylistResponse, UpdatePlaylistResponse, GenreChipsRow(), GenreChipsRowProps

### Community 46 - "usePendingFiles.tsx"
Cohesion: 0.21
Nodes (10): AddTrackDialog(), BACK_STEPS, ModalStep, SCREENS, DOT_STEPS, PanelHeader(), PanelHeaderProps, STEP_TITLES (+2 more)

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
Cohesion: 0.29
Nodes (6): HomeIcon(), NavSearchIcon(), UploadsIcon(), getNavIcon(), NavItem(), NavItemProps

### Community 52 - "ChipsField.tsx"
Cohesion: 0.11
Nodes (14): AlbumTagKind, HeartIcon(), HeartIconProps, LockIcon(), Chip(), ChipProps, CHIP_KIND_LABELS, CHIP_KINDS (+6 more)

### Community 53 - "PrivateLockWidget.tsx"
Cohesion: 0.25
Nodes (7): PrivateLockIcon(), PrivateLockIconProps, PrivatePlaylistIndicator(), PrivateLockWidget(), PrivateLockWidgetProps, usePrivateLockWidget(), UsePrivateLockWidgetParams

### Community 54 - "IPlaylistService"
Cohesion: 0.17
Nodes (4): GetPlaylistResponse, ListPlaylistsResponse, ListSongsResponse, IPlaylistService

### Community 55 - ".ListLibrary"
Cohesion: 0.33
Nodes (7): FeedArtistChip(), choosePlaylistComponent(), FeedDayGroup(), feedItemTransition, Props, FeedArtistItem, FeedDay

### Community 56 - "TrackList.tsx"
Cohesion: 0.31
Nodes (7): TrackList(), computeGhostStyle(), computeRowStyle(), Drag, TrackDragApi, useTrackDrag(), canCleanTrackNumbers()

### Community 57 - "PlaylistScreenWidget.tsx"
Cohesion: 0.39
Nodes (5): formatDuration(), FeedSongRow(), FeedSongItem, SongSearchBox(), SongSearchBoxProps

### Community 58 - "HeaderSearchInput.tsx"
Cohesion: 0.29
Nodes (5): PlayPauseButton(), PlayPauseButtonProps, TrackRewindButton, PlayerControls(), PlayerProps

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
Cohesion: 0.38
Nodes (4): UploadDoneIcon(), UploadErrorIcon(), UploadStatusChip(), UploadStatusChipProps

### Community 64 - "AddTrackDialog.tsx"
Cohesion: 0.23
Nodes (10): MetaDialogProps, MetaScreen(), MetaScreenProps, formatFileBytes(), formatFileDuration(), formatFileSize(), AudioFile, MultiSelect() (+2 more)

### Community 65 - "PlayerBarSegment.tsx"
Cohesion: 0.18
Nodes (11): VolumeControlProps, computeCoverColor(), COVER_COLORS, formatTime(), PlayerBarSegment(), CachedIndicator(), AudioStoreState, playerInstance (+3 more)

### Community 66 - "compilerOptions"
Cohesion: 0.22
Nodes (8): compilerOptions, allowSyntheticDefaultImports, composite, module, moduleResolution, skipLibCheck, strict, include

### Community 67 - "zpotify_common.pb.ts"
Cohesion: 0.07
Nodes (30): Absent, AlbumVersionMetadata, AlbumVersionMetadataVersionKind, BaseAlbumTag, OneOf, Paging, SongTag, SongTagKind (+22 more)

### Community 68 - "supportedAudio.ts"
Cohesion: 0.31
Nodes (7): UploadArrowSmallIcon(), DropZone(), DropZoneProps, AUDIO_ACCEPT, isSupportedAudioFile(), SUPPORTED_AUDIO_EXTENSIONS, AddTracksPanelProps

### Community 69 - "ZpotifyUI Development Manifesto"
Cohesion: 0.33
Nodes (5): AI Assistant Guidelines, Development Principles, Styling, Tech Stack & Architecture, ZpotifyUI Development Manifesto

### Community 71 - "LibraryGridScreenSkeleton.tsx"
Cohesion: 0.47
Nodes (3): AlbumCardSkeleton(), PlaylistCardWideSkeleton(), LibraryGridScreenSkeleton()

### Community 72 - "package.json"
Cohesion: 0.40
Nodes (4): name, private, type, version

## Knowledge Gaps
- **370 isolated node(s):** `localPlugin`, `name`, `private`, `version`, `type` (+365 more)
  These have ≤1 connection - possible missing edges or undocumented components.
- **9 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `useToaster()` connect `useUser` to `zpotify_service_files.pb.ts`, `Dropdown.tsx`, `HomePage.ts`, `MainLayout.tsx`, `useToaster`, `SongEditDialog.tsx`, `usePlaylistInfoSegment.ts`, `FilesList.tsx`, `CachedSongsAccordion.tsx`, `useTrackDrafts.ts`, `audioCacheStore.ts`, `ChooseScreen.tsx`, `LazyLoadSongsList.tsx`, `MainContent.tsx`, `InfoControls.tsx`, `usePendingFiles.tsx`, `PrivateLockWidget.tsx`, `AddTrackDialog.tsx`, `zpotify_common.pb.ts`, `supportedAudio.ts`?**
  _High betweenness centrality (0.068) - this node is a cross-community bridge._
- **Why does `AudioPlayerImpl` connect `AudioPlayerImpl` to `PlayerBarSegment.tsx`, `usePlayer.ts`?**
  _High betweenness centrality (0.046) - this node is a cross-community bridge._
- **Why does `SongBase` connect `index.ts` to `zpotify_service_files.pb.ts`, `audioCacheStore.ts`, `zpotify_common.pb.ts`, `MainLayout.tsx`, `supportedAudio.ts`, `useToaster`, `LazyLoadSongsList.tsx`, `SongsService`, `MainContent.tsx`, `InfoControls.tsx`, `PlaylistControls.tsx`, `usePlaylistInfoSegment.ts`, `ArtistItem`, `TrackList.tsx`, `PlaylistScreenWidget.tsx`, `useTrackDrafts.ts`?**
  _High betweenness centrality (0.030) - this node is a cross-community bridge._
- **What connects `localPlugin`, `name`, `private` to the rest of the system?**
  _376 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `zpotify_service_files.pb.ts` be split into smaller, more focused modules?**
  _Cohesion score 0.08668076109936575 - nodes in this community are weakly interconnected._
- **Should `HomePage.ts` be split into smaller, more focused modules?**
  _Cohesion score 0.11333333333333333 - nodes in this community are weakly interconnected._
- **Should `MainLayout.tsx` be split into smaller, more focused modules?**
  _Cohesion score 0.07120500782472614 - nodes in this community are weakly interconnected._