import { Redirect, useLocalSearchParams } from 'expo-router';

export default function GameIndex() {
  const { id: rawId } = useLocalSearchParams<{ id: string }>();
  const id = Array.isArray(rawId) ? rawId[0] : rawId;

  if (!id) return null;

  return (
    <Redirect
      href={{
        pathname: '/game/[id]/round',
        params: { id },
      }}
    />
  );
}
