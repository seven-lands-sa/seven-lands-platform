import { chromium } from 'playwright';
import fs from 'fs';
import path from 'path';

async function main() {
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage({ viewport: { width: 1200, height: 630 } });

  const logoBase64 = fs.readFileSync('public/brand/seven-lands-mark-light.png').toString('base64');
  const logoDataUri = `data:image/png;base64,${logoBase64}`;

  // 1. Arabic OG Image (1200x630)
  const arHtml = `
  <!DOCTYPE html>
  <html lang="ar" dir="rtl">
  <head>
    <meta charset="utf-8">
    <style>
      @font-face {
        font-family: 'Alexandria';
        src: url('file://${path.resolve('public/fonts/alexandria-arabic.woff2').replace(/\\/g, '/')}') format('woff2');
      }
      * { box-sizing: border-box; margin: 0; padding: 0; }
      body {
        width: 1200px;
        height: 630px;
        background-color: #061428;
        background-image: 
          radial-gradient(circle at 85% 20%, rgba(94, 219, 255, 0.15) 0%, transparent 45%),
          radial-gradient(circle at 15% 85%, rgba(15, 34, 64, 0.9) 0%, transparent 50%);
        color: #F5F7F8;
        font-family: 'Alexandria', system-ui, -apple-system, sans-serif;
        display: flex;
        flex-direction: column;
        justify-content: space-between;
        padding: 65px 75px;
        position: relative;
        overflow: hidden;
      }
      .grid-lines {
        position: absolute;
        inset: 0;
        background-size: 50px 50px;
        background-image: 
          linear-gradient(to right, rgba(255, 255, 255, 0.035) 1px, transparent 1px),
          linear-gradient(to bottom, rgba(255, 255, 255, 0.035) 1px, transparent 1px);
        pointer-events: none;
      }
      .header {
        display: flex;
        align-items: center;
        justify-content: space-between;
        position: relative;
        z-index: 10;
      }
      .logo-box {
        display: flex;
        align-items: center;
        gap: 16px;
      }
      .logo-img {
        width: 54px;
        height: 54px;
        object-fit: contain;
      }
      .brand-title {
        font-size: 26px;
        font-weight: 800;
        letter-spacing: -0.01em;
        color: #FFFFFF;
      }
      .badge {
        background: rgba(94, 219, 255, 0.12);
        border: 1px solid rgba(94, 219, 255, 0.35);
        color: #5EDBFF;
        padding: 8px 22px;
        border-radius: 9999px;
        font-size: 15px;
        font-weight: 700;
      }
      .main {
        position: relative;
        z-index: 10;
        margin-top: 15px;
      }
      .headline {
        font-size: 56px;
        font-weight: 900;
        line-height: 1.25;
        letter-spacing: -0.02em;
        color: #FFFFFF;
      }
      .headline span {
        color: #5EDBFF;
      }
      .subline {
        font-size: 23px;
        font-weight: 500;
        color: rgba(245, 247, 248, 0.82);
        margin-top: 20px;
        line-height: 1.55;
        max-width: 950px;
      }
      .footer {
        display: flex;
        align-items: center;
        justify-content: space-between;
        border-top: 1px solid rgba(255, 255, 255, 0.12);
        padding-top: 25px;
        position: relative;
        z-index: 10;
      }
      .canonical-domain {
        font-size: 24px;
        font-weight: 800;
        color: #5EDBFF;
        direction: ltr;
        letter-spacing: 0.02em;
      }
      .meta-points {
        display: flex;
        gap: 20px;
        font-size: 16px;
        color: rgba(245, 247, 248, 0.7);
        font-weight: 600;
      }
      .meta-dot {
        color: #5EDBFF;
      }
    </style>
  </head>
  <body>
    <div class="grid-lines"></div>
    <div class="header">
      <div class="logo-box">
        <img class="logo-img" src="${logoDataUri}" alt="Seven Lands" />
        <span class="brand-title">سفن لاند — Seven Lands</span>
      </div>
      <div class="badge">الرياض · المملكة العربية السعودية</div>
    </div>
    
    <div class="main">
      <h1 class="headline">
        تسويق. إبداع. تقنية.<br/>
        في اتجاه واحد: <span>نمو أعمالك.</span>
      </h1>
      <p class="subline">
        استراتيجية، هوية مؤسسية، إنتاج سينمائي، حملات رقمية، وتطوير منصات برمجية تحت مظلة واحدة متكاملة.
      </p>
    </div>

    <div class="footer">
      <div class="canonical-domain">7-lands.com</div>
      <div class="meta-points">
        <span>07 مجالات متخصصة</span>
        <span class="meta-dot">·</span>
        <span>منظومة نمو متكاملة</span>
        <span class="meta-dot">·</span>
        <span>فريق تنفيذي مقيم بالرياض</span>
      </div>
    </div>
  </body>
  </html>
  `;

  await page.setContent(arHtml, { waitUntil: 'load' });
  await page.waitForTimeout(500);
  await page.screenshot({ path: 'public/og/og-ar.png' });
  console.log('Regenerated public/og/og-ar.png with embedded logo');

  // 2. English OG Image (1200x630)
  const enHtml = `
  <!DOCTYPE html>
  <html lang="en" dir="ltr">
  <head>
    <meta charset="utf-8">
    <style>
      @font-face {
        font-family: 'Manrope';
        src: url('file://${path.resolve('public/fonts/manrope-latin.woff2').replace(/\\/g, '/')}') format('woff2');
      }
      * { box-sizing: border-box; margin: 0; padding: 0; }
      body {
        width: 1200px;
        height: 630px;
        background-color: #061428;
        background-image: 
          radial-gradient(circle at 15% 20%, rgba(94, 219, 255, 0.15) 0%, transparent 45%),
          radial-gradient(circle at 85% 85%, rgba(15, 34, 64, 0.9) 0%, transparent 50%);
        color: #F5F7F8;
        font-family: 'Manrope', system-ui, -apple-system, sans-serif;
        display: flex;
        flex-direction: column;
        justify-content: space-between;
        padding: 65px 75px;
        position: relative;
        overflow: hidden;
      }
      .grid-lines {
        position: absolute;
        inset: 0;
        background-size: 50px 50px;
        background-image: 
          linear-gradient(to right, rgba(255, 255, 255, 0.035) 1px, transparent 1px),
          linear-gradient(to bottom, rgba(255, 255, 255, 0.035) 1px, transparent 1px);
        pointer-events: none;
      }
      .header {
        display: flex;
        align-items: center;
        justify-content: space-between;
        position: relative;
        z-index: 10;
      }
      .logo-box {
        display: flex;
        align-items: center;
        gap: 16px;
      }
      .logo-img {
        width: 54px;
        height: 54px;
        object-fit: contain;
      }
      .brand-title {
        font-size: 26px;
        font-weight: 800;
        letter-spacing: -0.02em;
        color: #FFFFFF;
      }
      .badge {
        background: rgba(94, 219, 255, 0.12);
        border: 1px solid rgba(94, 219, 255, 0.35);
        color: #5EDBFF;
        padding: 8px 22px;
        border-radius: 9999px;
        font-size: 15px;
        font-weight: 700;
      }
      .main {
        position: relative;
        z-index: 10;
        margin-top: 15px;
      }
      .headline {
        font-size: 56px;
        font-weight: 900;
        line-height: 1.2;
        letter-spacing: -0.03em;
        color: #FFFFFF;
      }
      .headline span {
        color: #5EDBFF;
      }
      .subline {
        font-size: 23px;
        font-weight: 500;
        color: rgba(245, 247, 248, 0.82);
        margin-top: 20px;
        line-height: 1.55;
        max-width: 950px;
      }
      .footer {
        display: flex;
        align-items: center;
        justify-content: space-between;
        border-top: 1px solid rgba(255, 255, 255, 0.12);
        padding-top: 25px;
        position: relative;
        z-index: 10;
      }
      .canonical-domain {
        font-size: 24px;
        font-weight: 800;
        color: #5EDBFF;
        letter-spacing: 0.02em;
      }
      .meta-points {
        display: flex;
        gap: 20px;
        font-size: 16px;
        color: rgba(245, 247, 248, 0.7);
        font-weight: 600;
      }
      .meta-dot {
        color: #5EDBFF;
      }
    </style>
  </head>
  <body>
    <div class="grid-lines"></div>
    <div class="header">
      <div class="logo-box">
        <img class="logo-img" src="${logoDataUri}" alt="Seven Lands" />
        <span class="brand-title">Seven Lands</span>
      </div>
      <div class="badge">Riyadh · Saudi Arabia</div>
    </div>
    
    <div class="main">
      <h1 class="headline">
        Marketing. Creative. Tech.<br/>
        In One Direction: <span>Business Growth.</span>
      </h1>
      <p class="subline">
        Strategy, brand architecture, cinematic film, performance engines, and software engineering under one roof.
      </p>
    </div>

    <div class="footer">
      <div class="canonical-domain">7-lands.com</div>
      <div class="meta-points">
        <span>07 Specialized Lands</span>
        <span class="meta-dot">·</span>
        <span>Unified Architecture</span>
        <span class="meta-dot">·</span>
        <span>Resident Team in Riyadh</span>
      </div>
    </div>
  </body>
  </html>
  `;

  await page.setContent(enHtml, { waitUntil: 'load' });
  await page.waitForTimeout(500);
  await page.screenshot({ path: 'public/og/og-en.png' });
  console.log('Regenerated public/og/og-en.png with embedded logo');

  await browser.close();
}

main().catch(console.error);
