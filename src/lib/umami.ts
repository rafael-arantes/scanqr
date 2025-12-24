/**
 * Umami Analytics Integration
 * 
 * This file provides type-safe helpers for tracking custom events in Umami Analytics.
 * 
 * Setup:
 * 1. Add the Umami script to your site (done in layout.tsx)
 * 2. Set the NEXT_PUBLIC_UMAMI_WEBSITE_ID environment variable
 * 
 * Usage:
 * import { trackEvent } from '@/lib/umami';
 * trackEvent('qr-code-created', { tier: 'free', hasCustomDomain: false });
 */

declare global {
  interface Window {
    umami?: {
      track: (eventName: string, eventData?: Record<string, string | number | boolean>) => void;
    };
  }
}

// Define event names for type safety
export const UmamiEvents = {
  // QR Code events
  QR_CODE_CREATED: 'qr-code-created',
  QR_CODE_SCANNED: 'qr-code-scanned',
  QR_CODE_DOWNLOADED: 'qr-code-downloaded',
  QR_CODE_DELETED: 'qr-code-deleted',
  QR_CODE_EDITED: 'qr-code-edited',
  
  // Authentication events
  USER_SIGNUP: 'user-signup',
  USER_LOGIN: 'user-login',
  USER_LOGOUT: 'user-logout',
  
  // Subscription events
  SUBSCRIPTION_UPGRADED: 'subscription-upgraded',
  SUBSCRIPTION_CANCELLED: 'subscription-cancelled',
  SUBSCRIPTION_MANAGE_CLICKED: 'subscription-manage-clicked',
  UPGRADE_PAGE_VIEWED: 'upgrade-page-viewed',
  UPGRADE_BUTTON_CLICKED: 'upgrade-button-clicked',
  
  // Custom domain events
  CUSTOM_DOMAIN_ADDED: 'custom-domain-added',
  CUSTOM_DOMAIN_VERIFIED: 'custom-domain-verified',
  CUSTOM_DOMAIN_DELETED: 'custom-domain-deleted',
  
  // Feedback events
  FEEDBACK_SUBMITTED: 'feedback-submitted',
  FEEDBACK_DIALOG_OPENED: 'feedback-dialog-opened',
  
  // Dashboard events
  DASHBOARD_SEARCH: 'dashboard-search',
  PROFILE_UPDATED: 'profile-updated',
} as const;

export type UmamiEventName = typeof UmamiEvents[keyof typeof UmamiEvents];

/**
 * Track a custom event in Umami Analytics
 * 
 * @param eventName - The name of the event to track
 * @param eventData - Optional data to attach to the event
 * 
 * @example
 * trackEvent('qr-code-created', { tier: 'pro', hasCustomDomain: true });
 */
export function trackEvent(
  eventName: UmamiEventName | string,
  eventData?: Record<string, string | number | boolean>
): void {
  // Only track in browser environment
  if (typeof window === 'undefined') {
    return;
  }

  // Check if Umami is loaded
  if (typeof window.umami === 'undefined') {
    // In development, log events for debugging
    if (process.env.NODE_ENV === 'development') {
      console.log('[Umami Analytics - Not Loaded]', eventName, eventData);
    }
    return;
  }

  try {
    window.umami.track(eventName, eventData);
    
    // Optional: log in development
    if (process.env.NODE_ENV === 'development') {
      console.log('[Umami Analytics]', eventName, eventData);
    }
  } catch (error) {
    console.error('Error tracking Umami event:', error);
  }
}

/**
 * Helper function to track QR code creation
 */
export function trackQrCodeCreated(data: {
  tier: 'free' | 'pro' | 'enterprise';
  hasCustomDomain: boolean;
  hasName: boolean;
}) {
  trackEvent(UmamiEvents.QR_CODE_CREATED, data);
}

/**
 * Helper function to track QR code scans
 */
export function trackQrCodeScanned(data: {
  hasCustomDomain: boolean;
  tier?: 'free' | 'pro' | 'enterprise';
}) {
  trackEvent(UmamiEvents.QR_CODE_SCANNED, data);
}

/**
 * Helper function to track subscription changes
 */
export function trackSubscriptionChange(data: {
  action: 'upgraded' | 'cancelled';
  fromTier: 'free' | 'pro' | 'enterprise';
  toTier: 'free' | 'pro' | 'enterprise';
}) {
  const eventName = data.action === 'upgraded' 
    ? UmamiEvents.SUBSCRIPTION_UPGRADED 
    : UmamiEvents.SUBSCRIPTION_CANCELLED;
  
  trackEvent(eventName, {
    fromTier: data.fromTier,
    toTier: data.toTier,
  });
}

/**
 * Helper function to track authentication events
 */
export function trackAuth(action: 'signup' | 'login' | 'logout') {
  const eventMap = {
    signup: UmamiEvents.USER_SIGNUP,
    login: UmamiEvents.USER_LOGIN,
    logout: UmamiEvents.USER_LOGOUT,
  };
  
  trackEvent(eventMap[action]);
}
