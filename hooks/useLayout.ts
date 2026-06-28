import { useWindowDimensions } from 'react-native';

/** Shortest edge at or above this is treated as a tablet. */
const TABLET_MIN = 600;

/** Width at or above this enables wide / landscape-style layouts. */
const WIDE_MIN = 900;

/** Max content width on tablet for readable centered layouts. */
export const TABLET_CONTENT_MAX = 960;

export function useLayout() {
  const { width, height } = useWindowDimensions();
  const shortest = Math.min(width, height);
  const isTablet = shortest >= TABLET_MIN;
  const isWide = width >= WIDE_MIN;
  const contentPadding = isTablet ? 24 : 16;
  const splitGap = isTablet ? 20 : 0;

  return {
    width,
    height,
    isTablet,
    isWide,
    contentPadding,
    splitGap,
    contentMaxWidth: isTablet ? TABLET_CONTENT_MAX : undefined,
  };
}
