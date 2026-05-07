package com.example.aquaatiapp.repository

import com.example.aquaatiapp.data.model.DatosResponse
import com.example.aquaatiapp.data.model.LoginRequest
import com.example.aquaatiapp.data.model.LoginResponse
import com.example.aquaatiapp.data.model.LecturaDiaria
import com.example.aquaatiapp.network.ApiClient
import com.example.aquaatiapp.network.ApiService
import retrofit2.Response

class AuthRepository(
    private val apiService: ApiService = ApiClient.createService(ApiService::class.java)
) {
    suspend fun login(request: LoginRequest): Response<LoginResponse> {
        return apiService.login(request)
    }

    suspend fun getDatos(token: String): Response<DatosResponse> {
        return apiService.getDatos("Bearer $token")
    }

    suspend fun getHistorico(token: String): Response<List<LecturaDiaria>> {
        return apiService.getHistorico("Bearer $token")
    }
}
