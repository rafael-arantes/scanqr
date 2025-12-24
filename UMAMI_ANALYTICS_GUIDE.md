# Umami Analytics Implementation Guide

This guide explains the Umami Analytics integration in the ScanQR application.

## Overview

Umami Analytics is a privacy-focused, open-source analytics platform that has been integrated throughout the ScanQR application to track key user actions and application performance.

## Setup Instructions

### 1. Create an Umami Account

1. Go to [Umami Cloud](https://cloud.umami.is) or self-host Umami
2. Create a new website for your ScanQR instance
3. Note your **Website ID** from the tracking code

### 2. Configure Environment Variables

Add the following environment variables to your `.env.local` file:

```bash
# Umami Analytics - Required
NEXT_PUBLIC_UMAMI_WEBSITE_ID=your-website-id-here

# Umami Analytics - Optional (defaults to Umami Cloud)
NEXT_PUBLIC_UMAMI_SCRIPT_URL=https://cloud.umami.is/script.js

# For server-side tracking (QR code scans) - Optional
UMAMI_API_ENDPOINT=https://cloud.umami.is
```

**Important Notes:**
- `NEXT_PUBLIC_UMAMI_WEBSITE_ID` is **required** for analytics to work
- If you self-host Umami, update `NEXT_PUBLIC_UMAMI_SCRIPT_URL` to your instance URL
- `UMAMI_API_ENDPOINT` is only needed if you want server-side tracking for QR code scans

### 3. Deploy

After adding the environment variables, rebuild and redeploy your application:

```bash
npm run build
npm start
```

## Tracked Events

### QR Code Events
| Event Name | Description | Data Tracked |
|------------|-------------|--------------|
| `qr-code-created` | User creates a new QR code | `tier`, `hasCustomDomain`, `hasName`, `createdFrom` |
| `qr-code-scanned` | QR code is scanned/redirected | `hasCustomDomain`, `tier` |
| `qr-code-downloaded` | User downloads QR code image | `downloadedFrom` |

### Authentication Events
| Event Name | Description | Data Tracked |
|------------|-------------|--------------|
| `user-login` | User logs into dashboard | None |
| `user-logout` | User logs out | None |

### Subscription Events
| Event Name | Description | Data Tracked |
|------------|-------------|--------------|
| `upgrade-page-viewed` | User visits upgrade page | None |
| `upgrade-button-clicked` | User clicks upgrade button | `tier` |
| `subscription-manage-clicked` | User opens subscription portal | `tier` |

### Custom Domain Events
| Event Name | Description | Data Tracked |
|------------|-------------|--------------|
| `custom-domain-added` | User adds a custom domain | `tier`, `mode` |
| `custom-domain-verified` | Domain is successfully verified | `tier` |
| `custom-domain-deleted` | User deletes a custom domain | `tier` |

### Feedback Events
| Event Name | Description | Data Tracked |
|------------|-------------|--------------|
| `feedback-dialog-opened` | User opens feedback dialog | None |
| `feedback-submitted` | User submits feedback | `category` |

## Implementation Details

### Client-Side Tracking

Most events are tracked client-side using the Umami tracking library. The script is loaded in the root layout:

```tsx
// src/app/layout.tsx
<script
  defer
  src={process.env.NEXT_PUBLIC_UMAMI_SCRIPT_URL || 'https://cloud.umami.is/script.js'}
  data-website-id={process.env.NEXT_PUBLIC_UMAMI_WEBSITE_ID}
/>
```

### Utility Functions

We provide a type-safe wrapper in `src/lib/umami.ts`:

```typescript
import { trackEvent, UmamiEvents } from '@/lib/umami';

// Track a basic event
trackEvent(UmamiEvents.QR_CODE_CREATED, {
  tier: 'pro',
  hasCustomDomain: true,
});

// Use helper functions
trackAuth('login');
trackQrCodeCreated({ tier: 'free', hasCustomDomain: false, hasName: true });
```

### Server-Side Tracking

QR code scans are tracked server-side because they happen during redirects. This requires the `UMAMI_API_ENDPOINT` environment variable to be set.

```typescript
// src/app/[shortId]/page.tsx
await trackServerEvent('qr-code-scanned', {
  hasCustomDomain: qrCode?.custom_domain_id !== null,
  tier: userTier,
});
```

## Development Mode

In development mode:
- Events are logged to the console even if Umami is not configured
- Format: `[Umami Analytics] event-name { eventData }`
- This helps verify events are firing correctly

## Privacy Considerations

Umami Analytics is privacy-focused:
- ✅ No cookies required
- ✅ GDPR compliant
- ✅ No personal data collected
- ✅ Open source
- ✅ Respects Do Not Track
- ✅ Lightweight script (~2KB)

## Disabling Analytics

To disable analytics completely:
1. Remove the `NEXT_PUBLIC_UMAMI_WEBSITE_ID` environment variable
2. The script won't load and no events will be tracked
3. In development, events will still log to console for debugging

## Viewing Analytics

1. Log into your Umami dashboard
2. Select your ScanQR website
3. View:
   - Page views
   - Custom events
   - User journeys
   - Conversion funnels
   - Real-time visitors

## Key Metrics to Monitor

### User Engagement
- QR code creation rate (by tier)
- QR code scan rate
- Download conversions
- Dashboard active users

### Business Metrics
- Upgrade page views
- Upgrade button clicks
- Conversion rate (free → pro)
- Custom domain adoption

### Feature Usage
- Custom domain creation/verification rate
- Feedback submission rate
- Authentication patterns

### Technical Metrics
- Page load times (via Umami's built-in metrics)
- Error rates (track custom error events if needed)

## Troubleshooting

### Events Not Showing Up

1. **Check environment variable**: Ensure `NEXT_PUBLIC_UMAMI_WEBSITE_ID` is set
2. **Check browser console**: Look for Umami script loading errors
3. **Check ad blockers**: Some may block Umami (use self-hosted instance if needed)
4. **Verify website ID**: Ensure it matches your Umami dashboard
5. **Check development logs**: Events should log to console in dev mode

### Server-Side Events Not Working

1. **Check API endpoint**: Verify `UMAMI_API_ENDPOINT` is correct
2. **Check network**: Server must be able to reach Umami API
3. **Check logs**: Look for error messages in server logs
4. **API authentication**: Ensure your Umami instance accepts API calls

## Future Enhancements

Consider tracking these additional events in the future:
- QR code edit/update events
- Search queries in dashboard
- Profile updates
- Failed authentication attempts
- API rate limit hits
- Export actions
- Bulk operations

## Code Locations

- **Utility library**: `src/lib/umami.ts`
- **Script injection**: `src/app/layout.tsx`
- **Homepage tracking**: `src/app/page.tsx`
- **Dashboard tracking**: `src/app/dashboard/page.tsx`
- **QR creation**: `src/app/dashboard/CreateQrCodeDialog.tsx`
- **QR scans**: `src/app/[shortId]/page.tsx`
- **Subscriptions**: `src/components/stripe/*.tsx`, `src/app/upgrade/page.tsx`
- **Custom domains**: `src/app/dashboard/custom-domains/CustomDomainsClient.tsx`
- **Feedback**: `src/app/dashboard/FeedbackDialog.tsx`
- **Auth**: `src/app/dashboard/LogoutButton.tsx`

## Support

For issues or questions about Umami Analytics:
- [Umami Documentation](https://umami.is/docs)
- [Umami GitHub](https://github.com/umami-software/umami)
- [Umami Discord](https://discord.gg/4dz4zcXYrQ)
