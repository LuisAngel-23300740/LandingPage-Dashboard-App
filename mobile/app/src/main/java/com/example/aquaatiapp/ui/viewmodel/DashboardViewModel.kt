package com.example.aquaatiapp.ui.viewmodel

import androidx.lifecycle.LiveData
import androidx.lifecycle.MutableLiveData
import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import com.example.aquaatiapp.data.model.DatosResponse
import com.example.aquaatiapp.repository.AuthRepository
import kotlinx.coroutines.launch

class DashboardViewModel(
    private val repository: AuthRepository = AuthRepository()
) : ViewModel() {

    private val _datos = MutableLiveData<DatosResponse?>()
    val datos: LiveData<DatosResponse?> = _datos

    private val _loading = MutableLiveData(false)
    val loading: LiveData<Boolean> = _loading

    private val _error = MutableLiveData<String?>()
    val error: LiveData<String?> = _error

    private val _logout = MutableLiveData(false)
    val logout: LiveData<Boolean> = _logout

    fun loadDatos(token: String) {
        _loading.value = true
        _error.value = null

        viewModelScope.launch {
            try {
                val response = repository.getDatos(token)
                if (response.isSuccessful) {
                    _datos.value = response.body()
                } else if (response.code() == 401 || response.code() == 403) {
                    _logout.value = true
                } else {
                    _error.value = response.errorBody()?.string().takeUnless { it.isNullOrBlank() }
                        ?: "Error al cargar datos"
                }
            } catch (exception: Exception) {
                _error.value = exception.message ?: "Error de red"
            } finally {
                _loading.value = false
            }
        }
    }

    fun clearLogout() {
        _logout.value = false
    }
}
