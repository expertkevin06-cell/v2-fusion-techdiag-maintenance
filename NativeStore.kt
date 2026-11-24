package com.example.mecadata

import android.content.Context

object NativeStore {
    private const val PREFS = "mecadata_native_store"

    fun read(ctx: Context, key: String): String? {
        return ctx.getSharedPreferences(PREFS, Context.MODE_PRIVATE).getString(key, null)
    }

    fun write(ctx: Context, key: String, value: String) {
        ctx.getSharedPreferences(PREFS, Context.MODE_PRIVATE)
            .edit()
            .putString(key, value)
            .apply()
    }
}
