package com.parth.lookaway;

import com.getcapacitor.JSObject;
import com.getcapacitor.Plugin;
import com.getcapacitor.PluginCall;
import com.getcapacitor.PluginMethod;
import com.getcapacitor.annotation.CapacitorPlugin;

@CapacitorPlugin(name = "PersistentTimer")
public class PersistentTimerPlugin extends Plugin {
    @PluginMethod
    public void update(PluginCall call) {
        String phase = call.getString("phase");
        Boolean paused = call.getBoolean("paused");
        Long remainingMs = call.getLong("remainingMs");
        Long endsAt = call.getLong("endsAt");
        Long focusDurationMs = call.getLong("focusDurationMs");
        Long breakDurationMs = call.getLong("breakDurationMs");

        if (
            (!"focus".equals(phase) && !"break".equals(phase)) ||
            paused == null ||
            remainingMs == null ||
            focusDurationMs == null ||
            breakDurationMs == null ||
            focusDurationMs <= 0 ||
            breakDurationMs <= 0 ||
            (!paused && endsAt == null)
        ) {
            call.reject("Invalid persistent timer state.");
            return;
        }

        try {
            PersistentTimerNotification.update(
                getContext(),
                phase,
                paused,
                remainingMs,
                endsAt == null ? 0 : endsAt,
                focusDurationMs,
                breakDurationMs
            );
            call.resolve(new JSObject());
        } catch (RuntimeException error) {
            call.reject("Unable to update the persistent timer notification.", error);
        }
    }

    @PluginMethod
    public void cancel(PluginCall call) {
        try {
            PersistentTimerNotification.cancel(getContext());
            call.resolve(new JSObject());
        } catch (RuntimeException error) {
            call.reject("Unable to cancel the persistent timer notification.", error);
        }
    }
}
