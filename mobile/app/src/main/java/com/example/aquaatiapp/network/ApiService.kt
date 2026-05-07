package com.example.aquaatiapp.network

import com.example.aquaatiapp.data.model.DatosResponse
import com.example.aquaatiapp.data.model.HistoricoResponse
import com.example.aquaatiapp.data.model.LoginRequest
import com.example.aquaatiapp.data.model.LoginResponse
import retrofit2.Response
import retrofit2.http.Body
import retrofit2.http.GET
import retrofit2.http.POST

interface ApiService {
    @POST("login")
    suspend fun login(@Body request: LoginRequest): Response<LoginResponse>

    @GET("datos")
    suspend fun getDatos(): Response<DatosResponse>

    @GET("historico")
    suspend fun getHistorico(): Response<HistoricoResponse>
}
