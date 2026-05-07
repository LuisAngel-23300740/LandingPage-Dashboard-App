package com.example.aquaatiapp

import android.content.Intent
import android.os.Bundle
import android.view.Menu
import android.view.MenuItem
import android.widget.TextView
import android.widget.Toast
import androidx.appcompat.app.AppCompatActivity
import androidx.lifecycle.ViewModelProvider
import androidx.recyclerview.widget.LinearLayoutManager
import androidx.recyclerview.widget.RecyclerView
import androidx.swiperefreshlayout.widget.SwipeRefreshLayout
import com.example.aquaatiapp.network.ApiClient
import com.example.aquaatiapp.repository.AuthRepository
import com.example.aquaatiapp.ui.adapter.AlertsAdapter
import com.example.aquaatiapp.ui.viewmodel.DashboardViewModel
import com.example.aquaatiapp.ui.viewmodel.ViewModelFactory
import com.example.aquaatiapp.utils.TokenManager

class DashboardActivity : AppCompatActivity() {

    private lateinit var viewModel: DashboardViewModel
    private lateinit var tokenManager: TokenManager
    private lateinit var swipeRefresh: SwipeRefreshLayout
    private lateinit var alertsAdapter: AlertsAdapter

    private lateinit var tvLitrosTotales: TextView
    private lateinit var tvLitrosHoy: TextView
    private lateinit var tvCalidad: TextView
    private lateinit var tvEstadoFiltro: TextView
    private lateinit var rvAlertas: RecyclerView

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        setContentView(R.layout.activity_dashboard)

        tokenManager = TokenManager(this)

        // Recuperar token y configurar ApiClient al iniciar
        val token = tokenManager.getToken()
        if (token != null) {
            ApiClient.setToken(token)
        } else {
            navigateToLogin()
            return
        }

        val repository = AuthRepository(ApiClient.apiService)
        val factory = ViewModelFactory(repository)
        viewModel = ViewModelProvider(this, factory)[DashboardViewModel::class.java]

        initViews()
        setupObservers()

        viewModel.fetchDatos()

        swipeRefresh.setOnRefreshListener {
            viewModel.fetchDatos()
        }
    }

    private fun initViews() {
        swipeRefresh = findViewById(R.id.swipeRefresh)
        tvLitrosTotales = findViewById(R.id.tvLitrosTotales)
        tvLitrosHoy = findViewById(R.id.tvLitrosHoy)
        tvCalidad = findViewById(R.id.tvCalidad)
        tvEstadoFiltro = findViewById(R.id.tvEstadoFiltro)
        rvAlertas = findViewById(R.id.rvAlertas)

        // Configurar RecyclerView
        alertsAdapter = AlertsAdapter(emptyList())
        rvAlertas.layoutManager = LinearLayoutManager(this)
        rvAlertas.adapter = alertsAdapter

        findViewById<android.view.View>(R.id.btnVerHistorico).setOnClickListener {
            // Actividad de gráfico (próximo paso)
            Toast.makeText(this, "Cargando histórico...", Toast.LENGTH_SHORT).show()
        }
    }

    private fun setupObservers() {
        viewModel.isLoading.observe(this) { isLoading ->
            swipeRefresh.isRefreshing = isLoading
        }

        viewModel.datos.observe(this) { response ->
            if (response.isSuccessful && response.body() != null) {
                val data = response.body()!!
                tvLitrosTotales.text = "${data.litrosTotales} L"
                tvLitrosHoy.text = "${data.litrosHoy} L"
                tvCalidad.text = "${data.calidadAgua}%"
                tvEstadoFiltro.text = data.estadoFiltro

                // Actualizar alertas
                alertsAdapter.updateData(data.alertas)
            } else if (response.code() == 401) {
                handleUnauthorized()
            } else {
                val errorMsg = response.errorBody()?.string() ?: "Error desconocido"
                Toast.makeText(this, "Error: $errorMsg", Toast.LENGTH_LONG).show()
            }
        }

        viewModel.errorMessage.observe(this) { error ->
            error?.let {
                Toast.makeText(this, "Error de red: $it", Toast.LENGTH_SHORT).show()
            }
        }
    }

    private fun handleUnauthorized() {
        tokenManager.clearToken()
        Toast.makeText(this, "Sesión expirada o inválida", Toast.LENGTH_SHORT).show()
        navigateToLogin()
    }

    private fun navigateToLogin() {
        val intent = Intent(this, LoginActivity::class.java)
        intent.flags = Intent.FLAG_ACTIVITY_NEW_TASK or Intent.FLAG_ACTIVITY_CLEAR_TASK
        startActivity(intent)
        finish()
    }

    override fun onCreateOptionsMenu(menu: Menu?): Boolean {
        menuInflater.inflate(R.menu.dashboard_menu, menu)
        return true
    }

    override fun onOptionsItemSelected(item: MenuItem): Boolean {
        return when (item.itemId) {
            R.id.action_logout -> {
                logout()
                true
            }
            else -> super.onOptionsItemSelected(item)
        }
    }

    private fun logout() {
        tokenManager.clearToken()
        navigateToLogin()
    }
}
