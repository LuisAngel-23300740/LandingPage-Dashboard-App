package com.example.aquaatiapp

import android.content.Context
import android.content.Intent
import android.os.Bundle
import android.widget.Button
import android.widget.EditText
import android.widget.Toast
import androidx.appcompat.app.AppCompatActivity
import androidx.lifecycle.lifecycleScope
import com.example.aquaatiapp.data.model.LoginRequest
import com.example.aquaatiapp.network.ApiClient
import com.example.aquaatiapp.network.ApiService
import kotlinx.coroutines.launch

class LoginActivity : AppCompatActivity() {

    private lateinit var etEmail: EditText
    private lateinit var etPassword: EditText
    private lateinit var btnLogin: Button

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        setContentView(R.layout.activity_login)

        etEmail = findViewById(R.id.etEmail)
        etPassword = findViewById(R.id.etPassword)
        btnLogin = findViewById(R.id.btnLogin)

        val apiService = ApiClient.createService(ApiService::class.java)

        btnLogin.setOnClickListener {
            val email = etEmail.text.toString()
            val password = etPassword.text.toString()

            if (email.isEmpty() || password.isEmpty()) {
                Toast.makeText(this, "Por favor, completa todos los campos", Toast.LENGTH_SHORT).show()
                return@setOnClickListener
            }

            val loginRequest = LoginRequest(email, password)

            lifecycleScope.launch {
                try {
                    val response = apiService.login(loginRequest)
                    if (response.isSuccessful && response.body() != null) {
                        val token = response.body()!!.token
                        
                        // Guardar token en SharedPreferences
                        val sharedPref = getSharedPreferences("app_prefs", Context.MODE_PRIVATE)
                        with(sharedPref.edit()) {
                            putString("auth_token", token)
                            apply()
                        }

                        // Configurar token en ApiClient para futuras peticiones
                        ApiClient.setToken(token)

                        // Navegar a DashboardActivity
                        val intent = Intent(this@LoginActivity, DashboardActivity::class.java)
                        startActivity(intent)
                        finish()
                    } else {
                        Toast.makeText(this@LoginActivity, "Error: ${response.message()}", Toast.LENGTH_SHORT).show()
                    }
                } catch (e: Exception) {
                    Toast.makeText(this@LoginActivity, "Error de red: ${e.message}", Toast.LENGTH_SHORT).show()
                }
            }
        }
    }
}
