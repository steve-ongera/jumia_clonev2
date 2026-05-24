"""
M-Pesa STK Push Callback Processing
Called by Safaricom servers after the customer completes or cancels payment.
"""

import logging
from .client import mpesa_client

logger = logging.getLogger(__name__)


def process_stk_callback(callback_data: dict) -> dict:
    """
    Parse Safaricom's STK Push callback payload and return structured result.

    Callback structure:
    {
      "Body": {
        "stkCallback": {
          "MerchantRequestID": "...",
          "CheckoutRequestID": "...",
          "ResultCode": 0,            # 0 = success
          "ResultDesc": "The service request is processed successfully.",
          "CallbackMetadata": {       # only present on success (ResultCode == 0)
            "Item": [
              {"Name": "Amount", "Value": 1000.0},
              {"Name": "MpesaReceiptNumber", "Value": "NLJ7RT61SV"},
              {"Name": "TransactionDate", "Value": 20191219102115},
              {"Name": "PhoneNumber", "Value": 254708374149}
            ]
          }
        }
      }
    }
    """
    try:
        stk_callback = callback_data["Body"]["stkCallback"]
        result_code = stk_callback.get("ResultCode")
        result_desc = stk_callback.get("ResultDesc", "")
        checkout_request_id = stk_callback.get("CheckoutRequestID", "")
        merchant_request_id = stk_callback.get("MerchantRequestID", "")

        parsed = {
            "checkout_request_id": checkout_request_id,
            "merchant_request_id": merchant_request_id,
            "result_code": str(result_code),
            "result_desc": result_desc,
            "success": result_code == 0,
            "amount": None,
            "receipt_number": None,
            "phone_number": None,
            "transaction_date": None,
        }

        if result_code == 0:
            metadata_items = stk_callback.get("CallbackMetadata", {}).get("Item", [])
            metadata = {item["Name"]: item.get("Value") for item in metadata_items}
            parsed.update({
                "amount": metadata.get("Amount"),
                "receipt_number": str(metadata.get("MpesaReceiptNumber", "")),
                "phone_number": str(metadata.get("PhoneNumber", "")),
                "transaction_date": str(metadata.get("TransactionDate", "")),
            })
            logger.info(
                f"M-Pesa payment SUCCESS: {checkout_request_id} | "
                f"Receipt: {parsed['receipt_number']} | "
                f"Amount: {parsed['amount']}"
            )
        else:
            logger.warning(
                f"M-Pesa payment FAILED: {checkout_request_id} | "
                f"Code: {result_code} | Desc: {result_desc}"
            )

        return parsed

    except (KeyError, TypeError) as e:
        logger.error(f"M-Pesa callback parse error: {e} | Data: {callback_data}")
        return {
            "success": False,
            "result_code": "PARSE_ERROR",
            "result_desc": str(e),
            "checkout_request_id": "",
        }


# M-Pesa result codes reference
MPESA_RESULT_CODES = {
    0: "Success",
    1: "Insufficient funds",
    2: "Less than minimum transaction value",
    3: "More than maximum transaction value",
    4: "Would exceed daily transfer limit",
    5: "Would exceed minimum balance",
    6: "Unresolved primary party",
    7: "Unresolved receiver party",
    8: "Would exceed maximum balance",
    11: "Debit account invalid",
    12: "Credit account invalid",
    13: "Unresolved debit account",
    14: "Unresolved credit account",
    15: "Duplicate detected",
    17: "Internal failure",
    20: "Unresolved initiator",
    26: "Traffic blocking condition in place",
    1001: "The balance is insufficient for the transaction",
    1019: "Transaction expired in queue",
    1025: "Transaction failed — Invalid debit account",
    1037: "DS timeout user cannot be reached",
    2001: "The initiator information is invalid",
    1032: "Request cancelled by user",
}