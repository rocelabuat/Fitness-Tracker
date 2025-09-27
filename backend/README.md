# Fitness Tracker Django Backend

A Django REST API backend for a fitness tracking application with full CRUD operations.

## Features

- **User Management**: Create, read, update, and delete user profiles
- **Daily Activity Tracking**: Record daily steps, distance, and calories
- **Manual Entry System**: Add custom activities with duration and calories
- **RESTful API**: Complete CRUD operations with proper HTTP status codes
- **Data Validation**: Comprehensive input validation and error handling
- **CORS Support**: Configured for frontend integration
- **Pagination**: Built-in pagination for better performance

## Database Schema

### Users Table

- `id`: Primary key
- `username`: Unique username (3-50 characters)
- `gender`: M/F/ (optional)
- `weight`: Weight in kg (20-300)
- `height`: Height in cm (100-250)
- `age`: Age in years (1-150)
- `step_goal`: Daily step goal (1000-100000, default: 10000)

### Daily Activity Table

- `id`: Primary key
- `user_id`: Foreign key to users
- `date`: Activity date (no future dates)
- `steps`: Number of steps (0-100000)
- `distance`: Distance in meters (0-1000000)
- `calories`: Calories burned (0-10000)

### Manual Entries Table

- `id`: Primary key
- `daily_activity_id`: Foreign key to daily_activity
- `activity`: Activity name (2-50 characters)
- `duration`: Duration in minutes (0-1440, optional)
- `calories`: Calories burned (0-5000)

## Setup Instructions

### 1. Install Dependencies

```bash
cd backend
pip install -r requirements.txt
```

### 2. Database Setup

```bash
# Create and apply migrations
python manage.py makemigrations
python manage.py migrate

# Create superuser (optional)
python manage.py createsuperuser
```

### 3. Populate Test Data (Optional)

```bash
# Create test users with sample data
python manage.py populate_test_data --users 3
```

### 4. Run Development Server

```bash
python manage.py runserver
```

The API will be available at `http://localhost:8000/api/`

## API Endpoints

### Users

- `GET /api/users/` - List all users
- `POST /api/users/` - Create new user
- `GET /api/users/{id}/` - Get user details
- `PUT /api/users/{id}/` - Update user
- `DELETE /api/users/{id}/` - Delete user
- `GET /api/users/{id}/activities/` - Get user's activities
- `GET /api/users/{id}/recent/` - Get recent activities (last 7 days)

### Daily Activities

- `GET /api/daily-activities/` - List activities
- `POST /api/daily-activities/` - Create activity
- `GET /api/daily-activities/{id}/` - Get activity details
- `PUT /api/daily-activities/{id}/` - Update activity
- `DELETE /api/daily-activities/{id}/` - Delete activity
- `GET /api/daily-activities/by-date-range/` - Filter by date range

### Manual Entries

- `GET /api/manual-entries/` - List manual entries
- `POST /api/manual-entries/` - Create manual entry
- `GET /api/manual-entries/{id}/` - Get entry details
- `PUT /api/manual-entries/{id}/` - Update entry
- `DELETE /api/manual-entries/{id}/` - Delete entry
- `GET /api/manual-entries/by-user/` - Filter by user
- `GET /api/manual-entries/by-activity-type/` - Filter by activity type

## Query Parameters

### Users

- `username`: Filter by username (case-insensitive partial match)

### Daily Activities

- `user_id`: Filter by user ID
- `date`: Filter by specific date
- `start_date` & `end_date`: Filter by date range

### Manual Entries

- `daily_activity_id`: Filter by daily activity ID
- `activity`: Filter by activity name (case-insensitive partial match)
- `user_id`: Filter by user ID (via daily activity)
- `activity_type`: Filter by activity type

## Example API Usage

### Create a User

```bash
curl -X POST http://localhost:8000/api/users/ \
  -H "Content-Type: application/json" \
  -d '{
    "username": "john_doe",
    "gender": "M",
    "weight": 75,
    "height": 180,
    "age": 30,
    "step_goal": 12000
  }'
```

### Create Daily Activity

```bash
curl -X POST http://localhost:8000/api/daily-activities/ \
  -H "Content-Type: application/json" \
  -d '{
    "user": 1,
    "date": "2024-01-15",
    "steps": 8500,
    "distance": 6000,
    "calories": 2200
  }'
```

### Create Manual Entry

```bash
curl -X POST http://localhost:8000/api/manual-entries/ \
  -H "Content-Type: application/json" \
  -d '{
    "daily_activity": 1,
    "activity": "Running",
    "duration": 30,
    "calories": 300
  }'
```

## Configuration

### CORS Settings

The backend is configured to allow all origins for development. For production, update the CORS settings in `settings.py`:

```python
CORS_ALLOWED_ORIGINS = [
    "http://localhost:3000",
    "http://127.0.0.1:3000",
]
```

### Pagination

Default page size is set to 20 items. This can be customized in the REST framework settings.

## Testing

Run the test suite:

```bash
python manage.py test
```

## Admin Interface

Access the Django admin interface at `http://localhost:8000/admin/` to manage data through the web interface.

## Production Deployment

For production deployment:

1. Set `DEBUG = False` in settings
2. Configure proper database (PostgreSQL recommended)
3. Set up proper CORS origins
4. Configure static file serving
5. Set up proper authentication and permissions
6. Use environment variables for sensitive settings

## Dependencies

- Django 5.2.6
- Django REST Framework 3.16.1
- django-cors-headers 4.9.0
- SQLite (development) / PostgreSQL (production)
