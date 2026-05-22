# PrylKollen Pro - Todo

## Architecture & Setup
- [x] Initialize webdev project with db, server, user features
- [x] Design database schema (items, credits, payments, transactions)
- [x] Set up Stripe integration and environment variables
- [x] Configure PWA manifest and service worker

## Landing Page & Public Pages
- [x] Build elegant Swedish landing page with hero section
- [x] Add clear CTA ("Kom igång" / "Get Started")
- [x] Create pricing/features section explaining the credit system
- [x] Implement responsive design for mobile and tablet

## Authentication & User Management
- [x] Implement Manus OAuth login flow (built-in)
- [x] Create user dashboard/home page after login
- [x] Display user name and credit balance prominently
- [x] Add logout functionality (built-in)

## Image Upload & AI Analysis
- [x] Build image upload component (camera or file upload)
- [x] Integrate with Gemini AI for item identification and valuation
- [x] Display analysis results (name, description, estimated value)
- [x] Deduct one credit per analysis
- [x] Handle insufficient credits gracefully (show upgrade prompt)

## Inventory Management
- [x] Create inventory list page showing all analyzed items
- [x] Display item image, name, and estimated value in list
- [x] Add ability to delete items from inventory
- [ ] Add ability to view detailed item information
- [ ] Implement search/filter functionality

## Credit System & Payments
- [x] Create credits table in database
- [x] Build Stripe Checkout integration for 5 credits = 49 SEK
- [x] Create checkout page/modal with clear pricing
- [x] Implement credit balance tracking and display
- [ ] Add purchase history page

## Stripe Webhook & Credit Top-ups
- [x] Set up Stripe webhook endpoint
- [x] Verify webhook signature from Stripe
- [x] Automatically add 5 credits to user account on successful payment
- [x] Handle webhook idempotency (prevent duplicate credit additions)
- [x] Log webhook events for debugging

## Owner Notifications
- [x] Set up owner notification system using built-in Manus API
- [x] Send notification on every successful Stripe payment
- [x] Include purchase details in notification
- [ ] Test notification delivery

## PWA Support
- [x] Create manifest.json with app metadata
- [x] Add PWA meta tags to HTML
- [x] Configure installable app icons
- [ ] Test installation on Android/Samsung tablet
- [ ] Ensure app works offline (cached pages)

## Testing & Polish
- [ ] Test complete user flow: login → upload → analysis → payment → credit deduction
- [ ] Test Stripe webhook with test payments
- [ ] Verify owner notifications arrive correctly
- [ ] Test PWA installation and offline functionality
- [ ] Polish UI/UX for premium feel
- [ ] Verify all text is in Swedish
- [ ] Test on mobile and tablet devices

## Deployment & Launch
- [ ] Create checkpoint before final deployment
- [ ] Deploy to production
- [ ] Configure Stripe live keys (replace test keys)
- [ ] Verify all systems working in production
