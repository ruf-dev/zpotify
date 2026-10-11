# Graph Report - ZpotifyUI  (2026-10-11)

## Corpus Check
- 425 files · ~80,902 words
- Verdict: corpus is large enough that graph structure adds value.

## Summary
- 1934 nodes · 4352 edges · 130 communities (110 shown, 20 thin omitted)
- Extraction: 99% EXTRACTED · 1% INFERRED · 0% AMBIGUOUS · INFERRED: 22 edges (avg confidence: 0.54)
- Token cost: 0 input · 0 output

## Graph Freshness
- Built from commit: `85051326`
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
- PlaylistHomeSegment.tsx
- .ListLibrary
- cacheAudio
- AddTorrentMagnetRequest
- GetTorrentFileResponse
- GetTorrentJobRequest
- ListTorrentJobsRequest
- PauseTorrentJobRequest
- SubmitTorrentFileRequest
- TrackRow.test.tsx
- DescriptionSection.tsx
- CLAUDE.local.md

## God Nodes (most connected - your core abstractions)
1. `useToaster()` - 70 edges
2. `useDialog` - 55 edges
3. `AudioPlayerImpl` - 46 edges
4. `useUser` - 43 edges
5. `SongBase` - 42 edges
6. `ArtistItem` - 31 edges
7. `PlaylistService` - 29 edges
8. `TrackDraft` - 28 edges
9. `BaseService` - 28 edges
10. `buildCoverUrl()` - 25 edges

## Surprising Connections (you probably didn't know these)
- `ExistingFileSongMeta` --references--> `SongBase`  [EXTRACTED]
  src/dialogs/MultitrackUpload/useTrackDrafts.ts → src/app/api/zpotify/zpotify_common.pb.ts
- `ArtistSongsRowProps` --references--> `SongBase`  [EXTRACTED]
  src/widgets/ArtistScreen/widgets/ArtistSongsRow/ArtistSongsRow.tsx → src/app/api/zpotify/zpotify_common.pb.ts
- `SongSearchBoxProps` --references--> `SongBase`  [EXTRACTED]
  src/widgets/SongSearchBox/SongSearchBox.tsx → src/app/api/zpotify/zpotify_common.pb.ts
- `RecentTorrentsPanel()` --calls--> `useDialog`  [EXTRACTED]
  src/dialogs/AddTrack/screens/components/RecentTorrentsPanel/RecentTorrentsPanel.tsx → src/app/hooks/Dialog.tsx
- `PlaylistHomeSegment()` --calls--> `playlistPath()`  [EXTRACTED]
  src/widgets/PlaylistHomeSegment/PlaylistHomeSegment.tsx → src/app/routing/paths.ts

## Import Cycles
- 3-file cycle: `src/entities/artist/useLikedArtists.ts -> src/shared/api/ArtistsService.ts -> src/widgets/ArtistField/ArtistChipsField.tsx -> src/entities/artist/useLikedArtists.ts`

## Communities (130 total, 20 thin omitted)

### Community 0 - "zpotify_service_files.pb.ts"
Cohesion: 0.08
Nodes (24): BatchDeleteFiles, BatchDeleteFilesRequest, BatchDeleteFilesResponse, CheckFilesByHashes, CheckFilesByHashesFoundFileByHash, CheckFilesByHashesRequest, CheckFilesByHashesResponse, CheckSongsByFileIds (+16 more)

### Community 1 - "Dropdown.tsx"
Cohesion: 0.06
Nodes (28): AlbumTagKind, Version, VersionRequest, VersionResponse, ZpotifyAPI, HeartIcon(), HeartIconProps, LockIcon() (+20 more)

### Community 2 - "HomePage.ts"
Cohesion: 0.10
Nodes (10): SegmentTabBarProps, Tab, HomePage(), FeedSegmentInfo, HomeSegment, LibrarySegmentInfo, ManagementSegmentInfo, PlaylistSegmentInfo (+2 more)

### Community 3 - "MainLayout.tsx"
Cohesion: 0.24
Nodes (13): albumPath(), playlistPath(), isAlbum(), usePlaylistSongs(), User(), useUser, AlbumPage(), PlaylistPage() (+5 more)

### Community 4 - "fetch.pb.ts"
Cohesion: 0.14
Nodes (15): b64, b64Encode(), fetchStreamingRequest(), FlattenedRequestPayload, flattenRequestPayload(), getNewLineDelimitedJSONDecodingStream(), getNotifyEntityArrivalSink(), isPlainObject() (+7 more)

### Community 5 - "usePlayer.ts"
Cohesion: 0.20
Nodes (12): RemoveTrackIcon(), CachedSongEntry, useCachedSongs(), AlbumGroup, CachedSongsAccordion(), groupSongsByAlbum(), matchesQuery(), AccordionHeader() (+4 more)

### Community 7 - "useToaster"
Cohesion: 0.16
Nodes (13): CheckIcon(), RetryAllIcon(), AddTrackDialog, MultitrackUploadModal(), PlaylistToggleRow(), PlaylistToggleRowProps, useArtistLookup(), useMultitrackSubmit() (+5 more)

### Community 8 - "Auth.ts"
Cohesion: 0.29
Nodes (6): UserAPI, HomePageSegment, ISettingsService, parseHomePageSegment(), SettingsService, toHomeSegments()

### Community 9 - "DropZoneScreen.tsx"
Cohesion: 0.12
Nodes (17): DialogManager, useDialog, usePendingFiles(), NotificationDialog(), useNotifications, GhostSong(), LogPassAuth(), AddTrackButton() (+9 more)

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
Cohesion: 0.10
Nodes (18): GetUserSettings, GetUserSettingsRequest, GetUserSettingsResponse, Me, MeRequest, MeResponse, UserData, AuthMethods (+10 more)

### Community 14 - "useUser"
Cohesion: 0.13
Nodes (17): CoverWithFallback(), CoverWithFallbackProps, GenerativeCover(), GenerativeCoverProps, PALETTES, ShapeFn, SHAPES, cacheCover() (+9 more)

### Community 15 - "useSearchPage.ts"
Cohesion: 0.15
Nodes (17): FILTER_LABELS, FilterChipsProps, FilterKey, EMPTY_RESPONSE, UseSearchPageResult, ISearchService, SearchAlbumResult, SearchArtistResult (+9 more)

### Community 16 - "SongEditDialog.tsx"
Cohesion: 0.24
Nodes (6): DragHandleIcon(), EditableTitleProps, TODO: switch to chures Input once it supports ref/onKeyDown, TODO: Make editable here and send update name for such files if changed, TrackRow(), getCleanablePrefixLength()

### Community 17 - "usePlaylistInfoSegment.ts"
Cohesion: 0.23
Nodes (10): EditableAlbumName(), EditableAlbumNameProps, EditableYearProps, TrackCountLabel(), TrackCountLabelProps, PlaylistInfoSegment(), usePlaylistInfoSegment(), ArtistOrOwnerRow() (+2 more)

### Community 19 - "FilesList.tsx"
Cohesion: 0.19
Nodes (8): SongFile, TrashIcon(), Checkbox(), CheckboxProps, FileItemProps, listUploadedFilesMock, toasterCatchSpy, ExistingFilePartition

### Community 21 - "ArtistItem"
Cohesion: 0.13
Nodes (21): artistPath(), Path, SearchIcon(), useSearchHistory, SearchQueryState, useSearchQuery, ArtistCard(), ArtistCardProps (+13 more)

### Community 22 - "zpotify_service_playlist.pb.ts"
Cohesion: 0.08
Nodes (31): AddSongsToPlaylist, AddSongsToPlaylistRequest, AddSongsToPlaylistResponse, AddSongToPlaylist, AddSongToPlaylistRequest, AddSongToPlaylistResponse, ChangeSongsOrder, ChangeSongsOrderRequest (+23 more)

### Community 23 - "PlaylistService.ts"
Cohesion: 0.10
Nodes (21): ListSearchHistory, ListSearchHistoryRequest, ListSearchHistoryResponse, RecordSearchFinding, RecordSearchFindingRequest, RecordSearchFindingResponse, RecordSearchQuery, RecordSearchQueryRequest (+13 more)

### Community 24 - "useDialog"
Cohesion: 0.14
Nodes (15): AddTrackDialog(), FilesList(), FilesListProps, MetaDialog(), SongEditDialog(), TorrentManageDialog(), Dialog(), isPausedTorrentStatus() (+7 more)

### Community 25 - "CachedSongsAccordion.tsx"
Cohesion: 0.23
Nodes (7): UploadArrowIcon(), ZLogoIcon(), CoverFieldProps, CoverUploadProgress(), CoverUploadProgressProps, EditableCoverWithFallback(), EditableCoverWithFallbackProps

### Community 26 - "useTrackDrafts.ts"
Cohesion: 0.12
Nodes (30): useBatchUpload(), applyInitialTrackMeta(), buildNewTracksFromFresh(), ClassifiedFile, classifyIncomingFiles(), createInitialTracks(), createTracksFromExistingFiles(), ExistingFileSongMeta (+22 more)

### Community 27 - "PlaylistsLibrarySegment.tsx"
Cohesion: 0.15
Nodes (13): getInitialMatches(), MediaQueryListStub, useIsMobile(), AlbumCard(), TrackRow(), TrackRowProps, PlaylistCardWide(), AlbumCardProps (+5 more)

### Community 28 - "dependencies"
Cohesion: 0.10
Nodes (21): dependencies, classnames, framer-motion, grpc-web, @hookstate/core, lucide, morphicons, music-metadata-browser (+13 more)

### Community 29 - "index.ts"
Cohesion: 0.28
Nodes (11): Playlist, SongBase, EditTrackDialogProps, Props, PlaylistInfoSegmentProps, UsePlaylistInfoSegmentParams, InfoControls(), InfoControlsProps (+3 more)

### Community 30 - "useUser.ts"
Cohesion: 0.17
Nodes (10): Paging, Notification, NotificationAPI, NotificationDialogProps, NotificationsState, INotificationsService, NotificationsService, formatNotificationDate() (+2 more)

### Community 31 - "CommentsSection.tsx"
Cohesion: 0.20
Nodes (3): SearchAPI, ISearchHistoryService, SearchHistoryService

### Community 32 - "audioCacheStore.ts"
Cohesion: 0.19
Nodes (14): MobilePlayerControls(), formatTime(), MobilePlayerProgress(), MobilePlayerSegment(), computeCoverColor(), COVER_COLORS, formatTime(), PlayerBarSegment() (+6 more)

### Community 33 - "zpotify_service_feature_flags.pb.ts"
Cohesion: 0.18
Nodes (12): FeatureFlag, FeatureFlagId, FeatureFlagsAPI, GetFeatureFlags, GetFeatureFlagsRequest, GetFeatureFlagsResponse, FeatureFlagsStore, selectFlagEnabled() (+4 more)

### Community 34 - "ChooseScreen.tsx"
Cohesion: 0.06
Nodes (31): BellIcon(), BellIconProps, MoreDots(), SegmentCarousel(), SegmentCarouselProps, StubRect, MenuOption(), MenuOptionProps (+23 more)

### Community 35 - "TrackRow.tsx"
Cohesion: 0.19
Nodes (11): TargetPlaylist, TrackRowProps, ArtistLookup, buildValidationHint(), MultitrackSummary, MultitrackSummaryParams, useMultitrackSummary(), TrackDraftsState (+3 more)

### Community 36 - "WebApi.ts"
Cohesion: 0.11
Nodes (28): InitReq, parseDuplicateTorrentJobId(), serviceError(), BaseService, delay(), getAuth(), WebApiParams, withRetries() (+20 more)

### Community 37 - "ArtistChipsField.tsx"
Cohesion: 0.11
Nodes (18): BatchCreateSong, BatchCreateSongRequest, BatchCreateSongResponse, CreateSong, CreateSongRequest, CreateSongResponse, GetSong, GetSongRequest (+10 more)

### Community 40 - "LazyLoadSongsList.tsx"
Cohesion: 0.47
Nodes (3): AlbumCardSkeleton(), PlaylistCardWideSkeleton(), LibraryGridScreenSkeleton()

### Community 41 - "MainContent.tsx"
Cohesion: 0.29
Nodes (5): FeedDay, GetFeed, GetFeedRequest, GetFeedResponse, HomeAPI

### Community 42 - "InfoControls.tsx"
Cohesion: 0.21
Nodes (13): BatchUploadSection(), BatchUploadSectionProps, renderTrack(), UploadingFileRowProps, TrackFolderNode(), TrackFolderNodeProps, buildEntries(), folderProgress() (+5 more)

### Community 43 - "UserWidget.tsx"
Cohesion: 0.25
Nodes (8): TrackGroupEntry, TrackList(), TrackListProps, computeGhostStyle(), computeRowStyle(), Drag, TrackDragApi, useTrackDrag()

### Community 44 - "BaseService.ts"
Cohesion: 0.06
Nodes (37): Absent, Auth, AuthAPI, AuthData, AuthLogPass, AuthRequest, AuthResponse, AuthTelegramOAuth (+29 more)

### Community 45 - "AlbumTag"
Cohesion: 0.19
Nodes (13): Dropdown(), DropdownProps, useDropdownClose(), useSearchResults(), DropdownOption, getOptionId(), getOptionLabel(), DropdownCreateRow() (+5 more)

### Community 46 - "usePendingFiles.tsx"
Cohesion: 0.38
Nodes (4): AnimatedZ(), MobileLogoButton(), LogoRow(), LogoRowProps

### Community 47 - "zpotify_service_artists.pb.ts"
Cohesion: 0.18
Nodes (13): CardRow(), CardRowProps, LikedSongsState, useLikedSongs, SongListPermissions, UserPermissions, ArtistSongsRow(), ArtistSongsRowProps (+5 more)

### Community 48 - "ChipsField.tsx"
Cohesion: 0.19
Nodes (8): MiniClockIcon(), MiniDiscIcon(), FieldLabelRow(), FieldLabelRowProps, formatTotalDuration(), PlaylistDetailsPanel(), PlaylistDetailsPanelProps, DisabledChipProps

### Community 49 - "MoreButton.tsx"
Cohesion: 0.23
Nodes (9): NotifyStreamEntityArrival, DeleteTorrentJobRequest, DeleteTorrentJobResponse, DiscardTorrentFileRequest, DiscardTorrentFileResponse, WatchTorrentJobsRequest, WatchTorrentJobsResponse, ITorrentService (+1 more)

### Community 50 - "HeaderSearchInput.tsx"
Cohesion: 0.18
Nodes (9): AddTrackContext, ResolvingTorrentStatus(), ResolvingTorrentStatusProps, renderScreen(), Selection, mockResponse, TorrentFilesScreen(), toasterCatch (+1 more)

### Community 51 - "InitPage.tsx"
Cohesion: 0.31
Nodes (6): EditableArtistPickerContext, FADE_TRANSITION, HEIGHT_TRANSITION, PlaylistOwnerLabel(), PlaylistOwnerLabelProps, ArtistOrOwnerRowProps

### Community 52 - "SidebarSegment.tsx"
Cohesion: 0.33
Nodes (8): BatchUploadState, MultitrackUploadModalProps, DroppedFolder, DroppedGroups, readAllDirectoryEntries(), readEntryFile(), resolveDroppedEntries(), resolveFolder()

### Community 53 - "PrivateLockWidget.tsx"
Cohesion: 0.25
Nodes (7): PrivateLockIcon(), PrivateLockIconProps, PrivatePlaylistIndicator(), PrivateLockWidget(), PrivateLockWidgetProps, usePrivateLockWidget(), UsePrivateLockWidgetParams

### Community 54 - "IPlaylistService"
Cohesion: 0.15
Nodes (14): TorrentJob, DownloadIcon(), TorrentFileProgressList(), getStatusDotColor(), TorrentJobRow(), TorrentJobRowProps, RecentTorrentsPanel(), RecentTorrentsPanelProps (+6 more)

### Community 55 - "useUISettings"
Cohesion: 0.18
Nodes (9): AudioSettings, useAudioSettings, TelegramAuth(), DownloadsPage(), catchServiceError(), internalErrors, useToaster(), QueueTrack (+1 more)

### Community 56 - "TrackList.tsx"
Cohesion: 0.09
Nodes (21): CreateArtist, CreateArtistRequest, CreateArtistResponse, GetArtistPage, GetArtistPageRequest, GetArtistPageResponse, LikeArtist, LikeArtistRequest (+13 more)

### Community 57 - "PlaylistScreenWidget.tsx"
Cohesion: 0.18
Nodes (12): FeedService, IFeedService, toFeedResult(), FeedArtistChip(), choosePlaylistComponent(), FeedDayGroup(), feedItemTransition, Props (+4 more)

### Community 58 - "PlaylistScreenWidget.tsx"
Cohesion: 0.12
Nodes (15): Absent, AddTorrentMagnet, BaseAddTorrentMagnetResponse, CancelTorrentJob, DeleteTorrentJob, DiscardTorrentFile, GetTorrentFile, GetTorrentJob (+7 more)

### Community 59 - "EditControls.tsx"
Cohesion: 0.21
Nodes (11): SongRow(), SongRowArtist, SongRowProps, MetaScreen(), MetaScreenProps, formatFileDuration(), formatDuration(), ResultRowSkeleton() (+3 more)

### Community 60 - "PanelHeader.tsx"
Cohesion: 0.16
Nodes (13): GripIcon(), EditTrackDialog(), SongEditDialogProps, ISongsService, SongsService, Chip(), ChipProps, MultiSelect() (+5 more)

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
Cohesion: 0.08
Nodes (19): CreatePlaylistIcon(), MusicFileIcon(), MusicFileIconProps, UploadArrowLargeIcon(), ChooseScreen(), CreatePlaylistCard(), CreatePlaylistCardProps, LibraryCard() (+11 more)

### Community 65 - "PlayerBarSegment.tsx"
Cohesion: 0.13
Nodes (13): VolumeControlProps, VolumeBarProps, VolumeDisplayProps, ShuffleTracksButton(), ShuffleTracksButtonProps, TrackProgressControls(), TrackProgressControlsProps, MusicPlayerProps (+5 more)

### Community 66 - "compilerOptions"
Cohesion: 0.20
Nodes (9): compilerOptions, allowSyntheticDefaultImports, composite, module, moduleResolution, outDir, skipLibCheck, strict (+1 more)

### Community 67 - "zpotify_common.pb.ts"
Cohesion: 0.15
Nodes (12): ConsentNotification, ConsentNotificationRequest, ConsentNotificationResponse, GetNotificationSummary, GetNotificationSummaryRequest, GetNotificationSummaryResponse, ListNotifications, ListNotificationsRequest (+4 more)

### Community 68 - "supportedAudio.ts"
Cohesion: 0.07
Nodes (22): DashedRingIcon(), DashedRingIconProps, DropZoneTargetIcon(), DropZoneTargetIconProps, DropZoneUploadIcon(), DropZoneUploadIconProps, PlayTriangleIcon(), SpinnerIcon() (+14 more)

### Community 69 - "ZpotifyUI Development Manifesto"
Cohesion: 0.33
Nodes (5): AI Assistant Guidelines, Development Principles, Styling, Tech Stack & Architecture, ZpotifyUI Development Manifesto

### Community 70 - "DropZoneIcon.tsx"
Cohesion: 0.20
Nodes (18): toFeedArtistItem(), toFeedDay(), toFeedSongItem(), WireArtistBase, WireFeedDay, WireSongBase, interleave(), toAlbumItem() (+10 more)

### Community 71 - "LibraryGridScreenSkeleton.tsx"
Cohesion: 0.12
Nodes (15): AddTrackDialogProps, BACK_STEPS, ModalStep, SCREENS, DOT_STEPS, PanelHeader(), PanelHeaderProps, STEP_TITLES (+7 more)

### Community 72 - "package.json"
Cohesion: 0.40
Nodes (4): name, private, type, version

### Community 73 - "zpotify_common.pb.ts"
Cohesion: 0.21
Nodes (5): AlbumTag, CreatePlaylistResponse, UpdatePlaylistResponse, GenreChipsRow(), GenreChipsRowProps

### Community 89 - "useArtistHeroSegment.ts"
Cohesion: 0.23
Nodes (11): Artist, webApiService, ActiveUpload, EagerFileUpload, useEagerFileUpload(), EditableArtistName(), EditableArtistNameProps, ArtistHeroSegment() (+3 more)

### Community 90 - "EditControls.tsx"
Cohesion: 0.17
Nodes (13): MainLayout(), SidebarToggleIcon(), SidebarToggleIconProps, MobileSearchButton(), SidebarToggleButton(), MobileNavSegment(), ArtistRow(), ArtistRowProps (+5 more)

### Community 91 - ".preload"
Cohesion: 0.21
Nodes (16): cacheTracks(), clearAudioCache(), getTrackUrl(), inFlightCacheRequests, listCachedUrls(), trackPathFromUrl(), uncacheAudio(), AudioCacheState (+8 more)

### Community 92 - "UploadCard.tsx"
Cohesion: 0.29
Nodes (6): HomeIcon(), NavSearchIcon(), UploadsIcon(), getNavIcon(), NavItem(), NavItemProps

### Community 93 - "SearchIcon.tsx"
Cohesion: 0.31
Nodes (5): UploadArrowSmallIcon(), UploadDoneIcon(), UploadErrorIcon(), UploadStatusChip(), UploadStatusChipProps

### Community 94 - "useLikedArtists.ts"
Cohesion: 0.18
Nodes (12): ArtistBase, PlusIcon(), PlusIconProps, LikedArtistsState, useLikedArtists, ArtistRowSkeleton(), Props, SidebarArtistsWidget() (+4 more)

### Community 95 - "DropZoneIcon.tsx"
Cohesion: 0.19
Nodes (8): ClockIcon(), ZButton(), ZButtonProps, Drag, MainContentProps, Props, TrackRowSkeleton(), InfiniteSongsListProps

### Community 96 - "zpotify_common.pb.ts"
Cohesion: 0.23
Nodes (8): AuthStatus, ArtistPage(), useArtistPage(), setOnSessionInvalidated(), setAuthMiddleware(), Errors, NotFoundScreen(), SkeletonLoadScreen()

### Community 97 - "FolderGroupHeader.tsx"
Cohesion: 0.27
Nodes (5): ChevronRightIcon(), FolderIcon(), FolderIconProps, FolderGroupHeader(), FolderGroupHeaderProps

### Community 98 - "GeneratedAvatar.tsx"
Cohesion: 0.19
Nodes (11): getLikedPlaylistCoverFallback(), LikedPlaylistCoverFallback, PlaylistListRefreshState, usePlaylistListRefresh, PlaylistRowSkeleton(), Props, PlaylistItem, SidebarPlaylistsWidget() (+3 more)

### Community 99 - "SearchHistoryDropdown.test.tsx"
Cohesion: 0.22
Nodes (6): SearchHistoryState, SearchHistoryEntry, entries, fetchSpy, navigateSpy, setQuerySpy

### Community 100 - "Input.tsx"
Cohesion: 0.20
Nodes (8): MultitrackSubmitParams, MultitrackSubmitState, ToCreateTrack, FeedRefreshState, useFeedRefresh, ChipEntry, FeedHomeSegment(), FeedHomeSegmentSkeleton()

### Community 101 - "DropdownCreateRow.tsx"
Cohesion: 0.23
Nodes (9): FileItem(), ParsedSongFilePath, parseSongFilePath(), canCleanTrackNumbers(), cleanTrackNumber(), formatBytes(), formatTotalSize(), isSingleFolderInput() (+1 more)

### Community 102 - "zpotify_common.pb.ts"
Cohesion: 0.25
Nodes (7): Absent, AlbumVersionMetadata, AlbumVersionMetadataVersionKind, BaseAlbumTag, OneOf, SongTag, SongTagKind

### Community 103 - "PendingFilesScreen.test.tsx"
Cohesion: 0.25
Nodes (4): handleToggleSelectFolderSpy, mockFiles, mockJobs, mockSelectedIds

### Community 104 - "useTorrentJobs.ts"
Cohesion: 0.19
Nodes (12): PendingFolderNode(), PendingFolderNodeProps, PendingFilesScreen(), listTorrentJobsMock, useTorrentJobs(), buildFolderTree(), collectFolderItems(), FolderNode (+4 more)

### Community 105 - "SongEditDialog.tsx"
Cohesion: 0.29
Nodes (6): ImportedFile, TorrentFileStatusRowProps, TorrentFileStatusList(), TorrentFileStatusListProps, mergeTorrentFiles(), TorrentFileRow

### Community 106 - "AlbumCard.tsx"
Cohesion: 0.26
Nodes (9): TorrentFileEntry, TorrentFileProgress, TorrentFileProgressRow(), TorrentFileProgressRowProps, TorrentFileProgressListProps, TorrentFileRow(), TorrentFileRowProps, TorrentFileStatusRow() (+1 more)

### Community 107 - "PlaylistScreenWidget.tsx"
Cohesion: 0.36
Nodes (5): computeTotalDuration(), mapPlaylistArtists(), PlaylistScreenWidget(), NotFoundPlaylistInfoSegment(), NotFoundPlaylistInfoSegmentProps

### Community 108 - "IconButton.tsx"
Cohesion: 0.25
Nodes (6): ShareIcon(), RandomArrows(), IconButton(), IconButtonProps, ShareButton(), ShuffleButton()

### Community 109 - "SidebarSegment.tsx"
Cohesion: 0.23
Nodes (5): AlbumCardSkeleton(), ArtistCardSkeleton(), PlaylistCardSkeleton(), Props, TrackRowSkeleton()

### Community 110 - "PlayerControls.tsx"
Cohesion: 0.29
Nodes (5): PlayPauseButton(), PlayPauseButtonProps, TrackRewindButton, PlayerControls(), PlayerProps

### Community 111 - "SearchService"
Cohesion: 0.20
Nodes (3): GetPlaylistResponse, ListPlaylistsResponse, IPlaylistService

### Community 112 - "main.tsx"
Cohesion: 0.29
Nodes (5): initServiceWorker(), Router(), queryClient, EarlyAccessPage(), ErrorPage()

### Community 113 - "GeneratedAvatar.tsx"
Cohesion: 0.31
Nodes (5): LoginViaPass(), InitPage(), ZLogoLanding(), AuthButton(), AuthButtonProps

### Community 114 - "useEagerFileUpload.ts"
Cohesion: 0.22
Nodes (7): closeDialogMock, deleteTorrentJobMock, getTorrentJobMock, openDialogMock, pauseTorrentJobMock, resumeTorrentJobMock, toasterCatchSpy

### Community 115 - "Input.tsx"
Cohesion: 0.29
Nodes (3): ResumeTorrentJobRequest, ResumeTorrentJobResponse, TorrentAPI

### Community 116 - "NotificationRow.tsx"
Cohesion: 0.32
Nodes (5): EditIcon(), EditIconProps, SaveIcon(), EditControls(), EditControlsProps

### Community 118 - "PlaylistHomeSegment.tsx"
Cohesion: 0.33
Nodes (5): ActionButtonProps, IconButton(), DisplayPlaylistSegmentProps, PlaylistHomeSegment(), LazyLoadSongsList()

### Community 120 - "cacheAudio"
Cohesion: 0.33
Nodes (3): cacheAudio(), cacheAudioUncoordinated(), getCachedAudio()

### Community 127 - "TrackRow.test.tsx"
Cohesion: 0.67
Nodes (3): baseProps(), makeSong(), navigateSpy

## Knowledge Gaps
- **483 isolated node(s):** `localPlugin`, `name`, `private`, `version`, `type` (+478 more)
  These have ≤1 connection - possible missing edges or undocumented components.
- **20 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `useToaster()` connect `useUISettings` to `Dropdown.tsx`, `HomePage.ts`, `MainLayout.tsx`, `usePlayer.ts`, `useToaster`, `DropZoneScreen.tsx`, `usePlaylistInfoSegment.ts`, `useDialog`, `useTrackDrafts.ts`, `zpotify_service_feature_flags.pb.ts`, `AlbumTag`, `zpotify_service_artists.pb.ts`, `HeaderSearchInput.tsx`, `PrivateLockWidget.tsx`, `PanelHeader.tsx`, `supportedAudio.ts`, `LibraryGridScreenSkeleton.tsx`, `useArtistHeroSegment.ts`, `.preload`, `DropZoneIcon.tsx`, `GeneratedAvatar.tsx`, `Input.tsx`, `GeneratedAvatar.tsx`?**
  _High betweenness centrality (0.047) - this node is a cross-community bridge._
- **Why does `AudioPlayerImpl` connect `AudioPlayerImpl` to `cacheAudio`, `PlayerBarSegment.tsx`?**
  _High betweenness centrality (0.035) - this node is a cross-community bridge._
- **Why does `BaseService` connect `WebApi.ts` to `zpotify_service_files.pb.ts`, `DropZoneIcon.tsx`, `PlaylistAPI`, `Auth.ts`, `BaseService.ts`, `useSearchPage.ts`, `MoreButton.tsx`, `ArtistsService.ts`, `zpotify_service_playlist.pb.ts`, `PlaylistService.ts`, `TrackList.tsx`, `PlaylistScreenWidget.tsx`, `PanelHeader.tsx`, `useUser.ts`, `CommentsSection.tsx`?**
  _High betweenness centrality (0.033) - this node is a cross-community bridge._
- **What connects `localPlugin`, `name`, `private` to the rest of the system?**
  _489 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `zpotify_service_files.pb.ts` be split into smaller, more focused modules?**
  _Cohesion score 0.07822410147991543 - nodes in this community are weakly interconnected._
- **Should `Dropdown.tsx` be split into smaller, more focused modules?**
  _Cohesion score 0.06312292358803986 - nodes in this community are weakly interconnected._
- **Should `HomePage.ts` be split into smaller, more focused modules?**
  _Cohesion score 0.10256410256410256 - nodes in this community are weakly interconnected._