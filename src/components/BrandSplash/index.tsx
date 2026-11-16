import React from 'react';
import { KleenMark } from '../KleenMark';
import { SplashCaption, SplashRoot } from './styles';

interface BrandSplashProps {
  readonly caption?: string;
}

export function BrandSplash({
  caption,
}: BrandSplashProps): React.JSX.Element {
  return (
    <SplashRoot
      edges={['top', 'right', 'bottom', 'left']}
      accessibilityRole="progressbar"
      accessibilityLabel={caption}
    >
      <KleenMark variant="symbol" size={168} />
      {caption ? <SplashCaption>{caption}</SplashCaption> : null}
    </SplashRoot>
  );
}
