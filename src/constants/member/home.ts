import { Dimensions } from 'react-native';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

export const CARD_MARGIN = 16;
export const CARD_WIDTH = SCREEN_WIDTH - CARD_MARGIN * 2;
export const CARD_HEIGHT = 140;
export const EXPIRED_CARD_HEIGHT = 320;
export const PROGRESS_HEIGHT = 6;
