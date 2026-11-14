# My Schedule

A class-timetable builder for Android. Enter your classes by hand, toggle which
ones count, see the week laid out with clashes and a credit total, save
combinations as loadouts and compare them side by side.

It also shows the ERICA campus shuttle: hold the Schedule key (the first key
in the bottom row) and the Schedule tab switches to the next bus from your stop;
tap the key to go back to the board. **FULL TIMETABLE** opens the whole day's
table for that stop.

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

Tests cover the pure logic only — conflict detection, overlap layout, credit
maths, colour assignment, loadout diffing, and the shuttle timetable (which
table applies on a date, holidays, the next-bus reading, and spot checks of the
transcribed timetable against the PDF). Nothing under
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
  settings          theme, credit cap, shuttle timetable, erase all (modal)
  loadout-compare   full-screen landscape comparison
src/components/     UI, grouped by area (bus/ is the shuttle panel)
src/lib/            domain logic, storage, theme tokens
assets/fonts/       bundled Archivo + Courier Prime
assets/stamps/      the verdict stamp rasters
```

## Shuttle timetable

The shuttle times are bundled in `src/lib/bus-timetable.ts`, transcribed from
the university's shuttle PDF (semester, seasonal session and vacation tables,
weekday and weekend). The app never fetches anything, so a new timetable means
editing that file and building again; `src/lib/bus.test.ts` pins a sample of
cells and will need the same update.

Which table applies is guessed from the date in `src/lib/bus.ts`
(`guessPeriod`): semester from Mar 1 to Jun 21 and Sep 1 to Dec 21, seasonal
session from Jun 22 to Jul 15 and Dec 22 to Jan 15, vacation otherwise. These
are estimates. The readout always names the table in use, and Settings →
Shuttle timetable overrides it until the guess next changes. Korean public
holidays (2026 and 2027, substitute days included) run the weekend table; add
the next year's dates to `HOLIDAYS` in the same file.

## Design

The interface follows a documented visual direction — a production call sheet.
Colour tokens are declared once per scheme in `src/global.css` and exposed
through `tailwind.config.js`; components use the semantic names (`bg-stock`,
`text-ink-2`) and never raw Tailwind neutrals. The values that React Native APIs
need as literals are mirrored in `src/lib/theme.ts` and must be kept in step.

Class names, instructors and rooms are Korean, so the bundled Latin faces are
never applied to user-entered content — see `PRODUCT.md` for the full
constraint.
