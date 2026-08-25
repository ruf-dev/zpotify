# Graph Report - ZpotifyUI  (2026-08-25)

## Corpus Check
- 367 files · ~69,023 words
- Verdict: corpus is large enough that graph structure adds value.

## Summary
- 1688 nodes · 3766 edges · 118 communities (108 shown, 10 thin omitted)
- Extraction: 99% EXTRACTED · 1% INFERRED · 0% AMBIGUOUS · INFERRED: 22 edges (avg confidence: 0.54)
- Token cost: 0 input · 0 output

## Graph Freshness
- Built from commit: `a34c74a3`
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
- React + TypeScript + Vite
- Carousel.tsx
- Song.ts
- eslint.config.js
- useArtistHeroSegment.ts
- EditControls.tsx
- .preload
- UploadCard.tsx
- SearchIcon.tsx
- useLikedArtists.ts
- DropZoneIcon.tsx
- zpotify_common.pb.ts
- FolderGroupHeader.tsx
- GeneratedAvatar.tsx
- SearchHistoryDropdown.test.tsx
- Input.tsx
- DropdownCreateRow.tsx
- zpotify_common.pb.ts
- PendingFilesScreen.test.tsx
- useTorrentJobs.ts
- SongEditDialog.tsx
- AlbumCard.tsx
- PlaylistScreenWidget.tsx
- IconButton.tsx
- SidebarSegment.tsx
- PlayerControls.tsx
- SearchService
- main.tsx
- GeneratedAvatar.tsx
- useEagerFileUpload.ts
- Input.tsx
- NotificationRow.tsx
- EditableText.tsx

## God Nodes (most connected - your core abstractions)
1. `useToaster()` - 64 edges
2. `useDialog` - 51 edges
3. `SongBase` - 41 edges
4. `useUser` - 39 edges
5. `AudioPlayerImpl` - 39 edges
6. `ArtistItem` - 31 edges
7. `PlaylistService` - 29 edges
8. `BaseService` - 28 edges
9. `TrackDraft` - 24 edges
10. `buildCoverUrl()` - 23 edges

## Surprising Connections (you probably didn't know these)
- `SongSearchBoxProps` --references--> `SongBase`  [EXTRACTED]
  src/widgets/SongSearchBox/SongSearchBox.tsx → src/app/api/zpotify/zpotify_common.pb.ts
- `NotificationDialogProps` --references--> `Notification`  [EXTRACTED]
  src/dialogs/Notification/NotificationDialog.tsx → src/app/api/zpotify/zpotify_service_notification.pb.ts
- `NotificationRowProps` --references--> `Notification`  [EXTRACTED]
  src/widgets/NotificationBell/components/NotificationRow/NotificationRow.tsx → src/app/api/zpotify/zpotify_service_notification.pb.ts
- `PlaylistHomeSegment()` --calls--> `playlistPath()`  [EXTRACTED]
  src/widgets/PlaylistHomeSegment/PlaylistHomeSegment.tsx → src/app/routing/paths.ts
- `EditableCoverWithFallback()` --calls--> `buildCoverUrl()`  [EXTRACTED]
  src/components/EditableCoverWithFallback/EditableCoverWithFallback.tsx → src/shared/lib/coverUrl.ts

## Import Cycles
- 3-file cycle: `src/entities/artist/useLikedArtists.ts -> src/shared/api/ArtistsService.ts -> src/widgets/ArtistField/ArtistChipsField.tsx -> src/entities/artist/useLikedArtists.ts`

## Communities (118 total, 10 thin omitted)

### Community 0 - "zpotify_service_files.pb.ts"
Cohesion: 0.10
Nodes (20): BatchDeleteFiles, BatchDeleteFilesRequest, BatchDeleteFilesResponse, CheckFilesByHashes, CheckFilesByHashesFoundFileByHash, CheckFilesByHashesRequest, CheckFilesByHashesResponse, DeleteFile (+12 more)

### Community 1 - "Dropdown.tsx"
Cohesion: 0.16
Nodes (11): HeartIcon(), HeartIconProps, CommentsSectionProps, MOCK_COMMENTS, MockComment, TODO: implement comments API — no backend endpoint exists yet, TODO: implement comments API — no backend endpoint exists yet, SaveButtonWidget() (+3 more)

### Community 2 - "HomePage.ts"
Cohesion: 0.11
Nodes (10): SegmentTabBarProps, Tab, HomePage(), FeedSegmentInfo, HomeSegment, LibrarySegmentInfo, ManagementSegmentInfo, PlaylistSegmentInfo (+2 more)

### Community 3 - "MainLayout.tsx"
Cohesion: 0.16
Nodes (18): Path, LoginViaPass(), isAlbum(), usePlaylistSongs(), User(), AuthStatus, useUser, EarlyAccessPage() (+10 more)

### Community 4 - "fetch.pb.ts"
Cohesion: 0.13
Nodes (16): b64, b64Encode(), fetchStreamingRequest(), FlattenedRequestPayload, flattenRequestPayload(), getNewLineDelimitedJSONDecodingStream(), getNotifyEntityArrivalSink(), isPlainObject() (+8 more)

### Community 5 - "usePlayer.ts"
Cohesion: 0.20
Nodes (12): RemoveTrackIcon(), CachedSongEntry, useCachedSongs(), AlbumGroup, CachedSongsAccordion(), groupSongsByAlbum(), matchesQuery(), AccordionHeader() (+4 more)

### Community 7 - "useToaster"
Cohesion: 0.12
Nodes (14): CheckIcon(), RetryAllIcon(), AddTrackDialog, MultitrackUploadModal(), PlaylistToggleRow(), PlaylistToggleRowProps, useArtistLookup(), MultitrackSubmitState (+6 more)

### Community 8 - "Auth.ts"
Cohesion: 0.16
Nodes (15): InitReq, UserAPI, BaseService, getAuth(), WebApiParams, withRetries(), isReason(), WithCode() (+7 more)

### Community 9 - "DropZoneScreen.tsx"
Cohesion: 0.14
Nodes (16): DialogManager, useDialog, BellIcon(), BellIconProps, NotificationDialog(), SettingsDialog(), useNotifications, GhostSong() (+8 more)

### Community 10 - "compilerOptions"
Cohesion: 0.08
Nodes (24): compilerOptions, allowImportingTsExtensions, allowJs, allowSyntheticDefaultImports, esModuleInterop, forceConsistentCasingInFileNames, isolatedModules, jsx (+16 more)

### Community 11 - "CLAUDE.md"
Cohesion: 0.09
Nodes (22): Architecture — Feature Slice Design, Async style, Barrel / index.ts, Coding rules, Commands, Error and Confirmation Handling, Exploration Rules, Export conventions (+14 more)

### Community 12 - "devDependencies"
Cohesion: 0.07
Nodes (28): devDependencies, eslint, eslint-config-prettier, eslint-import-resolver-typescript, @eslint/js, eslint-plugin-import, eslint-plugin-prettier, eslint-plugin-react (+20 more)

### Community 13 - "zpotify_service_auth.pb.ts"
Cohesion: 0.05
Nodes (40): Absent, Auth, AuthLogPass, AuthRequest, AuthResponse, AuthTelegramOAuth, AuthViaAsync, AuthViaAsyncRequest (+32 more)

### Community 14 - "useUser"
Cohesion: 0.13
Nodes (17): CoverWithFallback(), CoverWithFallbackProps, GenerativeCover(), GenerativeCoverProps, PALETTES, ShapeFn, SHAPES, cacheCover() (+9 more)

### Community 15 - "useSearchPage.ts"
Cohesion: 0.18
Nodes (16): SearchResponse, FILTER_LABELS, FilterChipsProps, FilterKey, EMPTY_RESPONSE, UseSearchPageResult, SearchAlbumResult, SearchArtistResult (+8 more)

### Community 16 - "SongEditDialog.tsx"
Cohesion: 0.17
Nodes (10): DragHandleIcon(), EditableTitleProps, TODO: switch to chures Input once it supports ref/onKeyDown, TODO: Make editable here and send update name for such files if changed, TrackRow(), TrackRowProps, cleanTrackNumber(), formatBytes() (+2 more)

### Community 17 - "usePlaylistInfoSegment.ts"
Cohesion: 0.19
Nodes (10): EditableAlbumName(), EditableAlbumNameProps, EditableYearProps, TrackCountLabel(), TrackCountLabelProps, PlaylistInfoSegment(), usePlaylistInfoSegment(), DescriptionSectionProps (+2 more)

### Community 18 - "ArtistsService.ts"
Cohesion: 0.17
Nodes (3): ArtistsAPI, ListArtistResponse, ArtistsService

### Community 19 - "FilesList.tsx"
Cohesion: 0.16
Nodes (15): SongFile, TrashIcon(), Checkbox(), CheckboxProps, FileItem(), FileItemProps, ParsedSongFilePath, parseSongFilePath() (+7 more)

### Community 20 - "MultitrackUploadModal.tsx"
Cohesion: 0.16
Nodes (13): CancelTorrentJob, CancelTorrentJobRequest, CancelTorrentJobResponse, GetTorrentJob, GetTorrentJobRequest, GetTorrentJobResponse, ImportedFile, ListTorrentJobs (+5 more)

### Community 21 - "ArtistItem"
Cohesion: 0.17
Nodes (17): albumPath(), artistPath(), playlistPath(), SearchHistoryState, useSearchHistory, ArtistCard(), ArtistCardProps, SectionLabel() (+9 more)

### Community 22 - "zpotify_service_playlist.pb.ts"
Cohesion: 0.07
Nodes (32): AddSongsToPlaylist, AddSongsToPlaylistRequest, AddSongsToPlaylistResponse, AddSongToPlaylist, AddSongToPlaylistRequest, AddSongToPlaylistResponse, ChangeSongsOrder, ChangeSongsOrderRequest (+24 more)

### Community 23 - "PlaylistService.ts"
Cohesion: 0.11
Nodes (20): ListSearchHistory, ListSearchHistoryRequest, ListSearchHistoryResponse, RecordSearchFinding, RecordSearchFindingRequest, RecordSearchFindingResponse, RecordSearchQuery, RecordSearchQueryRequest (+12 more)

### Community 24 - "useDialog"
Cohesion: 0.18
Nodes (13): AddTrackDialog(), FilesList(), FilesListProps, MetaDialog(), SongEditDialog(), TorrentManageDialog(), BackHandler, ensureListener() (+5 more)

### Community 25 - "CachedSongsAccordion.tsx"
Cohesion: 0.23
Nodes (7): UploadArrowIcon(), ZLogoIcon(), CoverFieldProps, CoverUploadProgress(), CoverUploadProgressProps, EditableCoverWithFallback(), EditableCoverWithFallbackProps

### Community 26 - "useTrackDrafts.ts"
Cohesion: 0.15
Nodes (24): BatchUploadState, useBatchUpload(), MultitrackUploadModalProps, applyInitialTrackMeta(), buildNewTracksFromFresh(), ClassifiedFile, classifyIncomingFiles(), createInitialTracks() (+16 more)

### Community 27 - "PlaylistsLibrarySegment.tsx"
Cohesion: 0.12
Nodes (19): FeedArtistChip(), choosePlaylistComponent(), FeedDayGroup(), feedItemTransition, Props, FeedArtistItem, FeedDay, FeedSongArtist (+11 more)

### Community 28 - "dependencies"
Cohesion: 0.11
Nodes (19): dependencies, classnames, framer-motion, grpc-web, @hookstate/core, music-metadata-browser, react, react-dom (+11 more)

### Community 29 - "index.ts"
Cohesion: 0.20
Nodes (14): Playlist, SongBase, DownloadIcon(), EditTrackDialogProps, ArtistSongsRowProps, Props, PlaylistInfoSegmentProps, UsePlaylistInfoSegmentParams (+6 more)

### Community 30 - "useUser.ts"
Cohesion: 0.24
Nodes (6): Paging, Notification, NotificationAPI, NotificationsState, INotificationsService, NotificationsService

### Community 31 - "CommentsSection.tsx"
Cohesion: 0.20
Nodes (3): SearchAPI, ISearchHistoryService, SearchHistoryService

### Community 32 - "audioCacheStore.ts"
Cohesion: 0.14
Nodes (15): GripIcon(), PlayTriangleIcon(), computeCoverColor(), COVER_COLORS, formatTime(), PlayerBarSegment(), trackInfoKey(), useIsSongCached() (+7 more)

### Community 33 - "zpotify_service_feature_flags.pb.ts"
Cohesion: 0.07
Nodes (27): FeatureFlag, FeatureFlagId, FeatureFlagsAPI, GetFeatureFlags, GetFeatureFlagsRequest, GetFeatureFlagsResponse, ClockIcon(), FeatureFlagsStore (+19 more)

### Community 34 - "ChooseScreen.tsx"
Cohesion: 0.23
Nodes (8): SettingsRow(), SettingsRowProps, SettingsTabButton(), SettingsTabButtonProps, Tab, AppearanceScreen(), TABS, UISettingsWidget()

### Community 35 - "TrackRow.tsx"
Cohesion: 0.14
Nodes (17): UploadingFileRowProps, TrackGroupSegment, TargetPlaylist, PlaylistDetailsPanelProps, TrackListProps, TrackDraft, ArtistLookup, MultitrackSubmitParams (+9 more)

### Community 36 - "WebApi.ts"
Cohesion: 0.19
Nodes (12): GrpcErrorDetails, isHttpCodeRetryable(), ServiceError, WithDescription(), WithHttpStatus(), WithIsNonRetryable(), WithStatusCode(), WithTitle() (+4 more)

### Community 37 - "ArtistChipsField.tsx"
Cohesion: 0.11
Nodes (18): BatchCreateSong, BatchCreateSongRequest, BatchCreateSongResponse, CreateSong, CreateSongRequest, CreateSongResponse, GetSong, GetSongRequest (+10 more)

### Community 38 - "PlaylistAPI"
Cohesion: 0.11
Nodes (4): ListPlaylistsResponse, PlaylistAPI, mapToTrackPreviews(), PlaylistService

### Community 39 - "SongsService"
Cohesion: 0.18
Nodes (3): SongAPI, ISongsService, SongsService

### Community 40 - "LazyLoadSongsList.tsx"
Cohesion: 0.27
Nodes (6): PlaylistListRefreshState, usePlaylistListRefresh, AlbumCardSkeleton(), PlaylistCardWideSkeleton(), PlaylistsLibrarySegment(), LibraryGridScreenSkeleton()

### Community 41 - "MainContent.tsx"
Cohesion: 0.20
Nodes (7): FeedDay, GetFeed, GetFeedRequest, GetFeedResponse, HomeAPI, FeedService, IFeedService

### Community 42 - "InfoControls.tsx"
Cohesion: 0.38
Nodes (4): RandomArrows(), ShuffleTracksButton(), ShuffleTracksButtonProps, ShuffleButton()

### Community 43 - "UserWidget.tsx"
Cohesion: 0.23
Nodes (12): BatchUploadSection(), BatchUploadSectionProps, isFolderSettled(), folderProgress(), groupTracksByFolder(), TrackList(), computeGhostStyle(), computeRowStyle() (+4 more)

### Community 44 - "BaseService.ts"
Cohesion: 0.09
Nodes (21): AuthAPI, AuthData, User, TelegramAuth(), apiPrefix(), InitReq, options, AuthMiddleware (+13 more)

### Community 45 - "AlbumTag"
Cohesion: 0.24
Nodes (11): Dropdown(), DropdownProps, useDropdownClose(), useSearchResults(), DropdownOption, getOptionId(), getOptionLabel(), DropdownCreateRow() (+3 more)

### Community 46 - "usePendingFiles.tsx"
Cohesion: 0.22
Nodes (6): AnimatedZ(), LogoRow(), LogoRowProps, TrackProgressControls(), MusicPlayerProps, PlayerControls()

### Community 47 - "zpotify_service_artists.pb.ts"
Cohesion: 0.19
Nodes (10): CardRow(), CardRowProps, LikedSongsState, useLikedSongs, SongListPermissions, UserPermissions, ArtistSongsRow(), MainContent() (+2 more)

### Community 48 - "ChipsField.tsx"
Cohesion: 0.21
Nodes (7): MiniClockIcon(), MiniDiscIcon(), FieldLabelRow(), FieldLabelRowProps, formatTotalDuration(), PlaylistDetailsPanel(), DisabledChipProps

### Community 49 - "MoreButton.tsx"
Cohesion: 0.30
Nodes (8): MoreDots(), MenuOption(), MenuOptionProps, Menu(), MenuOption, MenuProps, MoreButton(), MoreButtonProps

### Community 50 - "HeaderSearchInput.tsx"
Cohesion: 0.19
Nodes (10): SearchIcon(), DropdownSearchRow(), DropdownSearchRowProps, SearchQueryState, useSearchQuery, EmptyState(), EmptyStateProps, MobileSearchInput() (+2 more)

### Community 51 - "InitPage.tsx"
Cohesion: 0.27
Nodes (7): EditableArtistPickerContext, FADE_TRANSITION, HEIGHT_TRANSITION, PlaylistOwnerLabel(), PlaylistOwnerLabelProps, ArtistOrOwnerRow(), ArtistOrOwnerRowProps

### Community 52 - "SidebarSegment.tsx"
Cohesion: 0.32
Nodes (9): DropZone(), DropZoneProps, readAllDirectoryEntries(), readEntryFile(), resolveDroppedEntries(), resolveFolder(), AUDIO_ACCEPT, isSupportedAudioFile() (+1 more)

### Community 53 - "PrivateLockWidget.tsx"
Cohesion: 0.25
Nodes (7): PrivateLockIcon(), PrivateLockIconProps, PrivatePlaylistIndicator(), PrivateLockWidget(), PrivateLockWidgetProps, usePrivateLockWidget(), UsePrivateLockWidgetParams

### Community 54 - "IPlaylistService"
Cohesion: 0.20
Nodes (9): TorrentJob, TorrentJobItem(), TorrentJobItemProps, cancelTorrentJobMock, getTorrentJobMock, toasterCatchSpy, TorrentManageDialogProps, formatFileBytes() (+1 more)

### Community 55 - "useUISettings"
Cohesion: 0.22
Nodes (9): MainLayout(), SegmentCarousel(), SegmentCarouselProps, StubRect, UISettings, useUISettings, MobileNavSegment(), useAudioPlayer() (+1 more)

### Community 56 - "TrackList.tsx"
Cohesion: 0.14
Nodes (13): CreateArtist, CreateArtistRequest, CreateArtistResponse, GetArtistPage, LikeArtist, LikeArtistRequest, LikeArtistResponse, ListArtist (+5 more)

### Community 57 - "PlaylistScreenWidget.tsx"
Cohesion: 0.33
Nodes (4): Version, VersionRequest, VersionResponse, ZpotifyAPI

### Community 58 - "PlaylistScreenWidget.tsx"
Cohesion: 0.18
Nodes (7): GetArtistPageRequest, GetArtistPageResponse, ListArtistRequest, UpdateArtistRequest, UpdateArtistResponse, IArtistsService, Props

### Community 59 - "EditControls.tsx"
Cohesion: 0.33
Nodes (6): SongRow(), SongRowArtist, SongRowProps, formatDuration(), SongSearchBox(), SongSearchBoxProps

### Community 60 - "PanelHeader.tsx"
Cohesion: 0.16
Nodes (18): EditTrackDialog(), MetaDialogProps, NotificationDialogProps, MetaScreen(), MetaScreenProps, useListSongs(), UseListSongsOptions, SongListRefreshState (+10 more)

### Community 61 - "scripts"
Cohesion: 0.20
Nodes (10): scripts, build, dev, gen, lint, lint:css, lint:fix, lint:js (+2 more)

### Community 62 - "PlayButton.tsx"
Cohesion: 0.28
Nodes (6): PauseIcon(), PauseIconProps, PlayIcon(), PlayIconProps, PlayButton(), PlayButtonProps

### Community 63 - "InitPage.tsx"
Cohesion: 0.29
Nodes (5): navigateSpy, playSpy, recordFindingSpy, setSongInfoSpy, visibleTracks

### Community 64 - "AddTrackDialog.tsx"
Cohesion: 0.21
Nodes (8): CreatePlaylistIcon(), MusicFileIcon(), MusicFileIconProps, ChooseScreen(), CreatePlaylistCard(), CreatePlaylistCardProps, LibraryCard(), LibraryCardProps

### Community 65 - "PlayerBarSegment.tsx"
Cohesion: 0.23
Nodes (5): VolumeControlProps, VolumeBarProps, VolumeDisplayProps, TrackProgressControlsProps, AudioPlayer

### Community 66 - "compilerOptions"
Cohesion: 0.20
Nodes (9): compilerOptions, allowSyntheticDefaultImports, composite, module, moduleResolution, outDir, skipLibCheck, strict (+1 more)

### Community 67 - "zpotify_common.pb.ts"
Cohesion: 0.15
Nodes (12): ConsentNotification, ConsentNotificationRequest, ConsentNotificationResponse, GetNotificationSummary, GetNotificationSummaryRequest, GetNotificationSummaryResponse, ListNotifications, ListNotificationsRequest (+4 more)

### Community 68 - "supportedAudio.ts"
Cohesion: 0.15
Nodes (10): DashedRingIcon(), DashedRingIconProps, SpinnerIcon(), DragOverDecoration(), DropZoneText(), DropZoneTextProps, IdleDecoration(), UploadingSpinner() (+2 more)

### Community 69 - "ZpotifyUI Development Manifesto"
Cohesion: 0.33
Nodes (5): AI Assistant Guidelines, Development Principles, Styling, Tech Stack & Architecture, ZpotifyUI Development Manifesto

### Community 70 - "DropZoneIcon.tsx"
Cohesion: 0.19
Nodes (19): toFeedArtistItem(), toFeedDay(), toFeedResult(), toFeedSongItem(), WireArtistBase, WireFeedDay, WireSongBase, interleave() (+11 more)

### Community 71 - "LibraryGridScreenSkeleton.tsx"
Cohesion: 0.15
Nodes (13): AddTrackContext, AddTrackDialogProps, BACK_STEPS, ModalStep, SCREENS, DOT_STEPS, PanelHeader(), PanelHeaderProps (+5 more)

### Community 72 - "package.json"
Cohesion: 0.40
Nodes (4): name, private, type, version

### Community 73 - "zpotify_common.pb.ts"
Cohesion: 0.15
Nodes (6): AlbumTag, CreatePlaylistResponse, UpdatePlaylistResponse, IPlaylistService, GenreChipsRow(), GenreChipsRowProps

### Community 89 - "useArtistHeroSegment.ts"
Cohesion: 0.19
Nodes (13): Artist, EditIcon(), EditIconProps, SaveIcon(), EditControls(), EditControlsProps, useEagerFileUpload(), EditableArtistName() (+5 more)

### Community 90 - "EditControls.tsx"
Cohesion: 0.31
Nodes (6): SidebarToggleIcon(), SidebarToggleButton(), ArtistRow(), ArtistRowProps, SidebarUIState, useSidebarUI

### Community 91 - ".preload"
Cohesion: 0.14
Nodes (22): AudioSettings, useAudioSettings, cacheAudio(), cacheAudioUncoordinated(), cacheTracks(), clearAudioCache(), getCachedAudio(), getTrackUrl() (+14 more)

### Community 92 - "UploadCard.tsx"
Cohesion: 0.29
Nodes (6): HomeIcon(), NavSearchIcon(), UploadsIcon(), getNavIcon(), NavItem(), NavItemProps

### Community 93 - "SearchIcon.tsx"
Cohesion: 0.31
Nodes (5): UploadArrowSmallIcon(), UploadDoneIcon(), UploadErrorIcon(), UploadStatusChip(), UploadStatusChipProps

### Community 94 - "useLikedArtists.ts"
Cohesion: 0.33
Nodes (7): ArtistBase, LikedArtistsState, useLikedArtists, SidebarArtistsWidget(), SidebarArtistsWidgetProps, uuidToHslSeed(), ArtistChipsField()

### Community 95 - "DropZoneIcon.tsx"
Cohesion: 0.28
Nodes (6): DropZoneTargetIcon(), DropZoneTargetIconProps, DropZoneUploadIcon(), DropZoneUploadIconProps, DropZoneIcon(), DropZoneIconProps

### Community 96 - "zpotify_common.pb.ts"
Cohesion: 0.33
Nodes (5): ArtistPage(), useArtistPage(), Errors, NotFoundScreen(), SkeletonLoadScreen()

### Community 97 - "FolderGroupHeader.tsx"
Cohesion: 0.27
Nodes (5): ChevronRightIcon(), FolderIcon(), FolderIconProps, FolderGroupHeader(), FolderGroupHeaderProps

### Community 98 - "GeneratedAvatar.tsx"
Cohesion: 0.33
Nodes (7): PlaylistRow(), PlaylistRowData, PlaylistRowProps, PlaylistItem, SidebarPlaylistsWidget(), SidebarPlaylistsWidgetProps, uuidToHslColor()

### Community 99 - "SearchHistoryDropdown.test.tsx"
Cohesion: 0.29
Nodes (4): entries, fetchSpy, navigateSpy, setQuerySpy

### Community 101 - "DropdownCreateRow.tsx"
Cohesion: 0.14
Nodes (11): AlbumTagKind, LockIcon(), PlusIcon(), PlusIconProps, RemoveIcon(), Chip(), ChipProps, ArtistChipsFieldProps (+3 more)

### Community 102 - "zpotify_common.pb.ts"
Cohesion: 0.25
Nodes (7): Absent, AlbumVersionMetadata, AlbumVersionMetadataVersionKind, BaseAlbumTag, OneOf, SongTag, SongTagKind

### Community 103 - "PendingFilesScreen.test.tsx"
Cohesion: 0.25
Nodes (4): handleToggleSelectFolderSpy, mockFiles, mockJobs, mockSelectedIds

### Community 104 - "useTorrentJobs.ts"
Cohesion: 0.39
Nodes (4): listTorrentJobsMock, useTorrentJobs(), isTerminalTorrentStatus(), TERMINAL_TORRENT_STATUSES

### Community 105 - "SongEditDialog.tsx"
Cohesion: 0.32
Nodes (5): SongEditDialogProps, BackButton(), BackButtonProps, Chip(), ChipProps

### Community 106 - "AlbumCard.tsx"
Cohesion: 0.39
Nodes (4): getInitialMatches(), MediaQueryListStub, useIsMobile(), AlbumCard()

### Community 107 - "PlaylistScreenWidget.tsx"
Cohesion: 0.36
Nodes (5): computeTotalDuration(), mapPlaylistArtists(), PlaylistScreenWidget(), NotFoundPlaylistInfoSegment(), NotFoundPlaylistInfoSegmentProps

### Community 108 - "IconButton.tsx"
Cohesion: 0.38
Nodes (4): ShareIcon(), IconButton(), IconButtonProps, ShareButton()

### Community 109 - "SidebarSegment.tsx"
Cohesion: 0.33
Nodes (5): AddTrackButton(), AddTrackButtonProps, NAV_ITEMS, navIdentity, SidebarSegment()

### Community 110 - "PlayerControls.tsx"
Cohesion: 0.33
Nodes (4): PlayPauseButton(), PlayPauseButtonProps, TrackRewindButton, PlayerProps

### Community 112 - "main.tsx"
Cohesion: 0.50
Nodes (3): initServiceWorker(), Router(), queryClient

### Community 113 - "GeneratedAvatar.tsx"
Cohesion: 0.60
Nodes (4): AvatarProps, generateColor(), GeneratedAvatar(), generateHash()

### Community 114 - "useEagerFileUpload.ts"
Cohesion: 0.50
Nodes (3): webApiService, ActiveUpload, EagerFileUpload

### Community 116 - "NotificationRow.tsx"
Cohesion: 0.67
Nodes (3): formatNotificationDate(), NotificationRow(), NotificationRowProps

## Knowledge Gaps
- **439 isolated node(s):** `localPlugin`, `name`, `private`, `version`, `type` (+434 more)
  These have ≤1 connection - possible missing edges or undocumented components.
- **10 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `useToaster()` connect `PanelHeader.tsx` to `Dropdown.tsx`, `HomePage.ts`, `MainLayout.tsx`, `usePlayer.ts`, `useToaster`, `DropZoneScreen.tsx`, `usePlaylistInfoSegment.ts`, `FilesList.tsx`, `useDialog`, `useTrackDrafts.ts`, `audioCacheStore.ts`, `zpotify_service_feature_flags.pb.ts`, `LazyLoadSongsList.tsx`, `BaseService.ts`, `AlbumTag`, `zpotify_service_artists.pb.ts`, `PrivateLockWidget.tsx`, `IPlaylistService`, `supportedAudio.ts`, `LibraryGridScreenSkeleton.tsx`, `useArtistHeroSegment.ts`, `.preload`, `SongEditDialog.tsx`?**
  _High betweenness centrality (0.050) - this node is a cross-community bridge._
- **Why does `AudioPlayerImpl` connect `AudioPlayerImpl` to `PlayerBarSegment.tsx`, `.preload`, `usePendingFiles.tsx`?**
  _High betweenness centrality (0.036) - this node is a cross-community bridge._
- **Why does `useDialog` connect `DropZoneScreen.tsx` to `audioCacheStore.ts`, `MainLayout.tsx`, `usePlayer.ts`, `LibraryGridScreenSkeleton.tsx`, `useToaster`, `SongEditDialog.tsx`, `SidebarSegment.tsx`, `FilesList.tsx`, `IPlaylistService`, `useDialog`, `.preload`, `PanelHeader.tsx`?**
  _High betweenness centrality (0.031) - this node is a cross-community bridge._
- **What connects `localPlugin`, `name`, `private` to the rest of the system?**
  _445 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `zpotify_service_files.pb.ts` be split into smaller, more focused modules?**
  _Cohesion score 0.0990990990990991 - nodes in this community are weakly interconnected._
- **Should `HomePage.ts` be split into smaller, more focused modules?**
  _Cohesion score 0.11333333333333333 - nodes in this community are weakly interconnected._
- **Should `fetch.pb.ts` be split into smaller, more focused modules?**
  _Cohesion score 0.13157894736842105 - nodes in this community are weakly interconnected._