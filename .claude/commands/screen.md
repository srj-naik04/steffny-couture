---
description: Scaffold a new Expo Router screen with loading, empty, and error states ready.
argument-hint: <route-path e.g. (customer)/bookings/index>
---

# New Screen: $1

Create the screen at `/app/$1.tsx` following the project's screen template.

## Mandatory structure
Every screen must define **all four states**:

1. **Loading** — skeleton (never a spinner-only state)
2. **Empty** — `<EmptyState>` with title, body, CTA
3. **Error** — recoverable, with "Try again" action
4. **Loaded** — the actual content

## Template

```tsx
import { useEffect } from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ScrollView, RefreshControl } from 'react-native';
import { Box, Text, EmptyState, Skeleton, ErrorView } from '@/components/ui';
import { colors } from '@/constants/brand';
// import the hook you need from @/features/...

export default function ScreenName() {
  const { data, isLoading, isError, refetch, isFetching } = useSomething();

  if (isLoading) {
    return (
      <SafeAreaView edges={['top']} className="flex-1 bg-ivory">
        <Box className="px-5 pt-4 gap-3">
          <Skeleton className="h-8 w-40" />
          <Skeleton className="h-24 w-full" />
          <Skeleton className="h-24 w-full" />
        </Box>
      </SafeAreaView>
    );
  }

  if (isError) {
    return (
      <SafeAreaView edges={['top']} className="flex-1 bg-ivory">
        <ErrorView
          title="Something didn't load"
          body="Check your connection and try again."
          onRetry={refetch}
        />
      </SafeAreaView>
    );
  }

  if (!data || data.length === 0) {
    return (
      <SafeAreaView edges={['top']} className="flex-1 bg-ivory">
        <EmptyState
          title="Nothing here yet"
          body="When you have items, they'll appear here."
          ctaLabel="Take action"
          onCta={() => {}}
        />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView edges={['top']} className="flex-1 bg-ivory">
      <ScrollView
        contentContainerClassName="px-5 pt-4 pb-12"
        refreshControl={
          <RefreshControl refreshing={isFetching} onRefresh={refetch} tintColor={colors.rose} />
        }
      >
        {/* content */}
      </ScrollView>
    </SafeAreaView>
  );
}
```

## Rules (auto-load `expo-react-native` and `steffny-brand` skills)
- Never import directly from `react-native` — use `/components/ui` primitives
- Brand voice in all copy (no exclamation marks, no "Oops!")
- Use NativeWind classes; no `StyleSheet`
- Pull-to-refresh on all list screens
- Safe area handled
- Status bar adapts to screen

## After scaffolding
1. Show the file
2. Wire up the data source (hook from `/features/...`)
3. If a new hook is needed, point that out and offer to scaffold it
4. Note any new components needed and offer to scaffold those
