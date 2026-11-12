/* Browser-only demo state. These credentials and role checks are not production security. */
window.escapeHTML = value => String(value ?? '').replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
window.DemoStore = {
  read(key, fallback) { try { return JSON.parse(localStorage.getItem(key)) ?? fallback; } catch { return fallback; } },
  write(key, value) { try { localStorage.setItem(key, JSON.stringify(value)); } catch { window.showToast?.('Browser storage is unavailable. Changes last until this page closes.'); } },
  save() { this.write('mmc-jobs-v1', window.INITIAL_JOBS); this.write('mmc-drivers-v1', window.DRIVER_ROSTER); },
  ref() { return 'MMC-' + Date.now().toString().slice(-7) + Math.floor(Math.random() * 100); }
};
