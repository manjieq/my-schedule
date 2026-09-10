# Product

<!-- impeccable:product-schema 1 -->

## Platform

android

## Users

A university student, using their own Android phone, in two distinct situations:

1. **Registration week** — deciding which classes to take. Building candidate
   combinations, watching for time clashes and a credit ceiling, saving and
   comparing several whole-semester options against each other before
   committing.
2. **Every day of the following semester** — checking what is on today and
   where. This is the higher-frequency use by far, and a glance, not a session.

The owner built it for themselves and shares the APK directly with friends, who
install it cold with no explanation. So the interface must teach its own
vocabulary — particularly the "loadout" concept — without onboarding
infrastructure.

## Product Purpose

Build a weekly class timetable by hand, see immediately whether it works, and
keep it as the daily reference for the term.

"Works" means two things the app checks continuously: no two included classes
overlap in time, and the total credits stay under a cap the user sets.

Success is that the user commits to a semester combination with confidence, then
keeps opening the app for months because it is the fastest way to see today.

## Positioning

Two mechanisms a neighbouring calendar app does not have:

- **Loadouts.** A named, frozen snapshot of a whole class combination, that can
  be reloaded or compared side by side against up to three others. Comparison
  highlights what differs between them. This treats a semester as a set of
  competing options to evaluate, which a calendar cannot express — a calendar
  has one timeline and you either put something on it or you do not.
- **Include / exclude without deleting.** A class can exist in the app without
  being part of the current schedule. The user drafts candidates and toggles
  them in and out, and the grid, the credit total, and the conflict warnings all
  recompute live.

It is also completely offline by deliberate design: no account, no server, no
sync, no analytics, no network permission of any kind. Every byte stays on the
phone.

## Operating Context

- Portrait phone, one-handed, frequently glanced at rather than read.
- The one exception is loadout comparison, which unlocks landscape for a
  full-screen side-by-side view and re-locks portrait on exit.
- Class data is entered entirely by hand. There is no catalog, no import, no
  timetable scraping, no AI extraction. Every class the app knows about, the
  user typed.
- Output leaves the app as a PNG of the week, saved to the gallery or shared —
  which is how a schedule gets sent to a friend or a group chat.
- Installed by sideloading an APK the owner built locally and passed on
  directly.

## Capabilities and Constraints

Confirmed functionality:

- Manual class entry: name, place, optional instructor, credits, and any number
  of weekly meeting times across Monday–Sunday.
- Include / exclude toggle per class.
- Live credit total against a user-set cap, with an over-cap warning.
- Generated week grid with overlapping classes packed into columns.
- Conflict detection between included classes, surfaced both as a list and as
  marks on the clashing blocks. It warns; it never blocks.
- Stable per-class colours, assigned deterministically so a class is the same
  colour everywhere it appears.
- Loadouts: save, load, delete, and compare up to four at once in a
  full-screen landscape view.
- PNG export of the week to gallery or share sheet.
- Light / dark / follow-system theme, persisted.
- Erase all data.

Terminology the product owns: a **class** is a course the user entered; a
**loadout** is a saved combination of classes; **included** means counted toward
the current schedule.

**Content is Korean.** The owner studies at Hanyang University ERICA, and enters
class names, instructor names, and room codes in Korean and mixed
Korean/Latin/numeric strings — 암호학, 시스템프로그래밍, 오희국, Y317-0406 ERICA.
This is a hard typographic constraint, not a localisation nicety:

- Any face used for user-entered content must carry Hangul. A Latin-only display
  face silently falls back to the system Korean face, which destroys a type
  system precisely on the most important text on the screen.
- Hangul syllable blocks are near-square and do not condense the way Latin does,
  so a narrow class-name column that works for "Cryptography" will not fit
  암호학 at the same optical size, and vice versa.
- Hangul has no case, so uppercase styling carries no emphasis there. Emphasis
  must come from weight, size, or colour.
- Latin-only display type may still be used for numerals, day labels, and
  interface chrome, where the app supplies the strings.

The interface language is English; only the user's own content is Korean.

Technical constraints future work must preserve:

- **Fully offline.** No network calls, no remote fonts, no hosted assets, no
  telemetry. Anything the app needs must be bundled.
- **No accounts, no backend, no cloud build.** The release APK is built locally
  with Gradle; there is no EAS or Expo account involved.
- **APK size is tracked.** The release is arm64-only with minification and
  resource shrinking on, GIF and WebP decoders disabled, and icons imported from
  `@expo/vector-icons/Ionicons` rather than the barrel export specifically to
  avoid bundling every icon font family. Added weight must be justified.
- Expo SDK 57, React Native 0.86, New Architecture. Reanimated 4 for motion —
  Moti is incompatible with this stack.
- `android/` is committed rather than generated, because the release signing
  config is hand-edited into `android/app/build.gradle`.

Undecided: nothing further has been committed about future features. Recurring
term dates, exam scheduling, and notifications have not been ruled in or out.

## Brand Commitments

Name: **My Schedule**. Android package `com.myschedule.app`, deep-link scheme
`myschedule`.

No logo, wordmark, brand palette, or typeface has been established. The current
violet accent and stock icon are placeholders from an interim polish pass, not
commitments.

## Evidence on Hand

The user's own real timetable, supplied directly for use as demonstration
content.

No customers, testimonials, download figures, reviews, press, or usage metrics
exist. The app has never been published to a store. Nothing of that kind may be
invented or implied anywhere in the product or its materials.

## Product Principles

1. **Glance before session.** The most common interaction is a two-second look
   at what is on today. Optimise for that first; planning depth second.
2. **Warn, never block.** Conflicts and an exceeded credit cap are information.
   The user may knowingly want both. Never refuse a save.
3. **Nothing leaves the phone.** Offline is the product, not a limitation to
   work around.
4. **A class is a candidate until the user says otherwise.** Existing and being
   included are separate states, and switching between them must stay cheap and
   reversible.
5. **Teach the vocabulary in place.** A friend installing the APK cold has no
   documentation. The interface itself has to explain what a loadout is.

## Accessibility & Inclusion

- Class colours must stay distinguishable to colourblind users; colour is never
  the only carrier of meaning.
- Text must survive the system font-scale setting up to 1.3 without clipping.
- Touch targets at least 48dp, at least 8dp apart.
