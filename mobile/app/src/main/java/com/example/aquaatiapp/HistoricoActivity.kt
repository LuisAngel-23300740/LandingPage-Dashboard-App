package com.example.aquaatiapp

import android.content.Intent
import android.os.Bundle
import android.view.View
import android.widget.ProgressBar
import android.widget.Toast
import androidx.appcompat.app.AppCompatActivity
import androidx.appcompat.widget.Toolbar
import androidx.core.content.ContextCompat
import androidx.lifecycle.lifecycleScope
import com.example.aquaatiapp.data.model.DiaHistorico
import com.example.aquaatiapp.network.ApiClient
import com.example.aquaatiapp.repository.AuthRepository
import com.example.aquaatiapp.utils.TokenManager
import com.github.mikephil.charting.charts.LineChart
import com.github.mikephil.charting.components.XAxis
import com.github.mikephil.charting.data.Entry
import com.github.mikephil.charting.data.LineData
import com.github.mikephil.charting.data.LineDataSet
import com.github.mikephil.charting.formatter.IndexAxisValueFormatter
import kotlinx.coroutines.launch

class HistoricoActivity : AppCompatActivity() {

    private lateinit var chartHistorico: LineChart
    private lateinit var progressHistorico: ProgressBar
    private lateinit var tokenManager: TokenManager

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        setContentView(R.layout.activity_historico)

        val toolbar: Toolbar = findViewById(R.id.toolbar)
        setSupportActionBar(toolbar)
        supportActionBar?.setDisplayHomeAsUpEnabled(true)

        chartHistorico = findViewById(R.id.chartHistorico)
        progressHistorico = findViewById(R.id.progressHistorico)
        tokenManager = TokenManager(this)

        val token = tokenManager.getToken()
        if (token.isNullOrBlank()) {
            goToLogin()
            return
        }
        
        ApiClient.setToken(token)
        loadHistorico()
    }

    override fun onSupportNavigateUp(): Boolean {
        onBackPressed()
        return true
    }

    private fun loadHistorico() {
        progressHistorico.visibility = View.VISIBLE
        lifecycleScope.launch {
            try {
                val repository = AuthRepository(ApiClient.apiService)
                val response = repository.getHistorico()
                if (response.isSuccessful && response.body() != null) {
                    val dias = response.body()!!
                    if (dias.isNotEmpty()) {
                        showChart(dias)
                    } else {
                        Toast.makeText(this@HistoricoActivity, "No hay datos históricos disponibles", Toast.LENGTH_SHORT).show()
                    }
                } else {
                    Toast.makeText(
                        this@HistoricoActivity,
                        "Error al cargar el histórico: ${response.message()}",
                        Toast.LENGTH_LONG
                    ).show()
                }
            } catch (exception: Exception) {
                Toast.makeText(
                    this@HistoricoActivity,
                    "Error de red: ${exception.message}",
                    Toast.LENGTH_LONG
                ).show()
            } finally {
                progressHistorico.visibility = View.GONE
            }
        }
    }

    private fun showChart(datos: List<DiaHistorico>) {
        val entries = datos.mapIndexed { index, lectura ->
            Entry(index.toFloat(), lectura.litros.toFloat())
        }

        val labels = datos.map { it.fecha }

        val dataSet = LineDataSet(entries, "Litros filtrados").apply {
            lineWidth = 3f
            circleRadius = 5f
            setDrawValues(true)
            valueTextSize = 10f
            color = ContextCompat.getColor(this@HistoricoActivity, R.color.purple_500)
            setCircleColor(ContextCompat.getColor(this@HistoricoActivity, R.color.purple_500))
            mode = LineDataSet.Mode.CUBIC_BEZIER
            setDrawFilled(true)
            fillAlpha = 50
        }

        chartHistorico.xAxis.apply {
            position = XAxis.XAxisPosition.BOTTOM
            valueFormatter = IndexAxisValueFormatter(labels)
            granularity = 1f
            setDrawGridLines(false)
            labelRotationAngle = -45f
        }

        chartHistorico.axisLeft.apply {
            setDrawGridLines(true)
            gridColor = android.graphics.Color.LTGRAY
        }

        chartHistorico.axisRight.isEnabled = false
        chartHistorico.description.isEnabled = false
        chartHistorico.legend.isEnabled = true
        
        chartHistorico.data = LineData(dataSet)
        chartHistorico.animateX(1000)
        chartHistorico.invalidate()
    }

    private fun goToLogin() {
        val intent = Intent(this, LoginActivity::class.java)
        intent.flags = Intent.FLAG_ACTIVITY_NEW_TASK or Intent.FLAG_ACTIVITY_CLEAR_TASK
        startActivity(intent)
        finish()
    }
}
