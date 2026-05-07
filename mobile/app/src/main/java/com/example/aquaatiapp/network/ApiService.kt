package com.example.aquaatiapp.network

import com.example.aquaatiapp.data.model.DatosResponse
import com.example.aquaatiapp.data.model.LecturaDiaria
import com.example.aquaatiapp.data.model.LoginRequest
import com.example.aquaatiapp.data.model.LoginResponse
import retrofit2.Response
import retrofit2.http.Body
import retrofit2.http.GET
import retrofit2.http.Header
import retrofit2.http.POST

interface ApiService {
    @POST("api/login")
    suspend fun login(@Body request: LoginRequest): Response<LoginResponse>

    @GET("api/datos")
    suspend fun getDatos(@Header("Authorization") token: String): Response<DatosResponse>

    @GET("api/historico")
    suspend fun getHistorico(@Header("Authorization") token: String): Response<List<LecturaDiaria>>
}
