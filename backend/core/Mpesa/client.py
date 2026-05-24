"""
M-Pesa Daraja API Client
Handles OAuth token generation and STK Push (Lipa na M-Pesa Online)
"""

import base64
import logging
from datetime import datetime

import requests
from django.conf import settings

logger = logging.getLogger(__name__)


class MpesaClient:
    def __init__(self):
        self.base_url = settings.MPESA_BASE_URL
        self.consumer_key = settings.MPESA_CONSUMER_KEY
        self.consumer_secret = settings.MPESA_CONSUMER_SECRET
        self.shortcode = settings.MPESA_SHORTCODE
        self.passkey = settings.MPESA_PASSKEY
        self.callback_url = settings.MPESA_CALLBACK_URL
        self._access_token = None
        self._token_expiry = None

    # ── OAuth Token ──────────────────────────────────────────────────────────
    def get_access_token(self) -> str:
        """Fetch or return cached OAuth2 access token."""
        now = datetime.now().timestamp()
        if self._access_token and self._token_expiry and now < self._token_expiry:
            return self._access_token

        url = f"{self.base_url}/oauth/v1/generate?grant_type=client_credentials"
        credentials = base64.b64encode(
            f"{self.consumer_key}:{self.consumer_secret}".encode()
        ).decode()

        try:
            response = requests.get(
                url,
                headers={"Authorization": f"Basic {credentials}"},
                timeout=15,
            )
            response.raise_for_status()
            data = response.json()
            self._access_token = data["access_token"]
            self._token_expiry = now + int(data.get("expires_in", 3599)) - 60
            return self._access_token
        except requests.RequestException as e:
            logger.error(f"M-Pesa token error: {e}")
            raise Exception("Failed to obtain M-Pesa access token") from e

    # ── Password / Timestamp ─────────────────────────────────────────────────
    def _get_password(self) -> tuple[str, str]:
        """Return (password, timestamp) for STK push."""
        timestamp = datetime.now().strftime("%Y%m%d%H%M%S")
        raw = f"{self.shortcode}{self.passkey}{timestamp}"
        password = base64.b64encode(raw.encode()).decode()
        return password, timestamp

    # ── STK Push ─────────────────────────────────────────────────────────────
    def stk_push(self, phone: str, amount: int, account_ref: str, description: str) -> dict:
        """
        Initiate Lipa na M-Pesa Online (STK Push).

        Args:
            phone: Safaricom phone number in format 2547XXXXXXXX
            amount: Amount in KES (integer)
            account_ref: Order number or reference
            description: Transaction description

        Returns:
            Daraja API response dict with MerchantRequestID, CheckoutRequestID
        """
        token = self.get_access_token()
        password, timestamp = self._get_password()
        url = f"{self.base_url}/mpesa/stkpush/v1/processrequest"

        payload = {
            "BusinessShortCode": self.shortcode,
            "Password": password,
            "Timestamp": timestamp,
            "TransactionType": "CustomerPayBillOnline",
            "Amount": int(amount),
            "PartyA": phone,
            "PartyB": self.shortcode,
            "PhoneNumber": phone,
            "CallBackURL": self.callback_url,
            "AccountReference": account_ref,
            "TransactionDesc": description,
        }

        try:
            response = requests.post(
                url,
                json=payload,
                headers={
                    "Authorization": f"Bearer {token}",
                    "Content-Type": "application/json",
                },
                timeout=30,
            )
            response.raise_for_status()
            data = response.json()
            logger.info(f"STK Push initiated: {data.get('CheckoutRequestID')}")
            return data
        except requests.RequestException as e:
            logger.error(f"STK Push error: {e}")
            raise Exception("M-Pesa STK Push request failed") from e

    # ── Query STK Status ─────────────────────────────────────────────────────
    def query_stk_status(self, checkout_request_id: str) -> dict:
        """Query the result of an STK push transaction."""
        token = self.get_access_token()
        password, timestamp = self._get_password()
        url = f"{self.base_url}/mpesa/stkpushquery/v1/query"

        payload = {
            "BusinessShortCode": self.shortcode,
            "Password": password,
            "Timestamp": timestamp,
            "CheckoutRequestID": checkout_request_id,
        }

        try:
            response = requests.post(
                url,
                json=payload,
                headers={
                    "Authorization": f"Bearer {token}",
                    "Content-Type": "application/json",
                },
                timeout=15,
            )
            response.raise_for_status()
            return response.json()
        except requests.RequestException as e:
            logger.error(f"STK Query error: {e}")
            raise Exception("Failed to query M-Pesa transaction status") from e


# Singleton instance
mpesa_client = MpesaClient()