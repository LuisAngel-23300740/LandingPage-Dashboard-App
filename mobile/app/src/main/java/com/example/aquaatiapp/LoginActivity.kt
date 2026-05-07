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
import com.example.aquaatiapp.ui.viewmodel.LoginState
import com.example.aquaatiapp.ui.viewmodel.LoginViewModel
import com.example.aquaatiapp.utils.TokenManager
import com.google.android.material.textfield.TextInputEditText

class LoginActivity : AppCompatActivity() {

    private lateinit var etEmail: TextInputEditText
    private lateinit var etPassword: TextInputEditText
    private lateinit var btnLogin: Button
    private lateinit var progressLogin: ProgressBar
    private lateinit var viewModel: LoginViewModel

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        setContentView(R.layout.activity_login)

        etEmail = findViewById(R.id.etEmail)
        etPassword = findViewById(R.id.etPassword)
        btnLogin = findViewById(R.id.btnLogin)
        progressLogin = findViewById(R.id.progressLogin)

        viewModel = ViewModelProvider(this)[LoginViewModel::class.java]

        val savedToken = TokenManager.getToken(this)
        if (!savedToken.isNullOrBlank()) {
            ApiClient.setToken(savedToken)
            goToDashboard()
            return
        }

        btnLogin.setOnClickListener {
            val email = etEmail.text.toString().trim()
            val password = etPassword.text.toString().trim()

            if (email.isEmpty() || password.isEmpty()) {
                Toast.makeText(this, "Por favor completa todos los campos", Toast.LENGTH_SHORT).show()
                return@setOnClickListener
            }

            viewModel.login(email, password)
        }

        observeViewModel()
    }

    private fun observeViewModel() {
        viewModel.loginState.observe(this) { state ->
            when (state) {
                is LoginState.Loading -> {
                    progressLogin.visibility = View.VISIBLE
                    btnLogin.isEnabled = false
                }
                is LoginState.Success -> {
                    progressLogin.visibility = View.GONE
                    btnLogin.isEnabled = true
                    TokenManager.saveToken(this, state.token)
                    ApiClient.setToken(state.token)
                    goToDashboard()
                }
                is LoginState.Error -> {
                    progressLogin.visibility = View.GONE
                    btnLogin.isEnabled = true
                    Toast.makeText(this, state.message, Toast.LENGTH_LONG).show()
                }
                else -> {
                    progressLogin.visibility = View.GONE
                    btnLogin.isEnabled = true
                }
            }
        }
    }

    private fun goToDashboard() {
        startActivity(Intent(this, DashboardActivity::class.java))
        finish()
    }
}
