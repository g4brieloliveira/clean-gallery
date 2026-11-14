import type { GalleryAsset, SwipeOutcome } from '../../types/domain';

export interface SwipeCardProps {
  readonly asset: GalleryAsset;
  readonly cardWidth: number;
  readonly cardHeight: number;
  readonly swipeThreshold: number;
  readonly onCommit: (outcome: SwipeOutcome) => void;
  readonly onAssetLoadFailed?: () => void;
  readonly disabled: boolean;
}
