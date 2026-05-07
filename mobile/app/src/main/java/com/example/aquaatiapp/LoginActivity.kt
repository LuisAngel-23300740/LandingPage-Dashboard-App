package com.example.aquaatiapp

import android.content.Intent
import android.os.Bundle
import android.view.View
import android.widget.Button
import android.widget.ProgressBar
import android.widget.Toast
import androidx.appcompat.app.AppCompatActivity
import androidx.lifecycle.ViewModelProvider
import com.example.aquaatiapp.network.ApiClient
import com.example.aquaatiapp.repository.AuthRepository
import com.example.aquaatiapp.ui.viewmodel.LoginViewModel
import com.example.aquaatiapp.ui.viewmodel.ViewModelFactory
import com.example.aquaatiapp.utils.TokenManager
import com.google.android.material.textfield.TextInputEditText

class LoginActivity : AppCompatActivity() {

    private lateinit var viewModel: LoginViewModel
    private lateinit var tokenManager: TokenManager

    private lateinit var etEmail: TextInputEditText
    private lateinit var etPassword: TextInputEditText
    private lateinit var btnLogin: Button
    private lateinit var progressBar: ProgressBar

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        setContentView(R.layout.activity_login)

        // Inicializar componentes
        tokenManager = TokenManager(this)
        val repository = AuthRepository(ApiClient.apiService)
        val factory = ViewModelFactory(repository)
        viewModel = ViewModelProvider(this, factory)[LoginViewModel::class.java]

        etEmail = findViewById(R.id.etEmail)
        etPassword = findViewById(R.id.etPassword)
        btnLogin = findViewById(R.id.btnLogin)
        progressBar = findViewById(R.id.progressBar)

        setupObservers()

        btnLogin.setOnClickListener {
            val email = etEmail.text.toString().trim()
            val password = etPassword.text.toString().trim()

            if (email.isEmpty() || password.isEmpty()) {
                Toast.makeText(this, "Completa todos los campos", Toast.LENGTH_SHORT).show()
            } else {
                viewModel.login(email, password)
            }
        }
    }

    private fun setupObservers() {
        viewModel.isLoading.observe(this) { isLoading ->
            progressBar.visibility = if (isLoading) View.VISIBLE else View.GONE
            btnLogin.isEnabled = !isLoading
        }

        viewModel.loginResponse.observe(this) { response ->
            if (response.isSuccessful && response.body() != null) {
                val token = response.body()!!.token

                // Guardar token
                tokenManager.saveToken(token)
                ApiClient.setToken(token)

                // Navegar al Dashboard
                val intent = Intent(this, DashboardActivity::class.java)
                startActivity(intent)
                finish()
            } else {
                val errorMsg = response.errorBody()?.string() ?: "Error de autenticación"
                Toast.makeText(this, errorMsg, Toast.LENGTH_LONG).show()
            }
        }

        viewModel.errorMessage.observe(this) { error ->
            error?.let {
                Toast.makeText(this, "Error de red: $it", Toast.LENGTH_LONG).show()
            }
        }
    }
}
