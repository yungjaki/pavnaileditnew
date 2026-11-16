import { useEffect, useRef, useState } from 'react';

function debounce(func, wait) {
  let timeout;
  return function (...args) {
    clearTimeout(timeout);
    timeout = setTimeout(() => func.apply(this, args), wait);
  };
}

function lerp(p1, p2, t) {
  return p1 + (p2 - p1) * t;
}

function autoBind(instance) {
  const proto = Object.getPrototypeOf(instance);
  Object.getOwnPropertyNames(proto).forEach(key => {
    if (key !== 'constructor' && typeof instance[key] === 'function') {
      instance[key] = instance[key].bind(instance);
    }
  });
}

async function buildApp(container, options) {
  const { Camera, Mesh, Plane, Program, Renderer, Texture, Transform } = await import('ogl');

  function createTextTexture(gl, text, font = 'bold 30px monospace', color = 'white') {
    const canvas = document.createElement('canvas');
    const context = canvas.getContext('2d');
    context.font = font;
    const metrics = context.measureText(text);
    const textWidth = Math.ceil(metrics.width);
    const textHeight = Math.ceil(parseInt(font, 10) * 1.2);
    canvas.width = textWidth + 20;
    canvas.height = textHeight + 20;
    context.font = font;
    context.fillStyle = color;
    context.textBaseline = 'middle';
    context.textAlign = 'center';
    context.clearRect(0, 0, canvas.width, canvas.height);
    context.fillText(text, canvas.width / 2, canvas.height / 2);
    const texture = new Texture(gl, { generateMipmaps: false });
    texture.image = canvas;
    return { texture, width: canvas.width, height: canvas.height };
  }

  class Title {
    constructor({ gl, plane, renderer, text, textColor = '#ffffff', font = 'bold 24px sans-serif' }) {
      autoBind(this);
      this.gl = gl; this.plane = plane; this.renderer = renderer;
      this.text = text; this.textColor = textColor; this.font = font;
      this.createMesh();
    }
    createMesh() {
      const { texture, width, height } = createTextTexture(this.gl, this.text, this.font, this.textColor);
      const geometry = new Plane(this.gl);
      const program = new Program(this.gl, {
        vertex: `attribute vec3 position;attribute vec2 uv;uniform mat4 modelViewMatrix;uniform mat4 projectionMatrix;varying vec2 vUv;void main(){vUv=uv;gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.0);}`,
        fragment: `precision highp float;uniform sampler2D tMap;varying vec2 vUv;void main(){vec4 color=texture2D(tMap,vUv);if(color.a<0.1)discard;gl_FragColor=color;}`,
        uniforms: { tMap: { value: texture } },
        transparent: true,
      });
      this.mesh = new Mesh(this.gl, { geometry, program });
      const aspect = width / height;
      const textHeight = this.plane.scale.y * 0.12;
      const textWidth = textHeight * aspect;
      this.mesh.scale.set(textWidth, textHeight, 1);
      this.mesh.position.y = -this.plane.scale.y * 0.5 - textHeight * 0.5 - 0.05;
      this.mesh.setParent(this.plane);
    }
  }

  class Media {
    constructor({ geometry, gl, image, index, length, renderer, scene, screen, text, viewport, bend, textColor, borderRadius = 0, font }) {
      this.extra = 0;
      Object.assign(this, { geometry, gl, image, index, length, renderer, scene, screen, text, viewport, bend, textColor, borderRadius, font });
      this.createShader();
      this.createMesh();
      this.createTitle();
      this.onResize();
    }
    createShader() {
      const texture = new Texture(this.gl, { generateMipmaps: true });
      this.program = new Program(this.gl, {
        depthTest: false, depthWrite: false,
        vertex: `precision highp float;attribute vec3 position;attribute vec2 uv;uniform mat4 modelViewMatrix;uniform mat4 projectionMatrix;uniform float uTime;uniform float uSpeed;varying vec2 vUv;void main(){vUv=uv;vec3 p=position;p.z=(sin(p.x*4.0+uTime)*1.5+cos(p.y*2.0+uTime)*1.5)*(0.1+uSpeed*0.5);gl_Position=projectionMatrix*modelViewMatrix*vec4(p,1.0);}`,
        fragment: `precision highp float;uniform vec2 uImageSizes;uniform vec2 uPlaneSizes;uniform sampler2D tMap;uniform float uBorderRadius;varying vec2 vUv;float roundedBoxSDF(vec2 p,vec2 b,float r){vec2 d=abs(p)-b;return length(max(d,vec2(0.0)))+min(max(d.x,d.y),0.0)-r;}void main(){vec2 ratio=vec2(min((uPlaneSizes.x/uPlaneSizes.y)/(uImageSizes.x/uImageSizes.y),1.0),min((uPlaneSizes.y/uPlaneSizes.x)/(uImageSizes.y/uImageSizes.x),1.0));vec2 uv=vec2(vUv.x*ratio.x+(1.0-ratio.x)*0.5,vUv.y*ratio.y+(1.0-ratio.y)*0.5);vec4 color=texture2D(tMap,uv);float d=roundedBoxSDF(vUv-0.5,vec2(0.5-uBorderRadius),uBorderRadius);float alpha=1.0-smoothstep(-0.002,0.002,d);gl_FragColor=vec4(color.rgb,alpha);}`,
        uniforms: {
          tMap: { value: texture },
          uPlaneSizes: { value: [0, 0] },
          uImageSizes: { value: [0, 0] },
          uSpeed: { value: 0 },
          uTime: { value: 100 * Math.random() },
          uBorderRadius: { value: this.borderRadius },
        },
        transparent: true,
      });
      const img = new Image();
      img.crossOrigin = 'anonymous';
      img.src = this.image;
      img.onload = () => {
        texture.image = img;
        this.program.uniforms.uImageSizes.value = [img.naturalWidth, img.naturalHeight];
      };
    }
    createMesh() {
      this.plane = new Mesh(this.gl, { geometry: this.geometry, program: this.program });
      this.plane.setParent(this.scene);
    }
    createTitle() {
      this.title = new Title({ gl: this.gl, plane: this.plane, renderer: this.renderer, text: this.text, textColor: this.textColor, font: this.font });
    }
    update(scroll, direction) {
      this.plane.position.x = this.x - scroll.current - this.extra;
      const x = this.plane.position.x;
      const H = this.viewport.width / 2;
      if (this.bend === 0) {
        this.plane.position.y = 0;
        this.plane.rotation.z = 0;
      } else {
        const B_abs = Math.abs(this.bend);
        const R = (H * H + B_abs * B_abs) / (2 * B_abs);
        const effectiveX = Math.min(Math.abs(x), H);
        const arc = R - Math.sqrt(R * R - effectiveX * effectiveX);
        if (this.bend > 0) {
          this.plane.position.y = -arc;
          this.plane.rotation.z = -Math.sign(x) * Math.asin(effectiveX / R);
        } else {
          this.plane.position.y = arc;
          this.plane.rotation.z = Math.sign(x) * Math.asin(effectiveX / R);
        }
      }
      this.speed = scroll.current - scroll.last;
      this.program.uniforms.uTime.value += 0.04;
      this.program.uniforms.uSpeed.value = this.speed;
      const planeOffset = this.plane.scale.x / 2;
      const viewportOffset = this.viewport.width / 2;
      this.isBefore = this.plane.position.x + planeOffset < -viewportOffset;
      this.isAfter = this.plane.position.x - planeOffset > viewportOffset;
      if (direction === 'right' && this.isBefore) { this.extra -= this.widthTotal; this.isBefore = this.isAfter = false; }
      if (direction === 'left' && this.isAfter) { this.extra += this.widthTotal; this.isBefore = this.isAfter = false; }
    }
    onResize({ screen, viewport } = {}) {
      if (screen) this.screen = screen;
      if (viewport) this.viewport = viewport;
      this.scale = this.screen.height / 1500;
      this.plane.scale.y = (this.viewport.height * (900 * this.scale)) / this.screen.height;
      this.plane.scale.x = (this.viewport.width * (700 * this.scale)) / this.screen.width;
      this.plane.program.uniforms.uPlaneSizes.value = [this.plane.scale.x, this.plane.scale.y];
      this.padding = 2;
      this.width = this.plane.scale.x + this.padding;
      this.widthTotal = this.width * this.length;
      this.x = this.width * this.index;
    }
  }

  // ── App ──────────────────────────────────────────────────
  const { items, bend = 1, textColor = '#ffffff', borderRadius = 0.05, font = 'bold 24px sans-serif', scrollSpeed = 1.6, scrollEase = 0.05 } = options;

  const renderer = new Renderer({ alpha: true, antialias: true, dpr: Math.min(window.devicePixelRatio || 1, 2) });
  const gl = renderer.gl;
  gl.clearColor(0, 0, 0, 0);
  container.appendChild(gl.canvas);

  const camera = new Camera(gl);
  camera.fov = 45;
  camera.position.z = 20;

  const scene = new Transform();
  const planeGeometry = new Plane(gl, { heightSegments: 50, widthSegments: 100 });

  let screen = { width: container.clientWidth, height: container.clientHeight };
  renderer.setSize(screen.width, screen.height);
  camera.perspective({ aspect: screen.width / screen.height });

  const fov0 = (camera.fov * Math.PI) / 180;
  let viewport = { width: 2 * Math.tan(fov0 / 2) * camera.position.z * (screen.width / screen.height), height: 2 * Math.tan(fov0 / 2) * camera.position.z };

  const allItems = items.concat(items);
  const medias = allItems.map((data, index) => new Media({
    geometry: planeGeometry, gl, image: data.image, index,
    length: allItems.length, renderer, scene,
    screen, text: data.text || '', viewport, bend, textColor, borderRadius, font,
  }));

  const scroll = { ease: scrollEase, current: 0, target: 0, last: 0 };
  let isDown = false, startX = 0, scrollPos = 0, raf;

  const onCheck = debounce(() => {
    if (!medias[0]) return;
    const width = medias[0].width;
    const itemIndex = Math.round(Math.abs(scroll.target) / width);
    const item = width * itemIndex;
    scroll.target = scroll.target < 0 ? -item : item;
  }, 200);

  function onResize() {
    screen = { width: container.clientWidth, height: container.clientHeight };
    renderer.setSize(screen.width, screen.height);
    camera.perspective({ aspect: screen.width / screen.height });
    const fov = (camera.fov * Math.PI) / 180;
    const h = 2 * Math.tan(fov / 2) * camera.position.z;
    viewport = { width: h * camera.aspect, height: h };
    medias.forEach(m => m.onResize({ screen, viewport }));
  }

  function onTouchDown(e) { isDown = true; scrollPos = scroll.current; startX = e.touches ? e.touches[0].clientX : e.clientX; }
  function onTouchMove(e) {
    if (!isDown) return;
    const x = e.touches ? e.touches[0].clientX : e.clientX;
    scroll.target = scrollPos + (startX - x) * (scrollSpeed * 0.025);
  }
  function onTouchUp() { isDown = false; onCheck(); }
  function onWheel(e) {
    const delta = e.deltaY || e.wheelDelta || e.detail;
    scroll.target += (delta > 0 ? scrollSpeed : -scrollSpeed) * 0.2;
    onCheck();
  }

  let visible = true;
  function update() {
    scroll.current = lerp(scroll.current, scroll.target, scroll.ease);
    const direction = scroll.current > scroll.last ? 'right' : 'left';
    medias.forEach(m => m.update(scroll, direction));
    renderer.render({ scene, camera });
    scroll.last = scroll.current;
    raf = visible ? requestAnimationFrame(update) : null;
  }

  // Only react to gestures that start on the gallery itself (not the whole page),
  // and stop rendering while it is scrolled out of view.
  const passive = { passive: true };
  container.addEventListener('wheel', onWheel, passive);
  container.addEventListener('mousedown', onTouchDown);
  window.addEventListener('mousemove', onTouchMove);
  window.addEventListener('mouseup', onTouchUp);
  container.addEventListener('touchstart', onTouchDown, passive);
  container.addEventListener('touchmove', onTouchMove, passive);
  window.addEventListener('touchend', onTouchUp);
  window.addEventListener('touchcancel', onTouchUp);
  window.addEventListener('resize', onResize);

  const io = new IntersectionObserver(([entry]) => {
    visible = entry.isIntersecting;
    if (visible && !raf) raf = requestAnimationFrame(update);
  });
  io.observe(container);

  update();

  return {
    destroy() {
      visible = false;
      if (raf) cancelAnimationFrame(raf);
      io.disconnect();
      window.removeEventListener('resize', onResize);
      container.removeEventListener('wheel', onWheel, passive);
      container.removeEventListener('mousedown', onTouchDown);
      window.removeEventListener('mousemove', onTouchMove);
      window.removeEventListener('mouseup', onTouchUp);
      container.removeEventListener('touchstart', onTouchDown, passive);
      container.removeEventListener('touchmove', onTouchMove, passive);
      window.removeEventListener('touchend', onTouchUp);
      window.removeEventListener('touchcancel', onTouchUp);
      if (gl.canvas.parentNode) gl.canvas.parentNode.removeChild(gl.canvas);
    }
  };
}

export default function CircularGallery({ items, bend = 1, textColor = '#ffffff', borderRadius = 0.05, font = 'bold 24px sans-serif', scrollSpeed = 1.6, scrollEase = 0.05 }) {
  const containerRef = useRef(null);
  const [reduced, setReduced] = useState(false);

  useEffect(() => {
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)');
    setReduced(mq.matches);
    const onChange = (e) => setReduced(e.matches);
    mq.addEventListener?.('change', onChange);
    return () => mq.removeEventListener?.('change', onChange);
  }, []);

  useEffect(() => {
    if (reduced || !containerRef.current || !items?.length) return;
    let app;
    let cancelled = false;
    buildApp(containerRef.current, { items, bend, textColor, borderRadius, font, scrollSpeed, scrollEase })
      .then(instance => {
        if (cancelled) instance.destroy();
        else app = instance;
      })
      .catch(console.error);
    return () => { cancelled = true; app?.destroy(); };
  }, [reduced]);

  // Reduced motion: a plain, swipeable row of photos instead of the 3D carousel.
  if (reduced) {
    return (
      <div className="cg-static" role="list">
        <style>{`
          .cg-static { display: flex; gap: 12px; height: 100%; overflow-x: auto; scroll-snap-type: x mandatory; padding: 8px; }
          .cg-static img { height: 100%; aspect-ratio: 3/4; object-fit: cover; border-radius: 16px; scroll-snap-align: center; flex-shrink: 0; }
        `}</style>
        {items.map((it, i) => (
          <img key={i} role="listitem" src={it.image} alt={it.alt || ''} loading="lazy" decoding="async" />
        ))}
      </div>
    );
  }

  return (
    <>
      <style>{`
        .circular-gallery { width: 100%; height: 100%; overflow: hidden; cursor: grab; touch-action: pan-y; }
        .circular-gallery:active { cursor: grabbing; }
        .circular-gallery canvas { display: block; }
      `}</style>
      <div
        className="circular-gallery"
        ref={containerRef}
        role="img"
        aria-label="Галерия с примерни маникюри — плъзни, за да разгледаш"
      />
    </>
  );
}
