/* Panduan Jurusan — konektor OpenAI GPT (opsional, key milik user, tersimpan lokal) */
(function () {
  'use strict';

  var KEY_STORE = 'pj-openai-key';
  var MODEL_STORE = 'pj-openai-model';
  var DEFAULT_MODEL = 'gpt-4o-mini';

  function getKey() {
    try { return (localStorage.getItem(KEY_STORE) || '').trim(); } catch (e) { return ''; }
  }
  function setKey(k) {
    try {
      if (!k) localStorage.removeItem(KEY_STORE);
      else localStorage.setItem(KEY_STORE, k);
    } catch (e) {}
  }
  function getModel() {
    try { return localStorage.getItem(MODEL_STORE) || DEFAULT_MODEL; } catch (e) { return DEFAULT_MODEL; }
  }
  function setModel(m) {
    try { localStorage.setItem(MODEL_STORE, m); } catch (e) {}
  }
  function hasKey() { return getKey().length > 10; }

  function buildSystemPrompt() {
    var jurusanTxt = '';
    try {
      var data = window.JURUSAN_DATA || [];
      jurusanTxt = data.map(function (j) {
        return '- ' + j.name + ' (' + j.catLabel + '): ' + j.desc + ' Cocok: ' + j.cocok + ' Durasi: ' + j.durasi + '. Estimasi: ' + j.biaya + '.';
      }).join('\n');
    } catch (e) {}
    return 'Kamu adalah "Asisten Panduan Jurusan", membantu orang tua Indonesia mendampingi anak SMA memilih jurusan kuliah.\n' +
      'Gaya: bahasa Indonesia sederhana, hangat, tidak menggurui, tidak seperti brosur kampus. Maksimal 5 kalimat + 1 langkah uji coba 2 minggu.\n' +
      'DATA JURUSAN RESMI (hanya 6 ini yang ada di web, jangan mengarang jurusan lain sebagai katalog):\n' + jurusanTxt + '\n' +
      'KONTEKS WEB:\n' +
      '- Ada Kuis Minat 10 soal (~3 menit), Dashboard riwayat, Daftar Jurusan, 36 Rekomendasi Kampus (12 PTN+12 PTS+12 PTLN), Kalkulator Biaya sampai lulus, Tips 4 langkah, FAQ, Jalur SNBP (rapor Feb-Mar) / SNBT (UTBK Apr-Jun) / Mandiri (Jun-Jul), Beasiswa KIP Kuliah.\n' +
      'ATURAN:\n' +
      '1. Jawab sesuai pertanyaan user. Boleh bandingkan 2 jurusan, petakan hobi/minat ke 1-2 jurusan + cara uji.\n' +
      '2. Jika relevan, rujuk fitur web mis. "coba hitung di Kalkulator Biaya" atau "isi Kuis 10 soal".\n' +
      '3. Jangan beri angka biaya pasti kampus tertentu; pakai estimasi kasar dan sarankan cek web kampus.\n' +
      '4. Bukan pengganti guru BK/psikolog. Jika anak stres berat, sarankan bicara guru BK.\n' +
      '5. Jika topik di luar kuliah/jurusan, jawab singkat maksimal 2 kalimat lalu arahkan kembali ke jurusan.';
  }

  function toApiMessages(convo) {
    var out = [{ role: 'system', content: buildSystemPrompt() }];
    var items = (convo || []).slice(-10);
    items.forEach(function (m) {
      if (!m.text) return;
      out.push({
        role: m.who === 'user' ? 'user' : 'assistant',
        content: String(m.text).slice(0, 1500)
      });
    });
    return out;
  }

  function sendMessage(userText, convo) {
    var key = getKey();
    var model = getModel();
    if (!key) return Promise.reject(new Error('NO_KEY'));
    var messages = toApiMessages(convo);
    messages.push({ role: 'user', content: String(userText).slice(0, 1500) });
    return fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer ' + key
      },
      body: JSON.stringify({
        model: model,
        messages: messages,
        temperature: 0.7,
        max_tokens: 600
      })
    }).then(function (res) {
      if (!res.ok) {
        return res.text().then(function (t) {
          var msg = 'HTTP ' + res.status;
          try {
            var j = JSON.parse(t);
            if (j.error && j.error.message) msg = j.error.message;
          } catch (e) {}
          if (res.status === 401) throw new Error('API key salah / tidak aktif (401). Cek key di platform.openai.com. (' + msg + ')');
          if (res.status === 429) throw new Error('Kuota habis / rate limit (429). Cek billing & limit di platform.openai.com. (' + msg + ')');
          if (res.status === 404) throw new Error('Model tidak ditemukan (404). Ganti model, mis. gpt-4o-mini. (' + msg + ')');
          throw new Error(msg);
        });
      }
      return res.json();
    }).then(function (data) {
      try {
        var txt = (data.choices[0].message.content || '').trim();
        if (!txt) throw new Error('Respons kosong dari OpenAI.');
        return txt;
      } catch (e) {
        throw new Error('Gagal membaca respons OpenAI.');
      }
    });
  }

  window.OpenAIChat = {
    getKey: getKey,
    setKey: setKey,
    getModel: getModel,
    setModel: setModel,
    hasKey: hasKey,
    sendMessage: sendMessage,
    DEFAULT_MODEL: DEFAULT_MODEL
  };
})();
