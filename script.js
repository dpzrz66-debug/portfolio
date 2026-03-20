/* ====== mygrid lightbox ====== */
(() => {
  const mygridLightbox = document.getElementById('mygrid-lightbox');
  const mygridImg = document.getElementById('mygrid-img');
  const mygridClose = document.getElementById('mygrid-close');
  const mygridPrev = document.getElementById('mygrid-prev');
  const mygridNext = document.getElementById('mygrid-next');
  const mygridImages = document.querySelectorAll('.mygrid-popup');

  if (
    !mygridLightbox ||
    !mygridImg ||
    !mygridClose ||
    !mygridPrev ||
    !mygridNext ||
    !mygridImages.length
  ) {
    return;
  }

  let mygridIndex = 0;

  mygridImages.forEach((img, index) => {
    img.addEventListener('click', () => {
      mygridIndex = index;
      mygridLightbox.style.display = 'flex';
      mygridImg.src = mygridImages[mygridIndex].src;
    });
  });

  mygridClose.addEventListener('click', () => {
    mygridLightbox.style.display = 'none';
  });

  mygridLightbox.addEventListener('click', e => {
    if (e.target === mygridLightbox) {
      mygridLightbox.style.display = 'none';
    }
  });

  mygridPrev.addEventListener('click', () => {
    mygridIndex = (mygridIndex - 1 + mygridImages.length) % mygridImages.length;
    mygridImg.src = mygridImages[mygridIndex].src;
  });

  mygridNext.addEventListener('click', () => {
    mygridIndex = (mygridIndex + 1) % mygridImages.length;
    mygridImg.src = mygridImages[mygridIndex].src;
  });
})();


/* ====== matter portfolio ====== */
window.addEventListener('load', function () {
  if (typeof Matter === 'undefined') {
    console.error('Matter.js no cargó.');
    return;
  }

  const {
    Engine,
    Render,
    Runner,
    Bodies,
    Composite,
    MouseConstraint,
    Mouse,
    Events,
    Body
  } = Matter;

  const matterBox = document.getElementById('matterBox');
  if (!matterBox) return;

  const matterPills = Array.from(
    matterBox.querySelectorAll('.dm-matter-elem-pill')
  );

  if (!matterPills.length) return;

  let engine;
  let render;
  let runner;
  let mouseConstraint;
  let pillBodies = [];

  function waitForImages(images) {
    return Promise.all(
      images.map(img => {
        return new Promise(resolve => {
          if (img.complete && img.naturalWidth > 0) {
            resolve();
          } else {
            img.addEventListener('load', resolve, { once: true });
            img.addEventListener('error', resolve, { once: true });
          }
        });
      })
    );
  }

  function createEngine() {
    engine = Engine.create();
    engine.world.gravity.y = 0.65;
  }

  function createRenderer() {
    render = Render.create({
      element: matterBox,
      engine: engine,
      options: {
        width: matterBox.clientWidth,
        height: matterBox.clientHeight,
        wireframes: false,
        background: 'transparent'
      }
    });

    render.canvas.style.position = 'absolute';
    render.canvas.style.inset = '0';
    render.canvas.style.zIndex = '1';
    render.canvas.style.pointerEvents = 'auto';
  }

  function createBoundaries() {
    const w = matterBox.clientWidth;
    const h = matterBox.clientHeight;

    const ground = Bodies.rectangle(w / 2, h + 30, w, 60, {
      isStatic: true,
      render: { opacity: 0 }
    });

    const leftWall = Bodies.rectangle(-30, h / 2, 60, h * 2, {
      isStatic: true,
      render: { opacity: 0 }
    });

    const rightWall = Bodies.rectangle(w + 30, h / 2, 60, h * 2, {
      isStatic: true,
      render: { opacity: 0 }
    });

    const topWall = Bodies.rectangle(w / 2, -30, w, 60, {
      isStatic: true,
      render: { opacity: 0 }
    });

    Composite.add(engine.world, [ground, leftWall, rightWall, topWall]);
  }

  function createPills() {
    pillBodies = matterPills.map((pill, index) => {
      const pillWidth = pill.offsetWidth || 260;
      const pillHeight = pill.offsetHeight || 160;

      const startX =
        Math.random() * (matterBox.clientWidth - pillWidth) + pillWidth / 2;
      const startY = 40 + index * 40;

      const pillRadius = pillHeight / 2;

      const leftCircle = Bodies.circle(
        startX - pillWidth / 2 + pillRadius,
        startY,
        pillRadius,
        {
          friction: 0.1,
          restitution: 0.5,
          render: { opacity: 0 }
        }
      );

      const rightCircle = Bodies.circle(
        startX + pillWidth / 2 - pillRadius,
        startY,
        pillRadius,
        {
          friction: 0.1,
          restitution: 0.5,
          render: { opacity: 0 }
        }
      );

      const rect = Bodies.rectangle(
        startX,
        startY,
        Math.max(20, pillWidth - pillHeight),
        pillHeight,
        {
          friction: 0.1,
          restitution: 0.5,
          render: { opacity: 0 }
        }
      );

      const pillBody = Body.create({
        parts: [leftCircle, rightCircle, rect],
        friction: 0.1,
        restitution: 0.55
      });

      Composite.add(engine.world, pillBody);
      return pillBody;
    });
  }

  function createMouse() {
    if (!render || !render.canvas) return;

    const mouse = Mouse.create(render.canvas);

    mouseConstraint = MouseConstraint.create(engine, {
      mouse: mouse,
      constraint: {
        stiffness: 0.2,
        render: { visible: false }
      }
    });

    Composite.add(engine.world, mouseConstraint);
    render.mouse = mouse;

    if (mouseConstraint.mouse && mouseConstraint.mouse.element) {
      mouseConstraint.mouse.element.removeEventListener(
        'mousewheel',
        mouseConstraint.mouse.mousewheel
      );
      mouseConstraint.mouse.element.removeEventListener(
        'DOMMouseScroll',
        mouseConstraint.mouse.mousewheel
      );
    }
  }

  function syncDom() {
    pillBodies.forEach((pillBody, index) => {
      const pillElem = matterPills[index];
      if (!pillElem) return;

      const angle = pillBody.angle;
      const position = pillBody.position;

      pillElem.style.left = `${position.x - pillElem.offsetWidth / 2}px`;
      pillElem.style.top = `${position.y - pillElem.offsetHeight / 2}px`;
      pillElem.style.transform = `rotate(${angle}rad)`;
      pillElem.style.zIndex = '2';
    });
  }

  function destroyScene() {
    if (runner) Runner.stop(runner);

    if (render) {
      Render.stop(render);
      if (render.canvas && render.canvas.parentNode) {
        render.canvas.parentNode.removeChild(render.canvas);
      }
    }

    if (engine) {
      Composite.clear(engine.world, false);
      Engine.clear(engine);
    }

    runner = null;
    render = null;
    engine = null;
    mouseConstraint = null;
    pillBodies = [];
  }

  function initScene() {
    destroyScene();
    createEngine();
    createRenderer();
    createBoundaries();
    createPills();
    createMouse();

    runner = Runner.create();
    Runner.run(runner, engine);
    Render.run(render);

    Events.on(engine, 'afterUpdate', syncDom);
    syncDom();
  }

  waitForImages(matterPills).then(() => {
    initScene();

    let resizeTimer;
    window.addEventListener('resize', function () {
      clearTimeout(resizeTimer);
      resizeTimer = setTimeout(() => {
        initScene();
      }, 180);
    });
  });
});


/* ====== contador xp ====== */
const counter = document.getElementById("xpCounter");

if (counter) {
  let started = false;

  const animateCounter = () => {
    let value = 0;
    const target = 2;

    const interval = setInterval(() => {
      value++;
      counter.textContent = value;
      if (value >= target) clearInterval(interval);
    }, 500);
  };

  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting && !started) {
        started = true;
        animateCounter();
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.45 });

  const section = document.querySelector(".portfolio-self");
  if (section) observer.observe(section);
}


/* ====== typewriter hero ====== */
const heroText = "Hola, soy David.";
const heroTarget = document.getElementById("typeHero");
let i = 0;

function typeHero() {
  if (i < heroText.length) {
    heroTarget.textContent += heroText.charAt(i);
    i++;
    setTimeout(typeHero, 45);
  }
}

window.addEventListener("load", () => {
  setTimeout(typeHero, 400);
});


/* ====== filtros proyectos ====== */
(() => {
  const countEl = document.getElementById('plCount');
  const cards   = document.querySelectorAll('.pl-card');

  if (countEl && cards.length) {
    countEl.textContent = `${cards.length} proyectos`;
  }

  const filters = document.querySelectorAll('.pl-filter');
  if (!filters.length || !cards.length) return;

  filters.forEach(btn => {
    btn.addEventListener('click', () => {
      const filter = btn.dataset.filter;

      filters.forEach(f => f.classList.remove('is-active'));
      btn.classList.add('is-active');

      let visible = 0;

      cards.forEach(card => {
        const tags = card.dataset.tags || '';
        const show = filter === 'all' || tags.split(' ').indexOf(filter) !== -1;

        if (show) {
          card.style.display = '';
          visible++;
        } else {
          card.style.display = 'none';
        }
      });

      if (countEl) {
        countEl.textContent = `${visible} proyecto${visible !== 1 ? 's' : ''}`;
      }
    });
  });
})();


/* ====== reloj footer ====== */
(function () {
  const timeEl   = document.getElementById('clockTime');
  const detailEl = document.getElementById('clockDetail');
  if (!timeEl || !detailEl) return;

  function update() {
    const now  = new Date();
    const time = now.toLocaleTimeString('es-MX', {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hour12: false
    });
    const day = now.toLocaleDateString('es-MX', { weekday: 'long' });
    const tz  = Intl.DateTimeFormat().resolvedOptions().timeZone;

    timeEl.textContent   = time;
    detailEl.textContent = day.charAt(0).toUpperCase() + day.slice(1) + ' · ' + tz.replace('_', ' ');
  }

  update();
  setInterval(update, 1000);
})();