package com.parth.lookaway;

import android.content.BroadcastReceiver;
import android.content.Context;
import android.content.Intent;

public class PersistentTimerAlarmReceiver extends BroadcastReceiver {
    @Override
    public void onReceive(Context context, Intent intent) {
        long revision = intent.getLongExtra("revision", -1);
        PersistentTimerNotification.onTransition(context, revision);
    }
}
