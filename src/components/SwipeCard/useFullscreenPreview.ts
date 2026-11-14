import { useCallback, useState } from 'react';

interface UseFullscreenPreviewResult {
  readonly previewOpen: boolean;
  readonly openPreview: (displayUri: string | null) => void;
  readonly closePreview: () => void;
}

export function useFullscreenPreview(): UseFullscreenPreviewResult {
  const [previewOpen, setPreviewOpen] = useState(false);

  const openPreview = useCallback((displayUri: string | null) => {
    if (!displayUri) return;
    setPreviewOpen(true);
  }, []);

  const closePreview = useCallback(() => {
    setPreviewOpen(false);
  }, []);

  return { previewOpen, openPreview, closePreview };
}
