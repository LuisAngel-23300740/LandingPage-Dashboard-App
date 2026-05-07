package com.example.aquaatiapp.data.model

import com.google.gson.annotations.SerializedName

data class DatosResponse(
    @SerializedName("litros_totales") val litrosTotales: Double,
    @SerializedName("litros_hoy") val litrosHoy: Double,
    @SerializedName("calidad_agua") val calidadAgua: Int,
    @SerializedName("estado_filtro") val estadoFiltro: String,
    val alertas: List<Alerta>
)
