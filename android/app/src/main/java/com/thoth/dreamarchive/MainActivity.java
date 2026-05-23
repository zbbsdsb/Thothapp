package com.thoth.dreamarchive;

import android.os.Bundle;
import com.getcapacitor.BridgeActivity;
import com.thoth.dreamarchive.billing.ThothBillingPlugin;

public class MainActivity extends BridgeActivity {
    @Override
    public void onCreate(Bundle savedInstanceState) {
        registerPlugin(ThothBillingPlugin.class);
        super.onCreate(savedInstanceState);
    }
}
