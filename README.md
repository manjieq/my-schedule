# My Schedule

A class-timetable builder for Android. Enter your classes by hand, toggle which
ones count, see the week laid out with clashes and a credit total, save
combinations as loadouts and compare them side by side.

Completely offline by design: no account, no server, no sync, no analytics, no
network permission. Everything stays on the phone.

## Requirements

- Node 20+ and npm
- JDK 17 (this project builds with `openjdk@17`; linuxbrew works)
- Android SDK command-line tools and platform-tools on `PATH`
- A physical Android device, or an emulator image

There is no EAS, Expo account, or cloud build anywhere in this project. Every
build is local.

## Running it

```bash
npm install
```

The app uses native modules that Expo Go cannot provide (media library, view
shot, screen orientation), so it needs a development build rather than Expo Go.

```bash
# build and install a debug build on a connected device
cd android && ./gradlew assembleDebug
adb install -r app/build/outputs/apk/debug/app-debug.apk

# then serve the JS
adb reverse tcp:8081 tcp:8081
npx expo start --dev-client
```

The debug variant carries `applicationIdSuffix '.debug'`, so it installs
**alongside** a release build rather than replacing it. That matters: the two
are signed with different keys, so without the suffix the only way to install a
debug build over an installed release is to uninstall it first, which erases the
schedule — there is no cloud copy of anything.

## Release build

Signing config lives in `keystore.properties` at the repo root (gitignored) and
is hand-edited into `android/app/build.gradle`, along with the debug
`applicationIdSuffix`. A `prebuild --clean` regenerates that file and drops both
edits; restore them from git history if that ever happens.

```bash
cd android && ./gradlew assembleRelease
```

Output lands in `android/app/build/outputs/apk/release/`.

The release is pinned to `arm64-v8a` only, with minification and resource
shrinking on and the GIF/WebP decoders disabled, to keep the APK small enough to
pass around directly. Icons are imported from `@expo/vector-icons/Ionicons`
rather than the barrel export for the same reason — the barrel bundles every
icon font family.

On a memory-constrained machine, close browsers and IDEs first, then retry with
`--no-daemon --max-workers=1`. Do not shrink `-Dorg.gradle.jvmargs` metaspace
much below the project's own 512m default: too small and the build hangs rather
than failing cleanly.

## Checks

```bash
npm run typecheck   # tsc --noEmit
npm run lint        # expo lint
npm test            # jest
```

Tests cover the pure scheduling logic only — conflict detection, overlap
layout, credit maths, colour assignment, loadout diffing. Nothing under
`src/app/` or `src/components/` has automated coverage, so UI changes are
verified by hand on a device.

## Layout

```
src/app/            expo-router routes
  (tabs)/index      the Schedule board — the landing screen
  (tabs)/classes    the class list
  (tabs)/loadouts   saved loadouts and comparison
  class-form        add/edit a class (modal)
  save-loadout      name and save the current week (modal)
  settings          theme, credit cap, erase all (modal)
  loadout-compare   full-screen landscape comparison
src/components/     UI, grouped by area
src/lib/            domain logic, storage, theme tokens
assets/fonts/       bundled Archivo + Courier Prime
assets/stamps/      the verdict stamp rasters
```

## Design

The interface follows a documented visual direction — a production call sheet.
Colour tokens are declared once per scheme in `src/global.css` and exposed
through `tailwind.config.js`; components use the semantic names (`bg-stock`,
`text-ink-2`) and never raw Tailwind neutrals. The values that React Native APIs
need as literals are mirrored in `src/lib/theme.ts` and must be kept in step.

Class names, instructors and rooms are Korean, so the bundled Latin faces are
never applied to user-entered content — see `PRODUCT.md` for the full
constraint.
