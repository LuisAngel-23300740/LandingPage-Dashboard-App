package com.example.aquaatiapp.data.model

data class Alerta(
    val fecha: String,      // ISO string, ej: "2025-05-05T10:00:00Z"
    val tipo: String,       // "Mantenimiento", "Filtro saturado", "Calidad baja"
    val descripcion: String
)
