import logging
from django.contrib.auth.models import User
from django.shortcuts import get_object_or_404
from rest_framework import generics, status, permissions
from rest_framework.decorators import api_view, permission_classes
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework_simplejwt.tokens import RefreshToken

from .models import (
    Category, Product, Review,
    Cart, CartItem, Address, Order, OrderItem,
    MpesaTransaction,
)
from .serializers import (
    RegisterSerializer, UserSerializer,
    CategorySerializer, ProductListSerializer, ProductDetailSerializer, ReviewSerializer,
    CartSerializer, CartItemSerializer, AddressSerializer,
    OrderSerializer, PlaceOrderSerializer,
    StkPushSerializer, MpesaTransactionSerializer,
)
from .filters import ProductFilter
from .mpesa.client import mpesa_client
from .mpesa.callbacks import process_stk_callback

logger = logging.getLogger(__name__)


# ─── Auth ────────────────────────────────────────────────────────────────────
class RegisterView(generics.CreateAPIView):
    queryset = User.objects.all()
    serializer_class = RegisterSerializer
    permission_classes = [permissions.AllowAny]

    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        user = serializer.save()
        refresh = RefreshToken.for_user(user)
        return Response(
            {
                "user": UserSerializer(user).data,
                "access": str(refresh.access_token),
                "refresh": str(refresh),
            },
            status=status.HTTP_201_CREATED,
        )


class MeView(generics.RetrieveUpdateAPIView):
    serializer_class = UserSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_object(self):
        return self.request.user


# ─── Categories ──────────────────────────────────────────────────────────────
class CategoryListView(generics.ListAPIView):
    queryset = Category.objects.filter(parent=None).prefetch_related("children")
    serializer_class = CategorySerializer
    permission_classes = [permissions.AllowAny]


# ─── Products ────────────────────────────────────────────────────────────────
class ProductListView(generics.ListAPIView):
    queryset = (
        Product.objects.filter(is_active=True)
        .select_related("category")
        .prefetch_related("reviews")
    )
    serializer_class = ProductListSerializer
    permission_classes = [permissions.AllowAny]
    filterset_class = ProductFilter
    search_fields = ["name", "brand", "description"]
    ordering_fields = ["price", "created_at", "average_rating"]
    ordering = ["-created_at"]


class ProductDetailView(generics.RetrieveAPIView):
    queryset = Product.objects.filter(is_active=True).select_related("category").prefetch_related(
        "images", "reviews__user"
    )
    serializer_class = ProductDetailSerializer
    permission_classes = [permissions.AllowAny]
    lookup_field = "slug"


class FlashSaleProductsView(generics.ListAPIView):
    queryset = Product.objects.filter(is_active=True, is_flash_sale=True)
    serializer_class = ProductListSerializer
    permission_classes = [permissions.AllowAny]


# ─── Reviews ─────────────────────────────────────────────────────────────────
class ReviewCreateView(generics.CreateAPIView):
    serializer_class = ReviewSerializer
    permission_classes = [permissions.IsAuthenticated]

    def perform_create(self, serializer):
        product = get_object_or_404(Product, slug=self.kwargs["slug"])
        serializer.save(user=self.request.user, product=product)


# ─── Cart ────────────────────────────────────────────────────────────────────
class CartView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def _get_or_create_cart(self, user):
        cart, _ = Cart.objects.get_or_create(user=user)
        return cart

    def get(self, request):
        cart = self._get_or_create_cart(request.user)
        return Response(CartSerializer(cart).data)

    def delete(self, request):
        """Clear all cart items."""
        cart = self._get_or_create_cart(request.user)
        cart.items.all().delete()
        return Response({"detail": "Cart cleared."}, status=status.HTTP_204_NO_CONTENT)


class CartAddView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request):
        cart, _ = Cart.objects.get_or_create(user=request.user)
        serializer = CartItemSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        product = serializer.validated_data["product"]
        quantity = serializer.validated_data.get("quantity", 1)

        if product.stock < quantity:
            return Response(
                {"detail": f"Only {product.stock} items available."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        item, created = CartItem.objects.get_or_create(cart=cart, product=product)
        if not created:
            item.quantity = min(item.quantity + quantity, product.stock)
            item.save()
        else:
            item.quantity = quantity
            item.save()

        return Response(CartSerializer(cart).data, status=status.HTTP_200_OK)


class CartItemUpdateView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def patch(self, request, pk):
        cart = get_object_or_404(Cart, user=request.user)
        item = get_object_or_404(CartItem, pk=pk, cart=cart)
        quantity = request.data.get("quantity", 1)
        if quantity < 1:
            return Response({"detail": "Quantity must be at least 1."}, status=400)
        if quantity > item.product.stock:
            return Response({"detail": f"Only {item.product.stock} available."}, status=400)
        item.quantity = quantity
        item.save()
        return Response(CartSerializer(cart).data)

    def delete(self, request, pk):
        cart = get_object_or_404(Cart, user=request.user)
        item = get_object_or_404(CartItem, pk=pk, cart=cart)
        item.delete()
        return Response(CartSerializer(cart).data)


# ─── Addresses ───────────────────────────────────────────────────────────────
class AddressListCreateView(generics.ListCreateAPIView):
    serializer_class = AddressSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        return Address.objects.filter(user=self.request.user)

    def perform_create(self, serializer):
        if serializer.validated_data.get("is_default"):
            Address.objects.filter(user=self.request.user).update(is_default=False)
        serializer.save(user=self.request.user)


class AddressDetailView(generics.RetrieveUpdateDestroyAPIView):
    serializer_class = AddressSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        return Address.objects.filter(user=self.request.user)


# ─── Orders ──────────────────────────────────────────────────────────────────
class OrderListView(generics.ListAPIView):
    serializer_class = OrderSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        return Order.objects.filter(user=self.request.user).prefetch_related("items")


class OrderDetailView(generics.RetrieveAPIView):
    serializer_class = OrderSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        return Order.objects.filter(user=self.request.user).prefetch_related("items")


class PlaceOrderView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request):
        serializer = PlaceOrderSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        address = get_object_or_404(
            Address, pk=serializer.validated_data["address_id"], user=request.user
        )
        cart = get_object_or_404(Cart, user=request.user)

        if not cart.items.exists():
            return Response({"detail": "Your cart is empty."}, status=400)

        # Validate stock
        for item in cart.items.select_related("product").all():
            if item.product.stock < item.quantity:
                return Response(
                    {"detail": f"'{item.product.name}' has only {item.product.stock} in stock."},
                    status=400,
                )

        subtotal = cart.total
        shipping_cost = 0 if subtotal >= 2000 else 200  # Free shipping above KES 2000
        total = subtotal + shipping_cost

        order = Order.objects.create(
            user=request.user,
            shipping_address=address,
            payment_method=serializer.validated_data["payment_method"],
            subtotal=subtotal,
            shipping_cost=shipping_cost,
            total=total,
            notes=serializer.validated_data.get("notes", ""),
        )

        for item in cart.items.select_related("product").all():
            OrderItem.objects.create(
                order=order,
                product=item.product,
                product_name=item.product.name,
                product_price=item.product.price,
                quantity=item.quantity,
                subtotal=item.subtotal,
            )
            # Deduct stock
            item.product.stock -= item.quantity
            item.product.save(update_fields=["stock"])

        cart.items.all().delete()
        return Response(OrderSerializer(order).data, status=status.HTTP_201_CREATED)


# ─── M-Pesa ──────────────────────────────────────────────────────────────────
class StkPushView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request):
        serializer = StkPushSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        order = get_object_or_404(
            Order, pk=serializer.validated_data["order_id"], user=request.user
        )

        if order.payment_status == "paid":
            return Response({"detail": "Order is already paid."}, status=400)

        phone = serializer.validated_data["phone_number"]

        # Create/update transaction record
        txn, _ = MpesaTransaction.objects.get_or_create(
            order=order,
            defaults={"phone_number": phone, "amount": order.total, "status": "initiated"},
        )
        if not _:
            txn.phone_number = phone
            txn.status = "initiated"
            txn.save(update_fields=["phone_number", "status", "updated_at"])

        try:
            result = mpesa_client.stk_push(
                phone=phone,
                amount=int(order.total),
                account_ref=order.order_number,
                description=f"Jumia Order {order.order_number}",
            )
        except Exception as e:
            return Response({"detail": str(e)}, status=503)

        if result.get("ResponseCode") == "0":
            txn.merchant_request_id = result.get("MerchantRequestID", "")
            txn.checkout_request_id = result.get("CheckoutRequestID", "")
            txn.status = "pending"
            txn.save(update_fields=["merchant_request_id", "checkout_request_id", "status"])

            order.payment_status = "pending"
            order.save(update_fields=["payment_status"])

            return Response(
                {
                    "detail": "STK Push sent. Check your phone.",
                    "checkout_request_id": txn.checkout_request_id,
                    "merchant_request_id": txn.merchant_request_id,
                }
            )
        else:
            return Response(
                {"detail": result.get("errorMessage", "STK Push failed.")},
                status=400,
            )


class MpesaCallbackView(APIView):
    """
    Endpoint called by Safaricom after customer completes/cancels M-Pesa payment.
    Must be publicly accessible (no auth) — whitelisted by IP in production.
    """
    permission_classes = [permissions.AllowAny]

    def post(self, request):
        parsed = process_stk_callback(request.data)
        checkout_id = parsed.get("checkout_request_id")

        if not checkout_id:
            logger.warning("M-Pesa callback missing CheckoutRequestID")
            return Response({"ResultCode": 0, "ResultDesc": "Accepted"})

        try:
            txn = MpesaTransaction.objects.select_related("order").get(
                checkout_request_id=checkout_id
            )
        except MpesaTransaction.DoesNotExist:
            logger.error(f"No transaction found for CheckoutRequestID: {checkout_id}")
            return Response({"ResultCode": 0, "ResultDesc": "Accepted"})

        txn.result_code = parsed["result_code"]
        txn.result_desc = parsed["result_desc"]
        txn.raw_callback = request.data

        if parsed["success"]:
            txn.status = "success"
            txn.mpesa_receipt_number = parsed.get("receipt_number", "")
            txn.order.payment_status = "paid"
            txn.order.status = "confirmed"
            txn.order.save(update_fields=["payment_status", "status"])
        else:
            txn.status = "failed"
            txn.order.payment_status = "failed"
            txn.order.save(update_fields=["payment_status"])

        txn.save()
        # Must return 200 with this body so Safaricom stops retrying
        return Response({"ResultCode": 0, "ResultDesc": "Accepted"})


class MpesaStatusView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request, checkout_id):
        txn = get_object_or_404(
            MpesaTransaction,
            checkout_request_id=checkout_id,
            order__user=request.user,
        )
        return Response(MpesaTransactionSerializer(txn).data)