// Language: saved choice → browser language → Polish
function setLang(lang) {
  document.documentElement.lang = lang;
  document.querySelectorAll('[data-set-lang]').forEach(b =>
    b.classList.toggle('active', b.dataset.setLang === lang));
  document.querySelectorAll('option[data-' + lang + ']').forEach(o =>
    o.textContent = o.dataset[lang]);
  try { localStorage.setItem('lang', lang); } catch (e) {}
}

let saved = null;
try { saved = localStorage.getItem('lang'); } catch (e) {}
setLang(saved || (navigator.language.startsWith('pl') ? 'pl' : 'en'));

document.querySelectorAll('[data-set-lang]').forEach(b =>
  b.addEventListener('click', () => setLang(b.dataset.setLang)));

document.getElementById('year').textContent = new Date().getFullYear();

// Contact form: submit via Formspree without leaving the page
const form = document.querySelector('.form');
const status = document.querySelector('.form-status');
const messages = {
  pl: { ok: 'Dziękuję! Wiadomość została wysłana.', err: 'Coś poszło nie tak. Spróbuj ponownie.' },
  en: { ok: 'Thank you! Your message has been sent.', err: 'Something went wrong. Please try again.' }
};

form.addEventListener('submit', async e => {
  e.preventDefault();
  const m = messages[document.documentElement.lang];
  try {
    const res = await fetch(form.action, {
      method: 'POST',
      body: new FormData(form),
      headers: { Accept: 'application/json' }
    });
    if (!res.ok) throw new Error();
    form.reset();
    status.textContent = m.ok;
  } catch {
    status.textContent = m.err;
  }
});
