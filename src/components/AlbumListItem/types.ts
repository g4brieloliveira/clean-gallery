import type { AlbumOptionId } from '../../types/domain';

export type AlbumListIconName =
  | 'shuffle'
  | 'checkmark-done-outline'
  | 'videocam-outline'
  | 'camera-outline'
  | 'phone-portrait-outline'
  | 'chatbubble-ellipses-outline'
  | 'download-outline'
  | 'person-outline';

export interface AlbumListItemProps {
  readonly id: AlbumOptionId;
  readonly title: string;
  readonly subtitle: string;
  readonly icon: AlbumListIconName;
  readonly highlightIcon: boolean;
  /** When set, shown as square thumbnail instead of the generic icon. */
  readonly coverUri: string | null;
  readonly onPress: (id: AlbumOptionId) => void;
}
