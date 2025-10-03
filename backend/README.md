## Fitness Tracker Backend (Django + DRF)

This is the backend for the Fitness Tracker app, built with Django 5 and Django REST Framework.

### Prerequisites

- Python 3.12
- PowerShell (Windows)

### Get Started (Windows)

1. Open PowerShell and navigate to the backend folder:
   ```bash
   cd backend
   ```
2. Activate the existing virtual environment (recommended):
   ```bash
   .\venv\Scripts\activate
   ```
   If you don't want to use the provided venv, create and activate your own:
   ```bash
   python -m venv venv
   .\venv\Scripts\activate
   ```
3. Install dependencies (if needed):
   ```bash
   pip install django==5.2.6 djangorestframework==3.16.1
   ```
4. Apply migrations:
   ```bash
   python manage.py migrate
   ```
5. Run the development server:
   ```bash
   python manage.py runserver
   ```

Server runs at `http://127.0.0.1:8000/` by default.

### Project Structure

- `django_rest_main/` – Django project config (root URLs, settings)
- `api/` – REST API app (serializers, views, API URLs)
- `fittracker/` – Core models app

### Base URL Prefixes

- Admin: `/admin/`
- Fitness models app: `/fittracker/` (app-specific URLs; see `fittracker/urls.py` if needed)
- REST API: `/api/`

### API Endpoints (under `/api/`)

Users

- `GET /add-user/` – List users
- `POST /add-user/` – Create user
- `POST /login/` – Login
- `GET /update-user/<pk>/` – Retrieve user
- `PATCH /update-user/<pk>/` – Partially update user (`age`, `height`, `weight`, `gender`, `step_goal`)

Daily Activity

- `GET /daily-activity/` – List daily activities
- `POST /daily-activity/` – Create daily activity
- `GET /daily-activity/<pk>/` – Retrieve
- `PUT /daily-activity/<pk>/` – Update
- `PATCH /daily-activity/<pk>/` – Partial update
- `DELETE /daily-activity/<pk>/` – Delete
- `GET /daily-activity/user/<user_id>/` – List daily activities for a user

Manual Entry

- `GET /manual-entry/` – List manual entries
- `POST /manual-entry/` – Create manual entry
- `GET /manual-entry/<pk>/` – Retrieve
- `PUT /manual-entry/<pk>/` – Update
- `PATCH /manual-entry/<pk>/` – Partial update
- `DELETE /manual-entry/<pk>/` – Delete
- `GET /manual-entry/user/<user_id>/` – List manual entries for a user

Aggregations & Utilities

- `GET /weekly-activity/<user_id>/` – Weekly summary for a user (averages for steps, distance, calories; total calories)
- `DELETE /history/user/<user_id>/` – Delete all history (daily activities + manual entries) for a user
- `DELETE /delete-activity/<user_id>/` – Deletes a single activity for a user, requires `id` and `type` (`daily` or `manual`) in the request body.

### Example Requests

Using PowerShell curl alias (`curl` maps to `Invoke-WebRequest`). For raw body posting, prefer `Invoke-RestMethod`:

```powershell
# List users
Invoke-RestMethod -Method GET http://127.0.0.1:8000/api/fittracker/

# Create user
Invoke-RestMethod -Method POST \
  -Uri http://127.0.0.1:8000/api/fittracker/ \
  -ContentType 'application/json' \
  -Body (@{ age=25; height=175; weight=70; gender='male'; step_goal=8000 } | ConvertTo-Json)

# Weekly summary
Invoke-RestMethod -Method GET http://127.0.0.1:8000/api/weekly-activity/1/
```

### Running Tests

```bash
python manage.py test
```

### Notes

- All responses are JSON.
- Authentication is not configured in this snapshot; add DRF auth if needed.
- For additional URLs, see:
  - `django_rest_main/urls.py`
  - `api/urls.py`
  - `api/views.py`
