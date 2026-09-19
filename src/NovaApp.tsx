import { useEffect, useRef, useState, type ReactNode } from 'react';
import { ChevronRight, Hexagon } from 'lucide-react';

const HERO_VIDEO_URL =
  'https://d8j0ntlcm91z4.cloudfront.net/user_38xzZboKViGWJOttwIXH07lWA1P/hf_20260729_102822_0e6c87e8-c141-4744-bf32-ad30db296371.mp4';
const HERO_POSTER_URL = '/hero-poster.jpg';
const PORTRAIT_URL =
  'https://images.higgs.ai/?default=1&output=webp&url=https%3A%2F%2Fd8j0ntlcm91z4.cloudfront.net%2Fuser_38xzZboKViGWJOttwIXH07lWA1P%2Fhf_20260728_050334_5b076e26-0ce7-4898-b432-d764190e448f.png&w=256&q=70';
const LERP = 0.14;
const SETTLE_EPSILON = 0.0004;
const SEEK_EPSILON = 0.08;
const SEEK_THROTTLE_MS = 100;
const MAX_CACHE_WIDTH = 640;
const MAX_CACHE_FRAMES = 48;

const shell =
  'flex min-h-screen flex-col justify-between gap-16 px-5 pb-12 pt-24 sm:px-8 sm:pt-28 md:px-12 md:pb-16 supports-[height:100svh]:min-h-[100svh]';
const headline =
  'text-5xl font-normal leading-[1.05] tracking-tight text-white sm:text-6xl sm:leading-[1.05] lg:text-7xl lg:leading-[1.05] [text-shadow:0_2px_24px_rgb(0_0_0/0.45)]';
const badge =
  'inline-block border-l-2 border-white bg-black/45 px-3 py-1.5 font-mono text-[11px] uppercase tracking-[0.15em]';
const textShadow = '[text-shadow:0_1px_12px_rgb(0_0_0/0.5)]';

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
      className={`${visible ? 'translate-y-0 opacity-100' : 'translate-y-8 opacity-0 will-change-transform'} transition-[transform,opacity] duration-700 ease-out ${className}`}
      style={{ transitionDelay: `${delay}ms` }}
    >
      {children}
    </div>
  );
}

function readProgress(maxScroll: number) {
  if (maxScroll <= 0) {
    return 0;
  }
  const y = window.scrollY;
  if (y <= 0) {
    return 0;
  }
  if (y >= maxScroll) {
    return 1;
  }
  return y / maxScroll;
}

function ScrollVideo() {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const bitmapsRef = useRef<ImageBitmap[]>([]);
  const cacheReadyRef = useRef(false);
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

  // Keep ref in sync without re-running the main effect.
  useEffect(() => {
    cacheReadyRef.current = cacheReady;
    if (cacheReady) {
      // Stop paying decode cost on the visible video once the canvas takes over.
      // Keep the element mounted (opacity-0) so scroll tests can still query it.
      const v = videoRef.current;
      if (v && !v.paused) {
        try {
          // Sync final position before pausing so currentTime stays meaningful.
          const max = document.documentElement.scrollHeight - window.innerHeight;
          const p = readProgress(max);
          if (Number.isFinite(v.duration) && v.duration > 0) {
            const t = Math.min(v.duration - 0.05, Math.max(0, p * (v.duration - 0.05)));
            if (Math.abs(v.currentTime - t) > SEEK_EPSILON && v.readyState >= 1 && !v.seeking) {
              v.currentTime = t;
            }
          }
        } catch {
          /* ignore sync errors */
        }
        v.pause();
      }
    }
  }, [cacheReady]);

  useEffect(() => {
    const canvas = canvasRef.current;
    const visibleVideo = videoRef.current;
    if (!canvas || !visibleVideo) {
      return;
    }
    // alpha:false avoids an extra alpha compositing pass for a fullscreen cover layer.
    // desynchronized:true lets the canvas skip blocking on the display vsync where supported.
    const ctx = canvas.getContext('2d', { alpha: false, desynchronized: true } as CanvasRenderingContext2DSettings);
    if (!ctx) {
      return;
    }

    let cancelled = false;
    let rafId = 0;
    let maxScroll = document.documentElement.scrollHeight - window.innerHeight;
    let target = readProgress(maxScroll);
    let smoothed = target;
    let lastDrawnIndex = -1;
    let lastCanvasW = 0;
    let lastCanvasH = 0;
    let resizeTimer = 0;
    let lastSeekAt = 0;
    let lastScrollAt = 0;
    let canPlay = visibleVideo.readyState >= 3;
    let pageLoaded = document.readyState === 'complete';

    const measure = () => {
      maxScroll = document.documentElement.scrollHeight - window.innerHeight;
      if (maxScroll < 0) {
        maxScroll = 0;
      }
      target = readProgress(maxScroll);
    };

    const onScroll = () => {
      target = readProgress(maxScroll);
      lastScrollAt = performance.now();
    };

    const onLoad = () => {
      pageLoaded = true;
      measure();
    };

    const onResize = () => {
      window.clearTimeout(resizeTimer);
      resizeTimer = window.setTimeout(() => {
        if (cancelled) {
          return;
        }
        measure();
        resizeCanvas();
      }, 150);
    };

    const resizeCanvas = () => {
      // Cap DPR at ~1 for a fullscreen ambient background: halves (or more)
      // the pixels repainted per frame vs DPR 2 with no visible difference
      // under text content.
      const dpr = Math.min(window.devicePixelRatio || 1, 1);
      const w = Math.max(1, Math.round(canvas.clientWidth * dpr));
      const h = Math.max(1, Math.round(canvas.clientHeight * dpr));
      if (w !== lastCanvasW || h !== lastCanvasH) {
        lastCanvasW = w;
        lastCanvasH = h;
        canvas.width = w;
        canvas.height = h;
        lastDrawnIndex = -1;
      }
    };

    const drawAt = (progress: number) => {
      const bitmaps = bitmapsRef.current;
      if (!bitmaps.length) {
        return;
      }
      const index = Math.min(bitmaps.length - 1, Math.floor(progress * bitmaps.length));
      if (index === lastDrawnIndex) {
        return;
      }
      const bitmap = bitmaps[index];
      if (!bitmap) {
        return;
      }
      lastDrawnIndex = index;
      const scale = Math.max(canvas.width / bitmap.width, canvas.height / bitmap.height);
      const sw = canvas.width / scale;
      const sh = canvas.height / scale;
      const sx = (bitmap.width - sw) / 2;
      const sy = (bitmap.height - sh) / 2;
      ctx.drawImage(bitmap, sx, sy, sw, sh, 0, 0, canvas.width, canvas.height);
    };

    const tick = () => {
      if (cancelled) {
        return;
      }
      rafId = window.requestAnimationFrame(tick);
      if (document.hidden) {
        return;
      }
      const diff = target - smoothed;
      if (Math.abs(diff) < SETTLE_EPSILON) {
        if (smoothed !== target) {
          smoothed = target;
        } else if (cacheReadyRef.current) {
          return; // fully settled + cached: skip all work
        }
      } else {
        smoothed += diff * LERP;
        if (Math.abs(target - smoothed) < SETTLE_EPSILON) {
          smoothed = target;
        }
      }

      if (!cacheReadyRef.current) {
        // Startup guard: don't thrash the network decoder before the video
        // has enough data to seek smoothly. Poster covers the gap.
        if (!canPlay || visibleVideo.readyState < 2 || visibleVideo.seeking) {
          return;
        }
        if (!Number.isFinite(visibleVideo.duration) || visibleVideo.duration <= 0) {
          return;
        }
        const now = performance.now();
        if (now - lastSeekAt < SEEK_THROTTLE_MS) {
          return;
        }
        const time = smoothed * (visibleVideo.duration - 0.05);
        if (Math.abs(visibleVideo.currentTime - time) <= SEEK_EPSILON) {
          return;
        }
        // Avoid seeking into a range that isn't buffered yet during startup —
        // that stall is the classic "laggy first seconds" symptom.
        try {
          const seekable = visibleVideo.seekable;
          if (seekable.length > 0) {
            let buffered = false;
            for (let i = 0; i < seekable.length; i++) {
              if (time >= seekable.start(i) - 0.15 && time <= seekable.end(i) + 0.15) {
                buffered = true;
                break;
              }
            }
            // If nothing is buffered near the target yet, wait for more data
            // instead of forcing a rebuffer. But don't stall forever: if the
            // video already has substantial data, allow the seek anyway.
            if (!buffered && visibleVideo.buffered.length > 0) {
              const lastEnd = visibleVideo.buffered.end(visibleVideo.buffered.length - 1);
              if (time > lastEnd + 0.5) {
                return;
              }
            }
          }
          visibleVideo.currentTime = time;
          lastSeekAt = now;
        } catch {
          /* ignore seek errors */
        }
      } else {
        drawAt(smoothed);
      }
    };

    const extract = async () => {
      // Never compete with first paint / first scroll: wait for full page
      // load, an idle window, and a pause in scrolling before decoding
      // dozens of frames on a second video element.
      try {
        if (!pageLoaded) {
          await new Promise<void>((resolve) => {
            if (document.readyState === 'complete') {
              resolve();
            } else {
              window.addEventListener('load', () => resolve(), { once: true });
            }
          });
        }
        if (cancelled) {
          return;
        }
        // Respect data-saver / very slow connections: stay on the cheap
        // video-scrub path instead of double-downloading the file.
        const conn = (navigator as unknown as { connection?: { saveData?: boolean; effectiveType?: string } })
          .connection;
        if (conn?.saveData || conn?.effectiveType === 'slow-2g' || conn?.effectiveType === '2g') {
          return;
        }
        // Wait until the user hasn't scrolled for ~1.5s so extraction
        // doesn't steal bandwidth/decode during the startup scroll.
        const calmStart = performance.now();
        while (performance.now() - lastScrollAt < 1500) {
          if (cancelled) {
            return;
          }
          // Cap total wait so cache still warms up for idle users.
          if (performance.now() - calmStart > 15000) {
            break;
          }
          await new Promise((resolve) => window.setTimeout(resolve, 400));
        }
        if (cancelled) {
          return;
        }
        await new Promise<void>((resolve) => {
          const idle = (
            window as unknown as {
              requestIdleCallback?: (cb: () => void, opts?: { timeout: number }) => number;
            }
          ).requestIdleCallback;
          if (idle) {
            idle(() => resolve(), { timeout: 3000 });
          } else {
            window.setTimeout(() => resolve(), 1500);
          }
        });
        if (cancelled) {
          return;
        }
      } catch {
        return;
      }
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
        const duration = cacheVideo.duration;
        if (!Number.isFinite(duration) || duration <= 0) {
          return;
        }
        const count = Math.min(MAX_CACHE_FRAMES, Math.max(24, Math.ceil(duration * 8)));
        const scale = Math.min(1, MAX_CACHE_WIDTH / (cacheVideo.videoWidth || MAX_CACHE_WIDTH));
        const w = Math.max(1, Math.round((cacheVideo.videoWidth || MAX_CACHE_WIDTH) * scale));
        const h = Math.max(1, Math.round((cacheVideo.videoHeight || 360) * scale));
        for (let i = 0; i < count; i++) {
          if (cancelled) {
            return;
          }
          // Don't steal decode/bandwidth mid-scroll: pause extraction while
          // the user is actively scrolling.
          while (performance.now() - lastScrollAt < 800) {
            if (cancelled) {
              return;
            }
            await new Promise((resolve) => window.setTimeout(resolve, 300));
          }
          if (cancelled) {
            return;
          }
          const time = (i / (count - 1)) * (duration - 0.05);
          try {
            await new Promise<void>((resolve, reject) => {
              const timer = window.setTimeout(() => reject(new Error('seek timeout')), 5000);
              cacheVideo.onseeked = () => {
                window.clearTimeout(timer);
                resolve();
              };
              cacheVideo.currentTime = time;
            });
          } catch {
            continue;
          }
          if (cancelled) {
            return;
          }
          try {
            const bitmap = await createImageBitmap(cacheVideo, {
              resizeWidth: w,
              resizeHeight: h,
              resizeQuality: 'medium',
            });
            if (cancelled) {
              bitmap.close();
              return;
            }
            bitmapsRef.current.push(bitmap);
          } catch {
            continue;
          }
          // Yield to the main thread between frames so scrolling never waits
          // behind a burst of decodes.
          await new Promise((resolve) => window.setTimeout(resolve, 0));
        }
        if (cancelled) {
          return;
        }
        if (bitmapsRef.current.length >= 8) {
          setCacheReady(true);
        }
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

    measure();
    resizeCanvas();
    const onCanPlay = () => {
      canPlay = true;
    };
    visibleVideo.addEventListener('canplay', onCanPlay);
    window.addEventListener('load', onLoad, { once: true });
    // Passive listener: never blocks the compositor during scroll.
    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', onResize);
    window.addEventListener('orientationchange', onResize);
    rafId = window.requestAnimationFrame(tick);

    let extractionTimer = 0;
    const startExtraction = () => {
      if (cancelled) {
        return;
      }
      window.clearTimeout(extractionTimer);
      // Start well after startup: the extract() itself additionally waits
      // for page load + scroll calm + idle before touching the network.
      extractionTimer = window.setTimeout(() => {
        if (!cancelled) {
          void extract();
        }
      }, 2500);
    };
    if (visibleVideo.readyState >= 2) {
      startExtraction();
    } else {
      visibleVideo.addEventListener('loadeddata', startExtraction, { once: true });
    }

    return () => {
      cancelled = true;
      window.cancelAnimationFrame(rafId);
      window.clearTimeout(resizeTimer);
      window.clearTimeout(extractionTimer);
      visibleVideo.removeEventListener('canplay', onCanPlay);
      visibleVideo.removeEventListener('loadeddata', startExtraction);
      window.removeEventListener('load', onLoad);
      window.removeEventListener('scroll', onScroll);
      window.removeEventListener('resize', onResize);
      window.removeEventListener('orientationchange', onResize);
      for (const bitmap of bitmapsRef.current) {
        bitmap.close();
      }
      bitmapsRef.current = [];
    };
  }, []);

  return (
    <div
      className="pointer-events-none fixed inset-0 z-0 overflow-hidden bg-[#0a0a0a] [contain:strict] [transform:translateZ(0)]"
      aria-hidden="true"
    >
      <img
        src={HERO_POSTER_URL}
        alt=""
        decoding="async"
        {...{ fetchpriority: 'high' }}
        loading="eager"
        className={`absolute inset-0 h-full w-full object-cover transition-opacity duration-500 ${hasVideoFrame || cacheReady ? 'opacity-0' : 'opacity-100'}`}
      />
      <video
        ref={videoRef}
        src={HERO_VIDEO_URL}
        muted
        playsInline
        preload="auto"
        disablePictureInPicture
        aria-hidden="true"
        tabIndex={-1}
        className={`absolute inset-0 h-full w-full object-cover transition-opacity duration-500 [transform:translateZ(0)] ${hasVideoFrame && !cacheReady ? 'opacity-100' : 'opacity-0'}`}
      />
      <canvas
        ref={canvasRef}
        className={`absolute inset-0 h-full w-full object-cover transition-opacity duration-500 [transform:translateZ(0)] ${cacheReady ? 'opacity-100' : 'opacity-0'}`}
      />
    </div>
  );
}

const NAV_LINKS = ['Projects', 'About', 'Blog', 'Contact'];

function Navbar() {
  return (
    <header className="fixed inset-x-0 top-0 z-50 border-b border-white/15 bg-[#0a0a0a]/60 [transform:translateZ(0)]">
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
            className="rounded-md border border-white/20 bg-black/40 px-4 py-2 text-xs text-white transition-colors duration-300 hover:bg-black/60 sm:px-5 sm:text-sm"
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
                    <p className={`font-mono text-xs uppercase tracking-[0.15em] text-white/90 ${textShadow}`}>
                      / {service}
                    </p>
                  </Reveal>
                ))}
              </div>
              <Reveal delay={300} className="max-w-xs sm:text-right">
                <p className={`text-lg leading-relaxed text-white sm:text-xl sm:leading-relaxed ${textShadow}`}>
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
                <div id="contact" className="flex items-center gap-4 rounded-xl border border-white/10 bg-black/45 p-3">
                  <img
                    src={PORTRAIT_URL}
                    alt="Mitha, co-founder of NovaAI"
                    loading="eager"
                    {...{ fetchpriority: 'low' }}
                    decoding="async"
                    width={80}
                    height={96}
                    className="h-24 w-20 rounded-lg object-cover"
                  />
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
                <p className={`text-lg leading-relaxed text-white sm:text-xl sm:leading-relaxed ${textShadow}`}>
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
                  <p className={`text-sm text-white/80 sm:text-base ${textShadow}`}>
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
                    className="rounded-full border border-white/25 bg-black/35 px-5 py-2.5 text-xs transition-colors duration-300 hover:bg-black/55 sm:text-sm"
                  >
                    Free consultation
                  </a>
                </Reveal>
              </div>
              <div className="w-full max-w-md rounded-2xl border border-white/15 bg-black/45 px-5 sm:px-6">
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
