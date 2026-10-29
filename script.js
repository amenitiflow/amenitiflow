// Language: saved choice → first Polish or English language in the browser's preferences → English
function detectLang() {
  const prefs = navigator.languages && navigator.languages.length ? navigator.languages : [navigator.language || ''];
  for (const l of prefs) {
    const code = l.toLowerCase().slice(0, 2);
    if (code === 'pl' || code === 'en') return code;
  }
  return 'en';
}

function setLang(lang) {
  document.documentElement.lang = lang;
  document.querySelectorAll('input[name="language"]').forEach(i => i.value = lang);
  document.querySelectorAll('[data-set-lang]').forEach(b =>
    b.classList.toggle('active', b.dataset.setLang === lang));
  document.querySelectorAll('option[data-' + lang + ']').forEach(o =>
    o.textContent = o.dataset[lang]);
  try { localStorage.setItem('lang', lang); } catch (e) {}
}

function store(key, value) {
  try { return value === undefined ? localStorage.getItem(key) : localStorage.setItem(key, value); } catch (e) {}
}

setLang(store('lang') || detectLang());

document.querySelectorAll('[data-set-lang]').forEach(b =>
  b.addEventListener('click', () => setLang(b.dataset.setLang)));

const year = document.getElementById('year');
if (year) year.textContent = new Date().getFullYear();

// Forms: submit via Formspree without leaving the page
const messages = {
  pl: { ok: 'Dziękuję! Wiadomość została wysłana.', err: 'Coś poszło nie tak. Spróbuj ponownie.' },
  en: { ok: 'Thank you! Your message has been sent.', err: 'Something went wrong. Please try again.' }
};

document.querySelectorAll('form[data-formspree]').forEach(form => {
  const status = form.querySelector('.form-status');
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
      if (form.dataset.success) {
        form.hidden = true;
        document.getElementById(form.dataset.success).hidden = false;
        store('giftDone', '1');
      } else {
        status.textContent = m.ok;
      }
    } catch {
      status.textContent = m.err;
    }
  });
});

// Free gift pop-up: opens from buttons, or once per visitor after a while
const gift = document.getElementById('gift');
if (gift) {
  const open = () => { if (!gift.open) gift.showModal(); store('giftSeen', '1'); };
  document.querySelectorAll('[data-open-gift]').forEach(b => b.addEventListener('click', open));
  gift.querySelector('.gift-close').addEventListener('click', () => gift.close());
  gift.addEventListener('click', e => { if (e.target === gift) gift.close(); });

  if (!store('giftSeen') && !store('giftDone')) {
    const auto = () => { if (!store('giftSeen')) open(); };
    setTimeout(auto, 20000);
    addEventListener('scroll', function onScroll() {
      if (scrollY > document.body.scrollHeight * 0.45) {
        removeEventListener('scroll', onScroll);
        auto();
      }
    });
  }
}
