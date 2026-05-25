"""
core/management/commands/seed_data.py

Usage:
    python manage.py seed_data
    python manage.py seed_data --images-dir "D:/gadaf/Documents/images/jumia"
    python manage.py seed_data --clear          # wipe existing data first
    python manage.py seed_data --clear --images-dir "/path/to/images"
"""

import random
import shutil
import uuid
from decimal import Decimal
from pathlib import Path

from django.contrib.auth.models import User
from django.core.management.base import BaseCommand, CommandError
from django.conf import settings
from django.utils.text import slugify
from django.utils import timezone

# ── adjust this import to wherever your models live ──────────────────────────
from core.models import (  # noqa: E402  – change "store" to your app label
    Address, Cart, CartItem, Category, MpesaTransaction,
    Order, OrderItem, Product, ProductImage, Review, UserProfile,
)

# ─────────────────────────────────────────────────────────────────────────────
DEFAULT_IMAGE_DIR = r"D:\gadaf\Documents\images\jumia"
IMAGE_EXTENSIONS  = {".jpg", ".jpeg", ".png", ".webp", ".gif"}

MEDIA_PRODUCTS    = Path(settings.MEDIA_ROOT) / "products"
MEDIA_GALLERY     = Path(settings.MEDIA_ROOT) / "products" / "gallery"
MEDIA_CATEGORIES  = Path(settings.MEDIA_ROOT) / "categories"
MEDIA_AVATARS     = Path(settings.MEDIA_ROOT) / "avatars"


# ─── helpers ─────────────────────────────────────────────────────────────────

def collect_images(image_dir: Path) -> list[Path]:
    """Return all image files found (recursively) under image_dir."""
    if not image_dir.exists():
        return []
    return [p for p in image_dir.rglob("*") if p.suffix.lower() in IMAGE_EXTENSIONS]


def copy_random_image(images: list[Path], dest_dir: Path, prefix: str = "") -> str:
    """
    Copy a randomly chosen image into dest_dir and return the relative
    MEDIA_ROOT path (suitable for an ImageField value).
    Returns "" when no images are available.
    """
    if not images:
        return ""
    dest_dir.mkdir(parents=True, exist_ok=True)
    src   = random.choice(images)
    fname = f"{prefix}{uuid.uuid4().hex[:8]}{src.suffix.lower()}"
    dest  = dest_dir / fname
    shutil.copy2(src, dest)
    # Django ImageField stores paths relative to MEDIA_ROOT
    return str(dest.relative_to(settings.MEDIA_ROOT))


def unique_slug(base: str, existing: set) -> str:
    slug = slugify(base)
    candidate, n = slug, 1
    while candidate in existing:
        candidate = f"{slug}-{n}"
        n += 1
    existing.add(candidate)
    return candidate


# ─── seed data definitions ───────────────────────────────────────────────────

CATEGORIES = [
    ("Phones & Tablets",       "bi-phone",          None),
    ("Smartphones",            "bi-phone-fill",     "Phones & Tablets"),
    ("Tablets",                "bi-tablet",         "Phones & Tablets"),
    ("Computers",              "bi-laptop",         None),
    ("Laptops",                "bi-laptop-fill",    "Computers"),
    ("Desktops",               "bi-pc-display",     "Computers"),
    ("TV & Audio",             "bi-tv",             None),
    ("Fashion",                "bi-bag",            None),
    ("Men's Clothing",         "bi-person",         "Fashion"),
    ("Women's Clothing",       "bi-person-dress",   "Fashion"),
    ("Home & Kitchen",         "bi-house",          None),
    ("Sports & Outdoors",      "bi-bicycle",        None),
    ("Health & Beauty",        "bi-heart-pulse",    None),
    ("Baby Products",          "bi-emoji-smile",    None),
    ("Gaming",                 "bi-controller",     None),
]

BRANDS = ["Samsung", "Apple", "Tecno", "Itel", "Infinix", "LG", "Sony",
          "HP", "Dell", "Lenovo", "Hisense", "Adidas", "Nike", "Puma",
          "Philips", "Breville", "Nikon", "Logitech", "JBL", "Anker"]

ADJECTIVES = ["Pro", "Ultra", "Plus", "Max", "Lite", "Air", "Neo",
              "Smart", "Advanced", "Premium", "Classic", "Elite"]

USERS = [
    {"username": "alice",   "email": "alice@example.com",   "first_name": "Alice",  "last_name": "Wanjiku"},
    {"username": "bob",     "email": "bob@example.com",     "first_name": "Bob",    "last_name": "Otieno"},
    {"username": "carol",   "email": "carol@example.com",   "first_name": "Carol",  "last_name": "Njoroge"},
    {"username": "david",   "email": "david@example.com",   "first_name": "David",  "last_name": "Kamau"},
    {"username": "eve",     "email": "eve@example.com",     "first_name": "Eve",    "last_name": "Achieng"},
]

KENYAN_CITIES   = ["Nairobi", "Mombasa", "Kisumu", "Nakuru", "Eldoret",
                    "Thika",   "Meru",    "Nyeri",  "Garissa", "Kitale"]
KENYAN_COUNTIES = ["Nairobi", "Mombasa", "Kisumu", "Nakuru", "Uasin Gishu",
                    "Kiambu",  "Meru",    "Nyeri",  "Garissa", "Trans Nzoia"]

REVIEW_BODIES = [
    "Excellent product, exactly as described. Would definitely recommend!",
    "Good value for money. Delivery was fast and packaging secure.",
    "Works perfectly. Setup was straightforward.",
    "Quality is decent for the price point. Happy with the purchase.",
    "Very satisfied. The product exceeded my expectations.",
    "Arrived on time and in perfect condition. Five stars!",
    "Great build quality. Feels premium and durable.",
    "Product is okay but customer support could be better.",
    "Exactly what I needed. Will buy again from this seller.",
    "Solid product. No complaints after a month of daily use.",
]

ORDER_NOTES = [
    "Please call before delivery.",
    "Leave at the gate if no one is home.",
    "Handle with care – fragile items inside.",
    "",
    "Deliver between 9 AM and 5 PM.",
]


# ─── Command ─────────────────────────────────────────────────────────────────

class Command(BaseCommand):
    help = "Seed the database with realistic e-commerce demo data."

    def add_arguments(self, parser):
        parser.add_argument(
            "--images-dir",
            default=DEFAULT_IMAGE_DIR,
            help="Path to a directory containing product images (searched recursively).",
        )
        parser.add_argument(
            "--clear",
            action="store_true",
            help="Delete all existing data before seeding.",
        )
        parser.add_argument(
            "--products",
            type=int,
            default=40,
            help="Number of products to create (default: 40).",
        )

    # ── main ─────────────────────────────────────────────────────────────────

    def handle(self, *args, **options):
        image_dir = Path(options["images_dir"])
        images    = collect_images(image_dir)

        if not images:
            self.stdout.write(self.style.WARNING(
                f"⚠  No images found in '{image_dir}'. "
                "Products will be created without images."
            ))
        else:
            self.stdout.write(self.style.SUCCESS(
                f"✔  Found {len(images)} image(s) in '{image_dir}'."
            ))

        if options["clear"]:
            self._clear_data()

        categories = self._seed_categories(images)
        users      = self._seed_users(images)
        products   = self._seed_products(categories, images, count=options["products"])
        self._seed_reviews(products, users)
        self._seed_carts(users, products)
        self._seed_orders(users, products)

        self.stdout.write(self.style.SUCCESS("\n🎉  Seeding complete!"))

    # ── clear ─────────────────────────────────────────────────────────────────

    def _clear_data(self):
        self.stdout.write("🗑  Clearing existing data…")
        MpesaTransaction.objects.all().delete()
        OrderItem.objects.all().delete()
        Order.objects.all().delete()
        CartItem.objects.all().delete()
        Cart.objects.all().delete()
        Review.objects.all().delete()
        ProductImage.objects.all().delete()
        Product.objects.all().delete()
        Category.objects.all().delete()
        Address.objects.all().delete()
        UserProfile.objects.all().delete()
        User.objects.filter(is_superuser=False).exclude(username="admin").delete()
        self.stdout.write(self.style.WARNING("   Done.\n"))

    # ── categories ────────────────────────────────────────────────────────────

    def _seed_categories(self, images: list[Path]) -> list[Category]:
        self.stdout.write("📂  Seeding categories…")
        created   = []
        name_map  = {}
        slug_set  = set(Category.objects.values_list("slug", flat=True))

        # first pass – top-level
        for name, icon, parent_name in CATEGORIES:
            if parent_name is not None:
                continue
            slug = unique_slug(name, slug_set)
            img  = copy_random_image(images, MEDIA_CATEGORIES, prefix="cat_")
            cat, _ = Category.objects.get_or_create(
                name=name,
                defaults={"slug": slug, "icon": icon, "image": img or None},
            )
            name_map[name] = cat
            created.append(cat)

        # second pass – children
        for name, icon, parent_name in CATEGORIES:
            if parent_name is None:
                continue
            slug   = unique_slug(name, slug_set)
            img    = copy_random_image(images, MEDIA_CATEGORIES, prefix="cat_")
            parent = name_map.get(parent_name)
            cat, _ = Category.objects.get_or_create(
                name=name,
                defaults={"slug": slug, "icon": icon, "image": img or None, "parent": parent},
            )
            name_map[name] = cat
            created.append(cat)

        self.stdout.write(f"   {len(created)} categories ready.")
        return created

    # ── users ─────────────────────────────────────────────────────────────────

    def _seed_users(self, images: list[Path]) -> list[User]:
        self.stdout.write("👤  Seeding users…")
        users = []
        for data in USERS:
            user, created_flag = User.objects.get_or_create(
                username=data["username"],
                defaults={
                    "email":      data["email"],
                    "first_name": data["first_name"],
                    "last_name":  data["last_name"],
                },
            )
            if created_flag:
                user.set_password("password123")
                user.save()

            avatar = copy_random_image(images, MEDIA_AVATARS, prefix="avatar_")
            UserProfile.objects.get_or_create(
                user=user,
                defaults={"phone": f"07{random.randint(10000000, 99999999)}", "avatar": avatar or None},
            )

            # address
            if not user.addresses.exists():
                city  = random.choice(KENYAN_CITIES)
                county = random.choice(KENYAN_COUNTIES)
                Address.objects.create(
                    user=user,
                    full_name=f"{user.first_name} {user.last_name}",
                    phone=f"07{random.randint(10000000, 99999999)}",
                    street=f"{random.randint(1, 999)} {random.choice(['Moi Ave', 'Kenyatta Ave', 'Tom Mboya St', 'Ronald Ngala St'])}",
                    city=city,
                    county=county,
                    is_default=True,
                )
            users.append(user)

        self.stdout.write(f"   {len(users)} users ready.")
        return users

    # ── products ──────────────────────────────────────────────────────────────

    def _seed_products(
        self, categories: list[Category], images: list[Path], count: int = 40
    ) -> list[Product]:
        self.stdout.write(f"📦  Seeding {count} products…")
        slug_set  = set(Product.objects.values_list("slug", flat=True))
        products  = []

        for i in range(count):
            brand    = random.choice(BRANDS)
            adj      = random.choice(ADJECTIVES)
            number   = random.randint(1, 99)
            name     = f"{brand} {adj} {number}"
            slug     = unique_slug(name, slug_set)
            category = random.choice(categories)
            price    = Decimal(random.randint(500, 150_000))
            discount = random.choice([0, 0, 0, 5, 10, 15, 20, 25, 30])
            old_price = None
            if discount:
                old_price = (price * Decimal(100 + discount) / Decimal(100)).quantize(Decimal("1.00"))

            is_flash = random.random() < 0.1  # 10 % chance
            flash_end = (
                timezone.now() + timezone.timedelta(hours=random.randint(1, 72))
                if is_flash else None
            )

            img = copy_random_image(images, MEDIA_PRODUCTS, prefix="prod_")

            product = Product.objects.create(
                category=category,
                name=name,
                slug=slug,
                description=(
                    f"The {name} is a high-quality product from {brand}. "
                    f"Built for performance and durability, it comes in the '{adj}' "
                    f"series and is loved by customers across Kenya."
                ),
                brand=brand,
                price=price,
                old_price=old_price,
                stock=random.randint(0, 200),
                image=img or None,
                is_active=True,
                is_flash_sale=is_flash,
                flash_sale_end=flash_end,
            )

            # gallery images (1–3 extra)
            for _ in range(random.randint(1, 3)):
                gallery_img = copy_random_image(images, MEDIA_GALLERY, prefix="gal_")
                if gallery_img:
                    ProductImage.objects.create(
                        product=product,
                        image=gallery_img,
                        alt_text=f"{product.name} view",
                    )

            products.append(product)

        self.stdout.write(f"   {len(products)} products created.")
        return products

    # ── reviews ───────────────────────────────────────────────────────────────

    def _seed_reviews(self, products: list[Product], users: list[User]):
        self.stdout.write("⭐  Seeding reviews…")
        count = 0
        for product in random.sample(products, min(len(products), 25)):
            reviewers = random.sample(users, random.randint(1, min(3, len(users))))
            for user in reviewers:
                if Review.objects.filter(product=product, user=user).exists():
                    continue
                Review.objects.create(
                    product=product,
                    user=user,
                    rating=random.randint(3, 5),
                    title=random.choice(["Great!", "Good value", "Recommended", "Satisfied", ""]),
                    body=random.choice(REVIEW_BODIES),
                )
                count += 1
        self.stdout.write(f"   {count} reviews created.")

    # ── carts ─────────────────────────────────────────────────────────────────

    def _seed_carts(self, users: list[User], products: list[Product]):
        self.stdout.write("🛒  Seeding carts…")
        for user in users:
            cart, _ = Cart.objects.get_or_create(user=user)
            for product in random.sample(products, random.randint(1, 4)):
                CartItem.objects.get_or_create(
                    cart=cart,
                    product=product,
                    defaults={"quantity": random.randint(1, 3)},
                )
        self.stdout.write(f"   Carts seeded for {len(users)} users.")

    # ── orders ────────────────────────────────────────────────────────────────

    def _seed_orders(self, users: list[User], products: list[Product]):
        self.stdout.write("🧾  Seeding orders…")
        statuses         = ["pending", "confirmed", "processing", "shipped", "delivered", "cancelled"]
        payment_statuses = ["unpaid", "pending", "paid", "failed"]
        payment_methods  = ["mpesa", "card", "cod"]
        count = 0

        for user in users:
            address = user.addresses.filter(is_default=True).first()
            if not address:
                continue

            for _ in range(random.randint(1, 4)):
                chosen   = random.sample(products, random.randint(1, 5))
                subtotal = Decimal(0)
                items_data = []

                for product in chosen:
                    qty      = random.randint(1, 3)
                    line_sub = product.price * qty
                    subtotal += line_sub
                    items_data.append((product, qty, line_sub))

                shipping = Decimal(random.choice([0, 100, 200, 300]))
                total    = subtotal + shipping

                status         = random.choice(statuses)
                payment_method = random.choice(payment_methods)
                payment_status = random.choice(payment_statuses)
                if status == "delivered":
                    payment_status = "paid"

                order = Order.objects.create(
                    user=user,
                    order_number="",          # auto-generated in save()
                    status=status,
                    payment_status=payment_status,
                    payment_method=payment_method,
                    shipping_address=address,
                    subtotal=subtotal,
                    shipping_cost=shipping,
                    total=total,
                    notes=random.choice(ORDER_NOTES),
                )

                for product, qty, line_sub in items_data:
                    OrderItem.objects.create(
                        order=order,
                        product=product,
                        product_name=product.name,
                        product_price=product.price,
                        quantity=qty,
                        subtotal=line_sub,
                    )

                # M-Pesa transaction for mpesa orders
                if payment_method == "mpesa":
                    mpesa_status_map = {
                        "paid":    "success",
                        "pending": "pending",
                        "unpaid":  "initiated",
                        "failed":  "failed",
                    }
                    MpesaTransaction.objects.create(
                        order=order,
                        phone_number=f"2547{random.randint(10000000, 99999999)}",
                        amount=total,
                        merchant_request_id=uuid.uuid4().hex[:20],
                        checkout_request_id=f"ws_CO_{uuid.uuid4().hex[:16].upper()}",
                        mpesa_receipt_number=(
                            f"QG{random.randint(100000000, 999999999)}"
                            if payment_status == "paid" else ""
                        ),
                        result_code="0" if payment_status == "paid" else "",
                        result_desc="The service request is processed successfully." if payment_status == "paid" else "",
                        status=mpesa_status_map.get(payment_status, "initiated"),
                    )

                count += 1

        self.stdout.write(f"   {count} orders created.")