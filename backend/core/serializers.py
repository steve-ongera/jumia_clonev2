from django.contrib.auth.models import User
from rest_framework import serializers
from .models import (
    Category, Product, ProductImage, Review,
    Cart, CartItem, Address, Order, OrderItem,
    MpesaTransaction, UserProfile,
)


# ─── Auth ────────────────────────────────────────────────────────────────────
class RegisterSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True, min_length=6)
    password2 = serializers.CharField(write_only=True)

    class Meta:
        model = User
        fields = ("id", "username", "email", "first_name", "last_name", "password", "password2")

    def validate(self, data):
        if data["password"] != data["password2"]:
            raise serializers.ValidationError({"password": "Passwords do not match."})
        return data

    def create(self, validated_data):
        validated_data.pop("password2")
        user = User.objects.create_user(**validated_data)
        UserProfile.objects.create(user=user)
        return user


class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ("id", "username", "email", "first_name", "last_name", "date_joined")


# ─── Category ────────────────────────────────────────────────────────────────
class CategorySerializer(serializers.ModelSerializer):
    children = serializers.SerializerMethodField()
    product_count = serializers.SerializerMethodField()

    class Meta:
        model = Category
        fields = ("id", "name", "slug", "icon", "image", "parent", "children", "product_count")

    def get_children(self, obj):
        if obj.children.exists():
            return CategorySerializer(obj.children.all(), many=True, context=self.context).data
        return []

    def get_product_count(self, obj):
        return obj.products.filter(is_active=True).count()


# ─── Product ─────────────────────────────────────────────────────────────────
class ProductImageSerializer(serializers.ModelSerializer):
    class Meta:
        model = ProductImage
        fields = ("id", "image", "alt_text")


class ReviewSerializer(serializers.ModelSerializer):
    user = serializers.StringRelatedField(read_only=True)

    class Meta:
        model = Review
        fields = ("id", "user", "rating", "title", "body", "created_at")
        read_only_fields = ("user", "created_at")


class ProductListSerializer(serializers.ModelSerializer):
    category_name = serializers.CharField(source="category.name", read_only=True)
    discount_percent = serializers.ReadOnlyField()
    average_rating = serializers.ReadOnlyField()
    review_count = serializers.ReadOnlyField()

    class Meta:
        model = Product
        fields = (
            "id", "name", "slug", "brand", "price", "old_price",
            "discount_percent", "image", "stock", "is_flash_sale",
            "flash_sale_end", "average_rating", "review_count", "category_name",
        )


class ProductDetailSerializer(serializers.ModelSerializer):
    category = CategorySerializer(read_only=True)
    images = ProductImageSerializer(many=True, read_only=True)
    reviews = ReviewSerializer(many=True, read_only=True)
    discount_percent = serializers.ReadOnlyField()
    average_rating = serializers.ReadOnlyField()
    review_count = serializers.ReadOnlyField()

    class Meta:
        model = Product
        fields = (
            "id", "name", "slug", "description", "brand", "price", "old_price",
            "discount_percent", "stock", "image", "images", "is_flash_sale",
            "flash_sale_end", "average_rating", "review_count", "category",
            "reviews", "created_at",
        )


# ─── Cart ────────────────────────────────────────────────────────────────────
class CartItemSerializer(serializers.ModelSerializer):
    product = ProductListSerializer(read_only=True)
    product_id = serializers.PrimaryKeyRelatedField(
        queryset=Product.objects.filter(is_active=True), source="product", write_only=True
    )
    subtotal = serializers.ReadOnlyField()

    class Meta:
        model = CartItem
        fields = ("id", "product", "product_id", "quantity", "subtotal")


class CartSerializer(serializers.ModelSerializer):
    items = CartItemSerializer(many=True, read_only=True)
    total = serializers.ReadOnlyField()
    item_count = serializers.ReadOnlyField()

    class Meta:
        model = Cart
        fields = ("id", "items", "total", "item_count", "updated_at")


# ─── Address ─────────────────────────────────────────────────────────────────
class AddressSerializer(serializers.ModelSerializer):
    class Meta:
        model = Address
        fields = ("id", "full_name", "phone", "street", "city", "county", "is_default")


# ─── Order ───────────────────────────────────────────────────────────────────
class OrderItemSerializer(serializers.ModelSerializer):
    class Meta:
        model = OrderItem
        fields = ("id", "product", "product_name", "product_price", "quantity", "subtotal")


class OrderSerializer(serializers.ModelSerializer):
    items = OrderItemSerializer(many=True, read_only=True)
    shipping_address = AddressSerializer(read_only=True)

    class Meta:
        model = Order
        fields = (
            "id", "order_number", "status", "payment_status", "payment_method",
            "shipping_address", "subtotal", "shipping_cost", "total",
            "notes", "items", "created_at",
        )


class PlaceOrderSerializer(serializers.Serializer):
    address_id = serializers.IntegerField()
    payment_method = serializers.ChoiceField(choices=["mpesa", "card", "cod"])
    notes = serializers.CharField(required=False, allow_blank=True)


# ─── M-Pesa ──────────────────────────────────────────────────────────────────
class StkPushSerializer(serializers.Serializer):
    phone_number = serializers.CharField(max_length=15)
    order_id = serializers.IntegerField()

    def validate_phone_number(self, value):
        value = value.strip().replace(" ", "").replace("-", "")
        if value.startswith("0"):
            value = "254" + value[1:]
        elif value.startswith("+"):
            value = value[1:]
        if not value.startswith("254") or len(value) != 12:
            raise serializers.ValidationError(
                "Enter a valid Kenyan phone number e.g. 0712345678 or 254712345678"
            )
        return value


class MpesaTransactionSerializer(serializers.ModelSerializer):
    class Meta:
        model = MpesaTransaction
        fields = (
            "id", "phone_number", "amount", "checkout_request_id",
            "mpesa_receipt_number", "status", "result_desc", "created_at",
        )