package com.example.aquaatiapp.data.model

data class DatosResponse(
    val litros_totales: Double,
    val litros_hoy: Double,
    val calidad_agua: Int,      // porcentaje (0-100)
    val estado_filtro: String,  // "bueno", "regular", "malo"
    val alertas: List<Alerta>   // lista de alertas
)
