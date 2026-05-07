package com.example.aquaatiapp.data.model

import com.google.gson.annotations.SerializedName

data class DiaHistorico(
    val fecha: String,
    val litros: Double,
    @SerializedName("calidad_promedio") val calidadPromedio: Int
)
