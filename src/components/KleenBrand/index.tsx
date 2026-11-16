import React from 'react';
import { KleenMark } from '../KleenMark';
import { BrandMarkFrame, BrandRow, BrandWordmark } from './styles';

interface KleenBrandProps {
  readonly compact?: boolean;
}

export function KleenBrand({
  compact = false,
}: KleenBrandProps): React.JSX.Element {
  return (
    <BrandRow accessibilityRole="header" accessibilityLabel="Kleen">
      <BrandMarkFrame $compact={compact}>
        <KleenMark variant="icon" size={compact ? 28 : 36} />
      </BrandMarkFrame>
      <BrandWordmark $compact={compact}>Kleen</BrandWordmark>
    </BrandRow>
  );
}
