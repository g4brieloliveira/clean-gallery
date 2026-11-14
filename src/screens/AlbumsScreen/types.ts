export type AlbumsPermissionPhase = 'checking' | 'denied' | 'ready' | 'error';

export interface AlbumsScreenViewState {
  readonly permissionPhase: AlbumsPermissionPhase;
  readonly loadingAlbums: boolean;
  readonly loadingAssets: boolean;
  readonly errorMessage: string | null;
}
