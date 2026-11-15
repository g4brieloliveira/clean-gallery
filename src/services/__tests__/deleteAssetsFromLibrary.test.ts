import * as MediaLibrary from 'expo-media-library/legacy';
import { deleteAssetsFromLibrary } from '../mediaLibraryService';

jest.mock('expo-media-library/legacy', () => ({
  deleteAssetsAsync: jest.fn(),
  getAssetInfoAsync: jest.fn(),
  MediaType: { photo: 'photo', video: 'video' },
  SortBy: { creationTime: 'creationTime' },
}));

const deleteAssetsAsync = MediaLibrary.deleteAssetsAsync as jest.Mock;
const getAssetInfoAsync = MediaLibrary.getAssetInfoAsync as jest.Mock;

describe('deleteAssetsFromLibrary', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('returns only ids that disappeared after a successful call (CG-33/CG-39)', async () => {
    deleteAssetsAsync.mockResolvedValue(undefined);
    getAssetInfoAsync.mockImplementation(async (id: string) => {
      if (id === 'remain') return { id: 'remain' };
      throw new Error('missing');
    });

    const result = await deleteAssetsFromLibrary(['gone', 'remain']);
    expect(result.deletedIds).toEqual(['gone']);
    expect(result.remainingIds).toEqual(['remain']);
    expect(result.cancelled).toBe(false);
  });

  it('treats cancel/throw with nothing deleted as cancelled (CG-33/CG-39)', async () => {
    deleteAssetsAsync.mockRejectedValue(new Error('User cancelled'));
    getAssetInfoAsync.mockImplementation(async (id: string) => ({ id }));

    const result = await deleteAssetsFromLibrary(['a', 'b']);
    expect(result.deletedIds).toEqual([]);
    expect(result.remainingIds).toEqual(['a', 'b']);
    expect(result.cancelled).toBe(true);
  });
});
