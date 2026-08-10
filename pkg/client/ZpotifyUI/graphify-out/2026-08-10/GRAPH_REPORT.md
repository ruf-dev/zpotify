# Graph Report - ZpotifyUI  (2026-08-10)

## Corpus Check
- 328 files · ~59,280 words
- Verdict: corpus is large enough that graph structure adds value.

## Summary
- 1489 nodes · 3256 edges · 95 communities (86 shown, 9 thin omitted)
- Extraction: 100% EXTRACTED · 0% INFERRED · 0% AMBIGUOUS · INFERRED: 13 edges (avg confidence: 0.52)
- Token cost: 0 input · 0 output

## Graph Freshness
- Built from commit: `362d3796`
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
- DropZoneIcon.tsx
- LibraryGridScreenSkeleton.tsx
- package.json
- zpotify_common.pb.ts
- Link.ts
- EditableText.tsx
- React + TypeScript + Vite
- Carousel.tsx
- Song.ts
- eslint.config.js
- MusicFileIcon.tsx
- zpotify_service_feature_flags.pb.ts
- IdleDecoration.tsx
- UploadCard.tsx
- GeneratedAvatar.tsx
- .preload

## God Nodes (most connected - your core abstractions)
1. `useToaster()` - 60 edges
2. `useDialog` - 49 edges
3. `SongBase` - 40 edges
4. `useUser` - 39 edges
5. `AudioPlayerImpl` - 37 edges
6. `ArtistItem` - 31 edges
7. `PlaylistService` - 29 edges
8. `BaseService` - 24 edges
9. `compilerOptions` - 21 edges
10. `buildCoverUrl()` - 20 edges

## Surprising Connections (you probably didn't know these)
- `NotificationRowProps` --references--> `Notification`  [EXTRACTED]
  src/widgets/NotificationBell/components/NotificationRow/NotificationRow.tsx → src/app/api/zpotify/zpotify_service_notification.pb.ts
- `FilesList()` --calls--> `useDialog`  [EXTRACTED]
  src/dialogs/FileList/FilesList.tsx → src/app/hooks/Dialog.tsx
- `LogPassAuth()` --calls--> `useDialog`  [EXTRACTED]
  src/features/auth/LogPassAuth.tsx → src/app/hooks/Dialog.tsx
- `EditableCoverWithFallback()` --calls--> `buildCoverUrl()`  [EXTRACTED]
  src/components/EditableCoverWithFallback/EditableCoverWithFallback.tsx → src/shared/lib/coverUrl.ts
- `TargetPlaylist` --references--> `ArtistItem`  [EXTRACTED]
  src/dialogs/MultitrackUpload/MultitrackUploadModal.tsx → src/widgets/ArtistField/ArtistChipsField.tsx

## Import Cycles
- 3-file cycle: `src/entities/artist/useLikedArtists.ts -> src/shared/api/ArtistsService.ts -> src/widgets/ArtistField/ArtistChipsField.tsx -> src/entities/artist/useLikedArtists.ts`

## Communities (95 total, 9 thin omitted)

### Community 0 - "zpotify_service_files.pb.ts"
Cohesion: 0.10
Nodes (20): BatchDeleteFiles, BatchDeleteFilesRequest, BatchDeleteFilesResponse, CheckFilesByHashes, CheckFilesByHashesFoundFileByHash, CheckFilesByHashesRequest, CheckFilesByHashesResponse, DeleteFile (+12 more)

### Community 1 - "Dropdown.tsx"
Cohesion: 0.11
Nodes (20): SearchIcon(), Dropdown(), DropdownProps, useDropdownClose(), useSearchResults(), DropdownOption, getOptionId(), getOptionLabel() (+12 more)

### Community 2 - "HomePage.ts"
Cohesion: 0.12
Nodes (12): UserAPI, ISettingsService, parseHomePageSegment(), SettingsService, toHomeSegments(), FeedSegmentInfo, HomeSegment, LibrarySegmentInfo (+4 more)

### Community 3 - "MainLayout.tsx"
Cohesion: 0.08
Nodes (35): initServiceWorker(), albumPath(), Path, playlistPath(), Router(), LoginViaPass(), isAlbum(), usePlaylistSongs() (+27 more)

### Community 4 - "fetch.pb.ts"
Cohesion: 0.13
Nodes (16): b64, b64Encode(), fetchStreamingRequest(), FlattenedRequestPayload, flattenRequestPayload(), getNewLineDelimitedJSONDecodingStream(), getNotifyEntityArrivalSink(), isPlainObject() (+8 more)

### Community 5 - "usePlayer.ts"
Cohesion: 0.21
Nodes (6): AnimatedZ(), LogoRow(), LogoRowProps, ShuffleTracksButton(), ShuffleTracksButtonProps, TrackProgressControls()

### Community 7 - "useToaster"
Cohesion: 0.25
Nodes (8): EditTrackDialog(), MetaDialog(), MetaDialogProps, FeedRefreshState, useFeedRefresh, SongListRefreshState, useSongListRefresh, AudioFile

### Community 8 - "Auth.ts"
Cohesion: 0.10
Nodes (21): AuthAPI, AuthData, AuthRequest, GetAuthMethodsRequest, RefreshRequest, apiPrefix(), InitReq, options (+13 more)

### Community 9 - "DropZoneScreen.tsx"
Cohesion: 0.25
Nodes (6): SpinnerIcon(), DragOverDecoration(), DropZoneText(), DropZoneTextProps, UploadingSpinner(), DropZoneScreen()

### Community 10 - "compilerOptions"
Cohesion: 0.08
Nodes (24): compilerOptions, allowImportingTsExtensions, allowJs, allowSyntheticDefaultImports, esModuleInterop, forceConsistentCasingInFileNames, isolatedModules, jsx (+16 more)

### Community 11 - "CLAUDE.md"
Cohesion: 0.09
Nodes (22): Architecture — Feature Slice Design, Async style, Barrel / index.ts, Coding rules, Commands, Error and Confirmation Handling, Exploration Rules, Export conventions (+14 more)

### Community 12 - "devDependencies"
Cohesion: 0.08
Nodes (25): devDependencies, eslint, eslint-config-prettier, eslint-import-resolver-typescript, @eslint/js, eslint-plugin-import, eslint-plugin-prettier, eslint-plugin-react (+17 more)

### Community 13 - "zpotify_service_auth.pb.ts"
Cohesion: 0.11
Nodes (18): Absent, Auth, AuthLogPass, AuthResponse, AuthTelegramOAuth, AuthViaAsync, AuthViaAsyncRequest, AuthViaAsyncResponse (+10 more)

### Community 14 - "useUser"
Cohesion: 0.13
Nodes (17): MainLayout(), SidebarToggleIcon(), SegmentCarousel(), SegmentCarouselProps, UISettings, useUISettings, SidebarToggleButton(), MobileNavSegment() (+9 more)

### Community 15 - "useSearchPage.ts"
Cohesion: 0.24
Nodes (11): FILTER_LABELS, FilterChipsProps, FilterKey, EMPTY_RESPONSE, UseSearchPageResult, SearchAlbumResult, SearchArtistResult, SearchFilters (+3 more)

### Community 16 - "SongEditDialog.tsx"
Cohesion: 0.40
Nodes (4): BackButton(), BackButtonProps, NotFoundPlaylistInfoSegment(), NotFoundPlaylistInfoSegmentProps

### Community 17 - "usePlaylistInfoSegment.ts"
Cohesion: 0.44
Nodes (4): EditableYearProps, TrackCountLabel(), TrackCountLabelProps, PlaylistMetaRowProps

### Community 18 - "ArtistsService.ts"
Cohesion: 0.06
Nodes (30): ArtistBase, ArtistsAPI, CreateArtist, CreateArtistRequest, CreateArtistResponse, GetArtistPage, GetArtistPageRequest, GetArtistPageResponse (+22 more)

### Community 19 - "FilesList.tsx"
Cohesion: 0.18
Nodes (13): useDialog, SettingsDialog(), GhostSong(), AddTrackButton(), AddTrackButtonProps, Dialog(), NAV_ITEMS, navIdentity (+5 more)

### Community 20 - "MultitrackUploadModal.tsx"
Cohesion: 0.15
Nodes (13): CheckIcon(), ChevronRightIcon(), RetryAllIcon(), MultitrackUploadModal(), MultitrackUploadModalProps, TargetPlaylist, PlaylistToggleRow(), PlaylistToggleRowProps (+5 more)

### Community 21 - "ArtistItem"
Cohesion: 0.23
Nodes (11): PlaylistDetailsPanelProps, TrackListProps, TrackDraft, MultitrackSubmitParams, MultitrackSubmitState, ToCreateTrack, MultitrackSummary, MultitrackSummaryParams (+3 more)

### Community 22 - "zpotify_service_playlist.pb.ts"
Cohesion: 0.08
Nodes (31): AddSongsToPlaylist, AddSongsToPlaylistRequest, AddSongsToPlaylistResponse, AddSongToPlaylist, AddSongToPlaylistRequest, AddSongToPlaylistResponse, ChangeSongsOrder, ChangeSongsOrderRequest (+23 more)

### Community 23 - "PlaylistService.ts"
Cohesion: 0.14
Nodes (18): FeedDay, GetFeed, GetFeedRequest, GetFeedResponse, HomeAPI, FeedService, IFeedService, toFeedArtistItem() (+10 more)

### Community 24 - "useDialog"
Cohesion: 0.11
Nodes (21): Search, SearchAlbumResult, SearchAPI, SearchArtistResult, SearchFilters, SearchPlaylistResult, SearchRequest, SearchResponse (+13 more)

### Community 25 - "CachedSongsAccordion.tsx"
Cohesion: 0.06
Nodes (41): SongFile, DownloadIcon(), HomeIcon(), NavSearchIcon(), RemoveTrackIcon(), UploadsIcon(), FileItemProps, AudioSettings (+33 more)

### Community 26 - "useTrackDrafts.ts"
Cohesion: 0.18
Nodes (19): buildNewTracksFromFresh(), ClassifiedFile, classifyIncomingFiles(), createInitialTracks(), InitialTrackMeta, loadInitialTrackMeta(), mapArtists(), mergeInitialTrack() (+11 more)

### Community 27 - "PlaylistsLibrarySegment.tsx"
Cohesion: 0.05
Nodes (47): artistPath(), CoverWithFallback(), CoverWithFallbackProps, GenerativeCover(), GenerativeCoverProps, PALETTES, ShapeFn, SHAPES (+39 more)

### Community 28 - "dependencies"
Cohesion: 0.11
Nodes (19): dependencies, classnames, framer-motion, grpc-web, @hookstate/core, music-metadata-browser, react, react-dom (+11 more)

### Community 29 - "index.ts"
Cohesion: 0.20
Nodes (9): Playlist, Props, PlaylistInfoSegmentProps, UsePlaylistInfoSegmentParams, InfoControls(), InfoControlsProps, PlaylistControlsProps, DownloadButtonWidgetProps (+1 more)

### Community 30 - "useUser.ts"
Cohesion: 0.17
Nodes (15): InitReq, AuthStatus, User, BaseService, getAuth(), setAuthMiddleware(), WebApiParams, withRetries() (+7 more)

### Community 31 - "CommentsSection.tsx"
Cohesion: 0.09
Nodes (19): GetUserSettings, GetUserSettingsRequest, GetUserSettingsResponse, Me, MeRequest, MeResponse, UserData, AuthMethods (+11 more)

### Community 32 - "audioCacheStore.ts"
Cohesion: 0.23
Nodes (6): GripIcon(), PlayTriangleIcon(), CachedIndicator(), ArtistNamePart, formatDuration(), TrackRow()

### Community 33 - "zpotify_service_feature_flags.pb.ts"
Cohesion: 0.36
Nodes (6): FeatureFlag, FeatureFlagsAPI, FeatureFlagsStore, useFeatureFlags, useFeatureFlagsQuery(), fetchFeatureFlags()

### Community 34 - "ChooseScreen.tsx"
Cohesion: 0.26
Nodes (9): PlaylistListRefreshState, usePlaylistListRefresh, PlaylistRow(), PlaylistRowData, PlaylistRowProps, PlaylistItem, SidebarPlaylistsWidget(), SidebarPlaylistsWidgetProps (+1 more)

### Community 35 - "TrackRow.tsx"
Cohesion: 0.22
Nodes (7): DragHandleIcon(), EditableTitleProps, TODO: switch to chures Input once it supports ref/onKeyDown, TODO: Make editable here and send update name for such files if changed, TrackRow(), TrackRowProps, getCleanablePrefixLength()

### Community 36 - "WebApi.ts"
Cohesion: 0.24
Nodes (11): GrpcErrorDetails, isHttpCodeRetryable(), WithDescription(), WithHttpStatus(), WithIsNonRetryable(), WithStatusCode(), WithTitle(), ServiceErrorFromHttp() (+3 more)

### Community 37 - "ArtistChipsField.tsx"
Cohesion: 0.11
Nodes (18): BatchCreateSong, BatchCreateSongRequest, BatchCreateSongResponse, CreateSong, CreateSongRequest, CreateSongResponse, GetSong, GetSongRequest (+10 more)

### Community 39 - "SongsService"
Cohesion: 0.14
Nodes (9): SongBase, SongAPI, EditTrackDialogProps, ISongsService, SongsService, ArtistSongsRowProps, TrackRowProps, SongSearchBox() (+1 more)

### Community 40 - "LazyLoadSongsList.tsx"
Cohesion: 0.13
Nodes (21): CardRow(), CardRowProps, LikedSongsState, useLikedSongs, useListSongs(), UseListSongsOptions, SongListPermissions, ArtistSongsRow() (+13 more)

### Community 41 - "MainContent.tsx"
Cohesion: 0.22
Nodes (8): ClockIcon(), selectFlagEnabled(), ZButton(), ZButtonProps, FeedHomeSegmentSkeleton(), Drag, MainContent(), MainContentProps

### Community 42 - "InfoControls.tsx"
Cohesion: 0.22
Nodes (9): ShareIcon(), RandomArrows(), IconButton(), IconButtonProps, ShareButton(), ShuffleButton(), SaveButtonWidget(), SaveButtonWidgetProps (+1 more)

### Community 43 - "UserWidget.tsx"
Cohesion: 0.21
Nodes (7): MiniClockIcon(), MiniDiscIcon(), FieldLabelRow(), FieldLabelRowProps, formatTotalDuration(), PlaylistDetailsPanel(), DisabledChipProps

### Community 44 - "BaseService.ts"
Cohesion: 0.08
Nodes (26): Artist, EditIcon(), EditIconProps, RemoveIcon(), SaveIcon(), UploadArrowIcon(), ZLogoIcon(), CoverFieldProps (+18 more)

### Community 45 - "AlbumTag"
Cohesion: 0.13
Nodes (3): CreatePlaylistResponse, UpdatePlaylistResponse, IPlaylistService

### Community 46 - "usePendingFiles.tsx"
Cohesion: 0.28
Nodes (7): ModalStep, DOT_STEPS, PanelHeader(), PanelHeaderProps, STEP_TITLES, StepDots(), StepDotsProps

### Community 47 - "zpotify_service_artists.pb.ts"
Cohesion: 0.13
Nodes (9): FilesList(), FilesListProps, LogPassAuth(), Button(), ButtonProps, InputProps, StyleProps, LogPassWidget() (+1 more)

### Community 48 - "PlaylistControls.tsx"
Cohesion: 0.19
Nodes (9): DialogManager, BellIcon(), BellIconProps, NotificationDialog(), useNotifications, formatNotificationDate(), NotificationRow(), NotificationRowProps (+1 more)

### Community 49 - "MoreButton.tsx"
Cohesion: 0.30
Nodes (8): MoreDots(), MenuOption(), MenuOptionProps, Menu(), MenuOption, MenuProps, MoreButton(), MoreButtonProps

### Community 50 - "CoverWithFallback.tsx"
Cohesion: 0.15
Nodes (12): ConsentNotification, ConsentNotificationRequest, ConsentNotificationResponse, GetNotificationSummary, GetNotificationSummaryRequest, GetNotificationSummaryResponse, ListNotifications, ListNotificationsRequest (+4 more)

### Community 51 - "InitPage.tsx"
Cohesion: 0.21
Nodes (7): Version, VersionRequest, VersionResponse, ZpotifyAPI, FileItem(), PendingFilesScreen(), usePendingFiles()

### Community 52 - "ChipsField.tsx"
Cohesion: 0.16
Nodes (10): AlbumTagKind, LockIcon(), PlusIcon(), PlusIconProps, Chip(), ChipProps, ArtistChipsFieldProps, CHIP_KIND_LABELS (+2 more)

### Community 53 - "PrivateLockWidget.tsx"
Cohesion: 0.31
Nodes (6): PrivateLockIcon(), PrivateLockIconProps, PrivatePlaylistIndicator(), PrivateLockWidget(), PrivateLockWidgetProps, usePrivateLockWidget()

### Community 54 - "IPlaylistService"
Cohesion: 0.20
Nodes (3): ListPlaylistsResponse, ListSongsResponse, mapToTrackPreviews()

### Community 55 - ".ListLibrary"
Cohesion: 0.23
Nodes (8): CreatePlaylistIcon(), AddTrackContext, AddTrackDialog(), BACK_STEPS, SCREENS, ChooseScreen(), CreatePlaylistCard(), CreatePlaylistCardProps

### Community 56 - "TrackList.tsx"
Cohesion: 0.31
Nodes (7): TrackList(), computeGhostStyle(), computeRowStyle(), Drag, TrackDragApi, useTrackDrag(), canCleanTrackNumbers()

### Community 57 - "PlaylistScreenWidget.tsx"
Cohesion: 0.22
Nodes (7): HeartIcon(), HeartIconProps, CommentsSectionProps, MOCK_COMMENTS, MockComment, TODO: implement comments API — no backend endpoint exists yet, TODO: implement comments API — no backend endpoint exists yet

### Community 58 - "HeaderSearchInput.tsx"
Cohesion: 0.29
Nodes (5): PlayPauseButton(), PlayPauseButtonProps, TrackRewindButton, PlayerControls(), PlayerProps

### Community 59 - "SearchPage.tsx"
Cohesion: 0.19
Nodes (9): AlbumTag, EditableAlbumName(), EditableAlbumNameProps, GenreChipsRow(), GenreChipsRowProps, PlaylistInfoSegment(), usePlaylistInfoSegment(), DescriptionSectionProps (+1 more)

### Community 60 - "EditableArtistPicker.tsx"
Cohesion: 0.27
Nodes (7): EditableArtistPickerContext, FADE_TRANSITION, HEIGHT_TRANSITION, PlaylistOwnerLabel(), PlaylistOwnerLabelProps, ArtistOrOwnerRow(), ArtistOrOwnerRowProps

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
Cohesion: 0.25
Nodes (13): MetaScreen(), MetaScreenProps, TrackRow(), computeCoverColor(), COVER_COLORS, formatTime(), PlayerBarSegment(), formatFileBytes() (+5 more)

### Community 65 - "PlayerBarSegment.tsx"
Cohesion: 0.21
Nodes (6): VolumeControlProps, VolumeBarProps, VolumeDisplayProps, TrackProgressControlsProps, MusicPlayerProps, AudioPlayer

### Community 66 - "compilerOptions"
Cohesion: 0.20
Nodes (9): compilerOptions, allowSyntheticDefaultImports, composite, module, moduleResolution, outDir, skipLibCheck, strict (+1 more)

### Community 67 - "zpotify_common.pb.ts"
Cohesion: 0.22
Nodes (7): Paging, Notification, NotificationAPI, NotificationDialogProps, NotificationsState, INotificationsService, NotificationsService

### Community 68 - "supportedAudio.ts"
Cohesion: 0.33
Nodes (7): DropZone(), DropZoneProps, AUDIO_ACCEPT, isSupportedAudioFile(), SUPPORTED_AUDIO_EXTENSIONS, AddTracksPanel(), AddTracksPanelProps

### Community 69 - "ZpotifyUI Development Manifesto"
Cohesion: 0.33
Nodes (5): AI Assistant Guidelines, Development Principles, Styling, Tech Stack & Architecture, ZpotifyUI Development Manifesto

### Community 70 - "DropZoneIcon.tsx"
Cohesion: 0.28
Nodes (6): DropZoneTargetIcon(), DropZoneTargetIconProps, DropZoneUploadIcon(), DropZoneUploadIconProps, DropZoneIcon(), DropZoneIconProps

### Community 71 - "LibraryGridScreenSkeleton.tsx"
Cohesion: 0.13
Nodes (16): SongEditDialog(), SongEditDialogProps, PlaylistService, catchServiceError(), internalErrors, useToaster(), Chip(), ChipProps (+8 more)

### Community 72 - "package.json"
Cohesion: 0.40
Nodes (4): name, private, type, version

### Community 73 - "zpotify_common.pb.ts"
Cohesion: 0.25
Nodes (7): Absent, AlbumVersionMetadata, AlbumVersionMetadataVersionKind, BaseAlbumTag, OneOf, SongTag, SongTagKind

### Community 75 - "EditableText.tsx"
Cohesion: 0.39
Nodes (4): SegmentTabBarProps, Tab, HomePage(), useHomeSegments()

### Community 89 - "MusicFileIcon.tsx"
Cohesion: 0.40
Nodes (4): MusicFileIcon(), MusicFileIconProps, LibraryCard(), LibraryCardProps

### Community 90 - "zpotify_service_feature_flags.pb.ts"
Cohesion: 0.40
Nodes (4): FeatureFlagId, GetFeatureFlags, GetFeatureFlagsRequest, GetFeatureFlagsResponse

### Community 91 - "IdleDecoration.tsx"
Cohesion: 0.50
Nodes (3): DashedRingIcon(), DashedRingIconProps, IdleDecoration()

### Community 93 - "GeneratedAvatar.tsx"
Cohesion: 0.60
Nodes (4): AvatarProps, generateColor(), GeneratedAvatar(), generateHash()

## Knowledge Gaps
- **391 isolated node(s):** `localPlugin`, `name`, `private`, `version`, `type` (+386 more)
  These have ≤1 connection - possible missing edges or undocumented components.
- **9 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `useToaster()` connect `LibraryGridScreenSkeleton.tsx` to `Dropdown.tsx`, `HomePage.ts`, `MainLayout.tsx`, `useToaster`, `usePlaylistInfoSegment.ts`, `MultitrackUploadModal.tsx`, `ArtistItem`, `CachedSongsAccordion.tsx`, `useTrackDrafts.ts`, `audioCacheStore.ts`, `LazyLoadSongsList.tsx`, `MainContent.tsx`, `InfoControls.tsx`, `BaseService.ts`, `PlaylistControls.tsx`, `InitPage.tsx`, `PrivateLockWidget.tsx`, `.ListLibrary`, `SearchPage.tsx`, `zpotify_common.pb.ts`, `supportedAudio.ts`, `EditableText.tsx`?**
  _High betweenness centrality (0.056) - this node is a cross-community bridge._
- **Why does `AudioPlayerImpl` connect `AudioPlayerImpl` to `LazyLoadSongsList.tsx`, `PlayerBarSegment.tsx`, `usePlayer.ts`, `.preload`?**
  _High betweenness centrality (0.045) - this node is a cross-community bridge._
- **Why does `PlaylistService` connect `LibraryGridScreenSkeleton.tsx` to `audioCacheStore.ts`, `ChooseScreen.tsx`, `MainLayout.tsx`, `supportedAudio.ts`, `PlaylistAPI`, `LazyLoadSongsList.tsx`, `MainContent.tsx`, `AlbumTag`, `usePlaylistInfoSegment.ts`, `ArtistItem`, `zpotify_service_playlist.pb.ts`, `IPlaylistService`, `CachedSongsAccordion.tsx`, `useUser.ts`?**
  _High betweenness centrality (0.030) - this node is a cross-community bridge._
- **What connects `localPlugin`, `name`, `private` to the rest of the system?**
  _396 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `zpotify_service_files.pb.ts` be split into smaller, more focused modules?**
  _Cohesion score 0.0990990990990991 - nodes in this community are weakly interconnected._
- **Should `Dropdown.tsx` be split into smaller, more focused modules?**
  _Cohesion score 0.10984848484848485 - nodes in this community are weakly interconnected._
- **Should `HomePage.ts` be split into smaller, more focused modules?**
  _Cohesion score 0.11965811965811966 - nodes in this community are weakly interconnected._