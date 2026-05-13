
// Nav Connect Wallet — presale sayfasına git ve wallet bağlantısını aç
function navConnectWallet(e) {
  e.preventDefault();
  if (window.location.pathname === '/presale/' || 
      window.location.pathname.includes('presale')) {
    // Zaten presale sayfasındayız — direkt MetaMask aç
    if (typeof connectMetaMask === 'function') {
      connectMetaMask();
    }
  } else {
    // Presale sayfasına git
    window.location.href = '/presale/';
  }
}
(function(){
  // Nav scroll effect
  const nav = document.querySelector('.nav');
  if(nav){
    window.addEventListener('scroll',()=>{
      nav.classList.toggle('scrolled', window.scrollY > 40);
    });
  }

  // Mobile toggle
  const toggle = document.querySelector('.nav-toggle');
  const links  = document.querySelector('.nav-links');
  if(toggle && links){
    toggle.addEventListener('click',()=>{
      links.classList.toggle('open');
    });
    document.addEventListener('click', e=>{
      if(!toggle.contains(e.target) && !links.contains(e.target)){
        links.classList.remove('open');
      }
    });
  }

  // Active nav link — /presale/, /tokenomics/ gibi path'e göre
  const path = window.location.pathname.replace(/\/$/, '') || '/';
  document.querySelectorAll('.nav-links a').forEach(a=>{
    const href = (a.getAttribute('href') || '').replace(/\/$/, '') || '/';
    if(href === path || (path === '' && href === '/')){
      a.classList.add('active');
    }
  });

  // Countdown to July 15 2026 00:00 UTC
  function updateCountdown(){
    const targets = document.querySelectorAll('[data-countdown]');
    if(!targets.length) return;
    const target = new Date('2026-07-15T00:00:00Z');
    const diff   = Math.max(0, target - new Date());
    const d = Math.floor(diff / 86400000);
    const h = Math.floor((diff % 86400000) / 3600000);
    const m = Math.floor((diff % 3600000)  / 60000);
    const s = Math.floor((diff % 60000)    / 1000);
    const pad = n => String(n).padStart(2,'0');
    targets.forEach(t=>{
      const k = t.dataset.countdown;
      if(k==='d') t.textContent = pad(d);
      if(k==='h') t.textContent = pad(h);
      if(k==='m') t.textContent = pad(m);
      if(k==='s') t.textContent = pad(s);
    });
  }
  updateCountdown();
  setInterval(updateCountdown, 1000);

  // Scroll reveal
  if('IntersectionObserver' in window){
    const obs = new IntersectionObserver(entries=>{
      entries.forEach(e=>{
        if(e.isIntersecting){
          e.target.style.opacity='1';
          e.target.style.transform='translateY(0)';
          obs.unobserve(e.target);
        }
      });
    },{threshold:0.08,rootMargin:'0px 0px -32px 0px'});
    document.querySelectorAll('.anim-up').forEach(el=>{
      el.style.opacity='0';
      el.style.transform='translateY(22px)';
      el.style.transition='opacity .65s ease, transform .65s ease';
      obs.observe(el);
    });
  }

  // Copy to clipboard
  document.querySelectorAll('[data-copy]').forEach(btn=>{
    btn.addEventListener('click',()=>{
      navigator.clipboard.writeText(btn.dataset.copy).then(()=>{
        const orig = btn.textContent;
        btn.textContent = 'Copied!';
        setTimeout(()=>btn.textContent=orig, 2000);
      });
    });
  });
})();
