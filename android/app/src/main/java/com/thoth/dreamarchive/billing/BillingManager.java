package com.thoth.dreamarchive.billing;

import android.content.Context;
import android.util.Log;

import com.android.billingclient.api.BillingClient;
import com.android.billingclient.api.BillingClientStateListener;
import com.android.billingclient.api.BillingResult;
import com.android.billingclient.api.ConsumeParams;
import com.android.billingclient.api.Purchase;
import com.android.billingclient.api.PurchasesUpdatedListener;
import com.android.billingclient.api.AcknowledgePurchaseParams;
import com.android.billingclient.api.QueryProductDetailsParams;
import com.android.billingclient.api.QueryPurchasesParams;
import com.android.billingclient.api.ProductDetails;
import com.android.billingclient.api.ProductDetailsResponseListener;
import com.android.billingclient.api.PurchasesResponseListener;

import java.util.ArrayList;
import java.util.List;

/**
 * Manages the Google Play BillingClient lifecycle.
 * Handles connection, reconnection, product queries, purchase launches,
 * consumption, and acknowledgement.
 */
public class BillingManager implements PurchasesUpdatedListener {

    private static final String TAG = "ThothBilling";

    private final Context context;
    private BillingClient billingClient;
    private boolean isReady = false;
    private PurchaseListener purchaseListener;
    private ProductQueryListener productQueryListener;
    private PurchasesQueryListener purchasesQueryListener;
    private ConsumeListener consumeListener;
    private AcknowledgeListener acknowledgeListener;

    public interface PurchaseListener {
        void onPurchasesUpdated(BillingResult billingResult, List<Purchase> purchases);
    }

    public interface ProductQueryListener {
        void onProductDetailsResponse(BillingResult billingResult, List<ProductDetails> productDetails);
    }

    public interface PurchasesQueryListener {
        void onPurchasesResponse(BillingResult billingResult, List<Purchase> purchases);
    }

    public interface ConsumeListener {
        void onConsumeResult(BillingResult billingResult, String purchaseToken);
    }

    public interface AcknowledgeListener {
        void onAcknowledgeResult(BillingResult billingResult, String purchaseToken);
    }

    public interface ConnectionListener {
        void onConnectionReady();
        void onConnectionError(BillingResult billingResult);
    }

    public BillingManager(Context context) {
        this.context = context.getApplicationContext();
    }

    /**
     * Initialize and connect the BillingClient.
     */
    public void initialize(ConnectionListener listener) {
        billingClient = BillingClient.newBuilder(context)
                .setListener(this)
                .enablePendingPurchases()
                .build();

        billingClient.startConnection(new BillingClientStateListener() {
            @Override
            public void onBillingSetupFinished(BillingResult billingResult) {
                if (billingResult.getResponseCode() == BillingClient.BillingResponseCode.OK) {
                    isReady = true;
                    Log.d(TAG, "BillingClient connected successfully");
                    if (listener != null) {
                        listener.onConnectionReady();
                    }
                } else {
                    Log.e(TAG, "BillingClient setup failed: " + billingResult.getDebugMessage());
                    isReady = false;
                    if (listener != null) {
                        listener.onConnectionError(billingResult);
                    }
                }
            }

            @Override
            public void onBillingServiceDisconnected() {
                isReady = false;
                Log.w(TAG, "BillingClient disconnected");
            }
        });
    }

    /**
     * Check if the BillingClient is ready for use.
     */
    public boolean isReady() {
        return isReady;
    }

    /**
     * Set the listener for purchase updates.
     */
    public void setPurchaseListener(PurchaseListener listener) {
        this.purchaseListener = listener;
    }

    /**
     * Called by the Billing Library when purchases are updated.
     */
    @Override
    public void onPurchasesUpdated(BillingResult billingResult, List<Purchase> purchases) {
        Log.d(TAG, "onPurchasesUpdated: code=" + billingResult.getResponseCode()
                + ", purchases=" + (purchases != null ? purchases.size() : "null"));
        if (purchaseListener != null) {
            purchaseListener.onPurchasesUpdated(billingResult, purchases);
        }
    }

    /**
     * Query product details for the given product IDs and type.
     *
     * @param productIds list of product IDs to query
     * @param productType either "inapp" or "subs"
     * @param listener    callback for results
     */
    public void queryProductDetails(List<String> productIds, String productType,
                                    ProductQueryListener listener) {
        if (!isReady) {
            listener.onProductDetailsResponse(
                    BillingResult.newBuilder()
                            .setResponseCode(BillingClient.BillingResponseCode.SERVICE_DISCONNECTED)
                            .setDebugMessage("BillingClient not connected")
                            .build(),
                    null
            );
            return;
        }

        this.productQueryListener = listener;

        List<QueryProductDetailsParams.Product> productList = new ArrayList<>();
        for (String productId : productIds) {
            productList.add(
                    QueryProductDetailsParams.Product.newBuilder()
                            .setProductId(productId)
                            .setProductType(productType)
                            .build()
            );
        }

        QueryProductDetailsParams params = QueryProductDetailsParams.newBuilder()
                .setProductList(productList)
                .build();

        billingClient.queryProductDetailsAsync(params, new ProductDetailsResponseListener() {
            @Override
            public void onProductDetailsResponse(BillingResult billingResult,
                                                  List<ProductDetails> productDetailsList) {
                if (productQueryListener != null) {
                    productQueryListener.onProductDetailsResponse(billingResult, productDetailsList);
                }
            }
        });
    }

    /**
     * Query active purchases (subscriptions and one-time).
     */
    public void queryPurchases(PurchasesQueryListener listener) {
        if (!isReady) {
            listener.onPurchasesResponse(
                    BillingResult.newBuilder()
                            .setResponseCode(BillingClient.BillingResponseCode.SERVICE_DISCONNECTED)
                            .setDebugMessage("BillingClient not connected")
                            .build(),
                    null
            );
            return;
        }

        this.purchasesQueryListener = listener;

        // Query subscriptions
        billingClient.queryPurchasesAsync(
                QueryPurchasesParams.newBuilder()
                        .setProductType(BillingClient.ProductType.SUBS)
                        .build(),
                new PurchasesResponseListener() {
                    @Override
                    public void onQueryPurchasesResponse(BillingResult billingResult,
                                                          List<Purchase> purchases) {
                        if (purchasesQueryListener != null) {
                            purchasesQueryListener.onPurchasesResponse(billingResult, purchases);
                        }
                    }
                }
        );
    }

    /**
     * Consume a one-time purchase.
     */
    public void consumePurchase(String purchaseToken, ConsumeListener listener) {
        if (!isReady) {
            listener.onConsumeResult(
                    BillingResult.newBuilder()
                            .setResponseCode(BillingClient.BillingResponseCode.SERVICE_DISCONNECTED)
                            .setDebugMessage("BillingClient not connected")
                            .build(),
                    purchaseToken
            );
            return;
        }

        this.consumeListener = listener;

        ConsumeParams params = ConsumeParams.newBuilder()
                .setPurchaseToken(purchaseToken)
                .build();

        billingClient.consumeAsync(params, (billingResult, s) -> {
            if (consumeListener != null) {
                consumeListener.onConsumeResult(billingResult, s);
            }
        });
    }

    /**
     * Acknowledge a purchase (for non-consumable items and subscriptions).
     */
    public void acknowledgePurchase(String purchaseToken, AcknowledgeListener listener) {
        if (!isReady) {
            listener.onAcknowledgeResult(
                    BillingResult.newBuilder()
                            .setResponseCode(BillingClient.BillingResponseCode.SERVICE_DISCONNECTED)
                            .setDebugMessage("BillingClient not connected")
                            .build(),
                    purchaseToken
            );
            return;
        }

        this.acknowledgeListener = listener;

        AcknowledgePurchaseParams params = AcknowledgePurchaseParams.newBuilder()
                .setPurchaseToken(purchaseToken)
                .build();

        billingClient.acknowledgePurchase(params, billingResult -> {
            if (acknowledgeListener != null) {
                acknowledgeListener.onAcknowledgeResult(billingResult, purchaseToken);
            }
        });
    }

    /**
     * Get the underlying BillingClient for launching purchase flows.
     * The plugin uses this to build BillingFlowParams.
     */
    public BillingClient getBillingClient() {
        return billingClient;
    }

    /**
     * End the billing connection. Call when the app is being destroyed.
     */
    public void endConnection() {
        if (billingClient != null && isReady) {
            billingClient.endConnection();
            isReady = false;
            Log.d(TAG, "BillingClient connection ended");
        }
    }
}
