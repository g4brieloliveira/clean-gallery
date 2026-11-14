export interface DeleteConfirmModalProps {
  readonly visible: boolean;
  readonly pendingDeleteCount: number;
  readonly loading: boolean;
  readonly onCancel: () => void;
  readonly onConfirm: () => void;
}
