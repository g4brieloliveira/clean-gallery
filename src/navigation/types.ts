import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { AlbumOption } from '../types/domain';

export type RootStackParamList = {
  Albums: undefined;
  Swipe: { album: AlbumOption };
  Settings: undefined;
};

export type AlbumsScreenProps = NativeStackScreenProps<RootStackParamList, 'Albums'>;
export type SwipeScreenProps = NativeStackScreenProps<RootStackParamList, 'Swipe'>;
export type SettingsScreenProps = NativeStackScreenProps<RootStackParamList, 'Settings'>;
