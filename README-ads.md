# Google Ads Integration

This application includes non-intrusive Google AdSense integration. The ads are strategically placed to support the app while maintaining a good user experience.

## Setup Instructions

1. **Get Google AdSense Account**
   - Sign up at [https://www.google.com/adsense/](https://www.google.com/adsense/)
   - Get your Publisher ID (starts with `ca-pub-`)

2. **Create Ad Units**
   - Create ad units in your AdSense dashboard:
     - Banner Ad (728x90 or responsive)
     - Sidebar Ad (300x600 or responsive)
     - Footer Ad (728x90 or responsive)

3. **Environment Configuration**
   - Copy `.env.example` to `.env`
   - Fill in your AdSense credentials:
     ```env
     VITE_ADSENSE_CLIENT_ID=ca-pub-your-publisher-id
     VITE_ADSENSE_BANNER_SLOT=your-banner-slot-id
     VITE_ADSENSE_SIDEBAR_SLOT=your-sidebar-slot-id
     VITE_ADSENSE_FOOTER_SLOT=your-footer-slot-id
     ```

## Ad Placement Strategy

### 1. Top Banner Ad
- **Location**: Below the current set progress, above champion grid
- **Condition**: Only shows when champions are loaded
- **Format**: Horizontal banner (728x90 responsive)
- **Reasoning**: Natural break in content flow

### 2. Sidebar Ad (Desktop Only)
- **Location**: Right side of champion grid
- **Condition**: Only shows on XL screens (1280px+) with 30+ champions
- **Format**: Vertical rectangle (300x600 responsive)
- **Reasoning**: Utilizes empty space on large screens

### 3. Footer Ad
- **Location**: Bottom of the page
- **Format**: Horizontal banner with reduced opacity
- **Reasoning**: Non-intrusive placement after main content

## Non-Intrusive Features

- **Conditional Display**: Ads only show when there's sufficient content
- **Responsive Design**: Ads adapt to different screen sizes
- **Visual Integration**: Styled to match the app's dark theme
- **Performance Optimized**: Lazy loading and error handling
- **User Experience**: No popups, no auto-play, no content blocking

## Technical Implementation

- **AdBanner Component**: Reusable ad component with error handling
- **useAdSense Hook**: Manages AdSense script loading
- **CSS Integration**: Smooth transitions and fallbacks
- **Environment Variables**: Secure configuration management

## Revenue Optimization

The placement strategy balances:
- User experience (non-intrusive)
- Ad visibility (strategic positioning)
- Content relevance (gaming audience)
- Performance impact (minimal)