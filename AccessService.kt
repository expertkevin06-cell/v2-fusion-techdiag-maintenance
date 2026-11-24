package com.example.mecadata

import android.app.Service
import android.content.Intent
import android.os.IBinder
import androidx.core.app.NotificationCompat

class AccessService : Service() {

    private var server: AccessServer? = null

    override fun onCreate() {
        super.onCreate()
        NotificationHelper.ensureChannel(this)
    }

    override fun onStartCommand(intent: Intent?, flags: Int, startId: Int): Int {
        startForeground(
            2001,
            NotificationCompat.Builder(this, "mecadata_access")
                .setSmallIcon(android.R.drawable.ic_dialog_info)
                .setContentTitle("MECADATA")
                .setContentText("Serveur local d'accès tiers actif.")
                .setOngoing(true)
                .build()
        )

        if (server == null) {
            server = AccessServer(this, 7777)
            try {
                server?.start()
            } catch (e: Exception) {
                server = null
            }
        }

        return START_STICKY
    }

    override fun onDestroy() {
        server?.stop()
        server = null
        super.onDestroy()
    }

    override fun onBind(intent: Intent?): IBinder? = null
}
