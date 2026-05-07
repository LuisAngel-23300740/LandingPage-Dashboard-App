package com.example.aquaatiapp.repository

import com.example.aquaatiapp.data.model.DatosResponse
import com.example.aquaatiapp.data.model.DiaHistorico
import com.example.aquaatiapp.data.model.LoginRequest
import com.example.aquaatiapp.data.model.LoginResponse
import com.example.aquaatiapp.network.ApiService
import retrofit2.Response

class DataRepository(private val apiService: ApiService) {

    suspend fun login(loginRequest: LoginRequest): Response<LoginResponse> {
        return apiService.login(loginRequest)
    }

    suspend fun getDatos(): Response<DatosResponse> {
        return apiService.getDatos()
    }

    suspend fun getHistorico(): Response<List<DiaHistorico>> {
        return apiService.getHistorico()
    }
}
