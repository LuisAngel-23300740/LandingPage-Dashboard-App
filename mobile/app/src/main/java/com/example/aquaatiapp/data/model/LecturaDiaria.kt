package com.example.aquaatiapp.data.model

data class LecturaDiaria(
    val fecha: String,      // "2025-05-05" (formato yyyy-MM-dd)
    val litros: Double,     // litros filtrados ese día
    val calidad_promedio: Int  // calidad promedio (opcional)
)
