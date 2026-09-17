import { useEffect, useRef, useState, type ReactNode } from 'react';
import { ChevronRight, Hexagon } from 'lucide-react';

const HERO_VIDEO_URL =
  'https://d8j0ntlcm91z4.cloudfront.net/user_38xzZboKViGWJOttwIXH07lWA1P/hf_20260729_102822_0e6c87e8-c141-4744-bf32-ad30db296371.mp4';
const HERO_POSTER_URL = '/hero-poster.jpg';
const PORTRAIT_URL =
  'https://images.higgs.ai/?default=1&output=webp&url=https%3A%2F%2Fd8j0ntlcm91z4.cloudfront.net%2Fuser_38xzZboKViGWJOttwIXH07lWA1P%2Fhf_20260728_050334_5b076e26-0ce7-4898-b432-d764190e448f.png&w=1280&q=85';
const LERP = 0.22;
const MAX_CACHE_WIDTH = 960;

const shell =
  'flex min-h-screen flex-col justify-between gap-16 px-5 pb-12 pt-24 sm:px-8 sm:pt-28 md:px-12 md:pb-16 supports-[height:100svh]:min-h-[100svh]';
const headline =
  'text-5xl font-normal leading-[1.05] tracking-tight text-white drop-shadow-[0_4px_4px_rgb(0_0_0/0.15)] sm:text-6xl sm:leading-[1.05] lg:text-7xl lg:leading-[1.05]';
const badge =
  'inline-block border-l-2 border-white bg-white/15 px-3 py-1.5 font-mono text-[11px] uppercase tracking-[0.15em] backdrop-blur-md';

const capabilities = [
  ['01', 'Real-time vision', 'Reads context as it happens and surfaces what matters before you ask.'],
  ['02', 'Layered insight', 'Moves from rough outline to sharp output without losing the thread.'],
  ['03', 'Adaptive speed', 'Learns your cadence and tightens every pass as you work.'],
];

type RevealProps = {
  children: ReactNode;
  delay?: number;
  className?: string;
};

function Reveal({ children, delay = 0, className = '' }: RevealProps) {
  const ref = useRef<HTMLDivElement | null>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) {
      return;
    }
    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            setVisible(true);
            observer.disconnect();
          }
        }
      },
      { threshold: 0.15 },
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  return (
    <div
      ref={ref}
      className={`${visible ? 'translate-y-0 opacity-100' : 'translate-y-6 opacity-0'} transition-[opacity,transform] duration-[900ms] ease-[cubic-bezier(0.22,1,0.36,1)] will-change-transform ${className}`}
      style={{ transitionDelay: `${delay}ms` }}
    >
      {children}
    </div>
  );
}

function scrollProgress() {
  const doc = document.documentElement;
  const max = doc.scrollHeight - window.innerHeight;
  if (max <= 0) {
    return 0;
  }
  return Math.min(1, Math.max(0, window.scrollY / max));
}

function ScrollVideo() {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const bitmapsRef = useRef<ImageBitmap[]>([]);
  const [hasVideoFrame, setHasVideoFrame] = useState(false);
  const [cacheReady, setCacheReady] = useState(false);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) {
      return;
    }
    if (video.readyState >= 2) {
      setHasVideoFrame(true);
    }
    const onLoadedData = () => setHasVideoFrame(true);
    video.addEventListener('loadeddata', onLoadedData);
    return () => video.removeEventListener('loadeddata', onLoadedData);
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current;
    const visibleVideo = videoRef.current;
    if (!canvas || !visibleVideo) {
      return;
    }
    const ctx = canvas.getContext('2d');
    if (!ctx) {
      return;
    }

    let cancelled = false;
    let rafId = 0;
    let smoothed = scrollProgress();
    let extractionStarted = false;
    let framesReady = false;
    let previousTime = performance.now();
    let lastPosition = -1;
    let extractionTimer = 0;

    const drawFrame = () => {
      const bitmaps = bitmapsRef.current;
      if (!framesReady || !bitmaps.length) {
        return;
      }
      const pos = Math.round(smoothed * (bitmaps.length - 1) * 32) / 32;
      if (pos === lastPosition) {
        return;
      }
      lastPosition = pos;
      const index = Math.min(bitmaps.length - 1, Math.floor(pos));
      const frac = pos - index;
      const bitmap = bitmaps[index];
      const nextBitmap = bitmaps[index + 1];
      if (!bitmap) {
        return;
      }
      if (nextBitmap && frac > 0.02) {
        blendFrame(bitmap, nextBitmap, frac);
      } else {
        drawBitmap(bitmap);
      }
    };
    const drawBitmap = (bitmap: ImageBitmap) => {
      const scale = Math.max(canvas.width / bitmap.width, canvas.height / bitmap.height);
      const sw = canvas.width / scale;
      const sh = canvas.height / scale;
      const sx = (bitmap.width - sw) / 2;
      const sy = (bitmap.height - sh) / 2;
      ctx.drawImage(bitmap, sx, sy, sw, sh, 0, 0, canvas.width, canvas.height);
    };
    const blendFrame = (a: ImageBitmap, b: ImageBitmap, frac: number) => {
      drawBitmap(a);
      ctx.globalAlpha = frac;
      drawBitmap(b);
      ctx.globalAlpha = 1;
    };
    const resizeCanvas = () => {
      const dpr = Math.min(window.devicePixelRatio, 1.5);
      canvas.width = Math.max(1, Math.round(canvas.clientWidth * dpr));
      canvas.height = Math.max(1, Math.round(canvas.clientHeight * dpr));
      lastPosition = -1;
      drawFrame();
    };
    const tick = () => {
      if (cancelled) {
        return;
      }
      const now = performance.now();
      const dt = Math.min(100, now - previousTime);
      previousTime = now;
      const factor = 1 - Math.pow(1 - LERP, dt / (1000 / 60));
      const target = scrollProgress();
      smoothed += (target - smoothed) * factor;
      if (Math.abs(target - smoothed) < 0.0001) {
        smoothed = target;
      }
      if (!framesReady && Number.isFinite(visibleVideo.duration) && visibleVideo.duration > 0.05 && visibleVideo.readyState >= 1 && !visibleVideo.seeking) {
        const time = smoothed * (visibleVideo.duration - 0.05);
        if (Math.abs(visibleVideo.currentTime - time) > 0.04) {
          visibleVideo.currentTime = time;
        }
      }
      if (framesReady) {
        drawFrame();
      }
      rafId = window.requestAnimationFrame(tick);
    };

    const extract = async () => {
      const cacheVideo = document.createElement('video');
      cacheVideo.crossOrigin = 'anonymous';
      cacheVideo.muted = true;
      cacheVideo.playsInline = true;
      cacheVideo.preload = 'auto';
      cacheVideo.src = HERO_VIDEO_URL;
      const cleanup = () => {
        cacheVideo.onloadeddata = null;
        cacheVideo.onseeked = null;
        cacheVideo.onerror = null;
        cacheVideo.removeAttribute('src');
        cacheVideo.load();
      };
      try {
        await new Promise<void>((resolve, reject) => {
          const timer = window.setTimeout(() => reject(new Error('cache load timeout')), 20000);
          cacheVideo.onloadeddata = () => {
            window.clearTimeout(timer);
            resolve();
          };
          cacheVideo.onerror = () => {
            window.clearTimeout(timer);
            reject(new Error('cache load error'));
          };
        });
        if (cancelled) {
          return;
        }
        await new Promise((resolve) => window.setTimeout(resolve, 300));
        if (cancelled) {
          return;
        }
        const duration = cacheVideo.duration;
        if (!Number.isFinite(duration) || duration <= 0) {
          return;
        }
        const count = Math.min(150, Math.max(48, Math.ceil(duration * 20)));
        const scale = Math.min(1, MAX_CACHE_WIDTH / cacheVideo.videoWidth);
        const w = Math.max(1, Math.round(cacheVideo.videoWidth * scale));
        const h = Math.max(1, Math.round(cacheVideo.videoHeight * scale));
        for (let i = 0; i < count; i++) {
          if (cancelled) {
            return;
          }
          const time = (i / (count - 1)) * (duration - 0.05);
          await new Promise<void>((resolve, reject) => {
            const timer = window.setTimeout(() => reject(new Error('seek timeout')), 5000);
            cacheVideo.onseeked = () => {
              window.clearTimeout(timer);
              resolve();
            };
            cacheVideo.currentTime = time;
          });
          if (cancelled) {
            return;
          }
          const bitmap = await createImageBitmap(cacheVideo, {
            resizeWidth: w,
            resizeHeight: h,
            resizeQuality: 'high',
          });
          if (cancelled) {
            bitmap.close();
            return;
          }
          bitmapsRef.current.push(bitmap);
        }
        if (cancelled) {
          return;
        }
        framesReady = true;
        lastPosition = -1;
        setCacheReady(true);
      } catch {
        if (!cancelled) {
          for (const bitmap of bitmapsRef.current) {
            bitmap.close();
          }
          bitmapsRef.current = [];
        }
      } finally {
        cleanup();
      }
    };

    const startExtraction = () => {
      if (extractionStarted || cancelled) {
        return;
      }
      extractionStarted = true;
      void extract();
    };
    if (visibleVideo.readyState >= 2) {
      extractionTimer = window.setTimeout(startExtraction, 300);
    } else {
      visibleVideo.addEventListener('loadeddata', startExtraction, { once: true });
    }

    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);
    rafId = window.requestAnimationFrame(tick);
    return () => {
      cancelled = true;
      window.cancelAnimationFrame(rafId);
      window.clearTimeout(extractionTimer);
      window.removeEventListener('resize', resizeCanvas);
      visibleVideo.removeEventListener('loadeddata', startExtraction);
      for (const bitmap of bitmapsRef.current) {
        bitmap.close();
      }
      bitmapsRef.current = [];
    };
  }, []);

  return (
    <div className="pointer-events-none fixed inset-0 z-0 overflow-hidden bg-[#0a0a0a]" aria-hidden="true">
      <img
        src={HERO_POSTER_URL}
        alt=""
        className={`absolute inset-0 h-full w-full object-cover transition-opacity duration-500 ${hasVideoFrame || cacheReady ? 'opacity-0' : 'opacity-100'}`}
      />
      <video
        ref={videoRef}
        src={HERO_VIDEO_URL}
        muted
        playsInline
        preload="auto"
        className={`absolute inset-0 h-full w-full object-cover transition-opacity duration-500 ${hasVideoFrame && !cacheReady ? 'opacity-100' : 'opacity-0'}`}
      />
      <canvas
        ref={canvasRef}
        className={`absolute inset-0 h-full w-full object-cover transition-opacity duration-500 ${cacheReady ? 'opacity-100' : 'opacity-0'}`}
      />
    </div>
  );
}

const NAV_LINKS = ['Projects', 'About', 'Blog', 'Contact'];

function Navbar() {
  return (
    <header className="fixed inset-x-0 top-0 z-50 border-b border-white/15">
      <nav className="flex items-center justify-between px-5 py-4 sm:px-8 md:px-12">
        <Reveal delay={0}>
          <a href="#" className="flex items-center gap-2 text-lg font-medium tracking-tight text-white sm:text-xl">
            <Hexagon size={24} strokeWidth={1.5} className="text-white" />
            novaai
          </a>
        </Reveal>
        <div className="hidden items-center gap-8 md:flex lg:gap-10">
          {NAV_LINKS.map((label, i) => (
            <Reveal key={label} delay={100 + i * 100}>
              <a href="#" className="text-sm text-white/85 transition-colors duration-300 hover:text-white">
                {label}
                {label === 'Projects' && <sup className="ml-0.5 font-mono text-[10px] text-white/60">6</sup>}
              </a>
            </Reveal>
          ))}
        </div>
        <Reveal delay={500}>
          <a
            href="#"
            className="rounded-md border border-white/20 bg-white/15 px-4 py-2 text-xs text-white backdrop-blur-md transition-colors duration-300 hover:bg-white/25 sm:px-5 sm:text-sm"
          >
            Get Free Consultation
          </a>
        </Reveal>
      </nav>
    </header>
  );
}

export default function NovaApp() {
  return (
    <div className="relative">
      <ScrollVideo />
      <div className="relative z-10">
        <Navbar />
        <main>
          <section className={shell}>
            <div className="flex flex-col justify-between gap-8 sm:flex-row">
              <div className="flex flex-col gap-2">
                {['AI AUTOMATION', 'AI INTEGRATION', 'AI AGENT DEVELOPMENT'].map((service, i) => (
                  <Reveal key={service} delay={150 + i * 120}>
                    <p className="font-mono text-xs uppercase tracking-[0.15em] text-white/90 drop-shadow-[0_3px_3px_rgb(0_0_0/0.12)]">
                      / {service}
                    </p>
                  </Reveal>
                ))}
              </div>
              <Reveal delay={300} className="max-w-xs sm:text-right">
                <p className="text-lg leading-relaxed text-white drop-shadow-[0_3px_3px_rgb(0_0_0/0.12)] sm:text-xl sm:leading-relaxed">
                  We design automation that brings clarity, precision, and efficiency to the way your company operates.
                </p>
              </Reveal>
            </div>
            <div className="flex flex-col justify-between gap-8 md:flex-row md:items-end">
              <div>
                <Reveal delay={150} className="mb-5">
                  <span className={badge}>We Automate 100+ Businesses</span>
                </Reveal>
                <Reveal delay={280}>
                  <h1 className={headline}>
                    Clear. Precise.
                    <br />
                    Automated.
                  </h1>
                </Reveal>
              </div>
              <Reveal delay={420} className="self-start md:self-auto">
                <div id="contact" className="flex items-center gap-4 rounded-xl bg-white/15 p-3 backdrop-blur-md">
                  <img src={PORTRAIT_URL} alt="Mitha, co-founder of NovaAI" className="h-24 w-20 rounded-lg object-cover" />
                  <div className="flex flex-col gap-1.5 pr-2">
                    <p className="text-sm font-medium text-white">Talk with Mitha</p>
                    <p className="font-mono text-[10px] uppercase tracking-[0.15em] text-white/60">
                      Co-founder of NovaAI
                    </p>
                    <a
                      href="#contact"
                      className="mt-1.5 inline-flex items-center justify-center gap-2 rounded-full bg-white px-4 py-2 text-xs font-medium text-black transition-colors duration-300 hover:bg-white/85"
                    >
                      Book 15-mins call <ChevronRight size={14} />
                    </a>
                  </div>
                </div>
              </Reveal>
            </div>
          </section>
          <div className="h-[160vh]" aria-hidden="true" />
          <section id="capability" className={shell}>
            <div className="flex flex-col justify-between gap-8 sm:flex-row">
              <Reveal delay={120}>
                <span className={badge}>Insight On Demand</span>
              </Reveal>
              <Reveal delay={220} className="max-w-sm sm:text-right">
                <p className="text-lg leading-relaxed text-white drop-shadow-[0_3px_3px_rgb(0_0_0/0.12)] sm:text-xl sm:leading-relaxed">
                  Our AI doesn&apos;t just respond — it interprets, sharpens, and delivers the signal you need.
                </p>
              </Reveal>
            </div>
            <div className="flex flex-1 flex-col justify-end gap-12 md:flex-row md:items-end md:justify-between md:gap-16">
              <div className="max-w-xl">
                <Reveal delay={180}>
                  <h2 className={headline}>
                    Learn to see
                    <br />
                    brilliantly.
                  </h2>
                </Reveal>
                <Reveal delay={320} className="mt-6 max-w-md">
                  <p className="text-sm text-white/80 drop-shadow-[0_3px_3px_rgb(0_0_0/0.12)] sm:text-base">
                    From the first sketch to the final render, Nova turns raw intent into decisions your team can act on
                    — quietly, precisely, at speed.
                  </p>
                </Reveal>
                <Reveal delay={420} className="mt-8 flex flex-wrap gap-3">
                  <a
                    href="#capability"
                    className="inline-flex items-center gap-2 rounded-full bg-white px-5 py-2.5 text-xs font-medium text-black transition-colors duration-300 hover:bg-white/85 sm:text-sm"
                  >
                    Run the demo <ChevronRight size={14} />
                  </a>
                  <a
                    href="#contact"
                    className="rounded-full border border-white/25 bg-white/10 px-5 py-2.5 text-xs backdrop-blur-md transition-colors duration-300 hover:bg-white/20 sm:text-sm"
                  >
                    Free consultation
                  </a>
                </Reveal>
              </div>
              <div className="w-full max-w-md rounded-2xl border border-white/15 bg-white/10 px-5 backdrop-blur-md sm:px-6">
                {capabilities.map(([index, title, body], i) => (
                  <Reveal key={index} delay={300 + i * 110} className={i < 2 ? 'border-b border-white/15' : ''}>
                    <div className="group flex gap-5 py-5">
                      <span className="pt-1 font-mono text-[11px] tracking-[0.15em] text-white/55">{index}</span>
                      <div className="flex-1">
                        <h3 className="flex items-center justify-between gap-3 text-base font-medium text-white sm:text-lg">
                          {title}
                          <ChevronRight
                            size={16}
                            className="shrink-0 text-white/40 transition-all duration-300 group-hover:translate-x-0.5 group-hover:text-white"
                          />
                        </h3>
                        <p className="mt-1.5 text-sm leading-relaxed text-white/70">{body}</p>
                      </div>
                    </div>
                  </Reveal>
                ))}
              </div>
            </div>
          </section>
        </main>
      </div>
    </div>
  );
}
