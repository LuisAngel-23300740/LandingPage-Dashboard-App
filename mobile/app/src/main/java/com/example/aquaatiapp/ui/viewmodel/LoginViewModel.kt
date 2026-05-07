package com.example.aquaatiapp.ui.viewmodel

import androidx.lifecycle.LiveData
import androidx.lifecycle.MutableLiveData
import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import com.example.aquaatiapp.data.model.LoginRequest
import com.example.aquaatiapp.repository.AuthRepository
import kotlinx.coroutines.launch

sealed class LoginState {
    object Idle : LoginState()
    object Loading : LoginState()
    data class Success(val token: String) : LoginState()
    data class Error(val message: String) : LoginState()
}

class LoginViewModel(
    private val repository: AuthRepository = AuthRepository()
) : ViewModel() {

    private val _loginState = MutableLiveData<LoginState>(LoginState.Idle)
    val loginState: LiveData<LoginState> = _loginState

    fun login(email: String, password: String) {
        _loginState.value = LoginState.Loading
        viewModelScope.launch {
            try {
                val response = repository.login(LoginRequest(email, password))
                if (response.isSuccessful) {
                    val body = response.body()
                    if (body != null && body.token.isNotBlank()) {
                        _loginState.value = LoginState.Success(body.token)
                    } else {
                        _loginState.value = LoginState.Error("Respuesta inválida del servidor")
                    }
                } else {
                    val message = response.errorBody()?.string().takeUnless { it.isNullOrBlank() }
                        ?: "Credenciales incorrectas"
                    _loginState.value = LoginState.Error(message)
                }
            } catch (exception: Exception) {
                _loginState.value = LoginState.Error(exception.message ?: "Error de red")
            }
        }
    }
}
