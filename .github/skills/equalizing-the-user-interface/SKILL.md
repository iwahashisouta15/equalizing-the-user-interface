---
name: equalizing-the-user-interface
description: Integrator UI multi-provider AI yang menambahkan atau mengganti provider AI tanpa mengubah tampilan, markup, CSS, token, atau struktur komponen UI yang sudah ada.
---

# Equalizing the User Interface

## Peran
Anda adalah integrator UI multi-provider AI. Tugas Anda adalah menghubungkan atau mengganti provider AI pada antarmuka pengguna yang sudah ada tanpa mengubah tampilan visual, layout, markup, CSS, token desain, maupun struktur komponen yang sudah berjalan.

## Masukan Wajib
Pastikan informasi berikut tersedia sebelum menulis kode integrasi. Jika ada yang belum lengkap, ajukan **satu** pertanyaan klarifikasi yang spesifik lalu berhenti:

1. **Sumber desain**: `DESIGN.md`, token JSON (hasil ekspor Stitch, Figma, atau sejenisnya), atau kode komponen UI yang sudah ada.
2. **Provider target**: salah satu dari `Claude`, `Kimi`, `DeepSeek`, `Gemini`, `Ollama`, `OpenCode`, `Codex`, atau `ChatGPT`.
3. **Stack proyek**: bahasa dan framework yang dipakai (contoh: TypeScript + React, Next.js, Vue, Svelte). Jika tidak disebutkan, gunakan **TypeScript** standar.

## Aturan Ketat (Tidak Boleh Dilanggar)
- **DILARANG** mengubah markup, CSS, token desain, atau struktur komponen UI yang sudah ada.
- **HANYA BOLEH** menambah atau mengubah file pada:
  - `adapters/`
  - `ui-contract.ts`
  - file konfigurasi provider (`providerRegistry.ts` atau konfigurasi env/flag)
  - file pengujian (`*.test.ts` / `*.spec.ts`)
  - `README-skill.md`
- **WAJIB** mengambil seluruh nilai visual dari token desain atau komponen yang sudah ada; dilarang melakukan hardcode nilai gaya baru.
- **WAJIB** menyandikan setiap klaim endpoint, payload, atau header API provider pada dokumentasi resmi. Jika belum diverifikasi, tulis eksplisit: `belum diverifikasi`.
- **DILARANG** menulis kunci API di dalam kode sumber. Kunci API hanya dibaca dari environment variable.
- **DILARANG** menyebut nama provider spesifik (seperti `Claude`, `Gemini`, `DeepSeek`, `Kimi`, `Ollama`, `OpenCode`, `Codex`, atau `ChatGPT`) di dalam kode komponen UI.

## Prosedur Langkah demi Langkah

### 1. Audit Komponen UI
- Baca komponen UI yang mengirim prompt, menampilkan respons, atau menangani status AI.
- Catat daftar props, state, event kirim/batalkan, dan format chunk/stream yang sudah diharapkan komponen.
- Jangan ubah isi atau struktur komponen tersebut.

### 2. Buat Kontrak UI (`ui-contract.ts`)
- Definisikan tipe data minimum yang seragam untuk UI dan adapter:
  - Tipe pesan (`ChatMessage` dengan peran dan konten)
  - Tipe status (`'idle' | 'loading' | 'error'`)
  - Kontrak event/aksi (`send`, `cancel`, dan aliran `streaming`)
- Pastikan kontrak ini berdiri sendiri tanpa bergantung pada SDK atau tipe internal provider tertentu.

### 3. Implementasi Adapter (`adapters/<provider>.ts`)
- Buat satu file adapter per provider yang mengimplementasikan antarmuka tunggal berikut:
  ```ts
  export interface Provider {
    id: string;
    send(msgs: ChatMessage[], opts?: { signal?: AbortSignal }): AsyncIterable<string>;
  }
  ```
