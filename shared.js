/* ═══════════════════════════════════════════════════
   AIRP GLOBAL — Shared JavaScript
   Includes: Particles, Wallet, Toast, Scroll Reveal,
             Modals, Smooth Scroll, Countdown helpers
═══════════════════════════════════════════════════ */

// ── Particle Background ────────────────────────────
function initParticles() {
    const canvas = document.getElementById('particles-canvas');
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    const particles = [];
    class Particle {
        constructor() {
            this.x = Math.random() * canvas.width;
            this.y = Math.random() * canvas.height;
            this.size = Math.random() * 2 + 0.5;
            this.speedX = Math.random() * 1 - 0.5;
            this.speedY = Math.random() * 1 - 0.5;
            this.opacity = Math.random() * 0.5 + 0.1;
        }
        update() {
            this.x += this.speedX; this.y += this.speedY;
            if (this.x > canvas.width) this.x = 0;
            if (this.x < 0) this.x = canvas.width;
            if (this.y > canvas.height) this.y = 0;
            if (this.y < 0) this.y = canvas.height;
        }
        draw() {
            ctx.fillStyle = `rgba(245,158,11,${this.opacity})`;
            ctx.beginPath(); ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2); ctx.fill();
        }
    }
    for (let i = 0; i < 100; i++) particles.push(new Particle());
    function animate() {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        particles.forEach(p => { p.update(); p.draw(); });
        for (let i = 0; i < particles.length; i++)
            for (let j = i; j < particles.length; j++) {
                const dx = particles[i].x - particles[j].x, dy = particles[i].y - particles[j].y;
                const d = Math.sqrt(dx * dx + dy * dy);
                if (d < 100) {
                    ctx.beginPath();
                    ctx.strokeStyle = `rgba(245,158,11,${0.1 * (1 - d / 100)})`;
                    ctx.lineWidth = 0.5;
                    ctx.moveTo(particles[i].x, particles[i].y);
                    ctx.lineTo(particles[j].x, particles[j].y);
                    ctx.stroke();
                }
            }
        requestAnimationFrame(animate);
    }
    animate();
    window.addEventListener('resize', () => { canvas.width = window.innerWidth; canvas.height = window.innerHeight; });
}

// ── Toast ──────────────────────────────────────────
function showToast(msg) {
    const t = document.createElement('div');
    t.className = 'fixed bottom-4 right-4 glass-card px-6 py-3 rounded-xl border border-amber-500/30 text-white z-50';
    t.style.animation = 'fadeIn 0.3s ease';
    t.innerHTML = `<i class="fas fa-check-circle text-green-400 mr-2"></i>${msg}`;
    document.body.appendChild(t);
    setTimeout(() => { t.style.animation = 'fadeOut 0.3s ease'; setTimeout(() => t.remove(), 300); }, 3000);
}

// ── Scroll Reveal ──────────────────────────────────
function initReveal() {
    const obs = new IntersectionObserver(
        entries => entries.forEach(e => { if (e.isIntersecting) e.target.classList.add('active'); }),
        { threshold: 0.1, rootMargin: '0px 0px -50px 0px' }
    );
    document.querySelectorAll('.reveal').forEach(el => obs.observe(el));
}

// ── Smooth Scroll ──────────────────────────────────
function initSmoothScroll() {
    document.querySelectorAll('a[href^="#"]').forEach(a => a.addEventListener('click', function (e) {
        const target = document.querySelector(this.getAttribute('href'));
        if (target) { e.preventDefault(); target.scrollIntoView({ behavior: 'smooth', block: 'start' }); }
    }));
}

// ── Countdown (July 15, 2026 UTC) ─────────────────
const PRESALE_DATE = new Date('2026-07-15T00:00:00Z').getTime();

function startCountdown(ids) {
    const pad = n => String(Math.max(0, n)).padStart(2, '0');
    function tick() {
        const diff = PRESALE_DATE - Date.now();
        if (ids.days)    { const el = document.getElementById(ids.days);    if (el) el.textContent = pad(Math.floor(diff / 86400000)); }
        if (ids.hours)   { const el = document.getElementById(ids.hours);   if (el) el.textContent = pad(Math.floor((diff % 86400000) / 3600000)); }
        if (ids.minutes) { const el = document.getElementById(ids.minutes); if (el) el.textContent = pad(Math.floor((diff % 3600000) / 60000)); }
        if (ids.seconds) { const el = document.getElementById(ids.seconds); if (el) el.textContent = pad(Math.floor((diff % 60000) / 1000)); }
    }
    tick(); setInterval(tick, 1000);
}

// ── Wallet ─────────────────────────────────────────
let connectedWallet = null;
const BSC_CHAIN = {
    chainId: '0x38', chainName: 'BNB Smart Chain',
    nativeCurrency: { name: 'BNB', symbol: 'BNB', decimals: 18 },
    rpcUrls: ['https://bsc-dataseed.binance.org/'],
    blockExplorerUrls: ['https://bscscan.com']
};

async function connectWallet() {
    if (connectedWallet) { showWalletOptionsModal(); return; }
    if (/iPhone|iPad|iPod|Android/i.test(navigator.userAgent)) showMobileWalletModal();
    else await connectMetaMaskDirect();
}

async function connectMetaMaskDirect() {
    if (typeof window.ethereum === 'undefined') { showWalletInstallModal(); return; }
    try {
        const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
        if (accounts && accounts.length > 0) {
            connectedWallet = accounts[0];
            try { await window.ethereum.request({ method: 'wallet_switchEthereumChain', params: [{ chainId: BSC_CHAIN.chainId }] }); }
            catch (e) { if (e.code === 4902) try { await window.ethereum.request({ method: 'wallet_addEthereumChain', params: [BSC_CHAIN] }); } catch {} }
            updateWalletUI(connectedWallet); showToast('Wallet connected!');
        }
    } catch (e) { if (e.code === 4001) showToast('Rejected by user'); }
}

function updateWalletUI(addr) {
    document.querySelectorAll('[data-wallet-btn]').forEach(b => {
        b.innerHTML = `<i class="fas fa-wallet mr-2"></i>${addr.slice(0, 6)}...${addr.slice(-4)}`;
        b.classList.remove('glass', 'text-white');
        b.classList.add('bg-gradient-to-r', 'from-amber-500', 'to-amber-600', 'text-black');
    });
    localStorage.setItem('connectedWallet', addr);
}

async function checkExistingConnection() {
    const saved = localStorage.getItem('connectedWallet');
    if (saved && typeof window.ethereum !== 'undefined') {
        try {
            const accs = await window.ethereum.request({ method: 'eth_accounts' });
            if (accs.length > 0 && accs[0].toLowerCase() === saved.toLowerCase()) {
                connectedWallet = accs[0]; updateWalletUI(connectedWallet);
            } else localStorage.removeItem('connectedWallet');
        } catch { localStorage.removeItem('connectedWallet'); }
    }
}

function showMobileWalletModal() {
    const m = document.createElement('div'); m.id = 'mobileWalletModal';
    m.className = 'fixed inset-0 z-[100] flex items-center justify-center';
    m.innerHTML = `<div class="absolute inset-0 bg-black/80 backdrop-blur-sm" onclick="closeMobileWalletModal()"></div>
    <div class="glass-card rounded-2xl p-6 relative max-w-sm w-full mx-4 border border-amber-500/30">
        <button onclick="closeMobileWalletModal()" class="absolute top-4 right-4 text-gray-400 hover:text-white"><i class="fas fa-times text-xl"></i></button>
        <h3 class="text-xl font-bold mb-2 gradient-text">Connect Wallet</h3>
        <p class="text-gray-400 text-sm mb-6">Select your wallet</p>
        <div class="space-y-3">
            <button onclick="window.location.href='https://link.trustwallet.com/open_url?url='+encodeURIComponent(window.location.href)" class="w-full glass hover:bg-white/10 p-4 rounded-xl flex items-center space-x-4 transition border border-white/10">
                <div class="w-10 h-10 bg-blue-500 rounded-full flex items-center justify-center"><i class="fas fa-shield-alt text-white"></i></div>
                <div class="text-left"><div class="font-semibold">Trust Wallet</div><div class="text-xs text-gray-400">Mobile</div></div>
                <i class="fas fa-chevron-right ml-auto text-gray-400"></i>
            </button>
            <button onclick="window.location.href='https://metamask.app.link/dapp/'+window.location.host+window.location.pathname" class="w-full glass hover:bg-white/10 p-4 rounded-xl flex items-center space-x-4 transition border border-white/10">
                <div class="w-10 h-10 bg-orange-500 rounded-full flex items-center justify-center"><i class="fas fa-fox text-white"></i></div>
                <div class="text-left"><div class="font-semibold">MetaMask</div><div class="text-xs text-gray-400">Mobile</div></div>
                <i class="fas fa-chevron-right ml-auto text-gray-400"></i>
            </button>
            <button onclick="closeMobileWalletModal();connectMetaMaskDirect()" class="w-full glass hover:bg-white/10 p-4 rounded-xl flex items-center space-x-4 transition border border-white/10">
                <div class="w-10 h-10 bg-gradient-to-br from-amber-400 to-amber-600 rounded-full flex items-center justify-center"><i class="fas fa-wallet text-black"></i></div>
                <div class="text-left"><div class="font-semibold">Browser Wallet</div><div class="text-xs text-gray-400">MetaMask etc.</div></div>
                <i class="fas fa-chevron-right ml-auto text-gray-400"></i>
            </button>
        </div>
    </div>`;
    document.body.appendChild(m); document.body.style.overflow = 'hidden';
}
function closeMobileWalletModal() { const m = document.getElementById('mobileWalletModal'); if (m) { m.remove(); document.body.style.overflow = 'auto'; } }

function showWalletInstallModal() {
    const m = document.createElement('div'); m.id = 'walletInstallModal';
    m.className = 'fixed inset-0 z-[100] flex items-center justify-center';
    m.innerHTML = `<div class="absolute inset-0 bg-black/80 backdrop-blur-sm" onclick="this.parentElement.remove()"></div>
    <div class="glass-card rounded-2xl p-6 relative max-w-sm w-full mx-4 border border-amber-500/30">
        <button onclick="this.closest('#walletInstallModal').remove()" class="absolute top-4 right-4 text-gray-400 hover:text-white"><i class="fas fa-times text-xl"></i></button>
        <div class="text-center mb-6"><i class="fas fa-wallet text-5xl text-amber-400 mb-4"></i><h3 class="text-xl font-bold gradient-text">No Wallet Detected</h3></div>
        <div class="space-y-3">
            <a href="https://metamask.io/download/" target="_blank" class="w-full glass hover:bg-white/10 p-4 rounded-xl flex items-center space-x-4 transition block border border-orange-500/30">
                <div class="w-10 h-10 bg-orange-500 rounded-full flex items-center justify-center"><i class="fas fa-fox text-white"></i></div>
                <div class="text-left"><div class="font-semibold">MetaMask</div><div class="text-xs text-gray-400">Most popular</div></div>
                <i class="fas fa-external-link-alt ml-auto text-gray-400"></i>
            </a>
            <a href="https://trustwallet.com/download" target="_blank" class="w-full glass hover:bg-white/10 p-4 rounded-xl flex items-center space-x-4 transition block border border-blue-500/30">
                <div class="w-10 h-10 bg-blue-500 rounded-full flex items-center justify-center"><i class="fas fa-shield-alt text-white"></i></div>
                <div class="text-left"><div class="font-semibold">Trust Wallet</div><div class="text-xs text-gray-400">Binance official</div></div>
                <i class="fas fa-external-link-alt ml-auto text-gray-400"></i>
            </a>
        </div>
    </div>`;
    document.body.appendChild(m);
}

function showWalletOptionsModal() {
    const m = document.createElement('div'); m.id = 'walletOptionsModal';
    m.className = 'fixed inset-0 z-[100] flex items-center justify-center';
    m.innerHTML = `<div class="absolute inset-0 bg-black/80 backdrop-blur-sm" onclick="this.parentElement.remove()"></div>
    <div class="glass-card rounded-2xl p-6 relative max-w-sm w-full mx-4 border border-amber-500/30">
        <button onclick="this.closest('#walletOptionsModal').remove()" class="absolute top-4 right-4 text-gray-400 hover:text-white"><i class="fas fa-times text-xl"></i></button>
        <div class="text-center mb-6"><i class="fas fa-check-circle text-5xl text-green-400 mb-4"></i><h3 class="text-xl font-bold gradient-text">Connected</h3><p class="font-mono text-amber-400 text-sm mt-2">${connectedWallet.slice(0,6)}...${connectedWallet.slice(-4)}</p></div>
        <div class="space-y-3">
            <button onclick="navigator.clipboard.writeText('${connectedWallet}');showToast('Copied!');this.closest('#walletOptionsModal').remove()" class="w-full glass hover:bg-white/10 p-4 rounded-xl flex items-center space-x-4 transition border border-white/10"><i class="fas fa-copy text-amber-400 text-xl"></i><div class="font-semibold">Copy Address</div></button>
            <a href="https://bscscan.com/address/${connectedWallet}" target="_blank" class="w-full glass hover:bg-white/10 p-4 rounded-xl flex items-center space-x-4 transition block border border-white/10"><i class="fas fa-external-link-alt text-blue-400 text-xl"></i><div class="font-semibold">View on BscScan</div></a>
            <button onclick="disconnectWallet()" class="w-full glass hover:bg-red-500/20 p-4 rounded-xl flex items-center space-x-4 transition border border-red-500/30"><i class="fas fa-sign-out-alt text-red-400 text-xl"></i><div class="font-semibold text-red-400">Disconnect</div></button>
        </div>
    </div>`;
    document.body.appendChild(m);
}

function disconnectWallet() {
    connectedWallet = null; localStorage.removeItem('connectedWallet');
    document.querySelectorAll('[data-wallet-btn]').forEach(b => {
        b.innerHTML = '<i class="fas fa-wallet mr-2"></i>Connect';
        b.classList.remove('bg-gradient-to-r', 'from-amber-500', 'to-amber-600', 'text-black');
        b.classList.add('glass', 'text-white');
    });
    const m = document.getElementById('walletOptionsModal'); if (m) m.remove();
    showToast('Disconnected');
}

if (typeof window !== 'undefined' && window.ethereum) {
    window.ethereum.on('accountsChanged', accs => {
        if (accs.length === 0) disconnectWallet();
        else { connectedWallet = accs[0]; updateWalletUI(connectedWallet); }
    });
    window.ethereum.on('chainChanged', () => window.location.reload());
}

// ── Whitelist & Buy Modals ─────────────────────────
function openWhitelistModal() {
    const m = document.getElementById('whitelistModal');
    if (m) { m.classList.remove('hidden'); document.body.style.overflow = 'hidden'; }
}
function closeWhitelistModal() {
    const m = document.getElementById('whitelistModal');
    if (m) { m.classList.add('hidden'); document.body.style.overflow = 'auto'; }
}
function openBuyModal() {
    const m = document.getElementById('buyModal');
    if (m) { m.classList.remove('hidden'); document.body.style.overflow = 'hidden'; }
}
function closeBuyModal() {
    const m = document.getElementById('buyModal');
    if (m) { m.classList.add('hidden'); document.body.style.overflow = 'auto'; }
}
function submitWhitelist(e) {
    e.preventDefault(); showToast('Application submitted! Check your email.'); closeWhitelistModal();
}
function copyContract() { navigator.clipboard.writeText('TGE Soon'); showToast('Contract address copied!'); }
function copyAddress()  { navigator.clipboard.writeText('TGE Soon'); showToast('Address copied!'); }
function openWhitepaperModal() { showToast('Interactive whitepaper viewer coming soon!'); }

// ── FAQ Toggle ─────────────────────────────────────
function toggleFaq(btn) {
    const c = btn.nextElementSibling, i = btn.querySelector('i');
    if (c.classList.contains('hidden')) { c.classList.remove('hidden'); i.style.transform = 'rotate(180deg)'; }
    else { c.classList.add('hidden'); i.style.transform = 'rotate(0)'; }
}

// ── Auto-init on DOM ready ─────────────────────────
document.addEventListener('DOMContentLoaded', () => {
    initParticles();
    initReveal();
    initSmoothScroll();
    checkExistingConnection();
});
