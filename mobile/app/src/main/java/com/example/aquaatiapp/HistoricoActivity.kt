package com.example.aquaatiapp

import android.content.Intent
import android.os.Bundle
import android.view.View
import android.widget.ProgressBar
import android.widget.Toast
import androidx.appcompat.app.AppCompatActivity
import androidx.lifecycle.lifecycleScope
import com.example.aquaatiapp.data.model.LecturaDiaria
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

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        setContentView(R.layout.activity_historico)

        chartHistorico = findViewById(R.id.chartHistorico)
        progressHistorico = findViewById(R.id.progressHistorico)

        val token = TokenManager.getToken(this)
        if (token.isNullOrBlank()) {
            goToLogin()
            return
        }

        loadHistorico(token)
    }

    private fun loadHistorico(token: String) {
        progressHistorico.visibility = View.VISIBLE
        lifecycleScope.launch {
            try {
                val response = AuthRepository().getHistorico(token)
                if (response.isSuccessful && response.body() != null) {
                    showChart(response.body()!!)
                } else {
                    Toast.makeText(
                        this@HistoricoActivity,
                        "No se pudo cargar el histórico",
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

    private fun showChart(datos: List<LecturaDiaria>) {
        val entries = datos.mapIndexed { index, lectura ->
            Entry(index.toFloat(), lectura.litros.toFloat())
        }

        val labels = datos.map { it.fecha }

        val dataSet = LineDataSet(entries, "Litros filtrados").apply {
            lineWidth = 2f
            circleRadius = 4f
            setDrawValues(false)
            color = getColor(R.color.purple_500)
            setCircleColor(getColor(R.color.purple_500))
        }

        chartHistorico.xAxis.apply {
            position = XAxis.XAxisPosition.BOTTOM
            valueFormatter = IndexAxisValueFormatter(labels)
            granularity = 1f
            setDrawGridLines(false)
            labelRotationAngle = -45f
        }

        chartHistorico.axisRight.isEnabled = false
        chartHistorico.description.isEnabled = false
        chartHistorico.data = LineData(dataSet)
        chartHistorico.animateX(800)
        chartHistorico.invalidate()
    }

    private fun goToLogin() {
        val intent = Intent(this, LoginActivity::class.java)
        startActivity(intent)
        finish()
    }
}
