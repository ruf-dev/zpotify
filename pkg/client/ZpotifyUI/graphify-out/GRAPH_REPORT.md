# Graph Report - ZpotifyUI  (2026-08-15)

## Corpus Check
- 335 files · ~61,174 words
- Verdict: corpus is large enough that graph structure adds value.

## Summary
- 1526 nodes · 3381 edges · 83 communities (75 shown, 8 thin omitted)
- Extraction: 99% EXTRACTED · 1% INFERRED · 0% AMBIGUOUS · INFERRED: 18 edges (avg confidence: 0.55)
- Token cost: 0 input · 0 output

## Graph Freshness
- Built from commit: `79102bb9`
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
- MoreButton.tsx
- InitPage.tsx
- PrivateLockWidget.tsx
- IPlaylistService
- TrackList.tsx
- PlaylistScreenWidget.tsx
- scripts
- PlayButton.tsx
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
- zpotify_service_feature_flags.pb.ts
- UploadCard.tsx
- zpotify_service_search.pb.ts

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
- `FileItemProps` --references--> `SongFile`  [EXTRACTED]
  src/dialogs/AddTrack/screens/components/FileItem/FileItem.tsx → src/app/api/zpotify/zpotify_common.pb.ts
- `NotificationRowProps` --references--> `Notification`  [EXTRACTED]
  src/widgets/NotificationBell/components/NotificationRow/NotificationRow.tsx → src/app/api/zpotify/zpotify_service_notification.pb.ts

## Import Cycles
- 3-file cycle: `src/entities/artist/useLikedArtists.ts -> src/shared/api/ArtistsService.ts -> src/widgets/ArtistField/ArtistChipsField.tsx -> src/entities/artist/useLikedArtists.ts`

## Communities (83 total, 8 thin omitted)

### Community 0 - "zpotify_service_files.pb.ts"
Cohesion: 0.06
Nodes (32): BatchDeleteFiles, BatchDeleteFilesRequest, BatchDeleteFilesResponse, CheckFilesByHashes, CheckFilesByHashesFoundFileByHash, CheckFilesByHashesRequest, CheckFilesByHashesResponse, DeleteFile (+24 more)

### Community 1 - "Dropdown.tsx"
Cohesion: 0.16
Nodes (15): PlusIcon(), PlusIconProps, Dropdown(), DropdownProps, useDropdownClose(), useSearchResults(), DropdownOption, getOptionId() (+7 more)

### Community 2 - "HomePage.ts"
Cohesion: 0.12
Nodes (12): SegmentTabBarProps, Tab, ISettingsService, parseHomePageSegment(), SettingsService, toHomeSegments(), FeedSegmentInfo, HomeSegment (+4 more)

### Community 3 - "MainLayout.tsx"
Cohesion: 0.05
Nodes (51): MainLayout(), initServiceWorker(), albumPath(), Path, playlistPath(), Router(), SidebarToggleIcon(), SegmentCarousel() (+43 more)

### Community 4 - "fetch.pb.ts"
Cohesion: 0.13
Nodes (16): b64, b64Encode(), fetchStreamingRequest(), FlattenedRequestPayload, flattenRequestPayload(), getNewLineDelimitedJSONDecodingStream(), getNotifyEntityArrivalSink(), isPlainObject() (+8 more)

### Community 5 - "usePlayer.ts"
Cohesion: 0.12
Nodes (18): GripIcon(), PlayTriangleIcon(), SpinnerIcon(), UploadingSpinner(), cacheAudio(), cacheAudioUncoordinated(), clearAudioCache(), getTrackUrl() (+10 more)

### Community 7 - "useToaster"
Cohesion: 0.15
Nodes (12): ConsentNotification, ConsentNotificationRequest, ConsentNotificationResponse, GetNotificationSummary, GetNotificationSummaryRequest, GetNotificationSummaryResponse, ListNotifications, ListNotificationsRequest (+4 more)

### Community 8 - "Auth.ts"
Cohesion: 0.09
Nodes (22): AuthAPI, AuthData, AuthRequest, GetAuthMethodsRequest, RefreshRequest, TelegramAuth(), apiPrefix(), InitReq (+14 more)

### Community 9 - "DropZoneScreen.tsx"
Cohesion: 0.50
Nodes (3): DashedRingIcon(), DashedRingIconProps, IdleDecoration()

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
Nodes (17): CoverWithFallback(), CoverWithFallbackProps, GenerativeCover(), GenerativeCoverProps, PALETTES, ShapeFn, SHAPES, cacheCover() (+9 more)

### Community 15 - "useSearchPage.ts"
Cohesion: 0.17
Nodes (17): FILTER_LABELS, FilterChipsProps, FilterKey, EMPTY_RESPONSE, UseSearchPageResult, ISearchService, SearchAlbumResult, SearchArtistResult (+9 more)

### Community 16 - "SongEditDialog.tsx"
Cohesion: 0.31
Nodes (6): EditableArtistPickerContext, FADE_TRANSITION, HEIGHT_TRANSITION, PlaylistOwnerLabel(), PlaylistOwnerLabelProps, ArtistOrOwnerRowProps

### Community 17 - "usePlaylistInfoSegment.ts"
Cohesion: 0.20
Nodes (11): EditableAlbumName(), EditableAlbumNameProps, EditableYearProps, TrackCountLabel(), TrackCountLabelProps, GenreChipsRow(), PlaylistInfoSegment(), usePlaylistInfoSegment() (+3 more)

### Community 18 - "ArtistsService.ts"
Cohesion: 0.05
Nodes (31): ArtistBase, ArtistsAPI, CreateArtist, CreateArtistRequest, CreateArtistResponse, GetArtistPage, GetArtistPageRequest, GetArtistPageResponse (+23 more)

### Community 19 - "FilesList.tsx"
Cohesion: 0.22
Nodes (4): ListSongsResponse, mapToTrackPreviews(), LibraryItem, Props

### Community 20 - "MultitrackUploadModal.tsx"
Cohesion: 0.10
Nodes (23): CheckIcon(), RetryAllIcon(), AddTrackDialog, MultitrackUploadModal(), TargetPlaylist, PlaylistToggleRow(), PlaylistToggleRowProps, ArtistLookup (+15 more)

### Community 21 - "ArtistItem"
Cohesion: 0.32
Nodes (5): ChevronRightIcon(), FolderIcon(), FolderIconProps, FolderGroupHeader(), FolderGroupHeaderProps

### Community 22 - "zpotify_service_playlist.pb.ts"
Cohesion: 0.08
Nodes (30): AddSongsToPlaylist, AddSongsToPlaylistRequest, AddSongsToPlaylistResponse, AddSongToPlaylist, AddSongToPlaylistRequest, AddSongToPlaylistResponse, ChangeSongsOrder, ChangeSongsOrderRequest (+22 more)

### Community 23 - "PlaylistService.ts"
Cohesion: 0.21
Nodes (17): toFeedArtistItem(), toFeedDay(), toFeedResult(), toFeedSongItem(), WireArtistBase, WireFeedDay, WireSongBase, interleave() (+9 more)

### Community 24 - "useDialog"
Cohesion: 0.43
Nodes (5): AudioSettings, useAudioSettings, useAudioCacheStore, useCachedCount(), AudioScreen()

### Community 25 - "CachedSongsAccordion.tsx"
Cohesion: 0.20
Nodes (12): RemoveTrackIcon(), CachedSongEntry, useCachedSongs(), AlbumGroup, CachedSongsAccordion(), groupSongsByAlbum(), matchesQuery(), AccordionHeader() (+4 more)

### Community 26 - "useTrackDrafts.ts"
Cohesion: 0.15
Nodes (23): AddTrackDialog(), BatchUploadState, useBatchUpload(), MultitrackUploadModalProps, buildNewTracksFromFresh(), ClassifiedFile, classifyIncomingFiles(), createInitialTracks() (+15 more)

### Community 27 - "PlaylistsLibrarySegment.tsx"
Cohesion: 0.18
Nodes (14): ArtistScreenWidget(), toAlbumCardProps(), choosePlaylistComponent(), FeedDayGroup(), feedItemTransition, AlbumCard(), TrackRow(), TrackRowProps (+6 more)

### Community 28 - "dependencies"
Cohesion: 0.11
Nodes (19): dependencies, classnames, framer-motion, grpc-web, @hookstate/core, music-metadata-browser, react, react-dom (+11 more)

### Community 29 - "index.ts"
Cohesion: 0.21
Nodes (15): Playlist, SongBase, DownloadIcon(), cacheTracks(), useDownloadProgress(), TrackRowProps, Props, PlaylistInfoSegmentProps (+7 more)

### Community 30 - "useUser.ts"
Cohesion: 0.21
Nodes (13): InitReq, AuthStatus, User, BaseService, getAuth(), setAuthMiddleware(), WebApiParams, withRetries() (+5 more)

### Community 31 - "CommentsSection.tsx"
Cohesion: 0.13
Nodes (13): GetUserSettings, GetUserSettingsRequest, GetUserSettingsResponse, Me, MeRequest, MeResponse, UserAPI, UserData (+5 more)

### Community 32 - "audioCacheStore.ts"
Cohesion: 0.36
Nodes (7): computeCoverColor(), COVER_COLORS, formatTime(), PlayerBarSegment(), trackInfoKey(), CachedIndicator(), useAudioPlayer()

### Community 33 - "zpotify_service_feature_flags.pb.ts"
Cohesion: 0.07
Nodes (33): FeatureFlag, FeatureFlagId, FeatureFlagsAPI, GetFeatureFlags, GetFeatureFlagsRequest, GetFeatureFlagsResponse, ClockIcon(), CardRow() (+25 more)

### Community 34 - "ChooseScreen.tsx"
Cohesion: 0.23
Nodes (10): PlaylistListRefreshState, usePlaylistListRefresh, PlaylistRow(), PlaylistRowData, PlaylistRowProps, PlaylistItem, SidebarPlaylistsWidget(), SidebarPlaylistsWidgetProps (+2 more)

### Community 35 - "TrackRow.tsx"
Cohesion: 0.13
Nodes (12): DragHandleIcon(), UploadArrowSmallIcon(), UploadDoneIcon(), UploadErrorIcon(), EditableTitleProps, TODO: switch to chures Input once it supports ref/onKeyDown, UploadStatusChip(), UploadStatusChipProps (+4 more)

### Community 36 - "WebApi.ts"
Cohesion: 0.24
Nodes (11): GrpcErrorDetails, isHttpCodeRetryable(), WithDescription(), WithHttpStatus(), WithIsNonRetryable(), WithStatusCode(), WithTitle(), ServiceErrorFromHttp() (+3 more)

### Community 37 - "ArtistChipsField.tsx"
Cohesion: 0.11
Nodes (18): BatchCreateSong, BatchCreateSongRequest, BatchCreateSongResponse, CreateSong, CreateSongRequest, CreateSongResponse, GetSong, GetSongRequest (+10 more)

### Community 39 - "SongsService"
Cohesion: 0.06
Nodes (36): SongAPI, SongRow(), SongRowArtist, SongRowProps, EditTrackDialog(), EditTrackDialogProps, MetaDialog(), MetaDialogProps (+28 more)

### Community 40 - "LazyLoadSongsList.tsx"
Cohesion: 0.33
Nodes (4): Version, VersionRequest, VersionResponse, ZpotifyAPI

### Community 41 - "MainContent.tsx"
Cohesion: 0.40
Nodes (4): FeedDay, GetFeed, GetFeedRequest, GetFeedResponse

### Community 42 - "InfoControls.tsx"
Cohesion: 0.22
Nodes (7): ShareIcon(), RandomArrows(), IconButton(), IconButtonProps, ShuffleTracksButtonProps, ShareButton(), ShuffleButton()

### Community 43 - "UserWidget.tsx"
Cohesion: 0.17
Nodes (10): MiniClockIcon(), MiniDiscIcon(), FieldLabelRow(), FieldLabelRowProps, formatTotalDuration(), PlaylistDetailsPanel(), PlaylistDetailsPanelProps, MultitrackSubmitParams (+2 more)

### Community 44 - "BaseService.ts"
Cohesion: 0.06
Nodes (32): Artist, EditIcon(), EditIconProps, SaveIcon(), UploadArrowIcon(), ZLogoIcon(), CoverFieldProps, CoverUploadProgress() (+24 more)

### Community 45 - "AlbumTag"
Cohesion: 0.24
Nodes (4): AlbumTag, CreatePlaylistResponse, UpdatePlaylistResponse, GenreChipsRowProps

### Community 47 - "zpotify_service_artists.pb.ts"
Cohesion: 0.05
Nodes (40): DialogManager, useDialog, BellIcon(), BellIconProps, PendingFilesScreen(), usePendingFiles(), FilesList(), FilesListProps (+32 more)

### Community 49 - "MoreButton.tsx"
Cohesion: 0.30
Nodes (8): MoreDots(), MenuOption(), MenuOptionProps, Menu(), MenuOption, MenuProps, MoreButton(), MoreButtonProps

### Community 51 - "InitPage.tsx"
Cohesion: 0.15
Nodes (13): artistPath(), SearchIcon(), SearchQueryState, useSearchQuery, ArtistCard(), ArtistCardProps, EmptyState(), EmptyStateProps (+5 more)

### Community 53 - "PrivateLockWidget.tsx"
Cohesion: 0.25
Nodes (7): PrivateLockIcon(), PrivateLockIconProps, PrivatePlaylistIndicator(), PrivateLockWidget(), PrivateLockWidgetProps, usePrivateLockWidget(), UsePrivateLockWidgetParams

### Community 54 - "IPlaylistService"
Cohesion: 0.20
Nodes (3): GetPlaylistResponse, ListPlaylistsResponse, IPlaylistService

### Community 56 - "TrackList.tsx"
Cohesion: 0.15
Nodes (19): SongFile, BatchUploadSection(), BatchUploadSectionProps, isFolderSettled(), UploadingFileRowProps, FetchServerFilesButtonProps, folderProgress(), groupTracksByFolder() (+11 more)

### Community 57 - "PlaylistScreenWidget.tsx"
Cohesion: 0.09
Nodes (19): AlbumTagKind, HeartIcon(), HeartIconProps, LockIcon(), RemoveIcon(), Chip(), ChipProps, CHIP_KIND_LABELS (+11 more)

### Community 61 - "scripts"
Cohesion: 0.22
Nodes (9): scripts, build, dev, gen, lint, lint:css, lint:fix, lint:js (+1 more)

### Community 62 - "PlayButton.tsx"
Cohesion: 0.21
Nodes (7): PauseIcon(), PauseIconProps, PlayIcon(), PlayIconProps, InfoControls(), PlayButton(), PlayButtonProps

### Community 64 - "AddTrackDialog.tsx"
Cohesion: 0.17
Nodes (10): HomeAPI, FeedService, IFeedService, FeedArtistChip(), Props, FeedHomeSegmentSkeleton(), FeedArtistItem, FeedDay (+2 more)

### Community 65 - "PlayerBarSegment.tsx"
Cohesion: 0.09
Nodes (20): AnimatedZ(), VolumeControlProps, LogoRow(), LogoRowProps, VolumeBarProps, VolumeDisplayProps, PlayPauseButton(), PlayPauseButtonProps (+12 more)

### Community 66 - "compilerOptions"
Cohesion: 0.20
Nodes (9): compilerOptions, allowSyntheticDefaultImports, composite, module, moduleResolution, outDir, skipLibCheck, strict (+1 more)

### Community 67 - "zpotify_common.pb.ts"
Cohesion: 0.15
Nodes (11): Paging, Notification, NotificationAPI, NotificationDialogProps, NotificationsState, ErrorReason, ServiceError, INotificationsService (+3 more)

### Community 68 - "supportedAudio.ts"
Cohesion: 0.17
Nodes (17): AddTrackContext, BACK_STEPS, SCREENS, DragOverDecoration(), DropZoneText(), DropZoneTextProps, DropZoneScreen(), DropZone() (+9 more)

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
Cohesion: 0.25
Nodes (7): Absent, AlbumVersionMetadata, AlbumVersionMetadataVersionKind, BaseAlbumTag, OneOf, SongTag, SongTagKind

### Community 90 - "zpotify_service_feature_flags.pb.ts"
Cohesion: 0.18
Nodes (10): Absent, BaseHomePageSegment, HomePageSegment, HomePageSegmentFeedSegment, HomePageSegmentLibrarySegment, HomePageSegmentManagement, HomePageSegmentPlaylistSegment, OneOf (+2 more)

### Community 92 - "UploadCard.tsx"
Cohesion: 0.29
Nodes (6): HomeIcon(), NavSearchIcon(), UploadsIcon(), getNavIcon(), NavItem(), NavItemProps

### Community 96 - "zpotify_service_search.pb.ts"
Cohesion: 0.17
Nodes (9): Search, SearchAlbumResult, SearchAPI, SearchArtistResult, SearchFilters, SearchPlaylistResult, SearchRequest, SearchResponse (+1 more)

## Knowledge Gaps
- **396 isolated node(s):** `localPlugin`, `name`, `private`, `version`, `type` (+391 more)
  These have ≤1 connection - possible missing edges or undocumented components.
- **8 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `useToaster()` connect `SongsService` to `Dropdown.tsx`, `HomePage.ts`, `MainLayout.tsx`, `usePlayer.ts`, `Auth.ts`, `usePlaylistInfoSegment.ts`, `useDialog`, `CachedSongsAccordion.tsx`, `useTrackDrafts.ts`, `index.ts`, `CommentsSection.tsx`, `zpotify_service_feature_flags.pb.ts`, `ChooseScreen.tsx`, `BaseService.ts`, `zpotify_service_artists.pb.ts`, `PrivateLockWidget.tsx`, `PlaylistScreenWidget.tsx`, `AddTrackDialog.tsx`, `zpotify_common.pb.ts`, `supportedAudio.ts`?**
  _High betweenness centrality (0.057) - this node is a cross-community bridge._
- **Why does `AudioPlayerImpl` connect `AudioPlayerImpl` to `PlayerBarSegment.tsx`, `usePlayer.ts`?**
  _High betweenness centrality (0.037) - this node is a cross-community bridge._
- **Why does `useDialog` connect `zpotify_service_artists.pb.ts` to `MainLayout.tsx`, `supportedAudio.ts`, `zpotify_common.pb.ts`, `usePlayer.ts`, `SongsService`, `MultitrackUploadModal.tsx`, `useDialog`, `CachedSongsAccordion.tsx`, `useTrackDrafts.ts`, `index.ts`?**
  _High betweenness centrality (0.029) - this node is a cross-community bridge._
- **What connects `localPlugin`, `name`, `private` to the rest of the system?**
  _401 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `zpotify_service_files.pb.ts` be split into smaller, more focused modules?**
  _Cohesion score 0.056866303690260134 - nodes in this community are weakly interconnected._
- **Should `HomePage.ts` be split into smaller, more focused modules?**
  _Cohesion score 0.12169312169312169 - nodes in this community are weakly interconnected._
- **Should `MainLayout.tsx` be split into smaller, more focused modules?**
  _Cohesion score 0.05132317562149158 - nodes in this community are weakly interconnected._