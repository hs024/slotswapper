# SlotSwapper

SlotSwapper is a peer-to-peer time-slot scheduling app. Users can mark their busy slots as "swappable," view others' swappable slots, and request swaps. Accepted swaps update the owners' calendars automatically.

---

## Features

- **User Authentication**: Sign up / Login with JWT-based sessions.
- **Dashboard**: Create slots, mark them swappable.
- **Marketplace**: See other users' swappable slots, request swaps.
- **Requests**: View incoming/outgoing swap requests, accept/reject them.
- **State Management**: Dynamic updates without page refresh.
- **Delete slot** : Delete the slot 
---

## Tech Stack

- **Frontend**: React, Tailwind CSS
- **Backend**: FastAPI (Python)
- **Database**: SQLite (via SQLAlchemy)
- **Authentication**: JWT tokens

---
## Folder Structure
This app consist of two folder 
1. backend (fastapi)
2. frontend (Reactjs)
---
## Setup
```
1. Clone repo:
   git clone <repo_url>
   cd slotsswapper
2. Create .env file in both folders :
    VITE_API_URL=http://127.0.0.1:8000 // in frontend
    JWT_SECRET=your_secret
    JWT_ALGORITHM=HS256
    ACCESS_TOKEN_EXPIRE_MINUTES=1440
    DATABASE_URL=sqlite:///./app.db
3. Install backend dependencies:
    cd backend
    pip install -r requirements.txt
4. Run backend:
    uvicorn main:app --reload --port 8000
5. Install frontend:
    cd frontend\frontend
    npm install
    npm run dev

6.Open browser: http://localhost:5173
```
---
## API Endpoints

| Method | Endpoint                  | Description                          |
|--------|---------------------------|--------------------------------------|
| POST   | /api/auth/signup          | Register a new user                  |
| POST   | /api/auth/login           | Login, returns JWT                   |
| GET    | /api/my-slots             | Get user's own slots                 |
| POST   | /api/slots                | Create new slot                       |
| PATCH  | /api/slots/{id}           | Update slot status                    |
| GET    | /api/swappable-slots      | Get all swappable slots               |
| POST   | /api/swap-request         | Request a swap with another slot     |
| POST   | /api/swap-response/{id}   | Accept or reject a swap request      |

---
## Assumptions / Notes
1. Slots must be marked SWAPPABLE before requesting swaps.
2. Swap transaction ensures atomic ownership change.
3. This is a demo app for assignment
---
## Live Demo: url