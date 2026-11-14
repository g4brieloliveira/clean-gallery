export interface BottomActionBarProps {
  readonly deleteCount: number;
  readonly keepCount: number;
  readonly remaining: number;
  readonly onDeletePress: () => void;
  readonly onKeepPress: () => void;
  readonly disabled: boolean;
}
