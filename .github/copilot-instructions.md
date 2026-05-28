# UMAT Hostels Mobile App - Copilot Instructions

## Project Overview
This is an Expo React Native mobile application for University of Mines and Technology (UMAT) students to find and book hostels in Tarkwa, Ghana. The app uses a freemium model with 15 GHS premium access and features a professional design with Supabase backend.

## Development Checklist

- [x] Verify that the copilot-instructions.md file in the .github directory is created.

- [x] Clarify Project Requirements
  Expo React Native mobile app for UMAT students hostel booking with Supabase backend

- [ ] Scaffold the Project
  Use Expo CLI to create new React Native project with TypeScript template.
  Run: npx create-expo-app UMATHostels --template blank-typescript
  Initialize Supabase configuration files.
  Set up proper folder structure for screens, components, services, and utilities.
  Configure environment variables for Supabase keys and API endpoints.

- [ ] Install Core Dependencies
  Install required packages:
  - @supabase/supabase-js (Supabase client)
  - @react-navigation/native (Navigation)
  - @react-navigation/stack
  - @react-navigation/bottom-tabs
  - expo-location (GPS/Maps)
  - expo-notifications (Push notifications)
  - expo-image-picker (Photo handling)
  - expo-secure-store (Secure storage)
  - react-native-maps (Google Maps)
  - expo-linking (Deep linking)
  - @react-native-async-storage/async-storage

- [ ] Setup Project Structure
  Create organized folder structure:
  /src
    /components (Reusable UI components)
    /screens (App screens)
    /services (API calls, Supabase client)
    /hooks (Custom React hooks)
    /types (TypeScript interfaces)
    /utils (Helper functions)
    /constants (Colors, dimensions, etc.)
    /navigation (Navigation configuration)
  /assets (Images, fonts, icons)

- [ ] Configure Supabase Integration
  Set up Supabase client configuration
  Create authentication service with phone verification
  Set up database schema for hostels, users, bookings
  Configure Row Level Security policies
  Set up real-time subscriptions
  Configure Supabase Storage for images

- [ ] Implement Core Features
  Authentication screens (Login, Register, Verify Phone)
  Home screen with hostel listings
  Search and filter functionality
  Hostel detail screens
  Map view integration
  User profile and settings
  Payment integration screens
  Messaging system

- [ ] Apply Design System
  Implement professional color scheme:
  - Primary: Deep navy blue (#1B365D)
  - Secondary: Gold/amber (#F4A261)
  - Background: Clean whites and light grays
  Create reusable styled components
  Ensure mobile-first responsive design
  Add proper typography and spacing

- [ ] Configure Maps and Location
  Set up Google Maps integration
  Implement location permissions
  Add hostel markers on map
  Calculate distances from UMAT campus
  Enable location-based search

- [ ] Setup Payment Integration
  Research and integrate Ghana mobile money APIs:
  - MTN Mobile Money
  - Vodafone Cash
  - AirtelTigo Money
  Implement premium feature unlocking
  Add payment verification

- [ ] Implement Push Notifications
  Configure Expo Push Notifications
  Set up Supabase Edge Functions for triggers
  Create notification service
  Handle notification permissions
  Test notification delivery

- [ ] Add Real-time Features
  Set up Supabase real-time subscriptions
  Implement real-time messaging
  Live booking status updates
  Real-time hostel availability

- [ ] Configure Build and Deployment
  Set up EAS Build configuration
  Configure app signing for Android/iOS
  Set up environment variables for production
  Test builds on physical devices
  Prepare for Google Play Store and App Store submission

- [ ] Testing and Quality Assurance
  Test on multiple device sizes
  Verify payment flows with test accounts
  Test offline functionality
  Performance testing with large datasets
  User acceptance testing with UMAT students

- [ ] Documentation and Deployment
  Update README with setup instructions
  Document API endpoints and database schema
  Create user guide for hostel owners
  Deploy to app stores
  Set up analytics and monitoring

## Technical Specifications

### Tech Stack
- **Frontend**: Expo React Native with TypeScript
- **Backend**: Supabase (PostgreSQL, Auth, Storage, Real-time)
- **Maps**: Google Maps API
- **Payments**: Ghana Mobile Money services
- **Notifications**: Expo Push Notifications

### Design Requirements
- Professional, corporate-grade UI
- Navy blue (#1B365D) and gold (#F4A261) color scheme
- Mobile-first responsive design
- Accessibility compliance
- No purple gradients or typical AI aesthetics

### Data Management
- Real hostel data from Tarkwa area
- High-quality photos (minimum 5 per hostel)
- Verified contact information
- Accurate pricing and availability

### Business Model
- Freemium with 15 GHS premium access
- Featured listings for hostel owners
- Commission on successful bookings
- Local payment method integration

## Development Guidelines

### Code Quality
- Use TypeScript for type safety
- Follow React Native best practices
- Implement proper error handling
- Add comprehensive logging
- Write unit tests for critical functions

### Performance
- Optimize image loading and caching
- Implement lazy loading for large lists
- Use FlatList for performance with large datasets
- Minimize bundle size
- Optimize for low-end Android devices

### Security
- Implement proper authentication flows
- Use secure storage for sensitive data
- Validate all user inputs
- Follow Supabase security best practices
- Implement Row Level Security policies

### Ghana-Specific Considerations
- Support Ghana phone number formats (+233)
- Handle intermittent internet connectivity
- Optimize for popular Android devices in Ghana
- Consider data usage optimization
- Support local languages if needed

## Success Metrics
- User registration and retention rates
- Premium conversion rate (target: 20%)
- Successful hostel bookings
- App store ratings (target: 4.5+)
- Student satisfaction surveys