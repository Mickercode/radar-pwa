# Radar PWA → Backend handoff

The PWA (`radar-pwa`) is built and runs end-to-end on **demo data** (`VITE_MOCK_AUTH=true`).
To go live, the backend (`radar-backend`) needs the endpoints below. Set
`VITE_MOCK_AUTH` off and point `VITE_API_URL` at the backend — no PWA code
changes are needed for the **Already live** set.

All authenticated routes use `Authorization: Bearer <jwt>`. Errors are
`{ "error": "message" }` with an HTTP status. The PWA derives the user from the
JWT, so **no user id is ever sent in request bodies/paths**.

---

## ✅ Already live (backend has these — PWA consumes them as-is)

| Method | Path | Used by | Notes |
|--------|------|---------|-------|
| POST | `/auth/signup` | Sign up | `{email,password,name}` → `{token,user}` |
| POST | `/auth/login` | Sign in | `{email,password}` → `{token,user}` |
| PATCH | `/auth/name` | Settings | `{name}` → `{user}` |
| PATCH | `/auth/password` | Change password | `{newPassword}` → `{ok}` |
| DELETE | `/auth/account` | (account delete) | → `{ok}` |
| GET | `/topics` | Onboarding | → `Topic[]` |
| GET | `/feed?topicIds=a,b` | Feed | → `{items,isFallback,matchedTopics}` |
| GET | `/content/:id` | Content detail | → `ContentItem` (404 → null) |
| GET | `/content?type=news\|podcast\|clip` | Feed filters | → `ContentItem[]` |
| GET | `/content/:id/key-moments` | Content detail / player | → `KeyMoment[]` |
| GET·POST | `/saved` · `DELETE /saved/:contentId` | Save button | scoped by JWT |
| GET·PUT | `/preferences` | Onboarding / Settings | snake_case `UserPreferences` |
| GET·PUT | `/playback/:contentId` | (player persistence — not wired yet) | available |
| POST | `/insights` | Capture save, feed save | `SaveInsightInput` → `Insight` |
| GET | `/insights?q=&limit=&offset=` | Brain list + search | → `Insight[]` |
| GET | `/insights/:id/graph` | Insight detail | → `{root,edges,neighbours}` |
| POST | `/insights/links` | (manual link) | → `InsightEdge` |
| POST | `/insights/:id/autolink` | Save flow (fire-and-forget) | embeds + auto-edges |
| POST | `/insights/:id/share` | Share sheet analytics | `{platform}` |
| GET | `/insights/:id/quiz` | Quiz | → `QuizQuestion[]` (generates on miss) |
| POST | `/insights/:id/quiz/attempt` | Quiz | `{correctCount,totalCount}` |
| GET | `/reviews/due?limit=` · `/reviews/due/count` | Review, Brain, Profile | |
| POST | `/reviews/:id/submit` | Review | `{grade:0\|1}` → `InsightReview` |
| GET | `/weekly-review` | Weekly, Brain | → `WeeklyReview` |
| POST | `/capture` | Capture | `{url}` → `CapturedInsight` |

---

## 🔨 Needs building (PWA expects these; backend does NOT have them yet)

Ordered by impact.

### 1. Content ingestion worker — **the live-feed blocker**
The `/feed` and `/content` tables are empty until the old `ingest-content` RSS
job is ported (it's intentionally out of the API — a separate worker/cron that
writes `content`/`summaries`/`key_moments`). **Without it, the Feed is empty in
production.** Highest priority for a real launch.

### 2. `DELETE /insights/:id`
- **Screen:** Insight detail → Delete.
- Removes the insight (cascade its edges/review/quiz). → `{ok}` / 204.

### 3. Content search — `GET /search?q=&type=&country=`
- **Screen:** Search (not yet routed in the PWA, pending this).
- Full-text over `content`+`summaries`. → `ContentItem[]`.
- (Brain/insight search already works via `/insights?q=`.)

### 4. `preferred_country` on preferences
- **Screen:** Onboarding step 3, Settings, Feed country tabs.
- Add `preferred_country` (`'NG' | 'AFRICA' | 'INTL'`) to `user_preferences` +
  `/preferences`. Feed ranking should boost it. Currently stored client-side
  (`localStorage 'radar_country'`).
- Optional: `GET /feed?country=` for the Nigeria/Africa/International tabs.

### 5. File / PDF upload analysis
- **Screen:** Capture (“PDF & file upload coming soon”).
- `POST /content/analyse/upload` (multipart `.pdf/.docx/.txt`) → either sync
  `CapturedInsight` (like `/capture`) or a job:
  - `{jobId}` + `GET /content/job/:jobId` → `{status,result?}` for a poll loader.
- Free-tier limit (5/mo) enforcement → `402` with `{error,limit}` to trigger the paywall.

### 6. Billing / subscription (Paystack)
- **Screens:** Subscription, Paywall.
- `GET /subscription` → `{plan:'free'|'premium', renewsAt?}`.
- `POST /subscription/checkout` `{plan:'monthly'|'annual'}` → Paystack auth URL.
- Paystack webhook → set `premium` on the user. `POST /subscription/cancel`.

### 7. Password reset
- **Screen:** Forgot password (placeholder today).
- `POST /auth/forgot-password` `{email}` → always `{ok}` (don't leak existence).
- `POST /auth/reset-password` `{token,newPassword}`. Needs an email sender.

### 8. Avatar upload
- **Screen:** Profile (avatar is initials-only now).
- `POST /account/avatar` (multipart) → `{avatarUrl}` (R2/S3). Add `avatarUrl` to the user.

### 9. Notepad / documents (deferred feature — not built in PWA yet)
- `GET/POST /documents`, `GET/PUT/DELETE /documents/:id`.
- Fields: `{id,title,bodyHtml,wordCount,updatedAt}`. Optional `POST /documents/:id/review` (premium AI review), `GET /documents/:id/export?format=pdf`.

### 10. Notification settings (P0 bug from feedback)
- **Screen:** Settings → Notifications (not built pending fields).
- Add to `/preferences`: `notifications_enabled`, `digest_time`, `review_reminders`.
- `push_token` already exists. Web Push (iOS 16.4+ once installed) needs a VAPID key + `POST /push/subscribe`.

### Smaller / optional
- **`POST /auth/password` re-auth:** currently takes only `newPassword`; add optional `currentPassword` verification if desired.
- **Content "Test yourself":** quizzes are per-insight. To quiz arbitrary content, the PWA would save it as an insight first (already possible) — no new endpoint strictly needed.
- **Player position:** `/playback/:contentId` exists but the PWA player doesn't persist position yet — wire later.

---

## Type shapes
The PWA's expected JSON shapes live in [`src/lib/types.ts`](src/lib/types.ts) —
they mirror the backend serializers. Keep them in sync. Demo fixtures that show
the exact shapes are in `src/lib/mockData.ts` and `src/lib/mockBrain.ts`.
