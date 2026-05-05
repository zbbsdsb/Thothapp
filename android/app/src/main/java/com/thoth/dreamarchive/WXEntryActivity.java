package com.thoth.dreamarchive;

import android.app.Activity;
import android.content.Intent;
import android.os.Bundle;
import android.util.Log;

/**
 * WXEntryActivity — WeChat Pay result callback receiver.
 *
 * WeChat SDK calls this activity after payment completes (success / cancelled / failed).
 * It must be registered in AndroidManifest.xml with:
 *   <activity android:name=".WXEntryActivity"
 *             android:exported="true"
 *             android:launchMode="singleTop" />
 *
 * The result is forwarded back to the calling activity via Intent extras:
 *   - errCode:  0 = success, -1 = general error, -2 = user cancelled
 *   - errStr:   error description
 *
 * Note: For Android 13 (API 33+), remove intent-filter from WXEntryActivity
 * to avoid it appearing in the launcher. Register it programmatically
 * via PackageManager or keep it export-only.
 */
public class WXEntryActivity extends Activity {

    private static final String TAG = "WXEntryActivity";

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        handleIntent(getIntent());
    }

    @Override
    protected void onNewIntent(Intent intent) {
        super.onNewIntent(intent);
        handleIntent(intent);
    }

    private void handleIntent(Intent intent) {
        int errCode = intent.getIntExtra("errCode", -1);
        String errStr = intent.getStringExtra("errStr");

        Log.d(TAG, "WeChat Pay result: errCode=" + errCode + ", errStr=" + errStr);

        // Dispatch to the web app via a custom URL scheme
        // The Capacitor web layer listens on this scheme to receive the result.
        String resultScheme;
        if (errCode == 0) {
            resultScheme = "thoth://payment/success";
        } else if (errCode == -2) {
            resultScheme = "thoth://payment/cancelled";
        } else {
            resultScheme = "thoth://payment/failed?reason=" + (errStr != null ? errStr : "unknown");
        }

        // Open the URL to notify the web layer
        Intent viewIntent = new Intent(Intent.ACTION_VIEW, android.net.Uri.parse(resultScheme));
        viewIntent.addFlags(Intent.FLAG_ACTIVITY_NEW_TASK | Intent.FLAG_ACTIVITY_CLEAR_TOP);
        startActivity(viewIntent);

        finish();
    }
}
