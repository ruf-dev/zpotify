# Graph Report - ZpotifyUI  (2026-08-10)

## Corpus Check
- 328 files · ~59,375 words
- Verdict: corpus is large enough that graph structure adds value.

## Summary
- 1490 nodes · 3265 edges · 103 communities (93 shown, 10 thin omitted)
- Extraction: 100% EXTRACTED · 0% INFERRED · 0% AMBIGUOUS · INFERRED: 13 edges (avg confidence: 0.52)
- Token cost: 0 input · 0 output

## Graph Freshness
- Built from commit: `484307b9`
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
- DescriptionSection.tsx
- zpotify_service_search.pb.ts
- EditControls.tsx
- ArtistPage.tsx
- GetArtistPageResponse
- PlaylistHomeSegment.tsx
- Input.tsx
- EditableText.tsx

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
- `EditTrackDialogProps` --references--> `SongBase`  [EXTRACTED]
  src/dialogs/EditTrack/EditTrackDialog.tsx → src/app/api/zpotify/zpotify_common.pb.ts
- `SongSearchBoxProps` --references--> `SongBase`  [EXTRACTED]
  src/widgets/SongSearchBox/SongSearchBox.tsx → src/app/api/zpotify/zpotify_common.pb.ts
- `NotificationRowProps` --references--> `Notification`  [EXTRACTED]
  src/widgets/NotificationBell/components/NotificationRow/NotificationRow.tsx → src/app/api/zpotify/zpotify_service_notification.pb.ts
- `HeaderPart()` --calls--> `useDialog`  [EXTRACTED]
  src/widgets/Header/HeaderPart.tsx → src/app/hooks/Dialog.tsx
- `UploadStatusChipProps` --references--> `TrackDraft`  [EXTRACTED]
  src/dialogs/MultitrackUpload/components/UploadStatusChip/UploadStatusChip.tsx → src/dialogs/MultitrackUpload/TrackRow.tsx

## Import Cycles
- 3-file cycle: `src/entities/artist/useLikedArtists.ts -> src/shared/api/ArtistsService.ts -> src/widgets/ArtistField/ArtistChipsField.tsx -> src/entities/artist/useLikedArtists.ts`

## Communities (103 total, 10 thin omitted)

### Community 0 - "zpotify_service_files.pb.ts"
Cohesion: 0.10
Nodes (20): BatchDeleteFiles, BatchDeleteFilesRequest, BatchDeleteFilesResponse, CheckFilesByHashes, CheckFilesByHashesFoundFileByHash, CheckFilesByHashesRequest, CheckFilesByHashesResponse, DeleteFile (+12 more)

### Community 1 - "Dropdown.tsx"
Cohesion: 0.24
Nodes (11): Dropdown(), DropdownProps, useDropdownClose(), useSearchResults(), DropdownOption, getOptionId(), getOptionLabel(), DropdownCreateRow() (+3 more)

### Community 2 - "HomePage.ts"
Cohesion: 0.15
Nodes (10): HomePageSegment, ISettingsService, parseHomePageSegment(), SettingsService, toHomeSegments(), FeedSegmentInfo, HomeSegment, LibrarySegmentInfo (+2 more)

### Community 3 - "MainLayout.tsx"
Cohesion: 0.25
Nodes (12): albumPath(), isAlbum(), usePlaylistSongs(), User(), AuthStatus, useUser, AlbumPage(), PlaylistPage() (+4 more)

### Community 4 - "fetch.pb.ts"
Cohesion: 0.06
Nodes (32): b64, b64Encode(), fetchStreamingRequest(), FlattenedRequestPayload, flattenRequestPayload(), getNewLineDelimitedJSONDecodingStream(), getNotifyEntityArrivalSink(), isPlainObject() (+24 more)

### Community 5 - "usePlayer.ts"
Cohesion: 0.22
Nodes (15): cacheAudio(), cacheAudioUncoordinated(), cacheTracks(), clearAudioCache(), getTrackUrl(), inFlightCacheRequests, listCachedUrls(), uncacheAudio() (+7 more)

### Community 7 - "useToaster"
Cohesion: 0.24
Nodes (11): LikedSongsState, useLikedSongs, catchServiceError(), internalErrors, useToaster(), MultiSelect(), MultiSelectProps, ArtistSongsRow() (+3 more)

### Community 8 - "Auth.ts"
Cohesion: 0.16
Nodes (14): AuthData, AuthRequest, GetAuthMethodsRequest, RefreshRequest, AuthService, clearLocalStorage(), fromLocalStorage(), getLocalStorageAuthInfoKey() (+6 more)

### Community 9 - "DropZoneScreen.tsx"
Cohesion: 0.19
Nodes (8): DashedRingIcon(), DashedRingIconProps, SpinnerIcon(), DragOverDecoration(), DropZoneText(), DropZoneTextProps, IdleDecoration(), UploadingSpinner()

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
Cohesion: 0.08
Nodes (27): CoverWithFallback(), CoverWithFallbackProps, GenerativeCover(), GenerativeCoverProps, PALETTES, ShapeFn, SHAPES, AudioSettings (+19 more)

### Community 15 - "useSearchPage.ts"
Cohesion: 0.24
Nodes (11): FILTER_LABELS, FilterChipsProps, FilterKey, EMPTY_RESPONSE, UseSearchPageResult, SearchAlbumResult, SearchArtistResult, SearchFilters (+3 more)

### Community 16 - "SongEditDialog.tsx"
Cohesion: 0.29
Nodes (7): BackButton(), BackButtonProps, computeTotalDuration(), mapPlaylistArtists(), PlaylistScreenWidget(), NotFoundPlaylistInfoSegment(), NotFoundPlaylistInfoSegmentProps

### Community 17 - "usePlaylistInfoSegment.ts"
Cohesion: 0.10
Nodes (20): PrivateLockIcon(), PrivateLockIconProps, EditableAlbumName(), EditableAlbumNameProps, EditableArtistPickerContext, FADE_TRANSITION, HEIGHT_TRANSITION, EditableYearProps (+12 more)

### Community 18 - "ArtistsService.ts"
Cohesion: 0.11
Nodes (18): CreateArtist, CreateArtistRequest, CreateArtistResponse, GetArtistPage, GetArtistPageRequest, LikeArtist, LikeArtistRequest, LikeArtistResponse (+10 more)

### Community 19 - "FilesList.tsx"
Cohesion: 0.18
Nodes (10): SidebarToggleIcon(), AddTrackButton(), AddTrackButtonProps, SidebarToggleButton(), NAV_ITEMS, navIdentity, SidebarSegment(), SidebarUIState (+2 more)

### Community 20 - "MultitrackUploadModal.tsx"
Cohesion: 0.15
Nodes (13): CheckIcon(), ChevronRightIcon(), RetryAllIcon(), MultitrackUploadModal(), MultitrackUploadModalProps, PlaylistToggleRow(), PlaylistToggleRowProps, useArtistLookup() (+5 more)

### Community 21 - "ArtistItem"
Cohesion: 0.21
Nodes (8): PlaylistDetailsPanelProps, MultitrackSubmitParams, MultitrackSubmitState, ToCreateTrack, useMultitrackSubmit(), FeedRefreshState, useFeedRefresh, ChipEntry

### Community 22 - "zpotify_service_playlist.pb.ts"
Cohesion: 0.11
Nodes (17): AddSongsToPlaylist, AddSongsToPlaylistResponse, AddSongToPlaylist, AddSongToPlaylistResponse, ChangeSongsOrder, ChangeSongsOrderResponse, CreatePlaylist, DeleteSong (+9 more)

### Community 23 - "PlaylistService.ts"
Cohesion: 0.13
Nodes (18): FeedDay, GetFeed, GetFeedRequest, GetFeedResponse, HomeAPI, FeedService, IFeedService, toFeedArtistItem() (+10 more)

### Community 24 - "useDialog"
Cohesion: 0.19
Nodes (13): SearchAPI, uuidToSeed(), ISearchService, SearchService, toSearchAlbumResult(), toSearchArtistResult(), toSearchPlaylistResult(), toSearchResponse() (+5 more)

### Community 25 - "CachedSongsAccordion.tsx"
Cohesion: 0.20
Nodes (12): RemoveTrackIcon(), CachedSongEntry, useCachedSongs(), AlbumGroup, CachedSongsAccordion(), groupSongsByAlbum(), matchesQuery(), AccordionHeader() (+4 more)

### Community 26 - "useTrackDrafts.ts"
Cohesion: 0.17
Nodes (20): buildNewTracksFromFresh(), ClassifiedFile, classifyIncomingFiles(), createInitialTracks(), InitialTrackMeta, loadInitialTrackMeta(), mapArtists(), mergeInitialTrack() (+12 more)

### Community 27 - "PlaylistsLibrarySegment.tsx"
Cohesion: 0.08
Nodes (31): artistPath(), CardRow(), CardRowProps, MetaScreen(), MetaScreenProps, TrackRow(), ArtistRowProps, formatFileBytes() (+23 more)

### Community 28 - "dependencies"
Cohesion: 0.11
Nodes (19): dependencies, classnames, framer-motion, grpc-web, @hookstate/core, music-metadata-browser, react, react-dom (+11 more)

### Community 29 - "index.ts"
Cohesion: 0.22
Nodes (13): Playlist, SongBase, DownloadIcon(), ArtistSongsRowProps, Props, PlaylistInfoSegmentProps, UsePlaylistInfoSegmentParams, InfoControls() (+5 more)

### Community 30 - "useUser.ts"
Cohesion: 0.31
Nodes (8): InitReq, getAuth(), setAuthMiddleware(), WebApiParams, withRetries(), isReason(), WithCode(), WithReason()

### Community 31 - "CommentsSection.tsx"
Cohesion: 0.13
Nodes (14): GetUserSettings, GetUserSettingsRequest, GetUserSettingsResponse, Me, MeRequest, MeResponse, UserAPI, UserData (+6 more)

### Community 32 - "audioCacheStore.ts"
Cohesion: 0.15
Nodes (12): GripIcon(), PlayTriangleIcon(), EditTrackDialog(), computeCoverColor(), COVER_COLORS, formatTime(), PlayerBarSegment(), useIsSongCached() (+4 more)

### Community 33 - "zpotify_service_feature_flags.pb.ts"
Cohesion: 0.16
Nodes (13): FeatureFlag, FeatureFlagId, FeatureFlagsAPI, GetFeatureFlags, GetFeatureFlagsRequest, GetFeatureFlagsResponse, FeatureFlagsStore, useFeatureFlags (+5 more)

### Community 34 - "ChooseScreen.tsx"
Cohesion: 0.33
Nodes (7): PlaylistRow(), PlaylistRowData, PlaylistRowProps, PlaylistItem, SidebarPlaylistsWidget(), SidebarPlaylistsWidgetProps, uuidToHslColor()

### Community 35 - "TrackRow.tsx"
Cohesion: 0.14
Nodes (11): DragHandleIcon(), UploadDoneIcon(), UploadErrorIcon(), EditableTitleProps, TODO: switch to chures Input once it supports ref/onKeyDown, UploadStatusChip(), UploadStatusChipProps, TODO: Make editable here and send update name for such files if changed (+3 more)

### Community 36 - "WebApi.ts"
Cohesion: 0.24
Nodes (11): GrpcErrorDetails, isHttpCodeRetryable(), WithDescription(), WithHttpStatus(), WithIsNonRetryable(), WithStatusCode(), WithTitle(), ServiceErrorFromHttp() (+3 more)

### Community 37 - "ArtistChipsField.tsx"
Cohesion: 0.11
Nodes (18): BatchCreateSong, BatchCreateSongRequest, BatchCreateSongResponse, CreateSong, CreateSongRequest, CreateSongResponse, GetSong, GetSongRequest (+10 more)

### Community 38 - "PlaylistAPI"
Cohesion: 0.13
Nodes (3): PlaylistAPI, mapToTrackPreviews(), PlaylistService

### Community 39 - "SongsService"
Cohesion: 0.15
Nodes (5): SongAPI, EditTrackDialogProps, ISongsService, SongsService, SongSearchBoxProps

### Community 40 - "LazyLoadSongsList.tsx"
Cohesion: 0.33
Nodes (7): useListSongs(), UseListSongsOptions, joinArtistNames(), toArtistNameParts(), toQueueTracks(), InfiniteSongsListProps, LazyLoadSongsList()

### Community 41 - "MainContent.tsx"
Cohesion: 0.31
Nodes (6): ClockIcon(), selectFlagEnabled(), ZButton(), ZButtonProps, Drag, MainContent()

### Community 42 - "InfoControls.tsx"
Cohesion: 0.25
Nodes (6): ShareIcon(), RandomArrows(), IconButton(), IconButtonProps, ShareButton(), ShuffleButton()

### Community 43 - "UserWidget.tsx"
Cohesion: 0.21
Nodes (7): MiniClockIcon(), MiniDiscIcon(), FieldLabelRow(), FieldLabelRowProps, formatTotalDuration(), PlaylistDetailsPanel(), DisabledChipProps

### Community 44 - "BaseService.ts"
Cohesion: 0.21
Nodes (8): UploadArrowIcon(), ZLogoIcon(), CoverFieldProps, CoverUploadProgress(), CoverUploadProgressProps, EditableCoverWithFallback(), buildCoverUrl(), SongSearchBox()

### Community 45 - "AlbumTag"
Cohesion: 0.21
Nodes (5): AlbumTag, CreatePlaylistResponse, UpdatePlaylistResponse, GenreChipsRow(), GenreChipsRowProps

### Community 46 - "usePendingFiles.tsx"
Cohesion: 0.15
Nodes (14): AddTrackDialog(), BACK_STEPS, ModalStep, SCREENS, DOT_STEPS, PanelHeader(), PanelHeaderProps, STEP_TITLES (+6 more)

### Community 47 - "zpotify_service_artists.pb.ts"
Cohesion: 0.11
Nodes (18): DialogManager, useDialog, FilesList(), FilesListProps, LoginViaPass(), SongEditDialog(), SongEditDialogProps, GhostSong() (+10 more)

### Community 48 - "PlaylistControls.tsx"
Cohesion: 0.31
Nodes (7): NotificationDialog(), useNotifications, ServiceError, formatNotificationDate(), NotificationRow(), NotificationRowProps, NotificationBellWidget()

### Community 49 - "MoreButton.tsx"
Cohesion: 0.30
Nodes (8): MoreDots(), MenuOption(), MenuOptionProps, Menu(), MenuOption, MenuProps, MoreButton(), MoreButtonProps

### Community 50 - "CoverWithFallback.tsx"
Cohesion: 0.13
Nodes (14): AddSongsToPlaylistRequest, AddSongToPlaylistRequest, ChangeSongsOrderRequest, CreatePlaylistRequest, DeleteSongRequest, FollowPlaylistRequest, GetPlaylistRequest, ListPlaylistsRequest (+6 more)

### Community 51 - "InitPage.tsx"
Cohesion: 0.18
Nodes (10): ArtistCard(), ArtistCardProps, EmptyState(), SectionLabel(), SectionLabelProps, SearchPage(), useSearchPage(), TrackRow() (+2 more)

### Community 52 - "ChipsField.tsx"
Cohesion: 0.14
Nodes (11): AlbumTagKind, LockIcon(), PlusIcon(), PlusIconProps, RemoveIcon(), Chip(), ChipProps, ArtistChipsFieldProps (+3 more)

### Community 53 - "PrivateLockWidget.tsx"
Cohesion: 0.47
Nodes (4): PrivateLockWidget(), PrivateLockWidgetProps, usePrivateLockWidget(), UsePrivateLockWidgetParams

### Community 54 - "IPlaylistService"
Cohesion: 0.17
Nodes (4): GetPlaylistResponse, ListPlaylistsResponse, ListSongsResponse, IPlaylistService

### Community 55 - ".ListLibrary"
Cohesion: 0.11
Nodes (16): SongFile, CreatePlaylistIcon(), MusicFileIcon(), MusicFileIconProps, UploadArrowLargeIcon(), AddTrackContext, ChooseScreen(), CreatePlaylistCard() (+8 more)

### Community 56 - "TrackList.tsx"
Cohesion: 0.14
Nodes (18): TargetPlaylist, TrackList(), TrackListProps, TrackDraft, ArtistLookup, buildValidationHint(), MultitrackSummary, MultitrackSummaryParams (+10 more)

### Community 57 - "PlaylistScreenWidget.tsx"
Cohesion: 0.16
Nodes (11): HeartIcon(), HeartIconProps, CommentsSectionProps, MOCK_COMMENTS, MockComment, TODO: implement comments API — no backend endpoint exists yet, TODO: implement comments API — no backend endpoint exists yet, SaveButtonWidget() (+3 more)

### Community 59 - "SearchPage.tsx"
Cohesion: 0.18
Nodes (6): AuthAPI, TelegramAuth(), AuthViaTelegram(), GetTelegramBotId(), AuthButton(), AuthButtonProps

### Community 60 - "EditableArtistPicker.tsx"
Cohesion: 0.21
Nodes (8): SearchIcon(), DropdownSearchRow(), DropdownSearchRowProps, SearchQueryState, useSearchQuery, EmptyStateProps, MobileSearchButton(), HeaderSearchInput()

### Community 61 - "scripts"
Cohesion: 0.22
Nodes (9): scripts, build, dev, gen, lint, lint:css, lint:fix, lint:js (+1 more)

### Community 62 - "PlayButton.tsx"
Cohesion: 0.28
Nodes (6): PauseIcon(), PauseIconProps, PlayIcon(), PlayIconProps, PlayButton(), PlayButtonProps

### Community 63 - "UploadStatusChip.tsx"
Cohesion: 0.27
Nodes (6): initServiceWorker(), Path, Router(), queryClient, EarlyAccessPage(), ErrorPage()

### Community 64 - "AddTrackDialog.tsx"
Cohesion: 0.24
Nodes (9): FeedHomeSegment(), FeedHomeSegmentSkeleton(), ArtistNamePart, AudioStoreState, playerInstance, QueueTrack, TrackInfo, useAudioPlayer() (+1 more)

### Community 65 - "PlayerBarSegment.tsx"
Cohesion: 0.09
Nodes (17): AnimatedZ(), VolumeControlProps, LogoRow(), LogoRowProps, VolumeBarProps, VolumeDisplayProps, PlayPauseButton(), PlayPauseButtonProps (+9 more)

### Community 66 - "compilerOptions"
Cohesion: 0.20
Nodes (9): compilerOptions, allowSyntheticDefaultImports, composite, module, moduleResolution, outDir, skipLibCheck, strict (+1 more)

### Community 67 - "zpotify_common.pb.ts"
Cohesion: 0.20
Nodes (8): Paging, Notification, NotificationAPI, NotificationDialogProps, NotificationsState, BaseService, INotificationsService, NotificationsService

### Community 68 - "supportedAudio.ts"
Cohesion: 0.22
Nodes (10): UploadArrowSmallIcon(), SongListRefreshState, useSongListRefresh, DropZone(), DropZoneProps, AUDIO_ACCEPT, isSupportedAudioFile(), SUPPORTED_AUDIO_EXTENSIONS (+2 more)

### Community 69 - "ZpotifyUI Development Manifesto"
Cohesion: 0.33
Nodes (5): AI Assistant Guidelines, Development Principles, Styling, Tech Stack & Architecture, ZpotifyUI Development Manifesto

### Community 70 - "DropZoneIcon.tsx"
Cohesion: 0.28
Nodes (6): DropZoneTargetIcon(), DropZoneTargetIconProps, DropZoneUploadIcon(), DropZoneUploadIconProps, DropZoneIcon(), DropZoneIconProps

### Community 71 - "LibraryGridScreenSkeleton.tsx"
Cohesion: 0.22
Nodes (5): ManagementHomeSegment(), AlbumCardSkeleton(), PlaylistCardWideSkeleton(), PlaylistsLibrarySegment(), LibraryGridScreenSkeleton()

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
Cohesion: 0.33
Nodes (8): Artist, EditableCoverWithFallbackProps, EditableArtistName(), EditableArtistNameProps, ArtistHeroSegment(), ArtistHeroSegmentProps, useArtistHeroSegment(), UseArtistHeroSegmentParams

### Community 90 - "zpotify_service_feature_flags.pb.ts"
Cohesion: 0.20
Nodes (9): Absent, BaseHomePageSegment, HomePageSegmentFeedSegment, HomePageSegmentLibrarySegment, HomePageSegmentManagement, HomePageSegmentPlaylistSegment, OneOf, UiSettings (+1 more)

### Community 91 - "IdleDecoration.tsx"
Cohesion: 0.38
Nodes (6): MainLayout(), SegmentCarousel(), SegmentCarouselProps, UISettings, useUISettings, MobileNavSegment()

### Community 92 - "UploadCard.tsx"
Cohesion: 0.29
Nodes (6): HomeIcon(), NavSearchIcon(), UploadsIcon(), getNavIcon(), NavItem(), NavItemProps

### Community 93 - "GeneratedAvatar.tsx"
Cohesion: 0.20
Nodes (10): BellIcon(), BellIconProps, SettingsDialog(), AvatarProps, generateColor(), GeneratedAvatar(), generateHash(), UISettingsWidget() (+2 more)

### Community 94 - ".preload"
Cohesion: 0.33
Nodes (7): ArtistBase, LikedArtistsState, useLikedArtists, SidebarArtistsWidget(), SidebarArtistsWidgetProps, uuidToHslSeed(), ArtistChipsField()

### Community 96 - "zpotify_service_search.pb.ts"
Cohesion: 0.22
Nodes (8): Search, SearchAlbumResult, SearchArtistResult, SearchFilters, SearchPlaylistResult, SearchRequest, SearchResponse, SearchTrackResult

### Community 97 - "EditControls.tsx"
Cohesion: 0.32
Nodes (5): EditIcon(), EditIconProps, SaveIcon(), EditControls(), EditControlsProps

### Community 98 - "ArtistPage.tsx"
Cohesion: 0.39
Nodes (4): ArtistPage(), useArtistPage(), NotFoundScreen(), SkeletonLoadScreen()

### Community 99 - "GetArtistPageResponse"
Cohesion: 0.29
Nodes (3): GetArtistPageResponse, IArtistsService, Props

### Community 100 - "PlaylistHomeSegment.tsx"
Cohesion: 0.38
Nodes (5): playlistPath(), ActionButtonProps, IconButton(), DisplayPlaylistSegmentProps, PlaylistHomeSegment()

## Knowledge Gaps
- **391 isolated node(s):** `localPlugin`, `name`, `private`, `version`, `type` (+386 more)
  These have ≤1 connection - possible missing edges or undocumented components.
- **10 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `useToaster()` connect `useToaster` to `Dropdown.tsx`, `MainLayout.tsx`, `usePlayer.ts`, `useUser`, `usePlaylistInfoSegment.ts`, `ArtistItem`, `CachedSongsAccordion.tsx`, `useTrackDrafts.ts`, `audioCacheStore.ts`, `SongsService`, `LazyLoadSongsList.tsx`, `MainContent.tsx`, `usePendingFiles.tsx`, `zpotify_service_artists.pb.ts`, `PlaylistControls.tsx`, `PrivateLockWidget.tsx`, `.ListLibrary`, `PlaylistScreenWidget.tsx`, `SearchPage.tsx`, `AddTrackDialog.tsx`, `supportedAudio.ts`, `LibraryGridScreenSkeleton.tsx`, `EditableText.tsx`, `MusicFileIcon.tsx`?**
  _High betweenness centrality (0.061) - this node is a cross-community bridge._
- **Why does `AudioPlayerImpl` connect `AudioPlayerImpl` to `AddTrackDialog.tsx`, `PlayerBarSegment.tsx`?**
  _High betweenness centrality (0.045) - this node is a cross-community bridge._
- **Why does `PlaylistService` connect `PlaylistAPI` to `audioCacheStore.ts`, `ChooseScreen.tsx`, `MainLayout.tsx`, `zpotify_common.pb.ts`, `supportedAudio.ts`, `usePlayer.ts`, `useToaster`, `LazyLoadSongsList.tsx`, `MainContent.tsx`, `LibraryGridScreenSkeleton.tsx`, `AlbumTag`, `usePlaylistInfoSegment.ts`, `CoverWithFallback.tsx`, `ArtistItem`, `IPlaylistService`, `PrivateLockWidget.tsx`, `PlaylistScreenWidget.tsx`?**
  _High betweenness centrality (0.031) - this node is a cross-community bridge._
- **What connects `localPlugin`, `name`, `private` to the rest of the system?**
  _396 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `zpotify_service_files.pb.ts` be split into smaller, more focused modules?**
  _Cohesion score 0.0990990990990991 - nodes in this community are weakly interconnected._
- **Should `HomePage.ts` be split into smaller, more focused modules?**
  _Cohesion score 0.14736842105263157 - nodes in this community are weakly interconnected._
- **Should `fetch.pb.ts` be split into smaller, more focused modules?**
  _Cohesion score 0.059379217273954114 - nodes in this community are weakly interconnected._