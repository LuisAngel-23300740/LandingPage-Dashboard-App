package com.example.aquaatiapp

import android.content.Intent
import android.os.Bundle
import android.view.Menu
import android.view.MenuItem
import android.view.View
import android.widget.Button
import android.widget.ProgressBar
import android.widget.TextView
import android.widget.Toast
import androidx.appcompat.app.AppCompatActivity
import androidx.lifecycle.ViewModelProvider
import androidx.recyclerview.widget.LinearLayoutManager
import androidx.recyclerview.widget.RecyclerView
import androidx.swiperefreshlayout.widget.SwipeRefreshLayout
import com.example.aquaatiapp.network.ApiClient
import com.example.aquaatiapp.ui.AlertAdapter
import com.example.aquaatiapp.ui.viewmodel.DashboardViewModel
import com.example.aquaatiapp.utils.TokenManager

class DashboardActivity : AppCompatActivity() {

    private lateinit var viewModel: DashboardViewModel
    private lateinit var swipeRefresh: SwipeRefreshLayout
    private lateinit var progressDashboard: ProgressBar
    private lateinit var tvLitrosTotales: TextView
    private lateinit var tvLitrosHoy: TextView
    private lateinit var tvCalidadAgua: TextView
    private lateinit var tvEstadoFiltro: TextView
    private lateinit var rvAlertas: RecyclerView
    private lateinit var btnHistorico: Button
    private lateinit var alertAdapter: AlertAdapter

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        setContentView(R.layout.activity_dashboard)

        swipeRefresh = findViewById(R.id.swipeRefresh)
        progressDashboard = findViewById(R.id.progressDashboard)
        tvLitrosTotales = findViewById(R.id.tvLitrosTotales)
        tvLitrosHoy = findViewById(R.id.tvLitrosHoy)
        tvCalidadAgua = findViewById(R.id.tvCalidadAgua)
        tvEstadoFiltro = findViewById(R.id.tvEstadoFiltro)
        rvAlertas = findViewById(R.id.rvAlertas)
        btnHistorico = findViewById(R.id.btnHistorico)

        rvAlertas.layoutManager = LinearLayoutManager(this)
        alertAdapter = AlertAdapter(emptyList())
        rvAlertas.adapter = alertAdapter

        val token = TokenManager.getToken(this)
        if (token.isNullOrBlank()) {
            goToLogin()
            return
        }

        ApiClient.setToken(token)

        viewModel = ViewModelProvider(this)[DashboardViewModel::class.java]
        observeViewModel()

        btnHistorico.setOnClickListener {
            startActivity(Intent(this, HistoricoActivity::class.java))
        }

        swipeRefresh.setOnRefreshListener {
            viewModel.loadDatos(token)
        }

        viewModel.loadDatos(token)
    }

    private fun observeViewModel() {
        viewModel.loading.observe(this) { loading ->
            progressDashboard.visibility = if (loading) View.VISIBLE else View.GONE
            swipeRefresh.isRefreshing = loading
        }

        viewModel.datos.observe(this) { datos ->
            datos?.let { updateDashboard(it) }
        }

        viewModel.error.observe(this) { error ->
            error?.let {
                Toast.makeText(this, it, Toast.LENGTH_LONG).show()
            }
        }

        viewModel.logout.observe(this) { shouldLogout ->
            if (shouldLogout) {
                TokenManager.clearToken(this)
                goToLogin()
                viewModel.clearLogout()
            }
        }
    }

    private fun updateDashboard(datos: com.example.aquaatiapp.data.model.DatosResponse) {
        tvLitrosTotales.text = String.format("%.0f L", datos.litros_totales)
        tvLitrosHoy.text = String.format("%.0f L hoy", datos.litros_hoy)
        tvCalidadAgua.text = "Calidad: ${datos.calidad_agua}%"
        tvEstadoFiltro.text = datos.estado_filtro.replaceFirstChar { it.uppercase() }

        alertAdapter = AlertAdapter(datos.alertas)
        rvAlertas.adapter = alertAdapter
    }

    private fun goToLogin() {
        startActivity(Intent(this, LoginActivity::class.java))
        finish()
    }

    override fun onCreateOptionsMenu(menu: Menu?): Boolean {
        menuInflater.inflate(R.menu.menu_dashboard, menu)
        return true
    }

    override fun onOptionsItemSelected(item: MenuItem): Boolean {
        return when (item.itemId) {
            R.id.action_logout -> {
                TokenManager.clearToken(this)
                goToLogin()
                true
            }
            else -> super.onOptionsItemSelected(item)
        }
    }
}
