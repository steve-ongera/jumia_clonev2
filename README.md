#  Jumia Clone — Full Stack E-Commerce Platform

A full-stack Jumia-style e-commerce platform built with **Django REST Framework** + **React**, featuring **M-Pesa Daraja API** real-time payment integration.

---

##  Project Directory Structure

```
jumia-clone/
├── README.md
│
├── backend/                          # Django Backend
│   ├── manage.py
│   ├── requirements.txt
│   ├── .env.example
│   ├── jumia_backend/                # Project config
│   │   ├── __init__.py
│   │   ├── settings.py
│   │   ├── urls.py
│   │   ├── wsgi.py
│   │   └── asgi.py
│   └── core/                         # Single core app
│       ├── __init__.py
│       ├── admin.py
│       ├── apps.py
│       ├── models.py                 # All models
│       ├── serializers.py            # DRF serializers
│       ├── views.py                  # All API views
│       ├── urls.py                   # App URL routes
│       ├── permissions.py            # Custom permissions
│       ├── filters.py                # Product filters
│       ├── pagination.py             # Custom pagination
│       └── mpesa/
│           ├── __init__.py
│           ├── client.py             # Daraja API client
│           ├── utils.py              # M-Pesa helpers
│           └── callbacks.py          # STK Push callbacks
│
└── frontend/                         # React Frontend
    ├── package.json
    ├── vite.config.js
    ├── .env.example
    ├── index.html                    # Bootstrap Icons + Google Fonts
    ├── src/
    │   ├── main.jsx                  # React entry point
    │   ├── App.jsx                   # Root component + routes
    │   ├── utils/
    │   │   └── api.js                # Axios instance + all API calls
    │   ├── context/
    │   │   ├── AuthContext.jsx       # Auth state
    │   │   └── CartContext.jsx       # Cart state
    │   ├── components/
    │   │   ├── Navbar.jsx
    │   │   ├── Footer.jsx
    │   │   ├── ProductCard.jsx
    │   │   ├── CategoryBar.jsx
    │   │   ├── HeroBanner.jsx
    │   │   ├── FlashSaleTimer.jsx
    │   │   ├── StarRating.jsx
    │   │   ├── Spinner.jsx
    │   │   ├── MpesaModal.jsx
    │   │   └── ProtectedRoute.jsx
    │   └── pages/
    │       ├── Home.jsx
    │       ├── ProductList.jsx
    │       ├── ProductDetail.jsx
    │       ├── Cart.jsx
    │       ├── Checkout.jsx
    │       ├── OrderConfirmation.jsx
    │       ├── Orders.jsx
    │       ├── Login.jsx
    │       ├── Register.jsx
    │       └── NotFound.jsx
```

---

##  Tech Stack

| Layer | Technology |
|---|---|
| Backend Framework | Django 5.x + Django REST Framework |
| Database | PostgreSQL (SQLite for dev) |
| Auth | JWT (djangorestframework-simplejwt) |
| Payments | Safaricom M-Pesa Daraja API (STK Push) |
| Frontend | React 18 + Vite |
| Routing | React Router v6 |
| HTTP Client | Axios |
| Styling | Jumia-theme CSS (orange/white) + Bootstrap Icons |
| State | React Context API |

---

##  Backend Setup

```bash
cd backend
python -m venv venv
source venv/bin/activate        # Windows: venv\Scripts\activate
pip install -r requirements.txt

# Copy and fill environment variables
cp .env.example .env

python manage.py migrate
python manage.py createsuperuser
python manage.py runserver
```

### Backend `.env.example`
```
SECRET_KEY=your-django-secret-key
DEBUG=True
ALLOWED_HOSTS=localhost,127.0.0.1

# Database (leave blank to use SQLite)
DATABASE_URL=

# M-Pesa Daraja API
MPESA_ENVIRONMENT=sandbox
MPESA_CONSUMER_KEY=your-consumer-key
MPESA_CONSUMER_SECRET=your-consumer-secret
MPESA_SHORTCODE=174379
MPESA_PASSKEY=your-lipa-na-mpesa-passkey
MPESA_CALLBACK_URL=https://yourdomain.com/api/mpesa/callback/

# CORS
CORS_ALLOWED_ORIGINS=http://localhost:5173
```

---

##  Frontend Setup

```bash
cd frontend
npm install
cp .env.example .env
npm run dev
```

### Frontend `.env.example`
```
VITE_API_BASE_URL=http://localhost:8000/api
```

---

##  API Endpoints

### Auth
| Method | Endpoint | Description |
|---|---|---|
| POST | `/api/auth/register/` | Register user |
| POST | `/api/auth/login/` | Login → returns JWT |
| POST | `/api/auth/refresh/` | Refresh access token |
| GET | `/api/auth/me/` | Current user profile |

### Products
| Method | Endpoint | Description |
|---|---|---|
| GET | `/api/products/` | List products (filterable) |
| GET | `/api/products/{id}/` | Product detail |
| GET | `/api/categories/` | All categories |
| GET | `/api/products/?category=&search=&min_price=&max_price=` | Filter/search |

### Cart
| Method | Endpoint | Description |
|---|---|---|
| GET | `/api/cart/` | View cart |
| POST | `/api/cart/add/` | Add item |
| PATCH | `/api/cart/update/{id}/` | Update quantity |
| DELETE | `/api/cart/remove/{id}/` | Remove item |

### Orders
| Method | Endpoint | Description |
|---|---|---|
| POST | `/api/orders/` | Place order |
| GET | `/api/orders/` | User's orders |
| GET | `/api/orders/{id}/` | Order detail |

### M-Pesa
| Method | Endpoint | Description |
|---|---|---|
| POST | `/api/mpesa/stk-push/` | Initiate STK Push |
| POST | `/api/mpesa/callback/` | Safaricom callback |
| GET | `/api/mpesa/status/{checkout_id}/` | Query payment status |

---

##  M-Pesa Flow

```
1. User clicks "Pay with M-Pesa" on Checkout page
2. Frontend sends phone + amount → POST /api/mpesa/stk-push/
3. Backend calls Daraja → STK Push sent to user's phone
4. User enters PIN on phone
5. Safaricom sends result → POST /api/mpesa/callback/
6. Backend updates Order.payment_status
7. Frontend polls GET /api/mpesa/status/{checkout_id}/ every 3s
8. Order confirmation shown to user
```

---

##  M-Pesa Sandbox Test Credentials

- **Phone**: 254708374149
- **PIN**: any 4-digit PIN (sandbox doesn't validate)
- Register at: https://developer.safaricom.co.ke

---

##  Docker (Optional)

```bash
docker-compose up --build
```

---

##  License

MIT