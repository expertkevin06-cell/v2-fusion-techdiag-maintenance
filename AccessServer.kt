package com.example.mecadata

import android.content.Context
import fi.iki.elonen.NanoHTTPD
import org.json.JSONArray
import org.json.JSONObject
import java.io.ByteArrayOutputStream
import java.io.File
import java.util.Locale
import java.util.UUID

class AccessServer(
    private val context: Context,
    port: Int = 7777
) : NanoHTTPD(port) {

    private val registryFile = File(context.filesDir, "access_registry.json")
    private val publishedFile = File(context.filesDir, "access_published.json")
    private val lock = Any()

    init {
        synchronized(lock) {
            if (!registryFile.exists()) {
                writeRegistry(defaultRegistry())
            }
        }
    }

    override fun serve(session: IHTTPSession): Response {
        val uri = session.uri.substringBefore("?")

        val cors = mutableMapOf<String, String>()
        cors["Access-Control-Allow-Origin"] = "*"
        cors["Access-Control-Allow-Methods"] = "GET, POST, OPTIONS"
        cors["Access-Control-Allow-Headers"] = "Content-Type"

        if (session.method == Method.OPTIONS) {
            return newFixedLengthResponse(Response.Status.OK, "text/plain", "", cors)
        }

        try {
            when {
                uri == "/health" -> {
                    return json(
                        JSONObject().put("ok", true)
                            .put("app", "mecadata")
                            .put("version", "8.4-access-server"),
                        cors
                    )
                }

                uri == "/api/registry" && session.method == Method.GET -> {
                    synchronized(lock) {
                        return json(readRegistry(), cors)
                    }
                }

                uri == "/api/requests" && session.method == Method.POST -> {
                    val body = readBody(session)
                    val user = handleRequest(body)
                    return json(user, cors)
                }

                uri.startsWith("/api/requests/") && session.method == Method.GET -> {
                    val id = uri.substringAfterLast("/")
                    val user = getUser(id)
                    return if (user != null) {
                        json(user, cors)
                    } else {
                        jsonError(404, "Utilisateur introuvable", cors)
                    }
                }

                uri == "/api/decisions" && session.method == Method.POST -> {
                    val body = readBody(session)
                    val user = handleDecision(body)
                    return if (user != null) {
                        json(user, cors)
                    } else {
                        jsonError(404, "Utilisateur introuvable", cors)
                    }
                }

                uri == "/api/published" && session.method == Method.GET -> {
                    synchronized(lock) {
                        return json(readPublished(), cors)
                    }
                }

                uri == "/api/published" && session.method == Method.POST -> {
                    val body = readBody(session)
                    savePublished(body)
                    return json(JSONObject().put("ok", true), cors)
                }

                else -> {
                    return serveStatic(uri, cors)
                }
            }
        } catch (e: Exception) {
            return jsonError(500, e.message ?: "Erreur serveur", cors)
        }
    }

    private fun json(obj: JSONObject, headers: Map<String, String>): Response {
        return newFixedLengthResponse(
            Response.Status.OK,
            "application/json; charset=utf-8",
            obj.toString(),
            headers
        )
    }

    private fun jsonError(code: Int, msg: String, headers: Map<String, String>): Response {
        val status = when (code) {
            400 -> Response.Status.BAD_REQUEST
            404 -> Response.Status.NOT_FOUND
            else -> Response.Status.INTERNAL_ERROR
        }
        return newFixedLengthResponse(
            status,
            "application/json; charset=utf-8",
            JSONObject().put("error", msg).toString(),
            headers
        )
    }

    private fun readBody(session: IHTTPSession): String {
        val ins = session.inputStream
        val bos = ByteArrayOutputStream()
        val buf = ByteArray(8192)
        var n: Int
        while (ins.read(buf).also { n = it } != -1) {
            bos.write(buf, 0, n)
        }
        return bos.toString("UTF-8")
    }

    private fun defaultRegistry(): JSONObject {
        return JSONObject()
            .put("users", JSONArray())
            .put("live", false)
            .put("rev", 0)
            .put("log", JSONArray())
            .put("seen", JSONArray())
            .put("tomb", JSONArray())
    }

    private fun readRegistry(): JSONObject {
        if (!registryFile.exists()) {
            writeRegistry(defaultRegistry())
        }
        return try {
            JSONObject(registryFile.readText())
        } catch (e: Exception) {
            defaultRegistry()
        }
    }

    private fun writeRegistry(obj: JSONObject) {
        registryFile.writeText(obj.toString())
    }

    private fun addLog(reg: JSONObject, msg: String) {
        val log = reg.optJSONArray("log") ?: JSONArray()
        val entry = JSONObject()
            .put("ts", System.currentTimeMillis())
            .put("a", msg)

        val arr = JSONArray()
        arr.put(entry)
        for (i in 0 until log.length()) {
            if (arr.length() >= 120) break
            arr.put(log.get(i))
        }
        reg.put("log", arr)
    }

    private fun normalizeName(name: String): String {
        return name.trim().lowercase(Locale.ROOT)
    }

    private fun handleRequest(body: String): JSONObject {
        synchronized(lock) {
            val req = JSONObject(body)
            val name = req.optString("name").trim()

            if (name.length < 2) {
                throw IllegalArgumentException("Prénom trop court")
            }

            val reg = readRegistry()
            val users = reg.optJSONArray("users") ?: JSONArray()

            var found: JSONObject? = null
            val needle = normalizeName(name)

            for (i in 0 until users.length()) {
                val u = users.getJSONObject(i)
                if (normalizeName(u.optString("name")) == needle) {
                    found = u
                    break
                }
            }

            val now = System.currentTimeMillis()

            if (found == null) {
                val user = JSONObject()
                    .put("id", "U-" + UUID.randomUUID().toString())
                    .put("name", name)
                    .put("status", "pending")
                    .put("ts", now)
                    .put("at", JSONObject.NULL)

                users.put(user)
                reg.put("users", users)
                reg.put("rev", reg.optLong("rev") + 1)
                addLog(reg, "Demande d'accès — $name")
                writeRegistry(reg)

                NotificationHelper.notifyRequest(context, name)
                return user
            }

            val status = found.optString("status")

            if (status == "denied" || status == "revoked") {
                found.put("status", "pending")
                found.put("ts", now)
                found.put("at", JSONObject.NULL)
                reg.put("rev", reg.optLong("rev") + 1)
                addLog(reg, "Nouvelle demande — ${found.optString("name")}")
                writeRegistry(reg)
                NotificationHelper.notifyRequest(context, found.optString("name"))
            }

            return found
        }
    }

    private fun getUser(id: String): JSONObject? {
        synchronized(lock) {
            val reg = readRegistry()
            val users = reg.optJSONArray("users") ?: JSONArray()
            for (i in 0 until users.length()) {
                val u = users.getJSONObject(i)
                if (u.optString("id") == id) return u
            }
            return null
        }
    }

    private fun handleDecision(body: String): JSONObject? {
        synchronized(lock) {
            val req = JSONObject(body)
            val id = req.optString("id")
            val status = req.optString("status")

            if (status != "granted" && status != "denied" && status != "revoked") {
                throw IllegalArgumentException("Statut invalide")
            }

            val reg = readRegistry()
            val users = reg.optJSONArray("users") ?: JSONArray()

            for (i in 0 until users.length()) {
                val u = users.getJSONObject(i)
                if (u.optString("id") == id) {
                    u.put("status", status)
                    u.put("at", System.currentTimeMillis())

                    val label = when (status) {
                        "granted" -> "ACCÈS accordé"
                        "denied" -> "REFUS"
                        else -> "RÉVOCATION"
                    }

                    reg.put("rev", reg.optLong("rev") + 1)
                    addLog(reg, "$label — ${u.optString("name")}")
                    writeRegistry(reg)
                    return u
                }
            }

            return null
        }
    }

    private fun readPublished(): JSONObject {
        if (!publishedFile.exists()) {
            return JSONObject().put("ok", false)
        }
        return try {
            JSONObject(publishedFile.readText())
        } catch (e: Exception) {
            JSONObject().put("ok", false)
        }
    }

    private fun savePublished(body: String) {
        synchronized(lock) {
            publishedFile.writeText(body)
        }
    }

    private fun serveStatic(path: String, headers: Map<String, String>): Response {
        var clean = path
        if (clean == "/" || clean.isEmpty()) clean = "/index.html"

        if (clean.contains("..")) {
            return newFixedLengthResponse(
                Response.Status.FORBIDDEN,
                "text/plain",
                "Accès refusé",
                headers
            )
        }

        val assetPath = "www$clean"

        return try {
            val ins = context.assets.open(assetPath)
            val bytes = ins.readBytes()
            ins.close()

            newFixedLengthResponse(
                Response.Status.OK,
                mimeFor(clean),
                ByteArrayInputStream(bytes),
                bytes.size.toLong(),
                headers
            )
        } catch (e: Exception) {
            newFixedLengthResponse(
                Response.Status.NOT_FOUND,
                "text/plain",
                "Fichier introuvable : $assetPath",
                headers
            )
        }
    }

    private fun mimeFor(path: String): String {
        return when (path.substringAfterLast(".", "").lowercase(Locale.ROOT)) {
            "html" -> "text/html; charset=utf-8"
            "js" -> "application/javascript; charset=utf-8"
            "css" -> "text/css; charset=utf-8"
            "json" -> "application/json; charset=utf-8"
            "png" -> "image/png"
            "jpg", "jpeg" -> "image/jpeg"
            "svg" -> "image/svg+xml"
            "ico" -> "image/x-icon"
            "webmanifest" -> "application/manifest+json"
            else -> "application/octet-stream"
        }
    }

    private class ByteArrayInputStream(val bytes: ByteArray) : java.io.InputStream() {
        private var pos = 0
        override fun read(): Int {
            if (pos >= bytes.size) return -1
            return bytes[pos++].toInt() and 0xff
        }
        override fun read(b: ByteArray, off: Int, len: Int): Int {
            if (pos >= bytes.size) return -1
            val l = minOf(len, bytes.size - pos)
            System.arraycopy(bytes, pos, b, off, l)
            pos += l
            return l
        }
    }
}
