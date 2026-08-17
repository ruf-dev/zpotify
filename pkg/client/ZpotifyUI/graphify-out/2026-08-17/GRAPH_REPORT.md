# Graph Report - ZpotifyUI  (2026-08-16)

## Corpus Check
- 347 files · ~64,885 words
- Verdict: corpus is large enough that graph structure adds value.

## Summary
- 1600 nodes · 3554 edges · 104 communities (93 shown, 11 thin omitted)
- Extraction: 99% EXTRACTED · 1% INFERRED · 0% AMBIGUOUS · INFERRED: 22 edges (avg confidence: 0.54)
- Token cost: 0 input · 0 output

## Graph Freshness
- Built from commit: `42a7f960`
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
- EditableText.tsx
- DescriptionSection.tsx

## God Nodes (most connected - your core abstractions)
1. `useToaster()` - 64 edges
2. `useDialog` - 49 edges
3. `SongBase` - 40 edges
4. `useUser` - 39 edges
5. `AudioPlayerImpl` - 39 edges
6. `ArtistItem` - 31 edges
7. `PlaylistService` - 29 edges
8. `BaseService` - 26 edges
9. `TrackDraft` - 24 edges
10. `buildCoverUrl()` - 21 edges

## Surprising Connections (you probably didn't know these)
- `ArtistSongsRowProps` --references--> `SongBase`  [EXTRACTED]
  src/widgets/ArtistScreen/widgets/ArtistSongsRow/ArtistSongsRow.tsx → src/app/api/zpotify/zpotify_common.pb.ts
- `SongSearchBoxProps` --references--> `SongBase`  [EXTRACTED]
  src/widgets/SongSearchBox/SongSearchBox.tsx → src/app/api/zpotify/zpotify_common.pb.ts
- `NotificationDialogProps` --references--> `Notification`  [EXTRACTED]
  src/dialogs/Notification/NotificationDialog.tsx → src/app/api/zpotify/zpotify_service_notification.pb.ts
- `NotificationRowProps` --references--> `Notification`  [EXTRACTED]
  src/widgets/NotificationBell/components/NotificationRow/NotificationRow.tsx → src/app/api/zpotify/zpotify_service_notification.pb.ts
- `HeaderPart()` --calls--> `useDialog`  [EXTRACTED]
  src/widgets/Header/HeaderPart.tsx → src/app/hooks/Dialog.tsx

## Import Cycles
- 3-file cycle: `src/entities/artist/useLikedArtists.ts -> src/shared/api/ArtistsService.ts -> src/widgets/ArtistField/ArtistChipsField.tsx -> src/entities/artist/useLikedArtists.ts`

## Communities (104 total, 11 thin omitted)

### Community 0 - "zpotify_service_files.pb.ts"
Cohesion: 0.06
Nodes (28): BatchDeleteFiles, BatchDeleteFilesRequest, BatchDeleteFilesResponse, CheckFilesByHashes, CheckFilesByHashesFoundFileByHash, CheckFilesByHashesRequest, CheckFilesByHashesResponse, DeleteFile (+20 more)

### Community 1 - "Dropdown.tsx"
Cohesion: 0.11
Nodes (14): AlbumTagKind, HeartIcon(), HeartIconProps, LockIcon(), Chip(), ChipProps, CHIP_KIND_LABELS, CHIP_KINDS (+6 more)

### Community 2 - "HomePage.ts"
Cohesion: 0.05
Nodes (34): GetUserSettings, GetUserSettingsRequest, GetUserSettingsResponse, Me, MeRequest, MeResponse, UserAPI, UserData (+26 more)

### Community 3 - "MainLayout.tsx"
Cohesion: 0.07
Nodes (41): initServiceWorker(), albumPath(), artistPath(), Path, playlistPath(), Router(), LoginViaPass(), usePlaylistSongs() (+33 more)

### Community 4 - "fetch.pb.ts"
Cohesion: 0.13
Nodes (16): b64, b64Encode(), fetchStreamingRequest(), FlattenedRequestPayload, flattenRequestPayload(), getNewLineDelimitedJSONDecodingStream(), getNotifyEntityArrivalSink(), isPlainObject() (+8 more)

### Community 5 - "usePlayer.ts"
Cohesion: 0.19
Nodes (13): RemoveTrackIcon(), CachedSongEntry, useAudioCacheStore, useCachedSongs(), AlbumGroup, CachedSongsAccordion(), groupSongsByAlbum(), matchesQuery() (+5 more)

### Community 7 - "useToaster"
Cohesion: 0.17
Nodes (15): EditTrackDialog(), SongEditDialogProps, useListSongs(), UseListSongsOptions, SongListRefreshState, useSongListRefresh, catchServiceError(), internalErrors (+7 more)

### Community 8 - "Auth.ts"
Cohesion: 0.23
Nodes (7): AuthData, User, AuthMiddleware, clearLocalStorage(), fromLocalStorage(), getLocalStorageAuthInfoKey(), saveToLocalStorage()

### Community 9 - "DropZoneScreen.tsx"
Cohesion: 0.12
Nodes (21): DialogManager, useDialog, AddTrackDialog(), FilesList(), FilesListProps, SongEditDialog(), GhostSong(), LogPassAuth() (+13 more)

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
Cohesion: 0.11
Nodes (18): Absent, Auth, AuthLogPass, AuthResponse, AuthTelegramOAuth, AuthViaAsync, AuthViaAsyncRequest, AuthViaAsyncResponse (+10 more)

### Community 14 - "useUser"
Cohesion: 0.06
Nodes (37): MiniClockIcon(), MiniDiscIcon(), CoverWithFallback(), CoverWithFallbackProps, GenerativeCover(), GenerativeCoverProps, PALETTES, ShapeFn (+29 more)

### Community 15 - "useSearchPage.ts"
Cohesion: 0.17
Nodes (17): FILTER_LABELS, FilterChipsProps, FilterKey, EMPTY_RESPONSE, UseSearchPageResult, ISearchService, SearchAlbumResult, SearchArtistResult (+9 more)

### Community 16 - "SongEditDialog.tsx"
Cohesion: 0.19
Nodes (9): DragHandleIcon(), EditableTitleProps, TODO: switch to chures Input once it supports ref/onKeyDown, TODO: Make editable here and send update name for such files if changed, TrackRow(), cleanTrackNumber(), formatBytes(), formatTotalSize() (+1 more)

### Community 17 - "usePlaylistInfoSegment.ts"
Cohesion: 0.18
Nodes (13): webApiService, ActiveUpload, EagerFileUpload, useEagerFileUpload(), EditableAlbumName(), EditableAlbumNameProps, EditableYearProps, TrackCountLabel() (+5 more)

### Community 18 - "ArtistsService.ts"
Cohesion: 0.09
Nodes (21): CreateArtist, CreateArtistRequest, CreateArtistResponse, GetArtistPage, GetArtistPageRequest, GetArtistPageResponse, LikeArtist, LikeArtistRequest (+13 more)

### Community 20 - "MultitrackUploadModal.tsx"
Cohesion: 0.16
Nodes (10): CheckIcon(), RetryAllIcon(), AddTrackDialog, MultitrackUploadModal(), PlaylistToggleRow(), PlaylistToggleRowProps, useArtistLookup(), MultitrackSubmitState (+2 more)

### Community 21 - "ArtistItem"
Cohesion: 0.17
Nodes (13): ZButton(), ZButtonProps, FeedArtistChip(), choosePlaylistComponent(), FeedDayGroup(), feedItemTransition, Props, FeedHomeSegmentSkeleton() (+5 more)

### Community 22 - "zpotify_service_playlist.pb.ts"
Cohesion: 0.08
Nodes (30): AddSongsToPlaylist, AddSongsToPlaylistRequest, AddSongsToPlaylistResponse, AddSongToPlaylist, AddSongToPlaylistRequest, AddSongToPlaylistResponse, ChangeSongsOrder, ChangeSongsOrderRequest (+22 more)

### Community 23 - "PlaylistService.ts"
Cohesion: 0.12
Nodes (15): ListSearchHistory, ListSearchHistoryRequest, RecordSearchFinding, RecordSearchFindingResponse, RecordSearchQuery, RecordSearchQueryResponse, Search, SearchAlbumResult (+7 more)

### Community 24 - "useDialog"
Cohesion: 0.21
Nodes (9): SongFile, MusicFileIcon(), MusicFileIconProps, FileItem(), FileItemProps, FetchServerFilesButton(), FetchServerFilesButtonProps, TrackListProps (+1 more)

### Community 25 - "CachedSongsAccordion.tsx"
Cohesion: 0.23
Nodes (7): UploadArrowIcon(), ZLogoIcon(), CoverFieldProps, CoverUploadProgress(), CoverUploadProgressProps, EditableCoverWithFallback(), EditableCoverWithFallbackProps

### Community 26 - "useTrackDrafts.ts"
Cohesion: 0.16
Nodes (22): BatchUploadState, useBatchUpload(), MultitrackUploadModalProps, buildNewTracksFromFresh(), ClassifiedFile, classifyIncomingFiles(), createInitialTracks(), flattenDroppedInput() (+14 more)

### Community 27 - "PlaylistsLibrarySegment.tsx"
Cohesion: 0.20
Nodes (10): TrackRow(), TrackRowProps, PlaylistCardWide(), AlbumCardProps, LibraryItem, PlaylistCardWideProps, TrackPreview, chooseComponent() (+2 more)

### Community 28 - "dependencies"
Cohesion: 0.11
Nodes (19): dependencies, classnames, framer-motion, grpc-web, @hookstate/core, music-metadata-browser, react, react-dom (+11 more)

### Community 29 - "index.ts"
Cohesion: 0.33
Nodes (10): Playlist, SongBase, EditTrackDialogProps, Props, PlaylistInfoSegmentProps, UsePlaylistInfoSegmentParams, InfoControlsProps, PlaylistControlsProps (+2 more)

### Community 30 - "useUser.ts"
Cohesion: 0.24
Nodes (6): Paging, Notification, NotificationAPI, NotificationsState, INotificationsService, NotificationsService

### Community 31 - "CommentsSection.tsx"
Cohesion: 0.14
Nodes (9): ListSearchHistoryResponse, RecordSearchFindingRequest, RecordSearchQueryRequest, SearchAPI, SearchHistoryEntry, ISearchHistoryService, SearchHistoryService, toEntries() (+1 more)

### Community 32 - "audioCacheStore.ts"
Cohesion: 0.18
Nodes (8): GripIcon(), PlayTriangleIcon(), SpinnerIcon(), UploadingSpinner(), ArtistNamePart, formatDuration(), TrackRow(), TrackRowProps

### Community 33 - "zpotify_service_feature_flags.pb.ts"
Cohesion: 0.13
Nodes (15): FeatureFlag, FeatureFlagId, FeatureFlagsAPI, GetFeatureFlags, GetFeatureFlagsRequest, GetFeatureFlagsResponse, ClockIcon(), FeatureFlagsStore (+7 more)

### Community 34 - "ChooseScreen.tsx"
Cohesion: 0.08
Nodes (25): MainLayout(), SidebarToggleIcon(), SegmentCarousel(), SegmentCarouselProps, StubRect, SettingsDialog(), UISettings, useUISettings (+17 more)

### Community 35 - "TrackRow.tsx"
Cohesion: 0.20
Nodes (11): TargetPlaylist, TrackRowProps, ArtistLookup, MultitrackSubmitParams, buildValidationHint(), MultitrackSummary, MultitrackSummaryParams, useMultitrackSummary() (+3 more)

### Community 36 - "WebApi.ts"
Cohesion: 0.24
Nodes (11): GrpcErrorDetails, isHttpCodeRetryable(), WithDescription(), WithHttpStatus(), WithIsNonRetryable(), WithStatusCode(), WithTitle(), ServiceErrorFromHttp() (+3 more)

### Community 37 - "ArtistChipsField.tsx"
Cohesion: 0.11
Nodes (18): BatchCreateSong, BatchCreateSongRequest, BatchCreateSongResponse, CreateSong, CreateSongRequest, CreateSongResponse, GetSong, GetSongRequest (+10 more)

### Community 38 - "PlaylistAPI"
Cohesion: 0.12
Nodes (4): ListSongsResponse, PlaylistAPI, mapToTrackPreviews(), PlaylistService

### Community 39 - "SongsService"
Cohesion: 0.18
Nodes (4): SongAPI, BaseService, ISongsService, SongsService

### Community 40 - "LazyLoadSongsList.tsx"
Cohesion: 0.19
Nodes (10): PlaylistListRefreshState, usePlaylistListRefresh, PlaylistItem, SidebarPlaylistsWidget(), SidebarPlaylistsWidgetProps, uuidToHslColor(), AlbumCardSkeleton(), PlaylistCardWideSkeleton() (+2 more)

### Community 41 - "MainContent.tsx"
Cohesion: 0.15
Nodes (18): FeedDay, GetFeed, GetFeedRequest, GetFeedResponse, HomeAPI, FeedService, IFeedService, toFeedArtistItem() (+10 more)

### Community 42 - "InfoControls.tsx"
Cohesion: 0.20
Nodes (10): ShareIcon(), IconButton(), IconButtonProps, InfoControls(), ShareButton(), ShuffleButton(), SaveButtonWidget(), SaveButtonWidgetProps (+2 more)

### Community 43 - "UserWidget.tsx"
Cohesion: 0.33
Nodes (8): BatchUploadSection(), BatchUploadSectionProps, isFolderSettled(), UploadingFileRowProps, folderProgress(), groupTracksByFolder(), TrackGroupSegment, TrackDraft

### Community 44 - "BaseService.ts"
Cohesion: 0.12
Nodes (15): AuthAPI, AuthRequest, GetAuthMethodsRequest, RefreshRequest, apiPrefix(), InitReq, options, AuthService (+7 more)

### Community 45 - "AlbumTag"
Cohesion: 0.30
Nodes (9): Dropdown(), DropdownProps, useDropdownClose(), useSearchResults(), DropdownOption, getOptionId(), getOptionLabel(), DropdownOptionRow() (+1 more)

### Community 46 - "usePendingFiles.tsx"
Cohesion: 0.31
Nodes (5): UploadArrowSmallIcon(), UploadDoneIcon(), UploadErrorIcon(), UploadStatusChip(), UploadStatusChipProps

### Community 47 - "zpotify_service_artists.pb.ts"
Cohesion: 0.21
Nodes (11): BellIcon(), BellIconProps, NotificationDialog(), NotificationDialogProps, useNotifications, formatNotificationDate(), NotificationRow(), NotificationRowProps (+3 more)

### Community 49 - "MoreButton.tsx"
Cohesion: 0.30
Nodes (8): MoreDots(), MenuOption(), MenuOptionProps, Menu(), MenuOption, MenuProps, MoreButton(), MoreButtonProps

### Community 50 - "HeaderSearchInput.tsx"
Cohesion: 0.21
Nodes (9): SearchQueryState, useSearchQuery, AddTrackButton(), AddTrackButtonProps, MobileSearchInput(), SearchPage(), useSearchPage(), HeaderSearchInput() (+1 more)

### Community 51 - "InitPage.tsx"
Cohesion: 0.27
Nodes (7): EditableArtistPickerContext, FADE_TRANSITION, HEIGHT_TRANSITION, PlaylistOwnerLabel(), PlaylistOwnerLabelProps, ArtistOrOwnerRow(), ArtistOrOwnerRowProps

### Community 52 - "SidebarSegment.tsx"
Cohesion: 0.15
Nodes (12): ConsentNotification, ConsentNotificationRequest, ConsentNotificationResponse, GetNotificationSummary, GetNotificationSummaryRequest, GetNotificationSummaryResponse, ListNotifications, ListNotificationsRequest (+4 more)

### Community 53 - "PrivateLockWidget.tsx"
Cohesion: 0.25
Nodes (7): PrivateLockIcon(), PrivateLockIconProps, PrivatePlaylistIndicator(), PrivateLockWidget(), PrivateLockWidgetProps, usePrivateLockWidget(), UsePrivateLockWidgetParams

### Community 54 - "IPlaylistService"
Cohesion: 0.20
Nodes (3): GetPlaylistResponse, ListPlaylistsResponse, IPlaylistService

### Community 55 - "useUISettings"
Cohesion: 0.60
Nodes (3): AudioSettings, useAudioSettings, AudioScreen()

### Community 56 - "TrackList.tsx"
Cohesion: 0.31
Nodes (7): TrackList(), computeGhostStyle(), computeRowStyle(), Drag, TrackDragApi, useTrackDrag(), canCleanTrackNumbers()

### Community 57 - "PlaylistScreenWidget.tsx"
Cohesion: 0.33
Nodes (4): Version, VersionRequest, VersionResponse, ZpotifyAPI

### Community 58 - "PlaylistScreenWidget.tsx"
Cohesion: 0.31
Nodes (6): isAlbum(), computeTotalDuration(), mapPlaylistArtists(), PlaylistScreenWidget(), NotFoundPlaylistInfoSegment(), NotFoundPlaylistInfoSegmentProps

### Community 59 - "EditControls.tsx"
Cohesion: 0.36
Nodes (7): computeCoverColor(), COVER_COLORS, formatTime(), PlayerBarSegment(), trackInfoKey(), useIsSongCached(), CachedIndicator()

### Community 60 - "PanelHeader.tsx"
Cohesion: 0.24
Nodes (8): BACK_STEPS, SCREENS, MetaDialog(), MetaDialogProps, FeedRefreshState, useFeedRefresh, AudioFile, FeedHomeSegment()

### Community 61 - "scripts"
Cohesion: 0.20
Nodes (10): scripts, build, dev, gen, lint, lint:css, lint:fix, lint:js (+2 more)

### Community 62 - "PlayButton.tsx"
Cohesion: 0.24
Nodes (6): PauseIcon(), PauseIconProps, PlayIcon(), PlayIconProps, PlayButton(), PlayButtonProps

### Community 63 - "InitPage.tsx"
Cohesion: 0.29
Nodes (5): navigateSpy, playSpy, recordFindingSpy, setSongInfoSpy, visibleTracks

### Community 64 - "AddTrackDialog.tsx"
Cohesion: 0.26
Nodes (8): SearchHistoryState, useSearchHistory, SearchHistoryEntry, getInitialMatches(), MediaQueryListStub, useIsMobile(), SearchHistoryDropdown(), SearchHistoryDropdownProps

### Community 65 - "PlayerBarSegment.tsx"
Cohesion: 0.06
Nodes (39): AnimatedZ(), RandomArrows(), CardRow(), CardRowProps, LikedSongsState, useLikedSongs, VolumeControlProps, LogoRow() (+31 more)

### Community 66 - "compilerOptions"
Cohesion: 0.20
Nodes (9): compilerOptions, allowSyntheticDefaultImports, composite, module, moduleResolution, outDir, skipLibCheck, strict (+1 more)

### Community 67 - "zpotify_common.pb.ts"
Cohesion: 0.19
Nodes (11): InitReq, getAuth(), setAuthMiddleware(), WebApiParams, withRetries(), isReason(), ServiceError, WithCode() (+3 more)

### Community 68 - "supportedAudio.ts"
Cohesion: 0.14
Nodes (18): DashedRingIcon(), DashedRingIconProps, AddTrackContext, DragOverDecoration(), DropZoneText(), DropZoneTextProps, IdleDecoration(), DropZoneScreen() (+10 more)

### Community 69 - "ZpotifyUI Development Manifesto"
Cohesion: 0.33
Nodes (5): AI Assistant Guidelines, Development Principles, Styling, Tech Stack & Architecture, ZpotifyUI Development Manifesto

### Community 70 - "DropZoneIcon.tsx"
Cohesion: 0.26
Nodes (8): toSearchAlbumResult(), toSearchArtistResult(), toSearchPlaylistResult(), toSearchResponse(), toSearchTrackResult(), buildCoverUrl(), ArtistScreenWidget(), toAlbumCardProps()

### Community 71 - "LibraryGridScreenSkeleton.tsx"
Cohesion: 0.21
Nodes (9): ModalStep, DOT_STEPS, PanelHeader(), PanelHeaderProps, STEP_TITLES, BackButton(), BackButtonProps, StepDots() (+1 more)

### Community 72 - "package.json"
Cohesion: 0.40
Nodes (4): name, private, type, version

### Community 73 - "zpotify_common.pb.ts"
Cohesion: 0.21
Nodes (5): AlbumTag, CreatePlaylistResponse, UpdatePlaylistResponse, GenreChipsRow(), GenreChipsRowProps

### Community 89 - "useArtistHeroSegment.ts"
Cohesion: 0.38
Nodes (7): Artist, EditableArtistName(), EditableArtistNameProps, ArtistHeroSegment(), ArtistHeroSegmentProps, useArtistHeroSegment(), UseArtistHeroSegmentParams

### Community 90 - "EditControls.tsx"
Cohesion: 0.27
Nodes (6): EditIcon(), EditIconProps, RemoveIcon(), SaveIcon(), EditControls(), EditControlsProps

### Community 91 - ".preload"
Cohesion: 0.17
Nodes (16): cacheAudio(), cacheAudioUncoordinated(), cacheTracks(), clearAudioCache(), getCachedAudio(), getTrackUrl(), inFlightCacheRequests, listCachedUrls() (+8 more)

### Community 92 - "UploadCard.tsx"
Cohesion: 0.23
Nodes (7): DownloadIcon(), HomeIcon(), NavSearchIcon(), UploadsIcon(), getNavIcon(), NavItem(), NavItemProps

### Community 93 - "SearchIcon.tsx"
Cohesion: 0.27
Nodes (6): SearchIcon(), DropdownSearchRow(), DropdownSearchRowProps, EmptyState(), EmptyStateProps, MobileSearchButton()

### Community 94 - "useLikedArtists.ts"
Cohesion: 0.33
Nodes (7): ArtistBase, LikedArtistsState, useLikedArtists, SidebarArtistsWidget(), SidebarArtistsWidgetProps, uuidToHslSeed(), ArtistChipsField()

### Community 95 - "DropZoneIcon.tsx"
Cohesion: 0.28
Nodes (6): DropZoneTargetIcon(), DropZoneTargetIconProps, DropZoneUploadIcon(), DropZoneUploadIconProps, DropZoneIcon(), DropZoneIconProps

### Community 96 - "zpotify_common.pb.ts"
Cohesion: 0.25
Nodes (7): Absent, AlbumVersionMetadata, AlbumVersionMetadataVersionKind, BaseAlbumTag, OneOf, SongTag, SongTagKind

### Community 97 - "FolderGroupHeader.tsx"
Cohesion: 0.32
Nodes (5): ChevronRightIcon(), FolderIcon(), FolderIconProps, FolderGroupHeader(), FolderGroupHeaderProps

### Community 98 - "GeneratedAvatar.tsx"
Cohesion: 0.60
Nodes (4): AvatarProps, generateColor(), GeneratedAvatar(), generateHash()

### Community 99 - "SearchHistoryDropdown.test.tsx"
Cohesion: 0.29
Nodes (4): entries, fetchSpy, navigateSpy, setQuerySpy

### Community 101 - "DropdownCreateRow.tsx"
Cohesion: 0.40
Nodes (4): PlusIcon(), PlusIconProps, DropdownCreateRow(), DropdownCreateRowProps

## Knowledge Gaps
- **421 isolated node(s):** `localPlugin`, `name`, `private`, `version`, `type` (+416 more)
  These have ≤1 connection - possible missing edges or undocumented components.
- **11 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `useToaster()` connect `useToaster` to `HomePage.ts`, `MainLayout.tsx`, `usePlayer.ts`, `DropZoneScreen.tsx`, `usePlaylistInfoSegment.ts`, `FilesList.tsx`, `MultitrackUploadModal.tsx`, `ArtistItem`, `useDialog`, `useTrackDrafts.ts`, `audioCacheStore.ts`, `zpotify_service_feature_flags.pb.ts`, `LazyLoadSongsList.tsx`, `InfoControls.tsx`, `AlbumTag`, `zpotify_service_artists.pb.ts`, `PrivateLockWidget.tsx`, `useUISettings`, `PanelHeader.tsx`, `PlayerBarSegment.tsx`, `supportedAudio.ts`, `useArtistHeroSegment.ts`, `.preload`?**
  _High betweenness centrality (0.065) - this node is a cross-community bridge._
- **Why does `AudioPlayerImpl` connect `AudioPlayerImpl` to `PlayerBarSegment.tsx`, `.preload`?**
  _High betweenness centrality (0.037) - this node is a cross-community bridge._
- **Why does `useDialog` connect `DropZoneScreen.tsx` to `audioCacheStore.ts`, `ChooseScreen.tsx`, `MainLayout.tsx`, `supportedAudio.ts`, `usePlayer.ts`, `useToaster`, `zpotify_service_artists.pb.ts`, `HeaderSearchInput.tsx`, `FilesList.tsx`, `MultitrackUploadModal.tsx`, `useUISettings`, `.preload`, `PanelHeader.tsx`?**
  _High betweenness centrality (0.037) - this node is a cross-community bridge._
- **What connects `localPlugin`, `name`, `private` to the rest of the system?**
  _427 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `zpotify_service_files.pb.ts` be split into smaller, more focused modules?**
  _Cohesion score 0.06485671191553545 - nodes in this community are weakly interconnected._
- **Should `Dropdown.tsx` be split into smaller, more focused modules?**
  _Cohesion score 0.11428571428571428 - nodes in this community are weakly interconnected._
- **Should `HomePage.ts` be split into smaller, more focused modules?**
  _Cohesion score 0.0512987012987013 - nodes in this community are weakly interconnected._