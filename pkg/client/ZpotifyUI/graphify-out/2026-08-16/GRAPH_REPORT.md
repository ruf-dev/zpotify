# Graph Report - ZpotifyUI  (2026-08-16)

## Corpus Check
- 343 files · ~63,365 words
- Verdict: corpus is large enough that graph structure adds value.

## Summary
- 1560 nodes · 3463 edges · 93 communities (83 shown, 10 thin omitted)
- Extraction: 99% EXTRACTED · 1% INFERRED · 0% AMBIGUOUS · INFERRED: 20 edges (avg confidence: 0.54)
- Token cost: 0 input · 0 output

## Graph Freshness
- Built from commit: `51a0349a`
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
- .preload
- UploadCard.tsx
- GeneratedAvatar.tsx
- Input.tsx

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
10. `buildCoverUrl()` - 21 edges

## Surprising Connections (you probably didn't know these)
- `SongSearchBoxProps` --references--> `SongBase`  [EXTRACTED]
  src/widgets/SongSearchBox/SongSearchBox.tsx → src/app/api/zpotify/zpotify_common.pb.ts
- `FileItemProps` --references--> `SongFile`  [EXTRACTED]
  src/dialogs/AddTrack/screens/components/FileItem/FileItem.tsx → src/app/api/zpotify/zpotify_common.pb.ts
- `EditableCoverWithFallback()` --calls--> `buildCoverUrl()`  [EXTRACTED]
  src/components/EditableCoverWithFallback/EditableCoverWithFallback.tsx → src/shared/lib/coverUrl.ts
- `UploadStatusChipProps` --references--> `TrackDraft`  [EXTRACTED]
  src/dialogs/MultitrackUpload/components/UploadStatusChip/UploadStatusChip.tsx → src/dialogs/MultitrackUpload/TrackRow.tsx
- `TrackRowProps` --references--> `ArtistItem`  [EXTRACTED]
  src/dialogs/MultitrackUpload/TrackRow.tsx → src/widgets/ArtistField/ArtistChipsField.tsx

## Import Cycles
- 3-file cycle: `src/entities/artist/useLikedArtists.ts -> src/shared/api/ArtistsService.ts -> src/widgets/ArtistField/ArtistChipsField.tsx -> src/entities/artist/useLikedArtists.ts`

## Communities (93 total, 10 thin omitted)

### Community 0 - "zpotify_service_files.pb.ts"
Cohesion: 0.08
Nodes (18): BatchDeleteFiles, BatchDeleteFilesRequest, BatchDeleteFilesResponse, CheckFilesByHashes, CheckFilesByHashesFoundFileByHash, CheckFilesByHashesRequest, CheckFilesByHashesResponse, DeleteFile (+10 more)

### Community 1 - "Dropdown.tsx"
Cohesion: 0.06
Nodes (38): AlbumTagKind, ArtistBase, HeartIcon(), HeartIconProps, LockIcon(), PlusIcon(), PlusIconProps, RemoveIcon() (+30 more)

### Community 2 - "HomePage.ts"
Cohesion: 0.05
Nodes (34): GetUserSettings, GetUserSettingsRequest, GetUserSettingsResponse, Me, MeRequest, MeResponse, UserAPI, UserData (+26 more)

### Community 3 - "MainLayout.tsx"
Cohesion: 0.12
Nodes (19): Path, Router(), LoginViaPass(), User(), AuthStatus, useUser, TelegramAuth(), EarlyAccessPage() (+11 more)

### Community 4 - "fetch.pb.ts"
Cohesion: 0.13
Nodes (16): b64, b64Encode(), fetchStreamingRequest(), FlattenedRequestPayload, flattenRequestPayload(), getNewLineDelimitedJSONDecodingStream(), getNotifyEntityArrivalSink(), isPlainObject() (+8 more)

### Community 5 - "usePlayer.ts"
Cohesion: 0.20
Nodes (12): RemoveTrackIcon(), CachedSongEntry, useCachedSongs(), AlbumGroup, CachedSongsAccordion(), groupSongsByAlbum(), matchesQuery(), AccordionHeader() (+4 more)

### Community 7 - "useToaster"
Cohesion: 0.11
Nodes (24): EditTrackDialog(), MetaDialog(), MetaDialogProps, MultitrackUploadModal(), useMultitrackSubmit(), SongEditDialog(), SongEditDialogProps, FeedRefreshState (+16 more)

### Community 8 - "Auth.ts"
Cohesion: 0.33
Nodes (3): AuthData, User, AuthMiddleware

### Community 9 - "DropZoneScreen.tsx"
Cohesion: 0.11
Nodes (23): DialogManager, useDialog, AddTrackDialog(), FilesList(), FilesListProps, GhostSong(), LogPassAuth(), AddTrackButton() (+15 more)

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
Nodes (20): Absent, Auth, AuthLogPass, AuthResponse, AuthTelegramOAuth, AuthViaAsync, AuthViaAsyncRequest, AuthViaAsyncResponse (+12 more)

### Community 14 - "useUser"
Cohesion: 0.06
Nodes (35): MiniClockIcon(), MiniDiscIcon(), CoverWithFallback(), CoverWithFallbackProps, GenerativeCover(), GenerativeCoverProps, PALETTES, ShapeFn (+27 more)

### Community 15 - "useSearchPage.ts"
Cohesion: 0.24
Nodes (11): FILTER_LABELS, FilterChipsProps, FilterKey, EMPTY_RESPONSE, UseSearchPageResult, SearchAlbumResult, SearchArtistResult, SearchFilters (+3 more)

### Community 16 - "SongEditDialog.tsx"
Cohesion: 0.16
Nodes (11): DragHandleIcon(), EditableTitleProps, TODO: switch to chures Input once it supports ref/onKeyDown, TODO: Make editable here and send update name for such files if changed, TrackRow(), TrackRowProps, canCleanTrackNumbers(), cleanTrackNumber() (+3 more)

### Community 17 - "usePlaylistInfoSegment.ts"
Cohesion: 0.15
Nodes (15): EditableAlbumName(), EditableAlbumNameProps, EditableArtistPickerContext, EditableYearProps, PlaylistOwnerLabel(), PlaylistOwnerLabelProps, TrackCountLabel(), TrackCountLabelProps (+7 more)

### Community 18 - "ArtistsService.ts"
Cohesion: 0.07
Nodes (23): ArtistsAPI, CreateArtist, CreateArtistRequest, CreateArtistResponse, GetArtistPage, GetArtistPageRequest, GetArtistPageResponse, LikeArtist (+15 more)

### Community 19 - "FilesList.tsx"
Cohesion: 0.21
Nodes (10): AddTrackContext, BACK_STEPS, SCREENS, ChooseScreen(), DropZoneScreen(), PendingFilesScreen(), usePendingFiles(), DroppedGroups (+2 more)

### Community 20 - "MultitrackUploadModal.tsx"
Cohesion: 0.16
Nodes (10): CheckIcon(), ChevronRightIcon(), FolderIcon(), FolderIconProps, RetryAllIcon(), FolderGroupHeader(), FolderGroupHeaderProps, AddTrackDialog (+2 more)

### Community 21 - "ArtistItem"
Cohesion: 0.50
Nodes (3): CreatePlaylistIcon(), CreatePlaylistCard(), CreatePlaylistCardProps

### Community 22 - "zpotify_service_playlist.pb.ts"
Cohesion: 0.11
Nodes (17): AddSongsToPlaylist, AddSongsToPlaylistResponse, AddSongToPlaylist, AddSongToPlaylistResponse, ChangeSongsOrder, ChangeSongsOrderResponse, CreatePlaylist, DeleteSong (+9 more)

### Community 23 - "PlaylistService.ts"
Cohesion: 0.10
Nodes (26): Search, SearchAlbumResult, SearchAPI, SearchArtistResult, SearchContainerPlaylist, SearchFilters, SearchPlaylistResult, SearchRequest (+18 more)

### Community 24 - "useDialog"
Cohesion: 0.28
Nodes (6): MusicFileIcon(), MusicFileIconProps, FileItem(), FileItemProps, LibraryCard(), LibraryCardProps

### Community 25 - "CachedSongsAccordion.tsx"
Cohesion: 0.06
Nodes (36): Artist, EditIcon(), EditIconProps, SaveIcon(), UploadArrowIcon(), ZLogoIcon(), CoverFieldProps, CoverUploadProgress() (+28 more)

### Community 26 - "useTrackDrafts.ts"
Cohesion: 0.16
Nodes (22): BatchUploadState, useBatchUpload(), MultitrackUploadModalProps, buildNewTracksFromFresh(), ClassifiedFile, classifyIncomingFiles(), createInitialTracks(), flattenDroppedInput() (+14 more)

### Community 27 - "PlaylistsLibrarySegment.tsx"
Cohesion: 0.15
Nodes (17): CardRow(), CardRowProps, ArtistScreenWidget(), toAlbumCardProps(), choosePlaylistComponent(), FeedDayGroup(), feedItemTransition, AlbumCard() (+9 more)

### Community 28 - "dependencies"
Cohesion: 0.11
Nodes (19): dependencies, classnames, framer-motion, grpc-web, @hookstate/core, music-metadata-browser, react, react-dom (+11 more)

### Community 29 - "index.ts"
Cohesion: 0.21
Nodes (12): Playlist, SongBase, DownloadIcon(), EditTrackDialogProps, ArtistSongsRowProps, Props, PlaylistInfoSegmentProps, UsePlaylistInfoSegmentParams (+4 more)

### Community 30 - "useUser.ts"
Cohesion: 0.07
Nodes (29): Absent, AlbumVersionMetadata, AlbumVersionMetadataVersionKind, BaseAlbumTag, OneOf, Paging, SongTag, SongTagKind (+21 more)

### Community 31 - "CommentsSection.tsx"
Cohesion: 0.32
Nodes (4): UserService, SongListPermissions, UserInfo, UserPermissions

### Community 32 - "audioCacheStore.ts"
Cohesion: 0.11
Nodes (21): ClockIcon(), GripIcon(), PlayTriangleIcon(), LikedSongsState, useLikedSongs, ZButton(), ZButtonProps, ArtistSongsRow() (+13 more)

### Community 33 - "zpotify_service_feature_flags.pb.ts"
Cohesion: 0.31
Nodes (7): FeatureFlag, FeatureFlagsAPI, FeatureFlagsStore, selectFlagEnabled(), useFeatureFlags, useFeatureFlagsQuery(), fetchFeatureFlags()

### Community 34 - "ChooseScreen.tsx"
Cohesion: 0.06
Nodes (34): MainLayout(), SidebarToggleIcon(), SegmentCarousel(), SegmentCarouselProps, StubRect, PlaylistListRefreshState, usePlaylistListRefresh, UISettings (+26 more)

### Community 35 - "TrackRow.tsx"
Cohesion: 0.12
Nodes (16): TargetPlaylist, PlaylistDetailsPanelProps, ArtistLookup, useArtistLookup(), MultitrackSubmitParams, MultitrackSubmitState, ToCreateTrack, buildValidationHint() (+8 more)

### Community 36 - "WebApi.ts"
Cohesion: 0.25
Nodes (9): isHttpCodeRetryable(), WithDescription(), WithHttpStatus(), WithStatusCode(), WithTitle(), ServiceErrorFromHttp(), WebApi, WebApiImpl (+1 more)

### Community 37 - "ArtistChipsField.tsx"
Cohesion: 0.11
Nodes (18): BatchCreateSong, BatchCreateSongRequest, BatchCreateSongResponse, CreateSong, CreateSongRequest, CreateSongResponse, GetSong, GetSongRequest (+10 more)

### Community 39 - "SongsService"
Cohesion: 0.18
Nodes (3): SongAPI, ISongsService, SongsService

### Community 40 - "LazyLoadSongsList.tsx"
Cohesion: 0.13
Nodes (14): AddSongsToPlaylistRequest, AddSongToPlaylistRequest, ChangeSongsOrderRequest, CreatePlaylistRequest, DeleteSongRequest, FollowPlaylistRequest, GetPlaylistRequest, ListPlaylistsRequest (+6 more)

### Community 41 - "MainContent.tsx"
Cohesion: 0.12
Nodes (20): FeedDay, GetFeed, GetFeedRequest, GetFeedResponse, HomeAPI, FeedService, IFeedService, toFeedArtistItem() (+12 more)

### Community 42 - "InfoControls.tsx"
Cohesion: 0.20
Nodes (10): ShareIcon(), IconButton(), IconButtonProps, InfoControlsProps, ShareButton(), ShuffleButton(), SaveButtonWidget(), SaveButtonWidgetProps (+2 more)

### Community 43 - "UserWidget.tsx"
Cohesion: 0.31
Nodes (9): BatchUploadSection(), BatchUploadSectionProps, isFolderSettled(), UploadingFileRowProps, folderProgress(), groupTracksByFolder(), TrackGroupSegment, TrackList() (+1 more)

### Community 44 - "BaseService.ts"
Cohesion: 0.18
Nodes (5): AuthAPI, apiPrefix(), InitReq, options, AuthViaTelegram()

### Community 45 - "AlbumTag"
Cohesion: 0.40
Nodes (3): initServiceWorker(), queryClient, ServiceError

### Community 46 - "usePendingFiles.tsx"
Cohesion: 0.31
Nodes (5): UploadArrowSmallIcon(), UploadDoneIcon(), UploadErrorIcon(), UploadStatusChip(), UploadStatusChipProps

### Community 47 - "zpotify_service_artists.pb.ts"
Cohesion: 0.20
Nodes (10): BellIcon(), BellIconProps, NotificationDialog(), SettingsDialog(), useNotifications, catchServiceError(), internalErrors, NotificationBellWidget() (+2 more)

### Community 48 - "ChipsField.tsx"
Cohesion: 0.27
Nodes (10): AuthRequest, AuthService, clearLocalStorage(), fromLocalStorage(), getLocalStorageAuthInfoKey(), IAuthService, saveToLocalStorage(), SessionInvalidatedCallback (+2 more)

### Community 49 - "MoreButton.tsx"
Cohesion: 0.30
Nodes (8): MoreDots(), MenuOption(), MenuOptionProps, Menu(), MenuOption, MenuProps, MoreButton(), MoreButtonProps

### Community 50 - "HeaderSearchInput.tsx"
Cohesion: 0.24
Nodes (8): SearchIcon(), SearchQueryState, useSearchQuery, EmptyState(), EmptyStateProps, MobileSearchInput(), MobileSearchButton(), HeaderSearchInput()

### Community 51 - "InitPage.tsx"
Cohesion: 0.12
Nodes (18): albumPath(), artistPath(), playlistPath(), ArtistCard(), ArtistCardProps, SectionLabel(), SectionLabelProps, TODO: standalone singles just play directly for now — give them their own page/f (+10 more)

### Community 52 - "SidebarSegment.tsx"
Cohesion: 0.20
Nodes (3): ListPlaylistsResponse, ListSongsResponse, mapToTrackPreviews()

### Community 53 - "PrivateLockWidget.tsx"
Cohesion: 0.25
Nodes (7): PrivateLockIcon(), PrivateLockIconProps, PrivatePlaylistIndicator(), PrivateLockWidget(), PrivateLockWidgetProps, usePrivateLockWidget(), UsePrivateLockWidgetParams

### Community 55 - "useUISettings"
Cohesion: 0.29
Nodes (8): AudioSettings, useAudioSettings, useAudioCacheStore, useCachedCount(), useDownloadProgress(), DownloadButtonWidget(), useDownloadButtonWidget(), AudioScreen()

### Community 56 - "TrackList.tsx"
Cohesion: 0.24
Nodes (9): SongFile, FetchServerFilesButton(), FetchServerFilesButtonProps, TrackListProps, computeGhostStyle(), computeRowStyle(), Drag, TrackDragApi (+1 more)

### Community 57 - "PlaylistScreenWidget.tsx"
Cohesion: 0.25
Nodes (4): Version, VersionRequest, VersionResponse, ZpotifyAPI

### Community 58 - "PlaylistScreenWidget.tsx"
Cohesion: 0.23
Nodes (11): isAlbum(), usePlaylistSongs(), AlbumPage(), PlaylistPage(), usePlaylist(), PlaylistService, computeTotalDuration(), mapPlaylistArtists() (+3 more)

### Community 59 - "EditControls.tsx"
Cohesion: 0.36
Nodes (7): computeCoverColor(), COVER_COLORS, formatTime(), PlayerBarSegment(), trackInfoKey(), useIsSongCached(), CachedIndicator()

### Community 60 - "PanelHeader.tsx"
Cohesion: 0.29
Nodes (5): PlayPauseButton(), PlayPauseButtonProps, TrackRewindButton, PlayerControls(), PlayerProps

### Community 61 - "scripts"
Cohesion: 0.20
Nodes (10): scripts, build, dev, gen, lint, lint:css, lint:fix, lint:js (+2 more)

### Community 62 - "PlayButton.tsx"
Cohesion: 0.28
Nodes (6): PauseIcon(), PauseIconProps, PlayIcon(), PlayIconProps, PlayButton(), PlayButtonProps

### Community 63 - "InitPage.tsx"
Cohesion: 0.33
Nodes (4): navigateSpy, playSpy, setSongInfoSpy, visibleTracks

### Community 64 - "AddTrackDialog.tsx"
Cohesion: 0.47
Nodes (3): getInitialMatches(), MediaQueryListStub, useIsMobile()

### Community 65 - "PlayerBarSegment.tsx"
Cohesion: 0.10
Nodes (18): AnimatedZ(), RandomArrows(), VolumeControlProps, LogoRow(), LogoRowProps, VolumeBarProps, VolumeDisplayProps, ShuffleTracksButton() (+10 more)

### Community 66 - "compilerOptions"
Cohesion: 0.20
Nodes (9): compilerOptions, allowSyntheticDefaultImports, composite, module, moduleResolution, outDir, skipLibCheck, strict (+1 more)

### Community 67 - "zpotify_common.pb.ts"
Cohesion: 0.25
Nodes (12): InitReq, getAuth(), setAuthMiddleware(), WebApiParams, withRetries(), ErrorReason, GrpcError, GrpcErrorDetails (+4 more)

### Community 68 - "supportedAudio.ts"
Cohesion: 0.09
Nodes (23): DashedRingIcon(), DashedRingIconProps, DropZoneTargetIcon(), DropZoneTargetIconProps, DropZoneUploadIcon(), DropZoneUploadIconProps, SpinnerIcon(), DragOverDecoration() (+15 more)

### Community 69 - "ZpotifyUI Development Manifesto"
Cohesion: 0.33
Nodes (5): AI Assistant Guidelines, Development Principles, Styling, Tech Stack & Architecture, ZpotifyUI Development Manifesto

### Community 70 - "DropZoneIcon.tsx"
Cohesion: 0.40
Nodes (4): FeatureFlagId, GetFeatureFlags, GetFeatureFlagsRequest, GetFeatureFlagsResponse

### Community 72 - "package.json"
Cohesion: 0.40
Nodes (4): name, private, type, version

### Community 73 - "zpotify_common.pb.ts"
Cohesion: 0.21
Nodes (5): AlbumTag, CreatePlaylistResponse, UpdatePlaylistResponse, GenreChipsRow(), GenreChipsRowProps

### Community 91 - ".preload"
Cohesion: 0.19
Nodes (12): cacheAudio(), cacheAudioUncoordinated(), cacheTracks(), clearAudioCache(), getCachedAudio(), getTrackUrl(), inFlightCacheRequests, listCachedUrls() (+4 more)

### Community 92 - "UploadCard.tsx"
Cohesion: 0.29
Nodes (6): HomeIcon(), NavSearchIcon(), UploadsIcon(), getNavIcon(), NavItem(), NavItemProps

### Community 98 - "GeneratedAvatar.tsx"
Cohesion: 0.60
Nodes (4): AvatarProps, generateColor(), GeneratedAvatar(), generateHash()

## Knowledge Gaps
- **409 isolated node(s):** `localPlugin`, `name`, `private`, `version`, `type` (+404 more)
  These have ≤1 connection - possible missing edges or undocumented components.
- **10 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `AudioPlayerImpl` connect `AudioPlayerImpl` to `PlayerBarSegment.tsx`, `.preload`?**
  _High betweenness centrality (0.060) - this node is a cross-community bridge._
- **Why does `useToaster()` connect `useToaster` to `Dropdown.tsx`, `HomePage.ts`, `MainLayout.tsx`, `usePlayer.ts`, `DropZoneScreen.tsx`, `usePlaylistInfoSegment.ts`, `FilesList.tsx`, `CachedSongsAccordion.tsx`, `useTrackDrafts.ts`, `index.ts`, `audioCacheStore.ts`, `ChooseScreen.tsx`, `TrackRow.tsx`, `InfoControls.tsx`, `zpotify_service_artists.pb.ts`, `PrivateLockWidget.tsx`, `useUISettings`, `TrackList.tsx`, `PlaylistScreenWidget.tsx`, `supportedAudio.ts`?**
  _High betweenness centrality (0.049) - this node is a cross-community bridge._
- **Why does `useDialog` connect `DropZoneScreen.tsx` to `audioCacheStore.ts`, `MainLayout.tsx`, `supportedAudio.ts`, `usePlayer.ts`, `useToaster`, `zpotify_service_artists.pb.ts`, `FilesList.tsx`, `MultitrackUploadModal.tsx`, `useUISettings`, `index.ts`?**
  _High betweenness centrality (0.031) - this node is a cross-community bridge._
- **What connects `localPlugin`, `name`, `private` to the rest of the system?**
  _415 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `zpotify_service_files.pb.ts` be split into smaller, more focused modules?**
  _Cohesion score 0.08333333333333333 - nodes in this community are weakly interconnected._
- **Should `Dropdown.tsx` be split into smaller, more focused modules?**
  _Cohesion score 0.056261343012704176 - nodes in this community are weakly interconnected._
- **Should `HomePage.ts` be split into smaller, more focused modules?**
  _Cohesion score 0.052525252525252523 - nodes in this community are weakly interconnected._