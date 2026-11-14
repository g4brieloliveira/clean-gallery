import { Ionicons } from '@expo/vector-icons';
import React, { useCallback, useEffect, useState } from 'react';
import type { AlbumListItemProps } from './types';
import { Chevron, CoverThumb, FallbackIconWrap, IconWrap, Row, Subtitle, TextBlock, Title } from './styles';

export function AlbumListItem(props: AlbumListItemProps): React.JSX.Element {
  const { id, title, subtitle, icon, highlightIcon, coverUri, onPress } = props;
  const [coverFailed, setCoverFailed] = useState(false);

  const handlePress = useCallback(() => {
    onPress(id);
  }, [id, onPress]);

  useEffect(() => {
    setCoverFailed(false);
  }, [coverUri]);

  const iconColor = highlightIcon ? '#000000' : '#FFFFFF';

  return (
    <Row onPress={handlePress} activeOpacity={0.75}>
      <IconWrap $highlight={highlightIcon}>
        {coverUri && !coverFailed ? (
          <CoverThumb
            source={{ uri: coverUri }}
            resizeMode="cover"
            accessibilityIgnoresInvertColors
            onError={() => setCoverFailed(true)}
          />
        ) : (
          <FallbackIconWrap>
            <Ionicons name={icon} size={22} color={iconColor} />
          </FallbackIconWrap>
        )}
      </IconWrap>
      <TextBlock>
        <Title numberOfLines={1}>{title}</Title>
        <Subtitle numberOfLines={1}>{subtitle}</Subtitle>
      </TextBlock>
      <Chevron>›</Chevron>
    </Row>
  );
}
