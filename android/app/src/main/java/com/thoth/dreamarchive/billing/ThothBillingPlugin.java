package com.thoth.dreamarchive.billing;

import android.app.Activity;
import android.util.Log;

import com.android.billingclient.api.BillingClient;
import com.android.billingclient.api.BillingFlowParams;
import com.android.billingclient.api.BillingResult;
import com.android.billingclient.api.ProductDetails;
import com.android.billingclient.api.Purchase;
import com.getcapacitor.JSArray;
import com.getcapacitor.JSObject;
import com.getcapacitor.Plugin;
import com.getcapacitor.PluginCall;
import com.getcapacitor.PluginMethod;
import com.getcapacitor.annotation.CapacitorPlugin;
import com.getcapacitor.annotation.Permission;

import java.util.ArrayList;
import java.util.List;

/**
 * Capacitor plugin for Google Play Billing integration.
 *
 * Exposes the following methods to the frontend:
 * - initialize(): Connect to Google Play Billing
 * - queryProducts(): Query product details
 * - purchase(): Launch the billing flow
 * - consumePurchase(): Consume a one-time purchase
 * - getPurchases(): Query active purchases (for restore)
 * - acknowledgePurchase(): Acknowledge a purchase
 */
@CapacitorPlugin(
        name = "ThothBilling",
        permissions = {
                @Permission(
                        alias = "billing",
                        strings = {"com.android.vending.BILLING"}
                )
        }
)
public class ThothBillingPlugin extends Plugin {

    private static final String TAG = "ThothBillingPlugin";

    private BillingManager billingManager;

    @Override
    public void load() {
        billingManager = new BillingManager(getContext());
        Log.d(TAG, "ThothBillingPlugin loaded");
    }

    @Override
    public void handleOnDestroy() {
        if (billingManager != null) {
            billingManager.endConnection();
        }
        super.handleOnDestroy();
    }

    /**
     * Initialize the BillingClient and connect to Google Play.
     */
    @PluginMethod
    public void initialize(PluginCall call) {
        billingManager.initialize(new BillingManager.ConnectionListener() {
            @Override
            public void onConnectionReady() {
                JSObject result = new JSObject();
                result.put("connected", true);
                call.resolve(result);
            }

            @Override
            public void onConnectionError(BillingResult billingResult) {
                call.reject(
                        "Failed to connect to Google Play Billing: " + billingResult.getDebugMessage(),
                        String.valueOf(billingResult.getResponseCode())
                );
            }
        });
    }

    /**
     * Query product details from Google Play.
     *
     * Expected call data:
     *   productIds: string[] - Array of product IDs
     *   type: string - "inapp" or "subs"
     */
    @PluginMethod
    public void queryProducts(PluginCall call) {
        if (!billingManager.isReady()) {
            call.reject("BillingClient not connected. Call initialize() first.");
            return;
        }

        JSArray productIdsArray = call.getArray("productIds");
        String productType = call.getString("type", "inapp");

        if (productIdsArray == null || productIdsArray.length() == 0) {
            call.reject("productIds is required and must not be empty");
            return;
        }

        List<String> productIds = new ArrayList<>();
        for (int i = 0; i < productIdsArray.length(); i++) {
            String id = productIdsArray.getString(i);
            if (id != null && !id.isEmpty()) {
                productIds.add(id);
            }
        }

        if (productIds.isEmpty()) {
            call.reject("productIds must contain at least one valid ID");
            return;
        }

        billingManager.queryProductDetails(productIds, productType,
                new BillingManager.ProductQueryListener() {
                    @Override
                    public void onProductDetailsResponse(BillingResult billingResult,
                                                          List<ProductDetails> productDetails) {
                        if (billingResult.getResponseCode() == BillingClient.BillingResponseCode.OK) {
                            JSObject result = new JSObject();
                            result.put("products", PurchaseHandler.productDetailsToJSONArray(productDetails));
                            call.resolve(result);
                        } else {
                            call.reject(
                                    "Failed to query products: " + billingResult.getDebugMessage(),
                                    String.valueOf(billingResult.getResponseCode())
                            );
                        }
                    }
                }
        );
    }

    /**
     * Launch the Google Play billing flow for a product.
     *
     * Expected call data:
     *   productId: string - The product ID to purchase
     *   offerToken: string - The offer token (required for subscriptions)
     *   obfuscatedAccountId: string (optional) - User's obfuscated account ID
     *   obfuscatedProfileId: string (optional) - User's obfuscated profile ID
     */
    @PluginMethod
    public void purchase(PluginCall call) {
        if (!billingManager.isReady()) {
            call.reject("BillingClient not connected. Call initialize() first.");
            return;
        }

        String productId = call.getString("productId");
        String offerToken = call.getString("offerToken");
        String obfuscatedAccountId = call.getString("obfuscatedAccountId");
        String obfuscatedProfileId = call.getString("obfuscatedProfileId");

        if (productId == null || productId.isEmpty()) {
            call.reject("productId is required");
            return;
        }

        // Query product details first to get the ProductDetails object needed for the billing flow
        List<String> productIds = new ArrayList<>();
        productIds.add(productId);

        // Determine product type based on whether offerToken is provided
        String productType = (offerToken != null && !offerToken.isEmpty()) ? "subs" : "inapp";

        billingManager.queryProductDetails(productIds, productType,
                new BillingManager.ProductQueryListener() {
                    @Override
                    public void onProductDetailsResponse(BillingResult billingResult,
                                                          List<ProductDetails> productDetails) {
                        if (billingResult.getResponseCode() != BillingClient.BillingResponseCode.OK
                                || productDetails == null || productDetails.isEmpty()) {
                            call.reject("Product not found: " + productId);
                            return;
                        }

                        ProductDetails details = productDetails.get(0);
                        Activity activity = getActivity();

                        // Build BillingFlowParams
                        BillingFlowParams.Builder flowParamsBuilder = BillingFlowParams.newBuilder()
                                .setProductDetailsParamsList(
                                        List.of(BillingFlowParams.ProductDetailsParams.newBuilder()
                                                .setProductDetails(details)
                                                .setOfferToken(offerToken != null ? offerToken : "")
                                                .build())
                                );

                        // Set obfuscated account/profile IDs for fraud detection
                        if (obfuscatedAccountId != null && !obfuscatedAccountId.isEmpty()) {
                            flowParamsBuilder.setObfuscatedAccountId(obfuscatedAccountId);
                        }
                        if (obfuscatedProfileId != null && !obfuscatedProfileId.isEmpty()) {
                            flowParamsBuilder.setObfuscatedProfileId(obfuscatedProfileId);
                        }

                        BillingFlowParams flowParams = flowParamsBuilder.build();
                        BillingResult launchResult = billingManager.getBillingClient()
                                .launchBillingFlow(activity, flowParams);

                        if (launchResult.getResponseCode() == BillingClient.BillingResponseCode.OK) {
                            // The billing flow was launched successfully.
                            // Results will come through PurchasesUpdatedListener.
                            // Store the call to resolve it later.
                            setPurchaseCall(call);
                        } else {
                            call.reject(
                                    "Failed to launch billing flow: " + launchResult.getDebugMessage(),
                                    String.valueOf(launchResult.getResponseCode())
                            );
                        }
                    }
                }
        );
    }

    /**
     * Consume a one-time purchase.
     *
     * Expected call data:
     *   purchaseToken: string - The purchase token to consume
     */
    @PluginMethod
    public void consumePurchase(PluginCall call) {
        if (!billingManager.isReady()) {
            call.reject("BillingClient not connected. Call initialize() first.");
            return;
        }

        String purchaseToken = call.getString("purchaseToken");
        if (purchaseToken == null || purchaseToken.isEmpty()) {
            call.reject("purchaseToken is required");
            return;
        }

        billingManager.consumePurchase(purchaseToken, new BillingManager.ConsumeListener() {
            @Override
            public void onConsumeResult(BillingResult billingResult, String token) {
                if (billingResult.getResponseCode() == BillingClient.BillingResponseCode.OK) {
                    JSObject result = new JSObject();
                    result.put("success", true);
                    result.put("purchaseToken", token);
                    call.resolve(result);
                } else {
                    call.reject(
                            "Failed to consume purchase: " + billingResult.getDebugMessage(),
                            String.valueOf(billingResult.getResponseCode())
                    );
                }
            }
        });
    }

    /**
     * Query active purchases (for purchase restoration).
     */
    @PluginMethod
    public void getPurchases(PluginCall call) {
        if (!billingManager.isReady()) {
            call.reject("BillingClient not connected. Call initialize() first.");
            return;
        }

        billingManager.queryPurchases(new BillingManager.PurchasesQueryListener() {
            @Override
            public void onPurchasesResponse(BillingResult billingResult, List<Purchase> purchases) {
                if (billingResult.getResponseCode() == BillingClient.BillingResponseCode.OK) {
                    JSObject result = new JSObject();
                    result.put("purchases", PurchaseHandler.purchasesToJSONArray(purchases));
                    call.resolve(result);
                } else {
                    call.reject(
                            "Failed to query purchases: " + billingResult.getDebugMessage(),
                            String.valueOf(billingResult.getResponseCode())
                    );
                }
            }
        });
    }

    /**
     * Acknowledge a purchase (for non-consumable items and subscriptions).
     * Server-side acknowledgement is preferred; this is a client-side fallback.
     *
     * Expected call data:
     *   purchaseToken: string - The purchase token to acknowledge
     */
    @PluginMethod
    public void acknowledgePurchase(PluginCall call) {
        if (!billingManager.isReady()) {
            call.reject("BillingClient not connected. Call initialize() first.");
            return;
        }

        String purchaseToken = call.getString("purchaseToken");
        if (purchaseToken == null || purchaseToken.isEmpty()) {
            call.reject("purchaseToken is required");
            return;
        }

        billingManager.acknowledgePurchase(purchaseToken, new BillingManager.AcknowledgeListener() {
            @Override
            public void onAcknowledgeResult(BillingResult billingResult, String token) {
                if (billingResult.getResponseCode() == BillingClient.BillingResponseCode.OK) {
                    JSObject result = new JSObject();
                    result.put("success", true);
                    result.put("purchaseToken", token);
                    call.resolve(result);
                } else {
                    call.reject(
                            "Failed to acknowledge purchase: " + billingResult.getDebugMessage(),
                            String.valueOf(billingResult.getResponseCode())
                    );
                }
            }
        });
    }

    // ── Purchase Flow Callback Management ──────────────────────

    private PluginCall purchaseCall;

    private void setPurchaseCall(PluginCall call) {
        // Release any previous saved call
        if (this.purchaseCall != null) {
            this.purchaseCall.release();
        }
        this.purchaseCall = call;

        // Set up the purchase listener to handle results
        billingManager.setPurchaseListener((billingResult, purchases) -> {
            handlePurchaseResult(billingResult, purchases);
        });
    }

    private void handlePurchaseResult(BillingResult billingResult, List<Purchase> purchases) {
        PluginCall savedCall = this.purchaseCall;
        if (savedCall == null) {
            Log.w(TAG, "Received purchase result but no saved PluginCall");
            return;
        }

        if (billingResult.getResponseCode() == BillingClient.BillingResponseCode.OK
                && purchases != null && !purchases.isEmpty()) {
            Purchase purchase = purchases.get(0);

            if (purchase.getPurchaseState() == Purchase.PurchaseState.PURCHASED) {
                JSObject result = PurchaseHandler.purchaseToJSON(purchase);
                result.put("success", true);
                savedCall.resolve(result);
            } else if (purchase.getPurchaseState() == Purchase.PurchaseState.PENDING) {
                JSObject result = PurchaseHandler.purchaseToJSON(purchase);
                result.put("success", false);
                result.put("pending", true);
                result.put("errorMessage", "Purchase is pending (awaiting payment)");
                savedCall.resolve(result);
            } else {
                JSObject result = PurchaseHandler.purchaseToJSON(purchase);
                result.put("success", false);
                result.put("errorMessage", "Purchase state: " + purchase.getPurchaseState());
                savedCall.resolve(result);
            }
        } else if (billingResult.getResponseCode() == BillingClient.BillingResponseCode.USER_CANCELED) {
            JSObject result = new JSObject();
            result.put("success", false);
            result.put("cancelled", true);
            result.put("errorMessage", "User cancelled the purchase");
            savedCall.resolve(result);
        } else {
            JSObject errorResult = PurchaseHandler.buildError(billingResult);
            errorResult.put("success", false);
            savedCall.resolve(errorResult);
        }

        this.purchaseCall = null;
    }
}
