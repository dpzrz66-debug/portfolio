/* ====== modal1.js ======
   Reemplaza únicamente este bloque JS (lo dejé encapsulado y compatible
   con tus botones .btn-popup que usan data-modal y atributos data-*)
*/

document.querySelectorAll('.btn-popup').forEach(btn => {
  btn.addEventListener('click', () => {
    const modalId = btn.getAttribute('data-modal');
    const modal = document.getElementById(modalId);
    if (!modal) return;

    const carouselInner = modal.querySelector('.carousel-inner');
    const titleEl = modal.querySelector('#modal-title');
    const descEl = modal.querySelector('#modal-description');
    const linkEl = modal.querySelector('#modal-link');
    const linkWrapper = modal.querySelector('.modal-link-wrapper');
    const closeBtn = modal.querySelector('.close-btn');
    const prevBtn = modal.querySelector('.prev');
    const nextBtn = modal.querySelector('.next');

    let currentIndex = 0;
    let slideWidth = 600;
    let slidesCount = 0;

    // renderSlides: ahora envuelve cada imagen en .carousel-slide (div)
    function renderSlides(images) {
      carouselInner.innerHTML = '';
      images.forEach(src => {
        const slide = document.createElement('div');
        slide.className = 'carousel-slide';
        const img = document.createElement('img');
        img.src = src.trim();
        img.draggable = false;
        img.alt = titleEl ? titleEl.textContent : '';
        // cuando la imagen carga, recalculamos ancho
        img.addEventListener('load', () => {
          recalcSlideWidth();
        });
        slide.appendChild(img);
        carouselInner.appendChild(slide);
      });
      slidesCount = carouselInner.children.length;
    }

    // calcula ancho del slide basándose en el ancho del wrapper (más robusto)
    function recalcSlideWidth() {
      const wrapper = modal.querySelector('.carousel-wrapper');
      slideWidth = wrapper ? wrapper.clientWidth : (carouselInner.querySelector('.carousel-slide')?.clientWidth || 600);
      // actualiza el transform sin animación para evitar saltos
      updateCarousel(false);
    }

    function updateCarousel(animate = true) {
      // por si no hay slides
      if (slidesCount === 0) return;
      const x = - (currentIndex * slideWidth);
      if (!animate) {
        carouselInner.style.transition = 'none';
      }
      carouselInner.style.transform = `translateX(${x}px)`;
      if (!animate) {
        // forzar reflow para luego restaurar transition
        requestAnimationFrame(() => {
          carouselInner.style.transition = '';
        });
      }
    }

    // Obtener datos del botón
    const imagesAttr = btn.getAttribute('data-images') || '';
    const images = imagesAttr ? imagesAttr.split(',').map(s => s.trim()).filter(Boolean) : [];
    const title = btn.getAttribute('data-title') || '';
    const desc = btn.getAttribute('data-desc') || '';
    const linkHref = btn.getAttribute('data-link') || '';

    titleEl.textContent = title;
    descEl.textContent = desc;

    // Mostrar u ocultar link con título según exista data-link
    if (linkHref && linkHref.trim() !== '') {
      linkEl.href = linkHref;
      linkWrapper.style.display = 'flex';
    } else {
      linkWrapper.style.display = 'none';
      linkEl.href = '#';
    }

    // render y abrir
    renderSlides(images);
    currentIndex = 0;

    // recalcula anchura tras render (y tras carga de imágenes)
    // pequeño timeout para casos donde no hay eventos load (cache)
    recalcSlideWidth();
    setTimeout(recalcSlideWidth, 120);

    // Mostrar modal (clase .show controla display)
    modal.classList.add('show');
    modal.setAttribute('aria-hidden', 'false');

    // asegurar que controles prev/next se oculten si solo 1 slide
    prevBtn.style.display = slidesCount > 1 ? '' : 'none';
    nextBtn.style.display = slidesCount > 1 ? '' : 'none';

    // ---- Handlers ----
    function closeModal() {
      modal.classList.remove('show');
      modal.setAttribute('aria-hidden', 'true');
      // quitar listener resize cuando cerramos
      window.removeEventListener('resize', resizeHandler);
    }

    closeBtn.onclick = closeModal;
    modal.onclick = e => {
      if (e.target === modal) closeModal();
    };

    prevBtn.onclick = e => {
      e.stopPropagation();
      if (slidesCount <= 1) return;
      currentIndex = (currentIndex === 0) ? slidesCount - 1 : currentIndex - 1;
      updateCarousel();
    };

    nextBtn.onclick = e => {
      e.stopPropagation();
      if (slidesCount <= 1) return;
      currentIndex = (currentIndex === slidesCount - 1) ? 0 : currentIndex + 1;
      updateCarousel();
    };

    // teclado para moverse y cerrar
    function keyHandler(e) {
      if (!modal.classList.contains('show')) return;
      if (e.key === 'Escape') closeModal();
      if (e.key === 'ArrowLeft') prevBtn.click();
      if (e.key === 'ArrowRight') nextBtn.click();
    }
    window.addEventListener('keydown', keyHandler);

    // resize handler
    function resizeHandler() {
      if (!modal.classList.contains('show')) return;
      recalcSlideWidth();
    }
    window.addEventListener('resize', resizeHandler);

    // limpieza si se cierra (por fuera)
    // añadimos observador para cuando la clase .show se quite por otros medios
    const observer = new MutationObserver(mutations => {
      mutations.forEach(m => {
        if (m.attributeName === 'class') {
          if (!modal.classList.contains('show')) {
            window.removeEventListener('resize', resizeHandler);
            window.removeEventListener('keydown', keyHandler);
            observer.disconnect();
          }
        }
      });
    });
    observer.observe(modal, { attributes: true });

  });
});




const mygridLightbox = document.getElementById('mygrid-lightbox');
const mygridImg = document.getElementById('mygrid-img');
const mygridClose = document.getElementById('mygrid-close');
const mygridPrev = document.getElementById('mygrid-prev');
const mygridNext = document.getElementById('mygrid-next');

const mygridImages = document.querySelectorAll('.mygrid-popup');
let mygridIndex = 0;

// Abrir Lightbox
mygridImages.forEach((img, index) => {
  img.addEventListener('click', () => {
    mygridIndex = index;
    mygridLightbox.style.display = 'flex';
    mygridImg.src = mygridImages[mygridIndex].src;
  });
});

// Cerrar Lightbox
mygridClose.addEventListener('click', () => mygridLightbox.style.display = 'none');
mygridLightbox.addEventListener('click', e => { if(e.target === mygridLightbox) mygridLightbox.style.display = 'none'; });

// Navegación
mygridPrev.addEventListener('click', () => {
  mygridIndex = (mygridIndex - 1 + mygridImages.length) % mygridImages.length;
  mygridImg.src = mygridImages[mygridIndex].src;
});

mygridNext.addEventListener('click', () => {
  mygridIndex = (mygridIndex + 1) % mygridImages.length;
  mygridImg.src = mygridImages[mygridIndex].src;
});









(function(){
  const nav = document.querySelector('header nav') || document.querySelector('.site-header nav') || document.querySelector('nav');
  const header = document.querySelector('header, .site-header');
  if(!nav || !header) return;

  // Evita duplicar el botón si ya existe
  if (!document.querySelector('.nav-toggle')){
    if(!nav.id) nav.id = 'site-nav';
    const btn = document.createElement('button');
    btn.className = 'nav-toggle';
    btn.setAttribute('aria-controls', nav.id);
    btn.setAttribute('aria-expanded', 'false');
    btn.setAttribute('aria-label', 'Abrir menú');
    btn.textContent = '☰';

    const container = header.querySelector('.container') || header;
    container.appendChild(btn);

    function syncTop(){
      // Coloca el panel justo debajo del header, sin hardcodear alturas
      const h = header.getBoundingClientRect().height;
      nav.style.top = h + 'px';
    }
    function inheritBg(){
      // Toma el mismo fondo del header para que no “desaparezca”
      const cs = getComputedStyle(header);
      const bg = cs.background || cs.backgroundColor || '';
      if(bg) nav.style.background = bg;
    }
    function openMenu(){
      nav.classList.add('is-open');
      btn.setAttribute('aria-expanded','true');
      document.body.classList.add('menu-open');
      syncTop(); inheritBg();
    }
    function closeMenu(){
      nav.classList.remove('is-open');
      btn.setAttribute('aria-expanded','false');
      document.body.classList.remove('menu-open');
    }

    btn.addEventListener('click', ()=>{
      const expanded = btn.getAttribute('aria-expanded') === 'true';
      expanded ? closeMenu() : openMenu();
    });

    // Cierra con Escape
    document.addEventListener('keydown', (e)=>{ if(e.key === 'Escape') closeMenu(); });

    // Cierra al click fuera
    document.addEventListener('click', (e)=>{
      if(!nav.classList.contains('is-open')) return;
      const inside = nav.contains(e.target) || btn.contains(e.target);
      if(!inside) closeMenu();
    });

    // Cierra al navegar
    nav.addEventListener('click', (e)=>{
      const a = e.target.closest('a');
      if(a) closeMenu();
    });

    // Ajusta en resize/scroll inicial
    window.addEventListener('resize', syncTop, {passive:true});
    window.addEventListener('load', ()=>{ syncTop(); inheritBg(); });
  }
})();






document.addEventListener('DOMContentLoaded', function(){
  const nav = document.querySelector('nav[data-js="nav"]');
  const btn = nav?.querySelector('.nav-toggle');
  const menu = nav?.querySelector('#primary-menu');

  if(!nav || !btn || !menu) return;

  btn.addEventListener('click', function(){
    const open = nav.classList.toggle('is-open');
    btn.setAttribute('aria-expanded', String(open));
  });

  // Cierra al tocar un link (móvil)
  menu.addEventListener('click', function(e){
    if(e.target.closest('a')){
      nav.classList.remove('is-open');
      btn.setAttribute('aria-expanded', 'false');
    }
  });
});