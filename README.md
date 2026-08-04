# 📇 Phonebook

A student phone directory built with **Expo SDK 57**, **Expo Router** and **axios**, talking to a
local `json-server` REST API. Full CRUD, with a modern light/dark interface.

---

## Getting started

The app needs two processes running side by side.

**1. Start the API**

```bash
cd phone-server
npm install
npm start          # json-server on port 3008
```

**2. Start the app**

```bash
npm install
npx expo start
```

Then press `i` (iOS), `a` (Android), `w` (web), or scan the QR code with Expo Go.

> **On a physical device?** Keep your phone on the same Wi-Fi as your computer. The app reads the
> Metro dev-server host and points itself at `http://<your-lan-ip>:3008` automatically — no manual
> IP editing. Android emulators fall back to `10.0.2.2`.

To point at a deployed API instead, copy `.env.example` to `.env` and set `EXPO_PUBLIC_API_URL`.

---

## Features

| | |
|---|---|
| 🔍 **Search** | Matches name, section, or phone number — separators are ignored, so `0888869845` finds `088-886-9845`. |
| 🏷️ **Filter & sort** | Section chips with live counts, plus an A–Z / Z–A toggle. |
| 📞 **Quick actions** | Tap a card to reveal Call, Text, Edit and Delete. |
| ↩️ **Undo delete** | Removal is confirmed, applied optimistically, and undoable from the toast. |
| 🌗 **Themes** | One button flips light ↔ dark. The app never switches on its own, and the choice is remembered between launches. |
| ✨ **Motion** | Calm, non-bouncy transitions — fades, staggered entry and a sliding section thumb, all linear-timed (Reanimated). |
| 📱 **Native feel** | Haptics, pull-to-refresh, skeleton loaders, safe-area and keyboard handling. |
| ⚠️ **Honest errors** | Offline, timeout and 404 states each explain what to do next. |

---

## Project structure

```
src/
├─ api/phones.ts          CRUD calls + response validation
├─ app/                   Expo Router screens
│  ├─ _layout.tsx         providers + stack (forms open as modals)
│  ├─ index.tsx           list, search, filter, sort
│  ├─ addPhone.tsx        create
│  └─ editPhone.tsx       update
├─ components/
│  ├─ PhoneCard.tsx       contact row with expandable actions
│  ├─ PhoneForm.tsx       shared add/edit form
│  ├─ Toast.tsx           snackbar with undo support
│  ├─ Avatar.tsx  SearchBar.tsx  FilterChips.tsx
│  ├─ EmptyState.tsx  SkeletonCard.tsx
│  └─ ui/                 Button, FormField, SegmentedControl
├─ hooks/usePhones.ts     loading state, refresh, optimistic delete
├─ theme/                 palette, spacing, type scale, ThemeProvider
├─ types/phone.ts
└─ utils/
   ├─ crud-api.ts         axios instance + host resolution + error messages
   └─ format.ts           initials, avatar colours, phone formatting, validation
```

---

## What changed from the original

**Bugs fixed**

1. **`localhost` API base URL** — worked only in a browser; every request failed on a phone or
   Android emulator. Now derived from the Metro host, with an env override.
2. **`uuid` without a polyfill** — `uuid@v4` needs `crypto.getRandomValues`, which Hermes does not
   provide, so creating a contact threw. Replaced with `expo-crypto`'s `randomUUID()`.
3. **The list never refreshed** — `useEffect` ran once, so adding or editing a contact returned to a
   stale list. Now re-syncs on screen focus, plus pull-to-refresh.
4. **Edit screen validated the wrong values** — it checked the original params instead of the edited
   ones, so clearing a field and saving wrote empty data.
5. **Route params were mistyped** — `useLocalSearchParams` returns `string | string[]`; feeding that
   straight into `TextInput` broke typing. Now collapsed safely.
6. **Delete had no confirmation** — the `Alert` was commented out, so one tap destroyed a record.
   Now confirmed, and undoable.
7. **Untyped props and state** — `Card(props)` and `useState([])` were implicit `any`. Everything is
   typed and `tsc --noEmit` passes clean.
8. **Layout issues** — no safe-area handling (content sat under the notch), `justifyContent:
   'center'` fighting the `FlatList`, no keyboard avoidance on the forms.
9. **`react-native-paper` used with no `PaperProvider`** — removed along with `uuid`; the section
   picker is now a custom animated segmented control.
10. **Silent failures** — errors only reached `console.log`. Failed loads, saves and deletes now
    surface to the user with a retry path.

**Also added:** a design-token theme, dark mode, search, filtering, sorting, call/SMS actions,
skeleton and empty states, toasts, haptics, and animations.

---

## Notes

- `json-server@1` assigns its own `id` on create and ignores a client-supplied one. The app always
  uses the id returned by the server, which is the one `PUT` and `DELETE` accept. Undo therefore
  re-inserts the contact under a new id.
- `react-native-gesture-handler` is pinned to 2.x via `expo.install.exclude`. SDK 57 nominally wants
  3.x, but Expo Go 57.0.6 still ships the 2.x native module, and the 3.x JS calls
  `RNGestureHandlerModule.installUIRuntimeBindings()` — which does not exist there — so the app
  red-screens on launch. Drop the exclude once you move to a custom dev build.
- Phone numbers are grouped as you type using common Thai formats (`08X-XXX-XXXX`, `0X-XXX-XXXX`);
  only the digits are used for `tel:` and `sms:` links.
