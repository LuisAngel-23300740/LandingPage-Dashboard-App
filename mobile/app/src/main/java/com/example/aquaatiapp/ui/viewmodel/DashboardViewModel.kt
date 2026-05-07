package com.example.aquaatiapp.ui.viewmodel

import androidx.lifecycle.LiveData
import androidx.lifecycle.MutableLiveData
import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import com.example.aquaatiapp.data.model.DatosResponse
import com.example.aquaatiapp.data.model.HistoricoResponse
import com.example.aquaatiapp.repository.AuthRepository
import kotlinx.coroutines.launch
import retrofit2.Response

class DashboardViewModel(private val repository: AuthRepository) : ViewModel() {

    private val _datos = MutableLiveData<Response<DatosResponse>>()
    val datos: LiveData<Response<DatosResponse>> = _datos

    private val _historico = MutableLiveData<Response<HistoricoResponse>>()
    val historico: LiveData<Response<HistoricoResponse>> = _historico

    private val _isLoading = MutableLiveData<Boolean>()
    val isLoading: LiveData<Boolean> = _isLoading

    private val _errorMessage = MutableLiveData<String?>()
    val errorMessage: LiveData<String?> = _errorMessage

    fun fetchDatos() {
        viewModelScope.launch {
            _isLoading.value = true
            try {
                val response = repository.getDatos()
                _datos.value = response
            } catch (e: Exception) {
                _errorMessage.value = e.message
            } finally {
                _isLoading.value = false
            }
        }
    }

    fun fetchHistorico() {
        viewModelScope.launch {
            _isLoading.value = true
            try {
                val response = repository.getHistorico()
                _historico.value = response
            } catch (e: Exception) {
                _errorMessage.value = e.message
            } finally {
                _isLoading.value = false
            }
        }
    }
}
