package com.example.aquaatiapp.ui.adapter

import android.view.LayoutInflater
import android.view.View
import android.view.ViewGroup
import android.widget.TextView
import androidx.recyclerview.widget.RecyclerView
import com.example.aquaatiapp.R
import com.example.aquaatiapp.data.model.Alerta

class AlertsAdapter(private var alerts: List<Alerta>) :
    RecyclerView.Adapter<AlertsAdapter.AlertViewHolder>() {

    class AlertViewHolder(view: View) : RecyclerView.ViewHolder(view) {
        val tvType: TextView = view.findViewById(android.R.id.text1)
        val tvDesc: TextView = view.findViewById(android.R.id.text2)
    }

    override fun onCreateViewHolder(parent: ViewGroup, viewType: Int): AlertViewHolder {
        val view = LayoutInflater.from(parent.context)
            .inflate(android.R.layout.simple_list_item_2, parent, false)
        return AlertViewHolder(view)
    }

    override fun onBindViewHolder(holder: AlertViewHolder, position: Int) {
        val alert = alerts[position]
        holder.tvType.text = alert.tipo
        holder.tvDesc.text = "${alert.fecha} - ${alert.descripcion}"
    }

    override fun getItemCount() = alerts.size

    fun updateData(newAlerts: List<Alerta>) {
        alerts = newAlerts
        notifyDataSetChanged()
    }
}
