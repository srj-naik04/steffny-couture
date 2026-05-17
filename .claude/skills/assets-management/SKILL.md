---
name: assets-management
description: Use this skill whenever working with images, fonts, icons, or any static asset in the Steffny Couture app. Fires for any file in `/assets/`, any `require()` of an image, any Supabase Storage upload code, or any decision about where an image should live. Enforces the asset categorisation, optimisation, storage choices, and the "ship-with-bundle vs storage" decision rule.
---

# Asset Management

The app has three categories of assets, each with different storage, sizing, and update strategies. Choose the right category before adding anything.

## The Three Categories

### Category 1 — Static brand assets (ship with the bundle)
- App icon, splash screen
- Welcome screen hero image
- About / studio photos
- Logo / wordmark variants
- Empty-state illustrations

**Storage:** `/assets/images/`, `/assets/icons/`
**Loaded via:** `require('@/assets/images/welcome-hero.jpg')`
**Updated via:** new app release (or EAS Update OTA if image is referenced by URL not require)
**Use when:** asset rarely changes (< quarterly) and must be available offline / before sign-in

### Category 2 — Dynamic brand assets (remote, swappable)
- "Recent work" gallery photos
- Seasonal hero variants
- Featured dress of the week
- Studio team photo on About screen (if it changes)

**Storage:** Supabase Storage, `public/gallery/` bucket
**Loaded via:** URL through `expo-image` with cache policy
**Updated via:** upload via Supabase dashboard or a manager-only screen
**Use when:** asset may change without a code release, and offline access not critical

### Category 3 — User-generated content
- Customer uploaded booking photos
- Staff-uploaded "before / after" comparison photos
- Profile avatars

**Storage:** Supabase Storage, private buckets (`booking-photos/`, `profile-avatars/`)
**Loaded via:** signed URLs (private) or public URL (avatars)
**Updated via:** users themselves through the app
**Use when:** user owns the content

## Decision Tree

```
Is the user going to upload this?
  ├─ Yes → Category 3 (Supabase Storage private)
  └─ No → does it need to load before sign-in / offline?
           ├─ Yes → Category 1 (ship with bundle)
           └─ No → does it change more than once a quarter?
                    ├─ Yes → Category 2 (Supabase Storage public)
                    └─ No → Category 1 (ship with bundle)
```

## Optimisation Rules

### Source format
- **Photographs**: source as JPG, target sRGB colour space, no Exif/metadata
- **UI graphics, logos, illustrations**: source as SVG, store SVG when possible
- **Icons**: always Lucide React Native components (no PNG icons except app icon)

### Sizing (the @2x / @3x reality)

Native apps render at three pixel densities. A 200x200 displayed image needs source files at:
- `@1x`: 200x200 (rarely used, fallback only)
- `@2x`: 400x400 (most current iPhones)
- `@3x`: 600x600 (Pro Max models)

Expo Image handles this automatically if you provide a `image.png`, `image@2x.png`, `image@3x.png` triple. For simplicity, **ship one large image** (3x the display size) and let `expo-image` downsample.

### Recommended source dimensions
| Use | Source size |
|---|---|
| Splash background | 2400 × 2400 (square — RN crops to screen) |
| Welcome hero | 2400 × 1600 |
| Studio / about photo | 2400 × 1600 |
| Gallery thumbnail | 1200 × 1200 |
| Gallery full-screen viewer | 2400 × 2400 |
| Avatar / profile | 800 × 800 |
| App icon | 1024 × 1024 |
| Adaptive icon foreground (Android) | 1024 × 1024 (content within centre 660×660) |

### Compression
Run every image through optimisation before shipping. Two options:
- **Manual**: drag through [Squoosh](https://squoosh.app) — MozJPEG at quality 75, strip metadata
- **Programmatic**: `sharp` in a build script (faster for many)

Target file sizes:
- Splash, hero: ≤ 200 KB
- Gallery image: ≤ 150 KB
- Avatar / thumbnail: ≤ 50 KB

A bundle bloated with unoptimised images is the #1 cause of slow cold starts.

## Naming Conventions

```
/assets/images/
  welcome-hero.jpg              ← kebab-case, descriptive
  about-studio.jpg
  empty-bookings-illustration.svg
  brand-wordmark.svg
  brand-wordmark-white.svg
  splash.png                    ← required name, used by expo-splash-screen
  icon.png                      ← required name, used as app icon
  adaptive-icon.png             ← required name, Android foreground
```

Never:
- `IMG_0023.JPG` (camera default)
- `image1.jpg`, `pic_final_final.jpg`
- Spaces in filenames
- Localised characters in filenames

## Loading Patterns

### Category 1: bundled, via require
```tsx
import { Image } from 'expo-image';

<Image
  source={require('@/assets/images/welcome-hero.jpg')}
  contentFit="cover"
  style={{ width: '100%', aspectRatio: 3 / 2 }}
  priority="high"
/>
```

### Category 2: remote, with blur placeholder
```tsx
const BLUR_HASH = 'L9AB*A4mIU%M9F%MM{xu00xu%M%M';

<Image
  source={{ uri: galleryImageUrl }}
  placeholder={{ blurhash: BLUR_HASH }}
  contentFit="cover"
  transition={200}
  cachePolicy="memory-disk"
  recyclingKey={galleryImageUrl}
/>
```

Always set `recyclingKey` on lists of images — without it, scrolling re-allocates memory.

### Category 3: signed URL for private storage
```tsx
const { data } = await supabase.storage
  .from('booking-photos')
  .createSignedUrl(path, 60 * 60);

<Image source={{ uri: data?.signedUrl }} ... />
```

Signed URLs expire (1 hour above). Refresh or generate them on demand for stale views.

## Adding a New Asset

### To bundle (Category 1)
1. Drop the optimised file in `/assets/images/<name>.jpg`
2. Reference via `require('@/assets/images/<name>.jpg')`
3. Commit
4. Bundle size impact: check `npx expo export` output if uncertain

### To Supabase Storage (Category 2)
1. Optimise locally first
2. Upload via Supabase dashboard to the public bucket
3. Record the public URL in `shop_settings` (e.g., `shop_settings.gallery_urls jsonb`)
4. Or hardcode if truly static, but Category 1 is better for that

### To private storage (Category 3)
- Always via the user flow (booking wizard, profile screen)
- Never manual upload — defeats the purpose of "user-generated"

## Fonts

- **Loaded via** `expo-font` + `useFonts()` hook in root layout
- **Sourced from** Google Fonts (Fraunces, Inter) — download .ttf files, commit to `/assets/fonts/`
- **Names** preserve the official font family (`Fraunces-SemiBold.ttf`, `Inter-Regular.ttf`)
- **Splash held** until fonts are loaded — otherwise text flickers between system font and brand font
- **Don't load all weights** — only those used: Fraunces 600 + 700, Inter 400 + 500 + 600

```tsx
// app/_layout.tsx
const [fontsLoaded] = useFonts({
  'Fraunces-SemiBold': require('@/assets/fonts/Fraunces-SemiBold.ttf'),
  'Fraunces-Bold': require('@/assets/fonts/Fraunces-Bold.ttf'),
  'Inter-Regular': require('@/assets/fonts/Inter-Regular.ttf'),
  'Inter-Medium': require('@/assets/fonts/Inter-Medium.ttf'),
  'Inter-SemiBold': require('@/assets/fonts/Inter-SemiBold.ttf'),
});

useEffect(() => {
  if (fontsLoaded) SplashScreen.hideAsync();
}, [fontsLoaded]);

if (!fontsLoaded) return null;
```

## Anti-Patterns

- ❌ **Importing unoptimised images** (anything > 500KB)
- ❌ **Storing user photos as base64 in the database** — always Supabase Storage
- ❌ **Hardcoding Supabase URLs in code** — use environment-aware helpers
- ❌ **Loading all gallery images on app start** — use `FlatList` with windowed rendering
- ❌ **Skipping `recyclingKey`** on `expo-image` in lists
- ❌ **Using `<Image>` from `react-native`** — always `expo-image` (caching, transitions, blurhash)
- ❌ **Storing fonts as remote URLs** — they must be local for predictable rendering
- ❌ **Putting splash/icon source files anywhere except `/assets/`** — Expo expects them there

## Getting Images from the Existing Webador Site

If the client's existing site has assets you want to use, the cleanest order:

1. **Ask the client for originals first** — they almost certainly have them on a phone or laptop, much higher quality than the web-compressed versions
2. **If they can't provide:** use the `/scripts/fetch-site-images.mjs` script to pull from the live site (strip the Webador transform params to get the largest available version)
3. **Always optimise after download** — Squoosh or sharp — the raw fetched files will be either too big or already over-compressed by Webador

The kit includes a starter script at `/scripts/fetch-site-images.mjs`. Run with `node scripts/fetch-site-images.mjs`. Outputs go to `/scripts/fetched-images/` (gitignored). Pick the few you want, optimise, move to `/assets/images/`.
