# LocateLink

## Current State
- SharePage has a name input field + Share My Location button
- HomePage is a marketing landing page; after creating a link user navigates separately to ViewPage to see locations
- ViewPage is a separate page showing map + location list

## Requested Changes (Diff)

### Add
- Live location map shown directly on HomePage after link is created (so owner sees locations without navigating away)

### Modify
- SharePage: Remove name input entirely. Remove extra text/options. Show only a single prominent "Turn On Location" / "Allow Location" button. On click, browser requests geolocation permission, location is submitted, success screen shown.
- HomePage: After creating a link, show a live map section at the top of the page (or inline) with collected locations updating in real-time (auto-refresh every 10s). Keep the copy link button.

### Remove
- Name input from SharePage
- Any extra form fields or informational blocks on SharePage

## Implementation Plan
1. Simplify SharePage.tsx: remove name state, remove name input, remove label, simplify description text, rename button to "Allow Location" / "Turn On Location"
2. Update submitLocation call in SharePage to pass empty string or "Guest" as name
3. Modify HomePage.tsx: after generatedToken is set, show a live map + location list at top of the page (above hero or replace hero with it), auto-refresh every 10s using setInterval + refetch
4. Import and use useGetEntries hook in HomePage for live location display
