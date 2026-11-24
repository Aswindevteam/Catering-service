const { chromium } = require('playwright');
const fs = require('fs');

const URL = 'https://wedding-feast.pages.dev/menu';
const VIEWPORTS = [
  { name: 'iPhone_390x844', width: 390, height: 844, isMobile: true, hasTouch: true },
  { name: 'Android_360x800', width: 360, height: 800, isMobile: true, hasTouch: true }
];

async function runAudit() {
  if (!fs.existsSync('./screenshots')) fs.mkdirSync('./screenshots');
  if (!fs.existsSync('./videos')) fs.mkdirSync('./videos');

  const browser = await chromium.launch({ headless: true });

  for (const vp of VIEWPORTS) {
    console.log(`\n========================================`);
    console.log(`Testing & Recording ${vp.name} (${vp.width}x${vp.height})`);
    console.log(`========================================`);

    // Enable video recording matching the mobile viewport size
    const context = await browser.newContext({
      viewport: { width: vp.width, height: vp.height },
      isMobile: vp.isMobile,
      hasTouch: vp.hasTouch,
      recordVideo: {
        dir: './videos/',
        size: { width: vp.width, height: vp.height }
      }
    });
    const page = await context.newPage();

    try {
      // 1. Emulate mid-range mobile CPU (4x slowdown)
      const client = await context.newCDPSession(page);
      await client.send('Emulation.setCPUThrottlingRate', { rate: 4 });

      await page.goto(URL, { waitUntil: 'networkidle', timeout: 30000 });
      await page.waitForTimeout(1000);

      // 2. Screenshot initial top view
      await page.screenshot({ path: `./screenshots/${vp.name}_1_top.png` });

      // 3. Check Horizontal Overflow & Sticky/Fixed Elements
      const layoutMetrics = await page.evaluate(() => {
        const docWidth = document.documentElement.scrollWidth;
        const winWidth = window.innerWidth;
        const overflowingElements = [];

        document.querySelectorAll('*').forEach(el => {
          const rect = el.getBoundingClientRect();
          if (rect.right > winWidth + 1 || rect.left < -1) {
            overflowingElements.push({
              tag: el.tagName,
              className: typeof el.className === 'string' ? el.className : '',
              right: Math.round(rect.right),
              left: Math.round(rect.left)
            });
          }
        });

        const stickyOrFixed = [];
        document.querySelectorAll('*').forEach(el => {
          const style = window.getComputedStyle(el);
          if (style.position === 'sticky' || style.position === 'fixed') {
            const rect = el.getBoundingClientRect();
            stickyOrFixed.push({
              tag: el.tagName,
              className: typeof el.className === 'string' ? el.className : '',
              position: style.position,
              top: Math.round(rect.top),
              bottom: Math.round(rect.bottom),
              height: Math.round(rect.height)
            });
          }
        });

        return {
          hasHorizontalOverflow: docWidth > winWidth,
          docWidth,
          winWidth,
          overflowingElements: overflowingElements.slice(0, 10),
          stickyOrFixed
        };
      });

      console.log('1. Horizontal Overflow:', layoutMetrics.hasHorizontalOverflow ? 'FAIL' : 'PASS',
        `(Doc: ${layoutMetrics.docWidth}px vs Viewport: ${layoutMetrics.winWidth}px)`);
      if (layoutMetrics.overflowingElements.length > 0) {
        console.log('   Overflowing Elements:', layoutMetrics.overflowingElements);
      }
      console.log('2. Sticky/Fixed Elements:', layoutMetrics.stickyOrFixed.length > 0 ? layoutMetrics.stickyOrFixed : 'None found');

      // 4. Inject Drag / Hang (FPS & Long Task) Monitor
      await page.evaluate(() => {
        window.__scrollMetrics = { longTasks: 0, maxFreezeMs: 0, frameDrops: 0 };

        new PerformanceObserver((list) => {
          for (const entry of list.getEntries()) {
            window.__scrollMetrics.longTasks++;
            if (entry.duration > window.__scrollMetrics.maxFreezeMs) {
              window.__scrollMetrics.maxFreezeMs = Math.round(entry.duration);
            }
          }
        }).observe({ entryTypes: ['longtask'] });

        let lastFrame = performance.now();
        function checkFrame(now) {
          const delta = now - lastFrame;
          if (delta > 32) window.__scrollMetrics.frameDrops++;
          lastFrame = now;
          requestAnimationFrame(checkFrame);
        }
        requestAnimationFrame(checkFrame);
      });

      // 5. Real Touch-Drag Scroll Test (via CDP Touch Events)
      console.log('3. Running real touch-drag lag test...');
      const midX = Math.floor(vp.width / 2);
      const startY = Math.floor(vp.height * 0.75);
      const endY = Math.floor(vp.height * 0.2);

      await client.send('Input.dispatchTouchEvent', {
        type: 'touchStart',
        touchPoints: [{ x: midX, y: startY }]
      });

      for (let y = startY; y >= endY; y -= 15) {
        await client.send('Input.dispatchTouchEvent', {
          type: 'touchMove',
          touchPoints: [{ x: midX, y: y }]
        });
        await page.waitForTimeout(16);
      }

      await client.send('Input.dispatchTouchEvent', {
        type: 'touchEnd',
        touchPoints: []
      });

      await page.waitForTimeout(600);

      const scrolledTo = await page.evaluate(() => Math.round(window.scrollY));
      const dragMetrics = await page.evaluate(() => window.__scrollMetrics);
      console.log(`   Touch-drag scrolled to Y=${scrolledTo}px | Hang/Lag Metrics:`, dragMetrics);

      // 6. Slow Scroll Simulation
      console.log('4. Running slow scroll check...');
      await page.evaluate(() => window.scrollTo(0, 0));
      await page.waitForTimeout(300);

      const scrollHeight = await page.evaluate(() => document.documentElement.scrollHeight);
      let currentScroll = 0;
      let stuckCount = 0;

      while (currentScroll < scrollHeight - vp.height) {
        const prevY = await page.evaluate(() => window.scrollY);
        await page.mouse.wheel(0, 150);
        await page.waitForTimeout(100);
        const newY = await page.evaluate(() => window.scrollY);

        if (newY === prevY && currentScroll < scrollHeight - vp.height - 20) {
          stuckCount++;
        }
        currentScroll = newY;
        if (stuckCount > 5) {
          console.log(`   WARNING: Scroll appeared stuck at Y=${newY}`);
          await page.screenshot({ path: `./screenshots/${vp.name}_stuck_${newY}.png` });
          break;
        }
      }

      // Capture mid-page and bottom screenshots
      await page.evaluate(() => window.scrollTo(0, document.documentElement.scrollHeight / 2));
      await page.waitForTimeout(500);
      await page.screenshot({ path: `./screenshots/${vp.name}_2_mid.png` });

      await page.evaluate(() => window.scrollTo(0, document.documentElement.scrollHeight));
      await page.waitForTimeout(500);
      await page.screenshot({ path: `./screenshots/${vp.name}_3_bottom.png` });

      // 7. Fast Scroll Simulation
      console.log('5. Running fast scroll check...');
      await page.evaluate(() => window.scrollTo({ top: 0, behavior: 'instant' }));
      await page.waitForTimeout(300);
      await page.evaluate(() => window.scrollTo({ top: document.documentElement.scrollHeight, behavior: 'smooth' }));
      await page.waitForTimeout(1500);
      await page.screenshot({ path: `./screenshots/${vp.name}_4_after_fast_scroll.png` });

    } catch (err) {
      console.error(`Error testing ${vp.name}:`, err.message);
    } finally {
      // Save and rename video file clearly by viewport name
      const video = page.video();
      await context.close(); // Video finishes saving when context closes
      if (video) {
        const rawPath = await video.path();
        const finalPath = `./videos/${vp.name}_scroll_test.webm`;
        fs.renameSync(rawPath, finalPath);
        console.log(`   Saved video: ${finalPath}`);
      }
    }
  }

  await browser.close();
  console.log('\nAudit complete! Check ./screenshots and ./videos folders.');
}

runAudit();