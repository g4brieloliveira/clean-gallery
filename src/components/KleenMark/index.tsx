import React from 'react';
import Svg, { Rect } from 'react-native-svg';
import {
  BRAND_PRIMARY,
  MARK_VIEWBOX,
  outlineCard,
  plate,
  solidCard,
  swipeStem,
} from './geometry';

export type KleenMarkVariant = 'icon' | 'symbol';

interface KleenMarkProps {
  readonly size?: number;
  /** `icon` = full-bleed brand plate + mark. `symbol` = mark only (for splash). */
  readonly variant?: KleenMarkVariant;
  readonly accessibilityLabel?: string;
}

function MarkShape({
  shape,
}: {
  readonly shape: {
    readonly x: number;
    readonly y: number;
    readonly width: number;
    readonly height: number;
    readonly rx: number;
    readonly fill: string;
    readonly stroke?: string;
    readonly strokeWidth?: number;
    readonly rotation: number;
    readonly originX: number;
    readonly originY: number;
  };
}): React.JSX.Element {
  return (
    <Rect
      x={shape.x}
      y={shape.y}
      width={shape.width}
      height={shape.height}
      rx={shape.rx}
      fill={shape.fill}
      stroke={shape.stroke}
      strokeWidth={shape.strokeWidth}
      transform={`rotate(${shape.rotation} ${shape.originX} ${shape.originY})`}
    />
  );
}

export function KleenMark({
  size = 96,
  variant = 'icon',
  accessibilityLabel = 'Kleen',
}: KleenMarkProps): React.JSX.Element {
  return (
    <Svg
      width={size}
      height={size}
      viewBox={`0 0 ${MARK_VIEWBOX} ${MARK_VIEWBOX}`}
      accessibilityRole="image"
      accessibilityLabel={accessibilityLabel}
    >
      {variant === 'icon' ? (
        <Rect
          x={plate.x}
          y={plate.y}
          width={plate.width}
          height={plate.height}
          fill={plate.fill}
        />
      ) : null}
      {/* Same mark geometry as kleen-mark.svg — only the plate differs by variant. */}
      <MarkShape shape={solidCard} />
      <MarkShape shape={outlineCard} />
      <MarkShape shape={swipeStem} />
    </Svg>
  );
}

export { BRAND_PRIMARY };
