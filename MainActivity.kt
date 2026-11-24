package com.example.mecadata

import android.Manifest
import android.Build.VERSION
import android.Build.VERSION_CODES
import android.content.Intent
import android.os.Bundle
import android.webkit.JavascriptInterface
import android.webkit.WebSettings
import android.webkit.WebView
import android.webkit.WebViewClient
import androidx.appcompat.app.AppCompatActivity
import androidx.core.app.ActivityCompat
import androidx.core.content.ContextCompat

class MainActivity : AppCompatActivity() {

    private lateinit var web: WebView

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        setContentView(R.layout.activity_main)

        askNotificationPermission()

        ContextCompat.startForegroundService(
            this,
            Intent(this, AccessService::class.java)
        )

        web = findViewById(R.id.web)

        web.settings.apply {
            javaScriptEnabled = true
            domStorageEnabled = true
            databaseEnabled = true
            allowFileAccess = false
            allowContentAccess = false
            cacheMode = WebSettings.LOAD_NO_CACHE
        }

        web.webViewClient = object : WebViewClient() {
            override fun onPageFinished(view: WebView?, url: String?) {
                super.onPageFinished(view, url)
            }
        }

        web.addJavascriptInterface(object {
            @JavascriptInterface
            fun notify(title: String, body: String) {
                NotificationHelper.notifyCustom(this@MainActivity, title, body)
            }

            @JavascriptInterface
            fun mdRead(key: String): String? {
                return NativeStore.read(this@MainActivity, key)
            }

            @JavascriptInterface
            fun mdWrite(key: String, value: String) {
                NativeStore.write(this@MainActivity, key, value)
            }
        }, "Android")

        loadApp()
    }

    private fun loadApp() {
        web.postDelayed({
            web.loadUrl("http://127.0.0.1:7777/")
        }, 450)
    }

    private fun askNotificationPermission() {
        if (VERSION.SDK_INT >= VERSION_CODES.TIRAMISU) {
            if (ContextCompat.checkSelfPermission(this, Manifest.permission.POST_NOTIFICATIONS)
                != android.content.pm.PackageManager.PERMISSION_GRANTED
            ) {
                ActivityCompat.requestPermissions(
                    this,
                    arrayOf(Manifest.permission.POST_NOTIFICATIONS),
                    1001
                )
            }
        }
    }
}
