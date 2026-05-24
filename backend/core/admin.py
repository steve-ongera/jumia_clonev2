# core/admin.py
from django.contrib import admin
from .models import (
    Category, Product, ProductImage, Review,
    Cart, CartItem, Address, Order, OrderItem,
    MpesaTransaction, UserProfile,
)


@admin.register(Category)
class CategoryAdmin(admin.ModelAdmin):
    list_display = ("name", "slug", "parent")
    prepopulated_fields = {"slug": ("name",)}


class ProductImageInline(admin.TabularInline):
    model = ProductImage
    extra = 1


@admin.register(Product)
class ProductAdmin(admin.ModelAdmin):
    list_display = ("name", "category", "price", "stock", "is_active", "is_flash_sale")
    list_filter = ("category", "is_active", "is_flash_sale")
    search_fields = ("name", "brand")
    prepopulated_fields = {"slug": ("name",)}
    inlines = [ProductImageInline]


@admin.register(Review)
class ReviewAdmin(admin.ModelAdmin):
    list_display = ("product", "user", "rating", "created_at")
    list_filter = ("rating",)


class OrderItemInline(admin.TabularInline):
    model = OrderItem
    extra = 0
    readonly_fields = ("product_name", "product_price", "quantity", "subtotal")


@admin.register(Order)
class OrderAdmin(admin.ModelAdmin):
    list_display = ("order_number", "user", "status", "payment_status", "total", "created_at")
    list_filter = ("status", "payment_status", "payment_method")
    search_fields = ("order_number", "user__username")
    readonly_fields = ("order_number",)
    inlines = [OrderItemInline]


@admin.register(MpesaTransaction)
class MpesaTransactionAdmin(admin.ModelAdmin):
    list_display = ("order", "phone_number", "amount", "status", "mpesa_receipt_number", "created_at")
    list_filter = ("status",)
    readonly_fields = ("raw_callback",)


admin.site.register(Address)
admin.site.register(UserProfile)
admin.site.register(Cart)