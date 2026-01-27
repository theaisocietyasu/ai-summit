# Admin Panel - Next.js Migration

## Overview

The admin panel has been successfully migrated from the original HTML/JavaScript implementation to a modern Next.js React component architecture with TypeScript support.

## Structure

### Main Pages

- **`/app/admin/page.tsx`** - Main admin panel page with authentication check and section routing
- **`/app/login/page.tsx`** - Admin login page for authentication

### Components

#### Layout Component

- **`/components/Admin/AdminLayout`** - Main layout wrapper with sidebar navigation and top navigation bar

#### Section Components

1. **`/components/Admin/BannerSection`** - Banner management
   - Upload banner title, description, and image
   - POST to `/api/admin/banner`

2. **`/components/Admin/AdminSpeakersSection`** - Speaker CRUD operations
   - Add, edit, delete speakers
   - Upload speaker images
   - Display speaker grid with information
   - API endpoints: `/api/speakers`, `/api/admin/speaker`

3. **`/components/Admin/AdminEventsSection`** - Event CRUD operations
   - Add, edit, delete events
   - Upload event thumbnails
   - Manage event tags
   - API endpoints: `/api/events`, `/api/admin/event`

4. **`/components/Admin/AdminSponsorsSection`** - Sponsor CRUD operations
   - Add, edit, delete sponsors
   - Upload sponsor logos
   - Organize sponsors by tier (Platinum, Gold, Silver, Bronze)
   - API endpoints: `/api/sponsors`, `/api/admin/sponsor`

5. **`/components/Admin/RegistrationsSection`** - Advanced registration management
   - Search registrations by name/email
   - Filter by status (Pending, Approved, Waitlisted, Rejected)
   - Filter by academic year
   - Sort by name, email, year, or status
   - Toggle sort order (ascending/descending)
   - View registration details in modal
   - Update registration status
   - View resume PDF

#### Modal Components

- **`/components/Admin/RegistrationModal`** - Displays full registration details
  - Shows all registration fields
  - Displays resume PDF in embedded viewer
  - Shows status badge with color coding

## Features

### Authentication

- Basic Auth using username and password
- Credentials stored in `localStorage` as Base64 encoded string
- Automatic redirect to login page if not authenticated
- Logout functionality clears credentials and redirects to login

### File Upload

- Supports image uploads for:
  - Banner images
  - Speaker photos
  - Event thumbnails
  - Sponsor logos
- Supports resume uploads (PDF)
- Uses FormData API for multipart requests
- Files sent with Authorization headers

### Data Management

- Real-time fetching of all data types
- Success/error message feedback
- Form validation with required fields
- Confirmation dialogs for delete operations
- Loading states for async operations

### Advanced Filtering & Search (Registrations)

- Full-text search across name and email fields
- Multi-select status filters
- Multi-select academic year filters
- Sort by multiple fields
- Toggle ascending/descending order
- All filters work together in real-time

### Styling

- CSS Modules for component scoping
- Consistent dark theme with cyan/purple gradient accents
- Responsive design
- Smooth transitions and animations
- Status-specific color coding

## API Endpoints Required

### Authentication

- `GET /api/admin/validate` - Validate admin credentials

### Banner

- `POST /api/admin/banner` - Create/update banner

### Speakers

- `GET /api/speakers` - Get all speakers
- `POST /api/admin/speaker` - Create speaker
- `PUT /api/admin/speaker/:id` - Update speaker
- `DELETE /api/admin/speaker/:id` - Delete speaker

### Events

- `GET /api/events` - Get all events
- `POST /api/admin/event` - Create event
- `PUT /api/admin/event/:id` - Update event
- `DELETE /api/admin/event/:id` - Delete event

### Sponsors

- `GET /api/sponsors` - Get all sponsors
- `POST /api/admin/sponsor` - Create sponsor
- `PUT /api/admin/sponsor/:id` - Update sponsor
- `DELETE /api/admin/sponsor/:id` - Delete sponsor

### Registrations

- `GET /api/registrations` - Get all registrations
- `PUT /api/admin/registration/:id/status` - Update registration status
- `GET /api/file/:id` - Get file/resume for display

## Component Props

### Section Components

All section components accept:

```typescript
{
  authHeaders: Record<string, string>; // Authorization headers
}
```

### RegistrationModal

```typescript
{
  registration: Registration      // Registration object to display
  onClose: () => void             // Callback when modal should close
  authHeaders: Record<string, string>  // Authorization headers
}
```

## State Management

Each section component manages its own state using React hooks:

- `useState` - Form data, loading states, messages, filtering
- `useCallback` - Memoized filter/sort functions
- `useEffect` - Fetch initial data on component mount

## Styling Classes

### Common Classes

- `.form` - Form wrapper
- `.formGroup` - Individual form field
- `.message.success` / `.message.error` - Alert messages
- `.btn` - Primary button with gradient
- `.btnCancel` - Secondary button
- `.card` - Data card/list item
- `.table` - Data table

### Registrations-Specific

- `.searchBox` - Search input wrapper
- `.filterSection` - Filter controls wrapper
- `.sortSection` - Sort controls wrapper
- `.statusBadge` - Status indicator with border color coding

## Error Handling

- Network errors display error messages
- Form validation prevents submission of incomplete data
- Delete operations require confirmation
- All async operations show loading states
- Error messages are displayed in red alert boxes
- Success messages are displayed in green alert boxes

## Future Enhancements

Potential improvements:

- Pagination for large datasets
- Bulk operations (delete multiple, batch status update)
- Export registrations to CSV
- Email notifications on status changes
- Advanced date filtering
- Image preview before upload
- Duplicate registration detection
- Advanced analytics dashboard

## Notes

- All file uploads use multipart/form-data
- Authorization header format: `Basic ${base64(username:password)}`
- Resume PDFs are embedded using iframe viewer
- Responsive design optimized for desktop and tablet viewing
- Database operations are handled entirely by Express backend
- GridFS is used for file storage on MongoDB
