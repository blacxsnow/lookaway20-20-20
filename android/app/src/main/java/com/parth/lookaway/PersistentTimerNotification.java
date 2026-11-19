package com.parth.lookaway;

import android.app.AlarmManager;
import android.app.Notification;
import android.app.NotificationChannel;
import android.app.NotificationManager;
import android.app.PendingIntent;
import android.content.Context;
import android.content.Intent;
import android.content.SharedPreferences;
import android.os.Build;

import androidx.core.app.NotificationCompat;
import androidx.core.app.NotificationManagerCompat;

import java.util.Locale;

final class PersistentTimerNotification {
    static final int NOTIFICATION_ID = 202021;

    private static final String CHANNEL_ID = "lookaway_timer_status";
    private static final String CHANNEL_NAME = "Timer status";
    private static final String ACTION_TRANSITION = "com.parth.lookaway.PERSISTENT_TIMER_TRANSITION";
    private static final String PREFERENCES = "lookaway_persistent_timer";
    private static final String KEY_ACTIVE = "active";
    private static final String KEY_REVISION = "revision";
    private static final String KEY_PHASE = "phase";
    private static final String KEY_PAUSED = "paused";
    private static final String KEY_ENDS_AT = "endsAt";
    private static final String KEY_FOCUS_DURATION = "focusDurationMs";
    private static final String KEY_BREAK_DURATION = "breakDurationMs";
    private static final String EXTRA_REVISION = "revision";

    private PersistentTimerNotification() {}

    static void update(
        Context context,
        String phase,
        boolean paused,
        long remainingMs,
        long endsAt,
        long focusDurationMs,
        long breakDurationMs
    ) {
        SharedPreferences preferences = preferences(context);
        long revision = preferences.getLong(KEY_REVISION, 0) + 1;
        cancelTransition(context);
        preferences.edit()
            .putLong(KEY_REVISION, revision)
            .putBoolean(KEY_ACTIVE, true)
            .putString(KEY_PHASE, phase)
            .putBoolean(KEY_PAUSED, paused)
            .putLong(KEY_ENDS_AT, endsAt)
            .putLong(KEY_FOCUS_DURATION, focusDurationMs)
            .putLong(KEY_BREAK_DURATION, breakDurationMs)
            .commit();

        show(context, phase, paused, remainingMs, endsAt);
        if (!paused) scheduleTransition(context, revision, endsAt);
    }

    static void cancel(Context context) {
        SharedPreferences preferences = preferences(context);
        long revision = preferences.getLong(KEY_REVISION, 0) + 1;
        preferences.edit()
            .putLong(KEY_REVISION, revision)
            .putBoolean(KEY_ACTIVE, false)
            .commit();
        cancelTransition(context);
        NotificationManagerCompat.from(context).cancel(NOTIFICATION_ID);
    }

    static void onTransition(Context context, long alarmRevision) {
        SharedPreferences preferences = preferences(context);
        if (
            !preferences.getBoolean(KEY_ACTIVE, false) ||
            preferences.getLong(KEY_REVISION, -1) != alarmRevision ||
            preferences.getBoolean(KEY_PAUSED, false)
        ) {
            return;
        }

        String phase = preferences.getString(KEY_PHASE, null);
        if (!"focus".equals(phase) && !"break".equals(phase)) {
            cancel(context);
            return;
        }

        long endsAt = preferences.getLong(KEY_ENDS_AT, 0);
        long now = System.currentTimeMillis();
        if (endsAt > now + 250) {
            scheduleTransition(context, alarmRevision, endsAt);
            return;
        }

        boolean focusEnded = "focus".equals(phase);
        String nextPhase = focusEnded ? "break" : "focus";
        long nextDuration = preferences.getLong(
            focusEnded ? KEY_BREAK_DURATION : KEY_FOCUS_DURATION,
            0
        );
        if (nextDuration <= 0) {
            cancel(context);
            return;
        }

        long nextEndsAt = now + nextDuration;
        preferences.edit()
            .putString(KEY_PHASE, nextPhase)
            .putLong(KEY_ENDS_AT, nextEndsAt)
            .commit();

        try {
            show(context, nextPhase, false, nextDuration, nextEndsAt);
            scheduleTransition(context, alarmRevision, nextEndsAt);
        } catch (SecurityException error) {
            cancel(context);
        }
    }

    private static void show(
        Context context,
        String phase,
        boolean paused,
        long remainingMs,
        long endsAt
    ) {
        ensureChannel(context);

        Intent launchIntent = new Intent(context, MainActivity.class)
            .setFlags(Intent.FLAG_ACTIVITY_CLEAR_TOP | Intent.FLAG_ACTIVITY_SINGLE_TOP);
        PendingIntent contentIntent = PendingIntent.getActivity(
            context,
            NOTIFICATION_ID,
            launchIntent,
            PendingIntent.FLAG_UPDATE_CURRENT | PendingIntent.FLAG_IMMUTABLE
        );

        String phaseLabel = "focus".equals(phase) ? "Focus" : "Break";
        String content = paused
            ? formatRemaining(remainingMs) + " remaining · Paused"
            : "Running · Remaining";

        NotificationCompat.Builder builder = new NotificationCompat.Builder(context, CHANNEL_ID)
            .setSmallIcon(R.drawable.ic_stat_lookaway)
            .setContentTitle("Lookaway | " + phaseLabel)
            .setContentText(content)
            .setContentIntent(contentIntent)
            .setCategory(NotificationCompat.CATEGORY_STOPWATCH)
            .setVisibility(NotificationCompat.VISIBILITY_PUBLIC)
            .setOngoing(true)
            .setOnlyAlertOnce(true)
            .setSilent(true)
            .setShowWhen(!paused)
            .setAutoCancel(false);

        if (paused) {
            builder.setUsesChronometer(false).setWhen(0);
        } else {
            builder.setUsesChronometer(true).setWhen(endsAt).setChronometerCountDown(true);
        }

        NotificationManagerCompat.from(context).notify(NOTIFICATION_ID, builder.build());
    }

    private static void ensureChannel(Context context) {
        if (Build.VERSION.SDK_INT < Build.VERSION_CODES.O) return;

        NotificationManager manager = context.getSystemService(NotificationManager.class);
        if (manager == null || manager.getNotificationChannel(CHANNEL_ID) != null) return;

        NotificationChannel channel = new NotificationChannel(
            CHANNEL_ID,
            CHANNEL_NAME,
            NotificationManager.IMPORTANCE_LOW
        );
        channel.setDescription("Shows the current Lookaway timer without sound.");
        channel.setSound(null, null);
        channel.enableVibration(false);
        channel.setShowBadge(false);
        channel.setLockscreenVisibility(Notification.VISIBILITY_PUBLIC);
        manager.createNotificationChannel(channel);
    }

    private static void scheduleTransition(Context context, long revision, long endsAt) {
        AlarmManager manager = (AlarmManager) context.getSystemService(Context.ALARM_SERVICE);
        if (manager == null) return;

        PendingIntent pendingIntent = transitionIntent(context, revision);
        long triggerAt = Math.max(endsAt, System.currentTimeMillis() + 250);
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.M) {
            manager.setAndAllowWhileIdle(AlarmManager.RTC_WAKEUP, triggerAt, pendingIntent);
        } else {
            manager.set(AlarmManager.RTC_WAKEUP, triggerAt, pendingIntent);
        }
    }

    private static PendingIntent transitionIntent(Context context, long revision) {
        Intent intent = new Intent(context, PersistentTimerAlarmReceiver.class)
            .setAction(ACTION_TRANSITION)
            .putExtra(EXTRA_REVISION, revision);
        return PendingIntent.getBroadcast(
            context,
            NOTIFICATION_ID,
            intent,
            PendingIntent.FLAG_UPDATE_CURRENT | PendingIntent.FLAG_IMMUTABLE
        );
    }

    private static void cancelTransition(Context context) {
        AlarmManager manager = (AlarmManager) context.getSystemService(Context.ALARM_SERVICE);
        if (manager == null) return;
        PendingIntent pendingIntent = transitionIntent(
            context,
            preferences(context).getLong(KEY_REVISION, 0)
        );
        manager.cancel(pendingIntent);
        pendingIntent.cancel();
    }

    private static SharedPreferences preferences(Context context) {
        return context.getSharedPreferences(PREFERENCES, Context.MODE_PRIVATE);
    }

    private static String formatRemaining(long remainingMs) {
        long totalSeconds = Math.max(0, (remainingMs + 999) / 1_000);
        return String.format(
            Locale.getDefault(),
            "%02d:%02d",
            totalSeconds / 60,
            totalSeconds % 60
        );
    }
}
