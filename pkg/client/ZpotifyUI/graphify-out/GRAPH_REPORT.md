# Graph Report - ZpotifyUI  (2026-08-17)

## Corpus Check
- 348 files · ~65,130 words
- Verdict: corpus is large enough that graph structure adds value.

## Summary
- 1604 nodes · 3566 edges · 102 communities (92 shown, 10 thin omitted)
- Extraction: 99% EXTRACTED · 1% INFERRED · 0% AMBIGUOUS · INFERRED: 22 edges (avg confidence: 0.54)
- Token cost: 0 input · 0 output

## Graph Freshness
- Built from commit: `99321827`
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

## God Nodes (most connected - your core abstractions)
1. `useToaster()` - 64 edges
2. `useDialog` - 49 edges
3. `SongBase` - 41 edges
4. `useUser` - 39 edges
5. `AudioPlayerImpl` - 39 edges
6. `ArtistItem` - 31 edges
7. `PlaylistService` - 29 edges
8. `BaseService` - 26 edges
9. `TrackDraft` - 24 edges
10. `buildCoverUrl()` - 23 edges

## Surprising Connections (you probably didn't know these)
- `EditTrackDialogProps` --references--> `SongBase`  [EXTRACTED]
  src/dialogs/EditTrack/EditTrackDialog.tsx → src/app/api/zpotify/zpotify_common.pb.ts
- `ArtistSongsRowProps` --references--> `SongBase`  [EXTRACTED]
  src/widgets/ArtistScreen/widgets/ArtistSongsRow/ArtistSongsRow.tsx → src/app/api/zpotify/zpotify_common.pb.ts
- `SongSearchBoxProps` --references--> `SongBase`  [EXTRACTED]
  src/widgets/SongSearchBox/SongSearchBox.tsx → src/app/api/zpotify/zpotify_common.pb.ts
- `EditableCoverWithFallback()` --calls--> `buildCoverUrl()`  [EXTRACTED]
  src/components/EditableCoverWithFallback/EditableCoverWithFallback.tsx → src/shared/lib/coverUrl.ts
- `UploadStatusChipProps` --references--> `TrackDraft`  [EXTRACTED]
  src/dialogs/MultitrackUpload/components/UploadStatusChip/UploadStatusChip.tsx → src/dialogs/MultitrackUpload/TrackRow.tsx

## Import Cycles
- 3-file cycle: `src/entities/artist/useLikedArtists.ts -> src/shared/api/ArtistsService.ts -> src/widgets/ArtistField/ArtistChipsField.tsx -> src/entities/artist/useLikedArtists.ts`

## Communities (102 total, 10 thin omitted)

### Community 0 - "zpotify_service_files.pb.ts"
Cohesion: 0.09
Nodes (21): BatchDeleteFiles, BatchDeleteFilesRequest, BatchDeleteFilesResponse, CheckFilesByHashes, CheckFilesByHashesFoundFileByHash, CheckFilesByHashesRequest, CheckFilesByHashesResponse, DeleteFile (+13 more)

### Community 1 - "Dropdown.tsx"
Cohesion: 0.09
Nodes (19): AlbumTagKind, HeartIcon(), HeartIconProps, LockIcon(), RemoveIcon(), Chip(), ChipProps, CHIP_KIND_LABELS (+11 more)

### Community 2 - "HomePage.ts"
Cohesion: 0.11
Nodes (11): SegmentTabBarProps, Tab, HomePage(), FeedSegmentInfo, HomeSegment, LibrarySegmentInfo, ManagementSegmentInfo, PlaylistSegmentInfo (+3 more)

### Community 3 - "MainLayout.tsx"
Cohesion: 0.05
Nodes (56): MainLayout(), initServiceWorker(), albumPath(), artistPath(), Path, playlistPath(), Router(), SidebarToggleIcon() (+48 more)

### Community 4 - "fetch.pb.ts"
Cohesion: 0.13
Nodes (16): b64, b64Encode(), fetchStreamingRequest(), FlattenedRequestPayload, flattenRequestPayload(), getNewLineDelimitedJSONDecodingStream(), getNotifyEntityArrivalSink(), isPlainObject() (+8 more)

### Community 5 - "usePlayer.ts"
Cohesion: 0.21
Nodes (11): CachedSongEntry, useCachedSongs(), AlbumGroup, CachedSongsAccordion(), groupSongsByAlbum(), matchesQuery(), AccordionHeader(), AccordionHeaderProps (+3 more)

### Community 7 - "useToaster"
Cohesion: 0.17
Nodes (12): MultitrackSubmitState, ToCreateTrack, useMultitrackSubmit(), FeedRefreshState, useFeedRefresh, catchServiceError(), internalErrors, useToaster() (+4 more)

### Community 8 - "Auth.ts"
Cohesion: 0.13
Nodes (14): Absent, BaseHomePageSegment, HomePageSegment, HomePageSegmentFeedSegment, HomePageSegmentLibrarySegment, HomePageSegmentManagement, HomePageSegmentPlaylistSegment, OneOf (+6 more)

### Community 9 - "DropZoneScreen.tsx"
Cohesion: 0.06
Nodes (44): DialogManager, useDialog, BellIcon(), BellIconProps, AddTrackDialog(), FilesList(), FilesListProps, NotificationDialog() (+36 more)

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
Cohesion: 0.09
Nodes (21): Absent, Auth, AuthLogPass, AuthRequest, AuthResponse, AuthTelegramOAuth, AuthViaAsync, AuthViaAsyncRequest (+13 more)

### Community 14 - "useUser"
Cohesion: 0.13
Nodes (17): CoverWithFallback(), CoverWithFallbackProps, GenerativeCover(), GenerativeCoverProps, PALETTES, ShapeFn, SHAPES, cacheCover() (+9 more)

### Community 15 - "useSearchPage.ts"
Cohesion: 0.17
Nodes (17): FILTER_LABELS, FilterChipsProps, FilterKey, EMPTY_RESPONSE, UseSearchPageResult, ISearchService, SearchAlbumResult, SearchArtistResult (+9 more)

### Community 16 - "SongEditDialog.tsx"
Cohesion: 0.15
Nodes (10): DragHandleIcon(), UploadDoneIcon(), UploadErrorIcon(), EditableTitleProps, TODO: switch to chures Input once it supports ref/onKeyDown, UploadStatusChip(), UploadStatusChipProps, TODO: Make editable here and send update name for such files if changed (+2 more)

### Community 17 - "usePlaylistInfoSegment.ts"
Cohesion: 0.14
Nodes (14): webApiService, ActiveUpload, EagerFileUpload, useEagerFileUpload(), EditableAlbumName(), EditableAlbumNameProps, EditableYearProps, TrackCountLabel() (+6 more)

### Community 18 - "ArtistsService.ts"
Cohesion: 0.06
Nodes (25): ArtistBase, ArtistsAPI, CreateArtist, CreateArtistRequest, CreateArtistResponse, GetArtistPage, GetArtistPageRequest, GetArtistPageResponse (+17 more)

### Community 19 - "FilesList.tsx"
Cohesion: 0.27
Nodes (8): AddTrackContext, BACK_STEPS, SCREENS, FileItem(), DropZoneScreen(), PendingFilesScreen(), usePendingFiles(), DroppedGroups

### Community 20 - "MultitrackUploadModal.tsx"
Cohesion: 0.50
Nodes (3): CheckIcon(), PlaylistToggleRow(), PlaylistToggleRowProps

### Community 21 - "ArtistItem"
Cohesion: 0.29
Nodes (8): FeedArtistChip(), choosePlaylistComponent(), FeedDayGroup(), feedItemTransition, Props, FeedArtistItem, FeedSongArtist, FeedSongItem

### Community 22 - "zpotify_service_playlist.pb.ts"
Cohesion: 0.08
Nodes (31): AddSongsToPlaylist, AddSongsToPlaylistRequest, AddSongsToPlaylistResponse, AddSongToPlaylist, AddSongToPlaylistRequest, AddSongToPlaylistResponse, ChangeSongsOrder, ChangeSongsOrderRequest (+23 more)

### Community 23 - "PlaylistService.ts"
Cohesion: 0.12
Nodes (15): ListSearchHistory, ListSearchHistoryRequest, RecordSearchFinding, RecordSearchFindingResponse, RecordSearchQuery, RecordSearchQueryResponse, Search, SearchAlbumResult (+7 more)

### Community 24 - "useDialog"
Cohesion: 0.24
Nodes (8): SongFile, MusicFileIcon(), MusicFileIconProps, RemoveTrackIcon(), FileItemProps, FetchServerFilesButtonProps, TrackListProps, TrackDraftsState

### Community 25 - "CachedSongsAccordion.tsx"
Cohesion: 0.23
Nodes (7): UploadArrowIcon(), ZLogoIcon(), CoverFieldProps, CoverUploadProgress(), CoverUploadProgressProps, EditableCoverWithFallback(), EditableCoverWithFallbackProps

### Community 26 - "useTrackDrafts.ts"
Cohesion: 0.16
Nodes (22): BatchUploadState, useBatchUpload(), MultitrackUploadModalProps, buildNewTracksFromFresh(), ClassifiedFile, classifyIncomingFiles(), createInitialTracks(), flattenDroppedInput() (+14 more)

### Community 27 - "PlaylistsLibrarySegment.tsx"
Cohesion: 0.21
Nodes (10): AlbumCard(), TrackRow(), TrackRowProps, PlaylistCardWide(), AlbumCardProps, LibraryItem, PlaylistCardWideProps, chooseComponent() (+2 more)

### Community 28 - "dependencies"
Cohesion: 0.11
Nodes (19): dependencies, classnames, framer-motion, grpc-web, @hookstate/core, music-metadata-browser, react, react-dom (+11 more)

### Community 29 - "index.ts"
Cohesion: 0.17
Nodes (12): Playlist, SongBase, DownloadIcon(), ISongsService, Props, PlaylistInfoSegmentProps, UsePlaylistInfoSegmentParams, InfoControls() (+4 more)

### Community 30 - "useUser.ts"
Cohesion: 0.07
Nodes (29): Absent, AlbumVersionMetadata, AlbumVersionMetadataVersionKind, BaseAlbumTag, OneOf, Paging, SongTag, SongTagKind (+21 more)

### Community 31 - "CommentsSection.tsx"
Cohesion: 0.13
Nodes (11): ListSearchHistoryResponse, RecordSearchFindingRequest, RecordSearchQueryRequest, SearchAPI, SearchHistoryEntry, SearchHistoryState, ISearchHistoryService, SearchHistoryEntry (+3 more)

### Community 32 - "audioCacheStore.ts"
Cohesion: 0.18
Nodes (9): GripIcon(), PlayTriangleIcon(), ArtistNamePart, formatDuration(), baseProps(), makeSong(), navigateSpy, TrackRow() (+1 more)

### Community 33 - "zpotify_service_feature_flags.pb.ts"
Cohesion: 0.36
Nodes (6): FeatureFlag, FeatureFlagsAPI, FeatureFlagsStore, useFeatureFlags, useFeatureFlagsQuery(), fetchFeatureFlags()

### Community 34 - "ChooseScreen.tsx"
Cohesion: 0.13
Nodes (13): SegmentCarousel(), SegmentCarouselProps, StubRect, UISettings, useUISettings, SettingsRow(), SettingsRowProps, SettingsTabButton() (+5 more)

### Community 35 - "TrackRow.tsx"
Cohesion: 0.15
Nodes (18): RetryAllIcon(), AddTrackDialog, MultitrackUploadModal(), TargetPlaylist, PlaylistDetailsPanelProps, TrackRowProps, ArtistLookup, useArtistLookup() (+10 more)

### Community 36 - "WebApi.ts"
Cohesion: 0.15
Nodes (20): InitReq, BaseService, getAuth(), WebApiParams, withRetries(), GrpcErrorDetails, isHttpCodeRetryable(), isReason() (+12 more)

### Community 37 - "ArtistChipsField.tsx"
Cohesion: 0.11
Nodes (18): BatchCreateSong, BatchCreateSongRequest, BatchCreateSongResponse, CreateSong, CreateSongRequest, CreateSongResponse, GetSong, GetSongRequest (+10 more)

### Community 40 - "LazyLoadSongsList.tsx"
Cohesion: 0.18
Nodes (9): PlaylistListRefreshState, usePlaylistListRefresh, PlaylistItem, SidebarPlaylistsWidget(), SidebarPlaylistsWidgetProps, uuidToHslColor(), AlbumCardSkeleton(), PlaylistCardWideSkeleton() (+1 more)

### Community 41 - "MainContent.tsx"
Cohesion: 0.15
Nodes (15): FeedDay, GetFeed, GetFeedRequest, GetFeedResponse, HomeAPI, FeedService, IFeedService, toFeedArtistItem() (+7 more)

### Community 42 - "InfoControls.tsx"
Cohesion: 0.38
Nodes (4): RandomArrows(), ShuffleTracksButton(), ShuffleTracksButtonProps, ShuffleButton()

### Community 43 - "UserWidget.tsx"
Cohesion: 0.24
Nodes (11): BatchUploadSection(), BatchUploadSectionProps, isFolderSettled(), UploadingFileRowProps, FetchServerFilesButton(), folderProgress(), groupTracksByFolder(), TrackGroupSegment (+3 more)

### Community 44 - "BaseService.ts"
Cohesion: 0.12
Nodes (16): AuthAPI, AuthData, apiPrefix(), InitReq, options, AuthMiddleware, AuthService, AuthViaTelegram() (+8 more)

### Community 45 - "AlbumTag"
Cohesion: 0.24
Nodes (11): Dropdown(), DropdownProps, useDropdownClose(), useSearchResults(), DropdownOption, getOptionId(), getOptionLabel(), DropdownOptionRow() (+3 more)

### Community 46 - "usePendingFiles.tsx"
Cohesion: 0.14
Nodes (10): AnimatedZ(), LogoRow(), LogoRowProps, PlayPauseButton(), PlayPauseButtonProps, TrackProgressControls(), TrackRewindButton, MusicPlayerProps (+2 more)

### Community 47 - "zpotify_service_artists.pb.ts"
Cohesion: 0.21
Nodes (12): CardRow(), CardRowProps, LikedSongsState, useLikedSongs, SongListPermissions, ArtistSongsRow(), ArtistSongsRowProps, joinArtistNames() (+4 more)

### Community 48 - "ChipsField.tsx"
Cohesion: 0.21
Nodes (7): MiniClockIcon(), MiniDiscIcon(), FieldLabelRow(), FieldLabelRowProps, formatTotalDuration(), PlaylistDetailsPanel(), DisabledChipProps

### Community 49 - "MoreButton.tsx"
Cohesion: 0.30
Nodes (8): MoreDots(), MenuOption(), MenuOptionProps, Menu(), MenuOption, MenuProps, MoreButton(), MoreButtonProps

### Community 50 - "HeaderSearchInput.tsx"
Cohesion: 0.20
Nodes (12): SearchIcon(), useSearchHistory, SearchQueryState, useSearchQuery, EmptyState(), EmptyStateProps, MobileSearchInput(), HeaderSearchInput() (+4 more)

### Community 51 - "InitPage.tsx"
Cohesion: 0.27
Nodes (7): EditableArtistPickerContext, FADE_TRANSITION, HEIGHT_TRANSITION, PlaylistOwnerLabel(), PlaylistOwnerLabelProps, ArtistOrOwnerRow(), ArtistOrOwnerRowProps

### Community 52 - "SidebarSegment.tsx"
Cohesion: 0.36
Nodes (8): DropZoneProps, readAllDirectoryEntries(), readEntryFile(), resolveDroppedEntries(), resolveFolder(), AUDIO_ACCEPT, isSupportedAudioFile(), SUPPORTED_AUDIO_EXTENSIONS

### Community 53 - "PrivateLockWidget.tsx"
Cohesion: 0.16
Nodes (11): PrivateLockIcon(), PrivateLockIconProps, ShareIcon(), IconButton(), IconButtonProps, PrivatePlaylistIndicator(), ShareButton(), PrivateLockWidget() (+3 more)

### Community 55 - "useUISettings"
Cohesion: 0.60
Nodes (3): AudioSettings, useAudioSettings, AudioScreen()

### Community 56 - "TrackList.tsx"
Cohesion: 0.47
Nodes (5): computeGhostStyle(), computeRowStyle(), Drag, TrackDragApi, useTrackDrag()

### Community 57 - "PlaylistScreenWidget.tsx"
Cohesion: 0.33
Nodes (4): Version, VersionRequest, VersionResponse, ZpotifyAPI

### Community 58 - "PlaylistScreenWidget.tsx"
Cohesion: 0.20
Nodes (3): ListPlaylistsResponse, ListSongsResponse, mapToTrackPreviews()

### Community 59 - "EditControls.tsx"
Cohesion: 0.18
Nodes (16): SongRow(), SongRowArtist, SongRowProps, MetaScreen(), MetaScreenProps, computeCoverColor(), COVER_COLORS, formatTime() (+8 more)

### Community 60 - "PanelHeader.tsx"
Cohesion: 0.18
Nodes (11): UploadArrowSmallIcon(), EditTrackDialog(), EditTrackDialogProps, MetaDialog(), MetaDialogProps, SongListRefreshState, useSongListRefresh, DropZone() (+3 more)

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
Cohesion: 0.27
Nodes (6): CreatePlaylistIcon(), ChooseScreen(), CreatePlaylistCard(), CreatePlaylistCardProps, LibraryCard(), LibraryCardProps

### Community 65 - "PlayerBarSegment.tsx"
Cohesion: 0.14
Nodes (12): VolumeControlProps, getCachedAudio(), VolumeBarProps, VolumeDisplayProps, TrackProgressControlsProps, ArtistNamePart, AudioPlayer, AudioStoreState (+4 more)

### Community 66 - "compilerOptions"
Cohesion: 0.20
Nodes (9): compilerOptions, allowSyntheticDefaultImports, composite, module, moduleResolution, outDir, skipLibCheck, strict (+1 more)

### Community 67 - "zpotify_common.pb.ts"
Cohesion: 0.12
Nodes (17): GetUserSettings, GetUserSettingsRequest, GetUserSettingsResponse, Me, MeRequest, MeResponse, UserAPI, UserData (+9 more)

### Community 68 - "supportedAudio.ts"
Cohesion: 0.19
Nodes (8): DashedRingIcon(), DashedRingIconProps, SpinnerIcon(), DragOverDecoration(), DropZoneText(), DropZoneTextProps, IdleDecoration(), UploadingSpinner()

### Community 69 - "ZpotifyUI Development Manifesto"
Cohesion: 0.33
Nodes (5): AI Assistant Guidelines, Development Principles, Styling, Tech Stack & Architecture, ZpotifyUI Development Manifesto

### Community 70 - "DropZoneIcon.tsx"
Cohesion: 0.24
Nodes (12): interleave(), toAlbumItem(), toPlaylistItem(), uuidToSeed(), toSearchAlbumResult(), toSearchArtistResult(), toSearchPlaylistResult(), toSearchResponse() (+4 more)

### Community 71 - "LibraryGridScreenSkeleton.tsx"
Cohesion: 0.17
Nodes (11): ModalStep, DOT_STEPS, PanelHeader(), PanelHeaderProps, STEP_TITLES, BackButton(), BackButtonProps, StepDots() (+3 more)

### Community 72 - "package.json"
Cohesion: 0.40
Nodes (4): name, private, type, version

### Community 73 - "zpotify_common.pb.ts"
Cohesion: 0.21
Nodes (5): AlbumTag, CreatePlaylistResponse, UpdatePlaylistResponse, GenreChipsRow(), GenreChipsRowProps

### Community 89 - "useArtistHeroSegment.ts"
Cohesion: 0.15
Nodes (14): Artist, EditIcon(), EditIconProps, SaveIcon(), EditControls(), EditControlsProps, EditableArtistName(), EditableArtistNameProps (+6 more)

### Community 90 - "EditControls.tsx"
Cohesion: 0.28
Nodes (5): ClockIcon(), selectFlagEnabled(), Drag, MainContent(), MainContentProps

### Community 91 - ".preload"
Cohesion: 0.19
Nodes (17): cacheAudio(), cacheAudioUncoordinated(), cacheTracks(), clearAudioCache(), getTrackUrl(), inFlightCacheRequests, listCachedUrls(), uncacheAudio() (+9 more)

### Community 92 - "UploadCard.tsx"
Cohesion: 0.29
Nodes (6): HomeIcon(), NavSearchIcon(), UploadsIcon(), getNavIcon(), NavItem(), NavItemProps

### Community 93 - "SearchIcon.tsx"
Cohesion: 0.31
Nodes (6): useListSongs(), UseListSongsOptions, ZButton(), ZButtonProps, InfiniteSongsListProps, LazyLoadSongsList()

### Community 94 - "useLikedArtists.ts"
Cohesion: 0.36
Nodes (6): useLikedArtists, SidebarArtistsWidget(), SidebarArtistsWidgetProps, uuidToHslSeed(), ArtistChipsField(), ArtistChipsFieldProps

### Community 95 - "DropZoneIcon.tsx"
Cohesion: 0.28
Nodes (6): DropZoneTargetIcon(), DropZoneTargetIconProps, DropZoneUploadIcon(), DropZoneUploadIconProps, DropZoneIcon(), DropZoneIconProps

### Community 96 - "zpotify_common.pb.ts"
Cohesion: 0.47
Nodes (3): Errors, NotFoundScreen(), SkeletonLoadScreen()

### Community 97 - "FolderGroupHeader.tsx"
Cohesion: 0.32
Nodes (5): ChevronRightIcon(), FolderIcon(), FolderIconProps, FolderGroupHeader(), FolderGroupHeaderProps

### Community 98 - "GeneratedAvatar.tsx"
Cohesion: 0.40
Nodes (4): FeatureFlagId, GetFeatureFlags, GetFeatureFlagsRequest, GetFeatureFlagsResponse

### Community 99 - "SearchHistoryDropdown.test.tsx"
Cohesion: 0.29
Nodes (4): entries, fetchSpy, navigateSpy, setQuerySpy

### Community 101 - "DropdownCreateRow.tsx"
Cohesion: 0.40
Nodes (4): PlusIcon(), PlusIconProps, DropdownCreateRow(), DropdownCreateRowProps

## Knowledge Gaps
- **422 isolated node(s):** `localPlugin`, `name`, `private`, `version`, `type` (+417 more)
  These have ≤1 connection - possible missing edges or undocumented components.
- **10 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `useToaster()` connect `useToaster` to `zpotify_service_files.pb.ts`, `Dropdown.tsx`, `HomePage.ts`, `MainLayout.tsx`, `usePlayer.ts`, `DropZoneScreen.tsx`, `usePlaylistInfoSegment.ts`, `FilesList.tsx`, `useTrackDrafts.ts`, `audioCacheStore.ts`, `LazyLoadSongsList.tsx`, `UserWidget.tsx`, `AlbumTag`, `zpotify_service_artists.pb.ts`, `PrivateLockWidget.tsx`, `useUISettings`, `PanelHeader.tsx`, `supportedAudio.ts`, `useArtistHeroSegment.ts`, `EditControls.tsx`, `.preload`, `SearchIcon.tsx`?**
  _High betweenness centrality (0.056) - this node is a cross-community bridge._
- **Why does `AudioPlayerImpl` connect `AudioPlayerImpl` to `PlayerBarSegment.tsx`, `.preload`, `usePendingFiles.tsx`?**
  _High betweenness centrality (0.037) - this node is a cross-community bridge._
- **Why does `useDialog` connect `DropZoneScreen.tsx` to `zpotify_service_files.pb.ts`, `audioCacheStore.ts`, `MainLayout.tsx`, `TrackRow.tsx`, `usePlayer.ts`, `FilesList.tsx`, `useUISettings`, `.preload`, `PanelHeader.tsx`?**
  _High betweenness centrality (0.037) - this node is a cross-community bridge._
- **What connects `localPlugin`, `name`, `private` to the rest of the system?**
  _428 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `zpotify_service_files.pb.ts` be split into smaller, more focused modules?**
  _Cohesion score 0.09268292682926829 - nodes in this community are weakly interconnected._
- **Should `Dropdown.tsx` be split into smaller, more focused modules?**
  _Cohesion score 0.08866995073891626 - nodes in this community are weakly interconnected._
- **Should `HomePage.ts` be split into smaller, more focused modules?**
  _Cohesion score 0.1076923076923077 - nodes in this community are weakly interconnected._