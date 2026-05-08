package com.example.aquaatiapp.utils

import android.app.NotificationChannel
import android.app.NotificationManager
import android.app.PendingIntent
import android.content.Context
import android.content.Intent
import android.os.Build
import android.util.Log
import androidx.core.app.NotificationCompat
import com.example.aquaatiapp.DashboardActivity
import com.example.aquaatiapp.R

class NotificationHelper(private val context: Context) {

    companion object {
        private const val CHANNEL_ID = "aquaati_notifications_v2"
        private const val CHANNEL_NAME = "Alertas de AquaAti"
        private const val NOTIFICATION_ID = 1001
        private const val TAG = "NotificationHelper"
    }

    init {
        createNotificationChannel()
    }

    private fun createNotificationChannel() {
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
            val channel = NotificationChannel(
                CHANNEL_ID,
                CHANNEL_NAME,
                NotificationManager.IMPORTANCE_HIGH
            ).apply {
                description = "Canal para alertas de mantenimiento y calidad del agua"
                enableLights(true)
                enableVibration(true)
            }
            val notificationManager =
                context.getSystemService(Context.NOTIFICATION_SERVICE) as NotificationManager
            notificationManager.createNotificationChannel(channel)
        }
    }

    fun showMaintenanceNotification(title: String, message: String) {
        Log.d(TAG, "Intentando mostrar notificación: $title - $message")
        
        val intent = Intent(context, DashboardActivity::class.java).apply {
            flags = Intent.FLAG_ACTIVITY_NEW_TASK or Intent.FLAG_ACTIVITY_CLEAR_TASK
        }
        val pendingIntent = PendingIntent.getActivity(
            context, 0, intent,
            PendingIntent.FLAG_IMMUTABLE or PendingIntent.FLAG_UPDATE_CURRENT
        )

        val builder = NotificationCompat.Builder(context, CHANNEL_ID)
            .setSmallIcon(R.drawable.ic_water)
            .setContentTitle(title)
            .setContentText(message)
            .setPriority(NotificationCompat.PRIORITY_HIGH)
            .setContentIntent(pendingIntent)
            .setAutoCancel(true)
            .setDefaults(NotificationCompat.DEFAULT_ALL)

        val notificationManager =
            context.getSystemService(Context.NOTIFICATION_SERVICE) as NotificationManager
        
        try {
            notificationManager.notify(NOTIFICATION_ID, builder.build())
            Log.d(TAG, "Notificación enviada al NotificationManager")
        } catch (e: Exception) {
            Log.e(TAG, "Error al mostrar notificación", e)
        }
    }
}
