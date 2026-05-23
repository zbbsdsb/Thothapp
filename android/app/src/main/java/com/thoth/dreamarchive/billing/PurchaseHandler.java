package com.thoth.dreamarchive.billing;

import android.util.Log;

import com.android.billingclient.api.BillingClient;
import com.android.billingclient.api.BillingResult;
import com.android.billingclient.api.ProductDetails;
import com.android.billingclient.api.Purchase;

import org.json.JSONArray;
import org.json.JSONException;
import org.json.JSONObject;

import java.util.List;

/**
 * Processes purchase results and product details into JSON objects
 * suitable for passing through the Capacitor bridge to the frontend.
 */
public class PurchaseHandler {

    private static final String TAG = "ThothPurchaseHandler";

    /**
     * Convert a Purchase object to a JSONObject for the Capacitor bridge.
     */
    public static JSONObject purchaseToJSON(Purchase purchase) {
        try {
            JSONObject json = new JSONObject();
            json.put("purchaseToken", purchase.getPurchaseToken());
            json.put("productId", getPrimaryProductId(purchase));
            json.put("orderId", purchase.getOrderId());
            json.put("purchaseState", purchase.getPurchaseState());
            json.put("acknowledgementState", purchase.getAcknowledgementState());
            json.put("autoRenewing", purchase.isAutoRenewing());
            json.put("packageName", purchase.getPackageName());
            json.put("purchaseTime", purchase.getPurchaseTime());

            if (purchase.getSignature() != null) {
                json.put("signature", purchase.getSignature());
            }

            return json;
        } catch (JSONException e) {
            Log.e(TAG, "Error converting purchase to JSON", e);
            return new JSONObject();
        }
    }

    /**
     * Convert a list of Purchase objects to a JSONArray.
     */
    public static JSONArray purchasesToJSONArray(List<Purchase> purchases) {
        JSONArray array = new JSONArray();
        if (purchases != null) {
            for (Purchase purchase : purchases) {
                array.put(purchaseToJSON(purchase));
            }
        }
        return array;
    }

    /**
     * Convert a ProductDetails object to a JSONObject for the Capacitor bridge.
     */
    public static JSONObject productDetailsToJSON(ProductDetails details) {
        try {
            JSONObject json = new JSONObject();
            json.put("productId", details.getProductId());
            json.put("title", details.getTitle());
            json.put("description", details.getDescription());
            json.put("productType", details.getProductType());

            // One-time purchase offer details
            ProductDetails.OneTimePurchaseOfferDetails oneTimeOffer = details.getOneTimePurchaseOfferDetails();
            if (oneTimeOffer != null) {
                JSONObject oneTimeJson = new JSONObject();
                oneTimeJson.put("price", oneTimeOffer.getFormattedPrice());
                oneTimeJson.put("priceAmountMicros", oneTimeOffer.getPriceAmountMicros());
                oneTimeJson.put("currencyCode", oneTimeOffer.getPriceCurrencyCode());
                json.put("oneTimePurchaseOfferDetails", oneTimeJson);
            }

            // Subscription offer details
            List<ProductDetails.SubscriptionOfferDetails> subOffers = details.getSubscriptionOfferDetails();
            if (subOffers != null && !subOffers.isEmpty()) {
                JSONArray offersArray = new JSONArray();
                for (ProductDetails.SubscriptionOfferDetails offer : subOffers) {
                    JSONObject offerJson = new JSONObject();
                    offerJson.put("offerId", offer.getOfferId());
                    offerJson.put("offerToken", offer.getOfferToken());
                    offerJson.put("basePlanId", offer.getBasePlanId());

                    // Pricing phases
                    List<ProductDetails.PricingPhase> pricingPhases = offer.getPricingPhases();
                    if (pricingPhases != null) {
                        JSONArray phasesArray = new JSONArray();
                        for (ProductDetails.PricingPhase phase : pricingPhases) {
                            JSONObject phaseJson = new JSONObject();
                            phaseJson.put("price", phase.getFormattedPrice());
                            phaseJson.put("priceAmountMicros", phase.getPriceAmountMicros());
                            phaseJson.put("currencyCode", phase.getPriceCurrencyCode());
                            phaseJson.put("billingPeriod", phase.getBillingPeriod());
                            phaseJson.put("recurrenceMode", phase.getRecurrenceMode());
                            phaseJson.put("billingCycleCount", phase.getBillingCycleCount());
                            phasesArray.put(phaseJson);
                        }
                        offerJson.put("pricingPhases", phasesArray);
                    }

                    offersArray.put(offerJson);
                }
                json.put("subscriptionOfferDetails", offersArray);
            }

            return json;
        } catch (JSONException e) {
            Log.e(TAG, "Error converting product details to JSON", e);
            return new JSONObject();
        }
    }

    /**
     * Convert a list of ProductDetails to a JSONArray.
     */
    public static JSONArray productDetailsToJSONArray(List<ProductDetails> detailsList) {
        JSONArray array = new JSONArray();
        if (detailsList != null) {
            for (ProductDetails details : detailsList) {
                array.put(productDetailsToJSON(details));
            }
        }
        return array;
    }

    /**
     * Get the primary product ID from a Purchase.
     * For subscriptions, this is the first product in the list.
     */
    private static String getPrimaryProductId(Purchase purchase) {
        List<String> products = purchase.getProducts();
        if (products != null && !products.isEmpty()) {
            return products.get(0);
        }
        return "";
    }

    /**
     * Map a BillingResponseCode to a human-readable error message.
     */
    public static String getErrorMessage(int responseCode) {
        switch (responseCode) {
            case BillingClient.BillingResponseCode.SERVICE_DISCONNECTED:
                return "Billing service disconnected. Please try again.";
            case BillingClient.BillingResponseCode.SERVICE_UNAVAILABLE:
                return "Billing service unavailable. Please check your connection.";
            case BillingClient.BillingResponseCode.BILLING_UNAVAILABLE:
                return "Billing API version is not supported for the requested type.";
            case BillingClient.BillingResponseCode.ITEM_UNAVAILABLE:
                return "Requested product is not available for purchase.";
            case BillingClient.BillingResponseCode.DEVELOPER_ERROR:
                return "Invalid arguments provided to the billing API.";
            case BillingClient.BillingResponseCode.ERROR:
                return "Fatal error during the billing operation.";
            case BillingClient.BillingResponseCode.ITEM_ALREADY_OWNED:
                return "Item is already owned. Try restoring purchases.";
            case BillingClient.BillingResponseCode.ITEM_NOT_OWNED:
                return "Item is not owned by the user.";
            case BillingClient.BillingResponseCode.USER_CANCELED:
                return "Purchase was cancelled by the user.";
            case BillingClient.BillingResponseCode.FEATURE_NOT_SUPPORTED:
                return "Requested feature is not supported by Play Store on the device.";
            case BillingClient.BillingResponseCode.OK:
                return "Success";
            default:
                return "Unknown billing error (code: " + responseCode + ")";
        }
    }

    /**
     * Build a standardized error JSONObject.
     */
    public static JSONObject buildError(BillingResult billingResult) {
        try {
            JSONObject error = new JSONObject();
            error.put("success", false);
            error.put("responseCode", billingResult.getResponseCode());
            error.put("debugMessage", billingResult.getDebugMessage());
            error.put("errorMessage", getErrorMessage(billingResult.getResponseCode()));
            return error;
        } catch (JSONException e) {
            Log.e(TAG, "Error building error JSON", e);
            return new JSONObject();
        }
    }
}
