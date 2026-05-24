# core/urls.py
from django.urls import path
from rest_framework_simplejwt.views import TokenObtainPairView, TokenRefreshView
from . import views

urlpatterns = [
    # Auth
    path("auth/register/", views.RegisterView.as_view(), name="register"),
    path("auth/login/", TokenObtainPairView.as_view(), name="login"),
    path("auth/refresh/", TokenRefreshView.as_view(), name="token-refresh"),
    path("auth/me/", views.MeView.as_view(), name="me"),

    # Categories
    path("categories/", views.CategoryListView.as_view(), name="categories"),

    # Products
    path("products/", views.ProductListView.as_view(), name="products"),
    path("products/flash-sale/", views.FlashSaleProductsView.as_view(), name="flash-sale"),
    path("products/<slug:slug>/", views.ProductDetailView.as_view(), name="product-detail"),
    path("products/<slug:slug>/reviews/", views.ReviewCreateView.as_view(), name="review-create"),

    # Cart
    path("cart/", views.CartView.as_view(), name="cart"),
    path("cart/add/", views.CartAddView.as_view(), name="cart-add"),
    path("cart/item/<int:pk>/", views.CartItemUpdateView.as_view(), name="cart-item"),

    # Addresses
    path("addresses/", views.AddressListCreateView.as_view(), name="addresses"),
    path("addresses/<int:pk>/", views.AddressDetailView.as_view(), name="address-detail"),

    # Orders
    path("orders/", views.OrderListView.as_view(), name="orders"),
    path("orders/place/", views.PlaceOrderView.as_view(), name="place-order"),
    path("orders/<int:pk>/", views.OrderDetailView.as_view(), name="order-detail"),

    # M-Pesa
    path("mpesa/stk-push/", views.StkPushView.as_view(), name="stk-push"),
    path("mpesa/callback/", views.MpesaCallbackView.as_view(), name="mpesa-callback"),
    path("mpesa/status/<str:checkout_id>/", views.MpesaStatusView.as_view(), name="mpesa-status"),
]