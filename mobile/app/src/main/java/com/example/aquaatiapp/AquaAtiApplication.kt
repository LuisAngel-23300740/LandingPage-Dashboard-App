package com.example.aquaatiapp

import android.app.Application
import android.content.Context
import androidx.appcompat.app.AppCompatDelegate

class AquaAtiApplication : Application() {
    override fun onCreate() {
        super.onCreate()
        
        val prefs = getSharedPreferences("settings_prefs", Context.MODE_PRIVATE)
        val isDarkMode = prefs.getBoolean("dark_mode", false)
        
        if (isDarkMode) {
            AppCompatDelegate.setDefaultNightMode(AppCompatDelegate.MODE_NIGHT_YES)
        } else {
            AppCompatDelegate.setDefaultNightMode(AppCompatDelegate.MODE_NIGHT_NO)
        }
    }
}
