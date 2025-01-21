import React, { memo } from 'react';
import { StyleSheet, View, ViewStyle } from 'react-native';
import { Card as PaperCard } from 'react-native-paper';

import { Colors } from '../../constants/Colors';

interface CardProps {
  children: React.ReactNode;
  style?: ViewStyle;
}

export const Card = memo(({ children, style }: CardProps) => (
  <PaperCard style={[styles.card, style]}>
    <PaperCard.Content>{children}</PaperCard.Content>
  </PaperCard>
));

const styles = StyleSheet.create({
  card: {
    backgroundColor: Colors.dark.surface,
    marginHorizontal: 16,
    marginVertical: 8,
    elevation: 2,
  },
});
