# Component Inventory

## Admin Panel Components

### Folder Structure

```
/components/Admin/
├── AdminLayout/
│   ├── AdminLayout.tsx
│   ├── AdminLayout.module.css
│   └── index.ts
├── BannerSection/
│   ├── BannerSection.tsx
│   ├── BannerSection.module.css
│   └── index.ts
├── AdminSpeakersSection/
│   ├── AdminSpeakersSection.tsx
│   ├── AdminSpeakersSection.module.css
│   └── index.ts
├── AdminEventsSection/
│   ├── AdminEventsSection.tsx
│   ├── AdminEventsSection.module.css
│   └── index.ts
├── AdminSponsorsSection/
│   ├── AdminSponsorsSection.tsx
│   ├── AdminSponsorsSection.module.css
│   └── index.ts
├── RegistrationsSection/
│   ├── RegistrationsSection.tsx
│   ├── RegistrationsSection.module.css
│   └── index.ts
└── RegistrationModal/
    ├── RegistrationModal.tsx
    ├── RegistrationModal.module.css
    └── index.ts
```

## Component Details

### 1. AdminLayout

**Purpose**: Main layout wrapper for the admin panel
**Props**:

```typescript
{
  activeSection: 'banner' | 'speakers' | 'events' | 'sponsors' | 'registrations'
  onSectionChange: (section: string) => void
  onLogout: () => void
  children: React.ReactNode
}
```

**Features**:

- Top navigation bar
- Sidebar with section links
- Logout button
- Active section highlighting
- Responsive grid layout

**Files**:

- AdminLayout.tsx (125 lines)
- AdminLayout.module.css (140 lines)

---

### 2. BannerSection

**Purpose**: Manage event banner
**Props**:

```typescript
{
  authHeaders: Record<string, string>;
}
```

**Features**:

- Form input for banner title
- Textarea for banner description
- File input for banner image
- Form submission to `/api/admin/banner`
- Success/error messaging
- Loading state

**API Endpoint**: `POST /api/admin/banner`

**Files**:

- BannerSection.tsx (70 lines)
- BannerSection.module.css (90 lines)

---

### 3. AdminSpeakersSection

**Purpose**: CRUD operations for speakers
**Props**:

```typescript
{
  authHeaders: Record<string, string>;
}
```

**Features**:

- List all speakers in grid
- Add button to show form
- Form for creating/editing speakers
- Fields: First name, Middle name, Last name, Bio, Image upload
- Edit button on each card
- Delete button with confirmation
- Success/error messaging
- Loading states

**API Endpoints**:

- `GET /api/speakers` - Fetch all speakers
- `POST /api/admin/speaker` - Create speaker
- `PUT /api/admin/speaker/:id` - Update speaker
- `DELETE /api/admin/speaker/:id` - Delete speaker

**Files**:

- AdminSpeakersSection.tsx (180 lines)
- AdminSpeakersSection.module.css (160 lines)

---

### 4. AdminEventsSection

**Purpose**: CRUD operations for events
**Props**:

```typescript
{
  authHeaders: Record<string, string>;
}
```

**Features**:

- List all events in grid
- Add button to show form
- Form for creating/editing events
- Fields: Title, Description, Tags, Thumbnail
- Tag management (add/remove tags)
- Edit button on each card
- Delete button with confirmation
- Success/error messaging
- Loading states

**API Endpoints**:

- `GET /api/events` - Fetch all events
- `POST /api/admin/event` - Create event
- `PUT /api/admin/event/:id` - Update event
- `DELETE /api/admin/event/:id` - Delete event

**Files**:

- AdminEventsSection.tsx (200 lines)
- AdminEventsSection.module.css (180 lines)

---

### 5. AdminSponsorsSection

**Purpose**: CRUD operations for sponsors
**Props**:

```typescript
{
  authHeaders: Record<string, string>;
}
```

**Features**:

- Organize sponsors by tier (Platinum, Gold, Silver, Bronze)
- Add button to show form
- Form for creating/editing sponsors
- Fields: Name, Tier (select), Logo (file upload)
- Tier-specific styling
- Edit/Delete buttons per sponsor
- Empty state messages for tiers
- Success/error messaging

**API Endpoints**:

- `GET /api/sponsors` - Fetch all sponsors
- `POST /api/admin/sponsor` - Create sponsor
- `PUT /api/admin/sponsor/:id` - Update sponsor
- `DELETE /api/admin/sponsor/:id` - Delete sponsor

**Files**:

- AdminSponsorsSection.tsx (170 lines)
- AdminSponsorsSection.module.css (200 lines)

---

### 6. RegistrationsSection

**Purpose**: Advanced registration management with filtering/search/sort
**Props**:

```typescript
{
  authHeaders: Record<string, string>;
}
```

**Features**:

- Search registrations by name/email (real-time)
- Multi-select status filter (Pending, Approved, Waitlisted, Rejected)
- Multi-select academic year filter
- Sort dropdown (name, email, year, status)
- Sort toggle button (ascending/descending)
- Responsive data table
- View button opens modal
- Status dropdown to update status
- Status badge with color coding
- Empty state handling

**API Endpoints**:

- `GET /api/registrations` - Fetch all registrations
- `PUT /api/admin/registration/:id/status` - Update status

**Files**:

- RegistrationsSection.tsx (280 lines)
- RegistrationsSection.module.css (240 lines)

---

### 7. RegistrationModal

**Purpose**: Display full registration details in a modal
**Props**:

```typescript
{
  registration: Registration
  onClose: () => void
  authHeaders: Record<string, string>
}
```

**Features**:

- Full-screen overlay
- Display all registration fields
- Status badge with color coding
- Resume viewer button
- Embedded PDF viewer in iframe
- Close button (X and outer click)
- Responsive design
- Styled detail rows

**API Endpoint**: `GET /api/file/:id` for resume

**Files**:

- RegistrationModal.tsx (120 lines)
- RegistrationModal.module.css (130 lines)

---

## Public Page Components

### 1. Navigation

**Location**: `/components/Navigation/Navigation.tsx`
**Purpose**: Top navigation bar for public pages
**Features**:

- Logo/home link
- Links to home, register, admin login
- Responsive design
- Sticky positioning

---

### 2. BannerHero

**Location**: `/components/BannerHero/BannerHero.tsx`
**Purpose**: Hero banner section on home page
**Features**:

- Fetches banner from `/api/banner` on mount
- Displays title and description
- Fallback text if no banner data
- Loading state

---

### 3. SpeakersSection

**Location**: `/components/SpeakersSection/SpeakersSection.tsx`
**Purpose**: Display speakers grid
**Features**:

- Fetches speakers from `/api/speakers`
- Grid layout with speaker cards
- Displays first, middle, last name and bio
- Circular image placeholders

---

### 4. EventsSection

**Location**: `/components/EventsSection/EventsSection.tsx`
**Purpose**: Display events grid
**Features**:

- Fetches events from `/api/events`
- Grid layout with event cards
- Tag pills for each event
- Event title and description

---

### 5. SponsorsSection

**Location**: `/components/SponsorsSection/SponsorsSection.tsx`
**Purpose**: Display sponsors organized by tier
**Features**:

- Fetches sponsors from `/api/sponsors`
- Groups by tier (Platinum, Gold, Silver, Bronze)
- Tier-specific styling
- Sponsor name and logo display

---

## Pages

### 1. Home (`/app/page.tsx`)

- Uses all public components
- Main landing page
- Responsive grid layout

### 2. Register (`/app/register/page.tsx`)

- Registration form page
- Form validation
- File upload support
- API submission

### 3. Admin (`/app/admin/page.tsx`)

- Admin dashboard
- Authentication check
- Section routing
- Passes authHeaders to child components

### 4. Login (`/app/login/page.tsx`)

- Admin login form
- Basic auth validation
- Redirect on success
- Error messaging

---

## Import Patterns

### Using index.ts for clean imports

```typescript
// Before (verbose)
import BannerSection from "@/components/Admin/BannerSection/BannerSection";

// After (clean)
import BannerSection from "@/components/Admin/BannerSection";
```

All admin components support the clean import pattern via their `index.ts` files.

---

## Styling Conventions

### CSS Modules Pattern

```css
/* Component-specific styles */
.component {
  /* ... */
}
.header {
  /* ... */
}
.section {
  /* ... */
}

/* States */
.active {
  /* ... */
}
.loading {
  /* ... */
}
.error {
  /* ... */
}
.success {
  /* ... */
}

/* Modifiers */
.platinum {
  /* ... */
}
.gold {
  /* ... */
}
```

### Color Theme

- Primary: `#00d9ff` (Cyan)
- Secondary: `#a855f7` (Purple)
- Success: `#86efac` (Green)
- Error: `#fca5a5` (Red)
- Warning: `#fbbf24` (Yellow)
- Info: `#60a5fa` (Blue)
- Background: `#0a0e27` (Dark blue)
- Text: `#e4e4e4` (Light gray)
- Muted: `#7a7a7a` (Medium gray)

---

## Total Component Count

| Category          | Count  |
| ----------------- | ------ |
| Admin Components  | 7      |
| Public Components | 5      |
| Pages             | 4      |
| **Total**         | **16** |

## Total Lines of Code

| Type           | Approximate Lines |
| -------------- | ----------------- |
| TypeScript/TSX | 2,000+            |
| CSS Modules    | 1,500+            |
| **Total**      | **3,500+**        |

---

## Component Dependencies

```
App (Layout)
├── Navigation
└── Page Routes
    ├── /page.tsx
    │   ├── Navigation
    │   ├── BannerHero
    │   ├── SpeakersSection
    │   ├── EventsSection
    │   └── SponsorsSection
    ├── /register/page.tsx
    ├── /admin/page.tsx
    │   └── AdminLayout
    │       ├── BannerSection
    │       ├── AdminSpeakersSection
    │       ├── AdminEventsSection
    │       ├── AdminSponsorsSection
    │       ├── RegistrationsSection
    │       │   └── RegistrationModal
    │       └── Navigation (inherited)
    └── /login/page.tsx
```

---

## Next Steps for Development

1. ✅ All components created
2. ✅ All styling implemented
3. ✅ API integration ready
4. 🔲 Test all components with real data
5. 🔲 Performance optimization if needed
6. 🔲 Add unit tests
7. 🔲 Add E2E tests
8. 🔲 Deploy to Vercel/production
