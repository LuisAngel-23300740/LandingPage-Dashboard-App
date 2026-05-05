package com.example.aquaatiapp.network

import com.example.aquaatiapp.data.model.LoginRequest
import com.example.aquaatiapp.data.model.LoginResponse
import retrofit2.Response
import retrofit2.http.Body
import retrofit2.http.POST

interface ApiService {
    @POST("api/login")
    suspend fun login(@Body request: LoginRequest): Response<LoginResponse>
}
