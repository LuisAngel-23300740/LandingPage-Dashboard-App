package com.example.aquaatiapp.workers

import android.content.Context
import androidx.work.CoroutineWorker
import androidx.work.WorkerParameters
import androidx.work.ListenableWorker.Result
import com.example.aquaatiapp.network.ApiClient
import com.example.aquaatiapp.utils.NotificationHelper
import com.example.aquaatiapp.utils.TokenManager

class DataRefreshWorker(
    appContext: Context,
    workerParams: WorkerParameters
) : CoroutineWorker(appContext, workerParams) {

    override suspend fun doWork(): Result {
        val tokenManager = TokenManager(applicationContext)
        val token = tokenManager.getToken() ?: return Result.failure()

        ApiClient.setToken(token)

        return try {
            val response = ApiClient.apiService.getDatos()
            if (response.isSuccessful && response.body() != null) {
                val data = response.body()!!
                val notificationHelper = NotificationHelper(applicationContext)

                if (data.estadoFiltro.lowercase() == "malo") {
                    notificationHelper.showMaintenanceNotification(
                        "Mantenimiento requerido",
                        "El filtro necesita atención inmediata."
                    )
                } else if (data.calidadAgua < 50) {
                    notificationHelper.showMaintenanceNotification(
                        "Calidad de agua baja",
                        "La calidad del agua es de solo ${data.calidadAgua}%."
                    )
                }
                Result.success()
            } else {
                Result.retry()
            }
        } catch (e: Exception) {
            Result.retry()
        }
    }
}
