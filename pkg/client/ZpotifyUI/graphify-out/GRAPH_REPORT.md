# Graph Report - ZpotifyUI  (2026-08-16)

## Corpus Check
- 336 files · ~61,442 words
- Verdict: corpus is large enough that graph structure adds value.

## Summary
- 1532 nodes · 3407 edges · 103 communities (92 shown, 11 thin omitted)
- Extraction: 99% EXTRACTED · 1% INFERRED · 0% AMBIGUOUS · INFERRED: 19 edges (avg confidence: 0.55)
- Token cost: 0 input · 0 output

## Graph Freshness
- Built from commit: `75f85ede`
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
- ChipsField.tsx
- MoreButton.tsx
- HeaderSearchInput.tsx
- InitPage.tsx
- SidebarSegment.tsx
- PrivateLockWidget.tsx
- IPlaylistService
- useUISettings
- TrackList.tsx
- PlaylistScreenWidget.tsx
- PlaylistScreenWidget.tsx
- EditControls.tsx
- PanelHeader.tsx
- scripts
- PlayButton.tsx
- InitPage.tsx
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
- useBackGuard
- React + TypeScript + Vite
- Carousel.tsx
- Song.ts
- eslint.config.js
- PlaylistHomeSegment.tsx
- zpotify_service_feature_flags.pb.ts
- .preload
- UploadCard.tsx
- SearchService
- UISettingsWidget.tsx
- NotificationDialog
- zpotify_service_search.pb.ts
- LogoRow.tsx
- GeneratedAvatar.tsx
- HeaderPart.tsx
- Input.tsx
- EditableText.tsx
- VolumeControl.tsx

## God Nodes (most connected - your core abstractions)
1. `useToaster()` - 64 edges
2. `useDialog` - 49 edges
3. `SongBase` - 40 edges
4. `useUser` - 39 edges
5. `AudioPlayerImpl` - 39 edges
6. `ArtistItem` - 31 edges
7. `PlaylistService` - 29 edges
8. `TrackDraft` - 24 edges
9. `BaseService` - 24 edges
10. `compilerOptions` - 21 edges

## Surprising Connections (you probably didn't know these)
- `EditTrackDialogProps` --references--> `SongBase`  [EXTRACTED]
  src/dialogs/EditTrack/EditTrackDialog.tsx → src/app/api/zpotify/zpotify_common.pb.ts
- `ArtistSongsRowProps` --references--> `SongBase`  [EXTRACTED]
  src/widgets/ArtistScreen/widgets/ArtistSongsRow/ArtistSongsRow.tsx → src/app/api/zpotify/zpotify_common.pb.ts
- `SongSearchBoxProps` --references--> `SongBase`  [EXTRACTED]
  src/widgets/SongSearchBox/SongSearchBox.tsx → src/app/api/zpotify/zpotify_common.pb.ts
- `NotificationRowProps` --references--> `Notification`  [EXTRACTED]
  src/widgets/NotificationBell/components/NotificationRow/NotificationRow.tsx → src/app/api/zpotify/zpotify_service_notification.pb.ts
- `HeaderPart()` --calls--> `useDialog`  [EXTRACTED]
  src/widgets/Header/HeaderPart.tsx → src/app/hooks/Dialog.tsx

## Import Cycles
- 3-file cycle: `src/entities/artist/useLikedArtists.ts -> src/shared/api/ArtistsService.ts -> src/widgets/ArtistField/ArtistChipsField.tsx -> src/entities/artist/useLikedArtists.ts`

## Communities (103 total, 11 thin omitted)

### Community 0 - "zpotify_service_files.pb.ts"
Cohesion: 0.10
Nodes (20): BatchDeleteFiles, BatchDeleteFilesRequest, BatchDeleteFilesResponse, CheckFilesByHashes, CheckFilesByHashesFoundFileByHash, CheckFilesByHashesRequest, CheckFilesByHashesResponse, DeleteFile (+12 more)

### Community 1 - "Dropdown.tsx"
Cohesion: 0.11
Nodes (23): ArtistBase, PlusIcon(), PlusIconProps, Dropdown(), DropdownProps, useDropdownClose(), useSearchResults(), DropdownOption (+15 more)

### Community 2 - "HomePage.ts"
Cohesion: 0.11
Nodes (10): SegmentTabBarProps, Tab, HomePage(), FeedSegmentInfo, HomeSegment, LibrarySegmentInfo, ManagementSegmentInfo, PlaylistSegmentInfo (+2 more)

### Community 3 - "MainLayout.tsx"
Cohesion: 0.16
Nodes (18): albumPath(), isAlbum(), usePlaylistSongs(), User(), AuthStatus, useUser, AlbumPage(), ArtistPage() (+10 more)

### Community 4 - "fetch.pb.ts"
Cohesion: 0.06
Nodes (32): b64, b64Encode(), fetchStreamingRequest(), FlattenedRequestPayload, flattenRequestPayload(), getNewLineDelimitedJSONDecodingStream(), getNotifyEntityArrivalSink(), isPlainObject() (+24 more)

### Community 5 - "usePlayer.ts"
Cohesion: 0.06
Nodes (45): GripIcon(), PlayTriangleIcon(), RemoveTrackIcon(), SpinnerIcon(), UploadingSpinner(), AudioSettings, useAudioSettings, computeCoverColor() (+37 more)

### Community 7 - "useToaster"
Cohesion: 0.14
Nodes (18): EditTrackDialog(), EditTrackDialogProps, MetaDialog(), MetaDialogProps, SongEditDialog(), FeedRefreshState, useFeedRefresh, useListSongs() (+10 more)

### Community 8 - "Auth.ts"
Cohesion: 0.13
Nodes (15): AuthAPI, AuthData, TelegramAuth(), apiPrefix(), AuthMiddleware, AuthService, AuthViaTelegram(), clearLocalStorage() (+7 more)

### Community 9 - "DropZoneScreen.tsx"
Cohesion: 0.19
Nodes (9): useDialog, FilesList(), FilesListProps, GhostSong(), LogPassAuth(), Button(), ButtonProps, LogPassWidget() (+1 more)

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
Cohesion: 0.09
Nodes (21): Absent, Auth, AuthLogPass, AuthRequest, AuthResponse, AuthTelegramOAuth, AuthViaAsync, AuthViaAsyncRequest (+13 more)

### Community 14 - "useUser"
Cohesion: 0.13
Nodes (17): CoverWithFallback(), CoverWithFallbackProps, GenerativeCover(), GenerativeCoverProps, PALETTES, ShapeFn, SHAPES, cacheCover() (+9 more)

### Community 15 - "useSearchPage.ts"
Cohesion: 0.20
Nodes (15): FILTER_LABELS, FilterChipsProps, FilterKey, EMPTY_RESPONSE, UseSearchPageResult, SearchAlbumResult, SearchArtistResult, SearchFilters (+7 more)

### Community 16 - "SongEditDialog.tsx"
Cohesion: 0.27
Nodes (7): EditableArtistPickerContext, FADE_TRANSITION, HEIGHT_TRANSITION, PlaylistOwnerLabel(), PlaylistOwnerLabelProps, ArtistOrOwnerRow(), ArtistOrOwnerRowProps

### Community 17 - "usePlaylistInfoSegment.ts"
Cohesion: 0.19
Nodes (10): EditableAlbumName(), EditableAlbumNameProps, EditableYearProps, TrackCountLabel(), TrackCountLabelProps, PlaylistInfoSegment(), usePlaylistInfoSegment(), DescriptionSectionProps (+2 more)

### Community 18 - "ArtistsService.ts"
Cohesion: 0.09
Nodes (21): CreateArtist, CreateArtistRequest, CreateArtistResponse, GetArtistPage, GetArtistPageRequest, GetArtistPageResponse, LikeArtist, LikeArtistRequest (+13 more)

### Community 19 - "FilesList.tsx"
Cohesion: 0.24
Nodes (12): SongRow(), SongRowArtist, SongRowProps, MetaScreen(), MetaScreenProps, formatFileBytes(), formatFileDuration(), formatFileSize() (+4 more)

### Community 20 - "MultitrackUploadModal.tsx"
Cohesion: 0.13
Nodes (16): CheckIcon(), ChevronRightIcon(), RetryAllIcon(), AddTrackDialog, MultitrackUploadModal(), TargetPlaylist, PlaylistToggleRow(), PlaylistToggleRowProps (+8 more)

### Community 21 - "ArtistItem"
Cohesion: 0.17
Nodes (8): CreatePlaylistIcon(), UploadArrowLargeIcon(), ChooseScreen(), CreatePlaylistCard(), CreatePlaylistCardProps, LibraryCard(), LibraryCardProps, UploadCardProps

### Community 22 - "zpotify_service_playlist.pb.ts"
Cohesion: 0.08
Nodes (31): AddSongsToPlaylist, AddSongsToPlaylistRequest, AddSongsToPlaylistResponse, AddSongToPlaylist, AddSongToPlaylistRequest, AddSongToPlaylistResponse, ChangeSongsOrder, ChangeSongsOrderRequest (+23 more)

### Community 23 - "PlaylistService.ts"
Cohesion: 0.22
Nodes (17): toFeedArtistItem(), toFeedDay(), toFeedResult(), toFeedSongItem(), WireArtistBase, WireFeedDay, WireSongBase, interleave() (+9 more)

### Community 24 - "useDialog"
Cohesion: 0.20
Nodes (9): SongFile, MusicFileIcon(), MusicFileIconProps, FileItem(), FileItemProps, UploadingFileRowProps, PendingFilesScreen(), usePendingFiles() (+1 more)

### Community 25 - "CachedSongsAccordion.tsx"
Cohesion: 0.25
Nodes (10): Artist, ActiveUpload, EagerFileUpload, useEagerFileUpload(), EditableArtistName(), EditableArtistNameProps, ArtistHeroSegment(), ArtistHeroSegmentProps (+2 more)

### Community 26 - "useTrackDrafts.ts"
Cohesion: 0.16
Nodes (22): BatchUploadState, useBatchUpload(), MultitrackUploadModalProps, buildNewTracksFromFresh(), ClassifiedFile, classifyIncomingFiles(), createInitialTracks(), flattenDroppedInput() (+14 more)

### Community 27 - "PlaylistsLibrarySegment.tsx"
Cohesion: 0.16
Nodes (14): CardRow(), CardRowProps, ArtistScreenWidget(), toAlbumCardProps(), AlbumCard(), TrackRow(), TrackRowProps, PlaylistCardWide() (+6 more)

### Community 28 - "dependencies"
Cohesion: 0.11
Nodes (19): dependencies, classnames, framer-motion, grpc-web, @hookstate/core, music-metadata-browser, react, react-dom (+11 more)

### Community 29 - "index.ts"
Cohesion: 0.26
Nodes (11): Playlist, SongBase, DownloadIcon(), Props, PlaylistInfoSegmentProps, UsePlaylistInfoSegmentParams, InfoControls(), InfoControlsProps (+3 more)

### Community 30 - "useUser.ts"
Cohesion: 0.11
Nodes (19): InitReq, NotificationAPI, UserAPI, User, BaseService, getAuth(), WebApiParams, withRetries() (+11 more)

### Community 31 - "CommentsSection.tsx"
Cohesion: 0.12
Nodes (13): GetUserSettings, GetUserSettingsRequest, GetUserSettingsResponse, Me, MeRequest, MeResponse, UserData, AuthMethods (+5 more)

### Community 32 - "audioCacheStore.ts"
Cohesion: 0.19
Nodes (14): LikedSongsState, useLikedSongs, ArtistSongsRow(), ArtistSongsRowProps, joinArtistNames(), toArtistNameParts(), toQueueTracks(), ArtistNamePart (+6 more)

### Community 33 - "zpotify_service_feature_flags.pb.ts"
Cohesion: 0.11
Nodes (19): FeatureFlag, FeatureFlagId, FeatureFlagsAPI, GetFeatureFlags, GetFeatureFlagsRequest, GetFeatureFlagsResponse, ClockIcon(), FeatureFlagsStore (+11 more)

### Community 34 - "ChooseScreen.tsx"
Cohesion: 0.23
Nodes (10): PlaylistListRefreshState, usePlaylistListRefresh, PlaylistRow(), PlaylistRowData, PlaylistRowProps, PlaylistItem, SidebarPlaylistsWidget(), SidebarPlaylistsWidgetProps (+2 more)

### Community 35 - "TrackRow.tsx"
Cohesion: 0.12
Nodes (18): DragHandleIcon(), EditableTitleProps, TODO: switch to chures Input once it supports ref/onKeyDown, TrackGroupSegment, TrackListProps, TODO: Make editable here and send update name for such files if changed, TrackDraft, TrackRow() (+10 more)

### Community 36 - "WebApi.ts"
Cohesion: 0.24
Nodes (11): GrpcErrorDetails, isHttpCodeRetryable(), WithDescription(), WithHttpStatus(), WithIsNonRetryable(), WithStatusCode(), WithTitle(), ServiceErrorFromHttp() (+3 more)

### Community 37 - "ArtistChipsField.tsx"
Cohesion: 0.11
Nodes (18): BatchCreateSong, BatchCreateSongRequest, BatchCreateSongResponse, CreateSong, CreateSongRequest, CreateSongResponse, GetSong, GetSongRequest (+10 more)

### Community 38 - "PlaylistAPI"
Cohesion: 0.12
Nodes (3): PlaylistAPI, mapToTrackPreviews(), PlaylistService

### Community 39 - "SongsService"
Cohesion: 0.14
Nodes (6): SongAPI, SongEditDialogProps, ISongsService, SongsService, Chip(), ChipProps

### Community 41 - "MainContent.tsx"
Cohesion: 0.20
Nodes (7): FeedDay, GetFeed, GetFeedRequest, GetFeedResponse, HomeAPI, FeedService, IFeedService

### Community 42 - "InfoControls.tsx"
Cohesion: 0.25
Nodes (6): ShareIcon(), RandomArrows(), IconButton(), IconButtonProps, ShareButton(), ShuffleButton()

### Community 43 - "UserWidget.tsx"
Cohesion: 0.18
Nodes (9): MiniClockIcon(), MiniDiscIcon(), FieldLabelRow(), FieldLabelRowProps, formatTotalDuration(), PlaylistDetailsPanel(), PlaylistDetailsPanelProps, DisabledChipProps (+1 more)

### Community 44 - "BaseService.ts"
Cohesion: 0.21
Nodes (7): UploadArrowIcon(), ZLogoIcon(), CoverFieldProps, CoverUploadProgress(), CoverUploadProgressProps, EditableCoverWithFallback(), EditableCoverWithFallbackProps

### Community 45 - "AlbumTag"
Cohesion: 0.25
Nodes (7): MainLayout(), initServiceWorker(), Path, Router(), queryClient, EarlyAccessPage(), ErrorPage()

### Community 46 - "usePendingFiles.tsx"
Cohesion: 0.21
Nodes (8): UploadArrowSmallIcon(), UploadDoneIcon(), UploadErrorIcon(), UploadStatusChip(), UploadStatusChipProps, DropZone(), AddTracksPanel(), AddTracksPanelProps

### Community 47 - "zpotify_service_artists.pb.ts"
Cohesion: 0.19
Nodes (11): BellIcon(), BellIconProps, SettingsDialog(), useNotifications, formatNotificationDate(), NotificationRow(), NotificationRowProps, NotificationBellWidget() (+3 more)

### Community 48 - "ChipsField.tsx"
Cohesion: 0.22
Nodes (7): AlbumTagKind, LockIcon(), Chip(), ChipProps, CHIP_KIND_LABELS, CHIP_KINDS, ChipsFieldProps

### Community 49 - "MoreButton.tsx"
Cohesion: 0.30
Nodes (8): MoreDots(), MenuOption(), MenuOptionProps, Menu(), MenuOption, MenuProps, MoreButton(), MoreButtonProps

### Community 50 - "HeaderSearchInput.tsx"
Cohesion: 0.27
Nodes (6): SearchIcon(), SearchQueryState, useSearchQuery, EmptyState(), EmptyStateProps, HeaderSearchInput()

### Community 51 - "InitPage.tsx"
Cohesion: 0.21
Nodes (8): artistPath(), ArtistCard(), ArtistCardProps, SectionLabel(), SectionLabelProps, SearchPage(), useSearchPage(), ArtistRowProps

### Community 52 - "SidebarSegment.tsx"
Cohesion: 0.27
Nodes (7): SidebarToggleIcon(), SidebarToggleButton(), NAV_ITEMS, navIdentity, SidebarSegment(), SidebarUIState, useSidebarUI

### Community 53 - "PrivateLockWidget.tsx"
Cohesion: 0.25
Nodes (7): PrivateLockIcon(), PrivateLockIconProps, PrivatePlaylistIndicator(), PrivateLockWidget(), PrivateLockWidgetProps, usePrivateLockWidget(), UsePrivateLockWidgetParams

### Community 54 - "IPlaylistService"
Cohesion: 0.14
Nodes (5): GetPlaylistResponse, ListPlaylistsResponse, ListSongsResponse, UpdatePlaylistResponse, IPlaylistService

### Community 55 - "useUISettings"
Cohesion: 0.29
Nodes (7): SegmentCarousel(), SegmentCarouselProps, UISettings, useUISettings, MobileSearchButton(), MobileNavSegment(), AppearanceScreen()

### Community 56 - "TrackList.tsx"
Cohesion: 0.15
Nodes (17): FolderIcon(), FolderIconProps, BatchUploadSection(), BatchUploadSectionProps, isFolderSettled(), FetchServerFilesButton(), FolderGroupHeader(), FolderGroupHeaderProps (+9 more)

### Community 57 - "PlaylistScreenWidget.tsx"
Cohesion: 0.16
Nodes (11): HeartIcon(), HeartIconProps, CommentsSectionProps, MOCK_COMMENTS, MockComment, TODO: implement comments API — no backend endpoint exists yet, TODO: implement comments API — no backend endpoint exists yet, SaveButtonWidget() (+3 more)

### Community 58 - "PlaylistScreenWidget.tsx"
Cohesion: 0.25
Nodes (7): BackButton(), BackButtonProps, computeTotalDuration(), mapPlaylistArtists(), PlaylistScreenWidget(), NotFoundPlaylistInfoSegment(), NotFoundPlaylistInfoSegmentProps

### Community 59 - "EditControls.tsx"
Cohesion: 0.27
Nodes (6): EditIcon(), EditIconProps, RemoveIcon(), SaveIcon(), EditControls(), EditControlsProps

### Community 60 - "PanelHeader.tsx"
Cohesion: 0.28
Nodes (7): ModalStep, DOT_STEPS, PanelHeader(), PanelHeaderProps, STEP_TITLES, StepDots(), StepDotsProps

### Community 61 - "scripts"
Cohesion: 0.22
Nodes (9): scripts, build, dev, gen, lint, lint:css, lint:fix, lint:js (+1 more)

### Community 62 - "PlayButton.tsx"
Cohesion: 0.28
Nodes (6): PauseIcon(), PauseIconProps, PlayIcon(), PlayIconProps, PlayButton(), PlayButtonProps

### Community 63 - "InitPage.tsx"
Cohesion: 0.31
Nodes (5): LoginViaPass(), InitPage(), ZLogoLanding(), AuthButton(), AuthButtonProps

### Community 64 - "AddTrackDialog.tsx"
Cohesion: 0.23
Nodes (10): FeedArtistChip(), choosePlaylistComponent(), FeedDayGroup(), feedItemTransition, Props, FeedHomeSegmentSkeleton(), FeedArtistItem, FeedDay (+2 more)

### Community 65 - "PlayerBarSegment.tsx"
Cohesion: 0.12
Nodes (13): VolumeBarProps, VolumeDisplayProps, PlayPauseButton(), PlayPauseButtonProps, ShuffleTracksButton(), ShuffleTracksButtonProps, TrackProgressControls(), TrackProgressControlsProps (+5 more)

### Community 66 - "compilerOptions"
Cohesion: 0.20
Nodes (9): compilerOptions, allowSyntheticDefaultImports, composite, module, moduleResolution, outDir, skipLibCheck, strict (+1 more)

### Community 67 - "zpotify_common.pb.ts"
Cohesion: 0.24
Nodes (8): Paging, Notification, NotificationDialogProps, NotificationsState, ErrorReason, ServiceError, catchServiceError(), internalErrors

### Community 68 - "supportedAudio.ts"
Cohesion: 0.13
Nodes (21): DashedRingIcon(), DashedRingIconProps, AddTrackContext, AddTrackDialog(), BACK_STEPS, SCREENS, DragOverDecoration(), DropZoneText() (+13 more)

### Community 69 - "ZpotifyUI Development Manifesto"
Cohesion: 0.33
Nodes (5): AI Assistant Guidelines, Development Principles, Styling, Tech Stack & Architecture, ZpotifyUI Development Manifesto

### Community 70 - "DropZoneIcon.tsx"
Cohesion: 0.28
Nodes (6): DropZoneTargetIcon(), DropZoneTargetIconProps, DropZoneUploadIcon(), DropZoneUploadIconProps, DropZoneIcon(), DropZoneIconProps

### Community 71 - "LibraryGridScreenSkeleton.tsx"
Cohesion: 0.47
Nodes (3): AlbumCardSkeleton(), PlaylistCardWideSkeleton(), LibraryGridScreenSkeleton()

### Community 72 - "package.json"
Cohesion: 0.40
Nodes (4): name, private, type, version

### Community 73 - "zpotify_common.pb.ts"
Cohesion: 0.14
Nodes (11): Absent, AlbumTag, AlbumVersionMetadata, AlbumVersionMetadataVersionKind, BaseAlbumTag, OneOf, SongTag, SongTagKind (+3 more)

### Community 75 - "useBackGuard"
Cohesion: 0.39
Nodes (6): Dialog(), BackHandler, ensureListener(), handlePopState(), stack, useBackGuard()

### Community 89 - "PlaylistHomeSegment.tsx"
Cohesion: 0.38
Nodes (5): playlistPath(), ActionButtonProps, IconButton(), DisplayPlaylistSegmentProps, PlaylistHomeSegment()

### Community 90 - "zpotify_service_feature_flags.pb.ts"
Cohesion: 0.18
Nodes (10): Absent, BaseHomePageSegment, HomePageSegment, HomePageSegmentFeedSegment, HomePageSegmentLibrarySegment, HomePageSegmentManagement, HomePageSegmentPlaylistSegment, OneOf (+2 more)

### Community 91 - ".preload"
Cohesion: 0.29
Nodes (3): cacheAudio(), cacheAudioUncoordinated(), getCachedAudio()

### Community 92 - "UploadCard.tsx"
Cohesion: 0.29
Nodes (6): HomeIcon(), NavSearchIcon(), UploadsIcon(), getNavIcon(), NavItem(), NavItemProps

### Community 93 - "SearchService"
Cohesion: 0.33
Nodes (3): SearchAPI, ISearchService, SearchService

### Community 94 - "UISettingsWidget.tsx"
Cohesion: 0.47
Nodes (4): SettingsTabButton(), SettingsTabButtonProps, Tab, TABS

### Community 96 - "zpotify_service_search.pb.ts"
Cohesion: 0.22
Nodes (8): Search, SearchAlbumResult, SearchArtistResult, SearchFilters, SearchPlaylistResult, SearchRequest, SearchResponse, SearchTrackResult

### Community 97 - "LogoRow.tsx"
Cohesion: 0.50
Nodes (3): AnimatedZ(), LogoRow(), LogoRowProps

### Community 98 - "GeneratedAvatar.tsx"
Cohesion: 0.60
Nodes (4): AvatarProps, generateColor(), GeneratedAvatar(), generateHash()

### Community 99 - "HeaderPart.tsx"
Cohesion: 0.50
Nodes (3): AddTrackButton(), AddTrackButtonProps, HeaderPart()

## Knowledge Gaps
- **398 isolated node(s):** `localPlugin`, `name`, `private`, `version`, `type` (+393 more)
  These have ≤1 connection - possible missing edges or undocumented components.
- **11 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `useToaster()` connect `useToaster` to `zpotify_service_files.pb.ts`, `Dropdown.tsx`, `HomePage.ts`, `MainLayout.tsx`, `usePlayer.ts`, `Auth.ts`, `usePlaylistInfoSegment.ts`, `MultitrackUploadModal.tsx`, `useDialog`, `CachedSongsAccordion.tsx`, `useTrackDrafts.ts`, `CommentsSection.tsx`, `audioCacheStore.ts`, `zpotify_service_feature_flags.pb.ts`, `ChooseScreen.tsx`, `TrackRow.tsx`, `SongsService`, `usePendingFiles.tsx`, `PrivateLockWidget.tsx`, `TrackList.tsx`, `PlaylistScreenWidget.tsx`, `InitPage.tsx`, `AddTrackDialog.tsx`, `zpotify_common.pb.ts`, `supportedAudio.ts`, `NotificationDialog`?**
  _High betweenness centrality (0.052) - this node is a cross-community bridge._
- **Why does `AudioPlayerImpl` connect `AudioPlayerImpl` to `audioCacheStore.ts`, `PlayerBarSegment.tsx`, `.preload`?**
  _High betweenness centrality (0.038) - this node is a cross-community bridge._
- **Why does `SongBase` connect `index.ts` to `audioCacheStore.ts`, `zpotify_service_feature_flags.pb.ts`, `TrackRow.tsx`, `MainLayout.tsx`, `usePlayer.ts`, `PlaylistScreenWidget.tsx`, `useToaster`, `SongsService`, `zpotify_common.pb.ts`, `usePendingFiles.tsx`, `usePlaylistInfoSegment.ts`, `FilesList.tsx`, `TrackList.tsx`, `useTrackDrafts.ts`, `CommentsSection.tsx`?**
  _High betweenness centrality (0.028) - this node is a cross-community bridge._
- **What connects `localPlugin`, `name`, `private` to the rest of the system?**
  _403 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `zpotify_service_files.pb.ts` be split into smaller, more focused modules?**
  _Cohesion score 0.09615384615384616 - nodes in this community are weakly interconnected._
- **Should `Dropdown.tsx` be split into smaller, more focused modules?**
  _Cohesion score 0.10756302521008404 - nodes in this community are weakly interconnected._
- **Should `HomePage.ts` be split into smaller, more focused modules?**
  _Cohesion score 0.11333333333333333 - nodes in this community are weakly interconnected._