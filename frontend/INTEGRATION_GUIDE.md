# Frontend-Backend Integration Guide

This guide explains how the React frontend has been integrated with the Django backend API for the Fitness Tracker application.

## Overview

The frontend has been completely integrated with the Django REST API backend, providing:

- **User Management**: Create, sign in, and manage user profiles
- **Daily Activity Tracking**: Real-time step tracking with API synchronization
- **Manual Entry System**: Add custom activities with duration and calories
- **History Tracking**: View and export 7-day activity history
- **Settings Management**: Update user profile and preferences

## Architecture

### API Service Layer

- **`apiService.ts`**: Centralized API client with all backend endpoints
- **`dataConverter.ts`**: Utility functions for data transformation between frontend and backend formats
- **`FitnessContext.tsx`**: React context providing state management and API integration

### Key Components Updated

- **Dashboard**: Real-time activity tracking with API sync
- **ManualEntry**: Add steps and activities via API
- **History**: Fetch and display activity history from backend
- **Settings**: Update user profile through API
- **SignIn/SignUp**: User authentication and registration

## Data Flow

```
Frontend Component → FitnessContext → ApiService → Django Backend
                    ↓
              DataConverter (format transformation)
                    ↓
              React Query (caching & state)
```

## Backend Integration Details

### User Management

- **Sign Up**: Creates new users via `POST /api/users/`
- **Sign In**: Finds users by username via `GET /api/users/?username=...`
- **Profile Updates**: Updates user data via `PUT /api/users/{id}/`

### Activity Tracking

- **Daily Activities**: CRUD operations via `/api/daily-activities/`
- **Manual Entries**: CRUD operations via `/api/manual-entries/`
- **Today's Activity**: Auto-created if not exists, updated in real-time

### Data Validation

- All API requests include proper validation
- Error handling with user-friendly messages
- Loading states for better UX

## Setup Instructions

### 1. Backend Setup

```bash
cd backend
pip install -r requirements.txt
python manage.py migrate
python manage.py runserver
```

The backend will be available at `http://localhost:8000/api/`

### 2. Frontend Setup

```bash
cd frontend
npm install
npm run dev
```

The frontend will be available at `http://localhost:3000`

### 3. Test Data (Optional)

```bash
cd backend
python manage.py populate_test_data --users 3
```

## API Endpoints Used

### Users

- `GET /api/users/` - List all users
- `POST /api/users/` - Create new user
- `GET /api/users/{id}/` - Get user details
- `PUT /api/users/{id}/` - Update user
- `GET /api/users/?username={username}` - Find user by username

### Daily Activities

- `GET /api/daily-activities/` - List activities
- `POST /api/daily-activities/` - Create activity
- `PUT /api/daily-activities/{id}/` - Update activity
- `GET /api/daily-activities/by-date-range/` - Filter by date range

### Manual Entries

- `GET /api/manual-entries/` - List manual entries
- `POST /api/manual-entries/` - Create manual entry
- `PUT /api/manual-entries/{id}/` - Update entry
- `DELETE /api/manual-entries/{id}/` - Delete entry

## Key Features

### Real-time Step Tracking

- Motion sensor integration with API synchronization
- Debounced API calls to prevent excessive requests
- Local state management with backend persistence

### Activity Management

- Manual step entry
- Custom activity logging with duration and calories
- Automatic calorie calculation from steps

### Data Export

- CSV export functionality for activity history
- Formatted data with proper calculations

### User Experience

- Loading states for all API operations
- Error handling with toast notifications
- Responsive design maintained
- Theme support preserved

## Error Handling

The integration includes comprehensive error handling:

- **Network Errors**: Graceful fallbacks with user notifications
- **Validation Errors**: Field-specific error messages
- **Authentication Errors**: Automatic redirect to sign-in
- **Loading States**: Visual feedback during API calls

## Performance Optimizations

- **React Query**: Automatic caching and background updates
- **Debounced Updates**: Reduced API calls for real-time tracking
- **Optimistic Updates**: Immediate UI feedback with rollback on errors
- **Data Transformation**: Efficient conversion between frontend/backend formats

## Testing the Integration

1. **Create Account**: Use the sign-up form to create a new user
2. **Sign In**: Sign in with your username
3. **Track Steps**: Add steps manually or use motion sensor
4. **Add Activities**: Log custom exercises with duration and calories
5. **View History**: Check your 7-day activity history
6. **Export Data**: Download your activity data as CSV
7. **Update Settings**: Modify your profile and step goals

## Troubleshooting

### Common Issues

1. **CORS Errors**: Ensure Django CORS settings allow `http://localhost:3000`
2. **API Not Found**: Verify backend is running on `http://localhost:8000`
3. **Authentication Issues**: Check if user exists in backend database
4. **Data Not Syncing**: Verify API endpoints are responding correctly

### Debug Mode

Enable debug logging by adding to your browser console:

```javascript
localStorage.setItem("debug", "true");
```

## Future Enhancements

- **Offline Support**: Cache data for offline usage
- **Real-time Updates**: WebSocket integration for live data
- **Advanced Analytics**: Charts and insights from activity data
- **Social Features**: Share achievements and compete with friends
- **Device Integration**: Support for fitness wearables

## Dependencies

### Frontend

- React 18+
- TypeScript
- React Query (TanStack Query)
- Tailwind CSS
- Lucide React (icons)

### Backend

- Django 5.2.6
- Django REST Framework 3.16.1
- django-cors-headers 4.9.0
- SQLite (development)

## Security Considerations

- **Input Validation**: All user inputs are validated on both frontend and backend
- **Error Messages**: Generic error messages to prevent information leakage
- **CORS Configuration**: Properly configured for production deployment
- **Data Sanitization**: All data is properly sanitized before API calls

This integration provides a robust, scalable foundation for the Fitness Tracker application with proper separation of concerns and maintainable code architecture.
