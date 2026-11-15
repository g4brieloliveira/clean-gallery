import React from 'react';
import type { ImageStyle, StyleProp } from 'react-native';
import { BrandIcon, BrandRow, BrandWordmark } from './styles';

interface KleenBrandProps {
  readonly compact?: boolean;
  readonly iconStyle?: StyleProp<ImageStyle>;
}

export function KleenBrand({ compact = false, iconStyle }: KleenBrandProps): React.JSX.Element {
  return (
    <BrandRow accessibilityRole="header" accessibilityLabel="Kleen">
      <BrandIcon
        source={require('../../../assets/icon.png')}
        style={iconStyle}
        $compact={compact}
      />
      <BrandWordmark $compact={compact}>Kleen</BrandWordmark>
    </BrandRow>
  );
}

