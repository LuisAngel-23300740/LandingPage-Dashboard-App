package com.example.aquaatiapp.repository

import com.example.aquaatiapp.data.model.DatosResponse
import com.example.aquaatiapp.data.model.HistoricoResponse
import com.example.aquaatiapp.data.model.LoginRequest
import com.example.aquaatiapp.data.model.LoginResponse
import com.example.aquaatiapp.network.ApiService
import retrofit2.Response

class AuthRepository(private val apiService: ApiService) {

    suspend fun login(loginRequest: LoginRequest): Response<LoginResponse> {
        return apiService.login(loginRequest)
    }

    suspend fun getDatos(): Response<DatosResponse> {
        return apiService.getDatos()
    }

    suspend fun getHistorico(): Response<HistoricoResponse> {
        return apiService.getHistorico()
    }
}
