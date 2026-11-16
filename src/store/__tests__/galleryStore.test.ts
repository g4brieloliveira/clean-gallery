import type { AlbumOption, GalleryAsset } from '../../types/domain';
import {
  __resetSessionIdCounterForTests,
  useGalleryStore,
} from '../galleryStore';

jest.mock('../../services/mediaLibraryService', () => ({
  clearResolvedUriCache: jest.fn(),
}));

jest.mock('../mediaReadinessStore', () => ({
  useMediaReadinessStore: {
    getState: () => ({
      clearAll: jest.fn(),
    }),
  },
}));

function asset(id: string): GalleryAsset {
  return {
    id,
    uri: `file://${id}.jpg`,
    width: 100,
    height: 100,
    creationTime: 1,
    mediaType: 'photo',
  };
}

function album(overrides?: Partial<AlbumOption>): AlbumOption {
  return {
    id: 'album:test',
    title: 'Test',
    subtitle: '1',
    assetCount: 3,
    mode: 'album',
    libraryAlbumId: 'lib-1',
    highlightIcon: false,
    coverUri: null,
    ...overrides,
  };
}

function resetStore(): void {
  __resetSessionIdCounterForTests();
  useGalleryStore.setState({
    keptAssetIds: [],
    validatedAlbumIds: [],
    toDeleteIds: [],
    hasSeenOnboarding: true,
    sessionSelection: null,
    sessionId: 0,
    sourceLoadState: 'paginationComplete',
    queue: [],
    currentIndex: 0,
    sessionDeleteCount: 0,
    sessionKeepCount: 0,
    sessionFailedCount: 0,
    sessionRemovedCount: 0,
    history: [],
    hasHydrated: true,
  });
}

describe('galleryStore', () => {
  beforeEach(() => {
    resetStore();
  });

  it('keeps, deletes, undoes, defers, and starts a new session (CG-37)', () => {
    const a = album();
    const sessionId = useGalleryStore.getState().beginSession({
      album: a,
      assets: [asset('1'), asset('2'), asset('3')],
    });
    expect(sessionId).toBe(1);
    expect(useGalleryStore.getState().queue.map((x) => x.id)).toEqual(['1', '2', '3']);

    useGalleryStore.getState().applySwipe('keep', '1');
    expect(useGalleryStore.getState().keptAssetIds).toEqual(['1']);
    expect(useGalleryStore.getState().sessionKeepCount).toBe(1);

    useGalleryStore.getState().applySwipe('delete', '2');
    expect(useGalleryStore.getState().toDeleteIds).toEqual(['2']);
    expect(useGalleryStore.getState().sessionDeleteCount).toBe(1);

    useGalleryStore.getState().undoLast();
    expect(useGalleryStore.getState().toDeleteIds).toEqual([]);
    expect(useGalleryStore.getState().currentIndex).toBe(1);

    useGalleryStore.getState().deferCurrentToEnd();
    expect(useGalleryStore.getState().queue.map((x) => x.id)).toEqual(['1', '3', '2']);
    expect(useGalleryStore.getState().queue[useGalleryStore.getState().currentIndex]?.id).toBe('3');

    useGalleryStore.getState().beginSession({
      album: a,
      assets: [asset('1'), asset('9')],
    });
    // kept "1" filtered out of a normal album session
    expect(useGalleryStore.getState().queue.map((x) => x.id)).toEqual(['9']);
    expect(useGalleryStore.getState().sessionId).toBe(2);
  });

  it('clears history after confirmed delete so undo cannot revive removed media (CG-26/CG-38)', () => {
    useGalleryStore.getState().beginSession({
      album: album(),
      assets: [asset('a'), asset('b'), asset('c'), asset('d')],
    });
    useGalleryStore.getState().applySwipe('delete', 'a');
    useGalleryStore.getState().applySwipe('keep', 'b');
    useGalleryStore.getState().applySwipe('delete', 'c');
    expect(useGalleryStore.getState().history).toHaveLength(3);

    useGalleryStore.getState().applyConfirmedDeletes(['a', 'c']);
    const state = useGalleryStore.getState();
    expect(state.history).toEqual([]);
    expect(state.toDeleteIds).toEqual([]);
    expect(state.queue.map((x) => x.id)).toEqual(['b', 'd']);
    expect(state.keptAssetIds).not.toContain('a');
    expect(state.sessionRemovedCount).toBe(2);

    useGalleryStore.getState().undoLast();
    expect(useGalleryStore.getState().history).toEqual([]);
    expect(useGalleryStore.getState().queue.map((x) => x.id)).toEqual(['b', 'd']);
  });

  it('keeps remaining pending deletes on partial confirmation (CG-33/CG-39)', () => {
    useGalleryStore.getState().beginSession({
      album: album(),
      assets: [asset('1'), asset('2'), asset('3')],
    });
    useGalleryStore.getState().applySwipe('delete', '1');
    useGalleryStore.getState().applySwipe('delete', '2');
    useGalleryStore.getState().applySwipe('delete', '3');

    useGalleryStore.getState().applyConfirmedDeletes(['1']);
    const state = useGalleryStore.getState();
    expect(state.toDeleteIds).toEqual(['2', '3']);
    expect(state.queue.map((x) => x.id)).toEqual(['2', '3']);
    expect(state.history).toEqual([]);
  });

  it('ignores appends from a stale session (CG-27/CG-40)', () => {
    const idA = useGalleryStore.getState().beginSession({
      album: album({ id: 'album:a', libraryAlbumId: 'a' }),
      assets: [asset('a1')],
      sourceLoadState: 'loading',
    });
    const idB = useGalleryStore.getState().beginSession({
      album: album({ id: 'album:b', libraryAlbumId: 'b' }),
      assets: [asset('b1')],
      sourceLoadState: 'loading',
    });
    expect(idA).not.toBe(idB);

    useGalleryStore.getState().appendToQueue([asset('a2')], idA);
    expect(useGalleryStore.getState().queue.map((x) => x.id)).toEqual(['b1']);

    useGalleryStore.getState().appendToQueue([asset('b2')], idB);
    expect(useGalleryStore.getState().queue.map((x) => x.id)).toEqual(['b1', 'b2']);
  });

  it('dedupes append batches and filters kept (CG-44)', () => {
    useGalleryStore.setState({ keptAssetIds: ['k1'] });
    const sessionId = useGalleryStore.getState().beginSession({
      album: album(),
      assets: [asset('1')],
    });
    useGalleryStore.getState().appendToQueue([asset('2'), asset('2'), asset('k1'), asset('1')], sessionId);
    expect(useGalleryStore.getState().queue.map((x) => x.id)).toEqual(['1', '2']);
  });

  it('marks album validated only when pagination completed (CG-29/CG-41/CG-42)', () => {
    const a = album();
    useGalleryStore.getState().beginSession({
      album: a,
      assets: [asset('1')],
      sourceLoadState: 'loading',
    });
    useGalleryStore.getState().markAlbumValidated(a.id);
    expect(useGalleryStore.getState().validatedAlbumIds).toEqual([]);

    useGalleryStore.getState().setSourceLoadState('partialByLimit', useGalleryStore.getState().sessionId);
    useGalleryStore.getState().markAlbumValidated(a.id);
    expect(useGalleryStore.getState().validatedAlbumIds).toEqual([]);

    useGalleryStore
      .getState()
      .setSourceLoadState('paginationComplete', useGalleryStore.getState().sessionId);
    useGalleryStore.getState().markAlbumValidated(a.id);
    expect(useGalleryStore.getState().validatedAlbumIds).toEqual([a.id]);
  });

  it('ignores stale source-load state updates (CG-28)', () => {
    const idA = useGalleryStore.getState().beginSession({
      album: album(),
      assets: [asset('1')],
      sourceLoadState: 'loading',
    });
    useGalleryStore.getState().beginSession({
      album: album({ id: 'album:other' }),
      assets: [asset('2')],
      sourceLoadState: 'loading',
    });
    useGalleryStore.getState().setSourceLoadState('paginationComplete', idA);
    expect(useGalleryStore.getState().sourceLoadState).toBe('loading');
  });

  it('reconciles kept and pending ids that no longer exist (CG-30/CG-43)', () => {
    useGalleryStore.setState({
      keptAssetIds: ['live', 'gone'],
      toDeleteIds: ['pending-live', 'pending-gone'],
    });
    useGalleryStore.getState().reconcileKeptAssetIds(['live', 'pending-live']);
    expect(useGalleryStore.getState().keptAssetIds).toEqual(['live']);
    expect(useGalleryStore.getState().toDeleteIds).toEqual(['pending-live']);
  });

  it('allows the onboarding to be shown again from Settings (CG-112)', () => {
    expect(useGalleryStore.getState().hasSeenOnboarding).toBe(true);
    useGalleryStore.getState().resetOnboarding();
    expect(useGalleryStore.getState().hasSeenOnboarding).toBe(false);
  });

  it('does not reopen pending deletes in physical album sessions', () => {
    useGalleryStore.setState({ toDeleteIds: ['pending'] });
    const sessionId = useGalleryStore.getState().beginSession({
      album: album(),
      assets: [asset('pending'), asset('fresh')],
      sourceLoadState: 'loading',
    });
    expect(useGalleryStore.getState().queue.map((item) => item.id)).toEqual([
      'fresh',
    ]);

    useGalleryStore
      .getState()
      .appendToQueue([asset('pending'), asset('later')], sessionId);
    expect(useGalleryStore.getState().queue.map((item) => item.id)).toEqual([
      'fresh',
      'later',
    ]);
  });

  it('keeps pending deletes visible in their virtual album', () => {
    useGalleryStore.setState({ toDeleteIds: ['pending'] });
    useGalleryStore.getState().beginSession({
      album: album({ id: 'pending-delete', mode: 'pendingDelete' }),
      assets: [asset('pending')],
    });
    expect(useGalleryStore.getState().queue.map((item) => item.id)).toEqual([
      'pending',
    ]);
  });
});
