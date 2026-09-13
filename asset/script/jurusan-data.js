/* Panduan Jurusan — data katalog bersama (dipakai favorit, banding, asisten) */
(function () {
  'use strict';
  window.JURUSAN_DATA = [
    { name: 'Teknik Informatika', cat: 'teknologi', catLabel: 'Teknologi', desc: 'Merancang program, aplikasi, dan website. Banyak praktik logika & proyek.', durasi: '8 semester (4 thn)', biaya: '± Rp 40–120 jt', tags: ['Logis', 'Peluang kerja luas'], cocok: 'Suka logika, ngoprek, tahan debug.' },
    { name: 'Kedokteran', cat: 'kesehatan', catLabel: 'Kesehatan', desc: 'Tubuh manusia & penanganan penyakit. Masa belajar paling lama.', durasi: '11–12 smt (5–6 thn)', biaya: '± Rp 120–250 jt+', tags: ['Tekun', 'Berdampak sosial'], cocok: 'Teliti, empati, siap kuliah panjang.' },
    { name: 'Psikologi', cat: 'soshum', catLabel: 'Soshum', desc: 'Pikiran & perilaku manusia. Kuat di mendengar dan memahami orang.', durasi: '8 semester (4 thn)', biaya: '± Rp 40–120 jt', tags: ['Empati', 'Komunikasi'], cocok: 'Senang mendengarkan tanpa menghakimi.' },
    { name: 'Akuntansi', cat: 'bisnis', catLabel: 'Bisnis', desc: 'Keuangan perusahaan. Dicari hampir semua bisnis.', durasi: '8 semester (4 thn)', biaya: '± Rp 40–120 jt', tags: ['Teliti', 'Kebutuhan tinggi'], cocok: 'Rapi, teliti, suka angka.' },
    { name: 'Desain Komunikasi Visual', cat: 'kreatif', catLabel: 'Kreatif', desc: 'Pesan lewat gambar & warna. Dinilai dari karya, bukan ujian.', durasi: '8 semester (4 thn)', biaya: '± Rp 50–140 jt', tags: ['Kreativitas', 'Industri kreatif'], cocok: 'Suka menggambar & revisi visual.' },
    { name: 'Hukum', cat: 'soshum', catLabel: 'Soshum', desc: 'Peraturan & keadilan. Baca, diskusi, argumen runtut.', durasi: '8 semester (4 thn)', biaya: '± Rp 40–120 jt', tags: ['Analitis', 'Percaya diri'], cocok: 'Suka debat & berpikir runtut.' }
  ];
  window.JURUSAN_BY_NAME = function (name) {
    var list = window.JURUSAN_DATA || [];
    for (var i = 0; i < list.length; i++) {
      if (list[i].name.toLowerCase() === String(name || '').toLowerCase()) return list[i];
    }
    return null;
  };
})();
