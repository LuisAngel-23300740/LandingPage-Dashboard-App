package com.example.aquaatiapp.ui

import android.view.LayoutInflater
import android.view.View
import android.view.ViewGroup
import android.widget.TextView
import androidx.recyclerview.widget.RecyclerView
import com.example.aquaatiapp.R
import com.example.aquaatiapp.data.model.Alerta

class AlertAdapter(
    private val alerts: List<Alerta>
) : RecyclerView.Adapter<AlertAdapter.AlertViewHolder>() {

    override fun onCreateViewHolder(parent: ViewGroup, viewType: Int): AlertViewHolder {
        val view = LayoutInflater.from(parent.context)
            .inflate(R.layout.item_alerta, parent, false)
        return AlertViewHolder(view)
    }

    override fun onBindViewHolder(holder: AlertViewHolder, position: Int) {
        holder.bind(alerts[position])
    }

    override fun getItemCount(): Int = alerts.size

    class AlertViewHolder(itemView: View) : RecyclerView.ViewHolder(itemView) {
        private val tvFecha: TextView = itemView.findViewById(R.id.tvAlertFecha)
        private val tvTipo: TextView = itemView.findViewById(R.id.tvAlertTipo)
        private val tvDescripcion: TextView = itemView.findViewById(R.id.tvAlertDescripcion)

        fun bind(alerta: Alerta) {
            tvFecha.text = alerta.fecha
            tvTipo.text = alerta.tipo
            tvDescripcion.text = alerta.descripcion
        }
    }
}
