const { test, expect } = require('@playwright/test');
const AxeBuilder = require('@axe-core/playwright').default;

test('launches without runtime errors and exposes working settings tabs', async ({ page }) => {
  const errors = [];
  page.on('pageerror', error => errors.push(error.message));
  await page.goto('/');
  await expect(page.getByText('Device voice ready · Sign in for cloud voices')).toBeVisible();
  await expect(page.getByRole('heading', { name: /Juniper/ })).toBeVisible();
  await page.getByRole('button', { name: 'Info' }).click();
  const dialog = page.getByRole('dialog', { name: 'My Info' });
  await expect(dialog).toBeVisible();
  await page.getByRole('tab', { name: 'API' }).click();
  await expect(page.getByText(/Provider keys stay on the Firebase backend/)).toBeVisible();
  await page.getByRole('button', { name: 'Close My Info' }).click();
  expect(errors).toEqual([]);
});

test('creates and saves a manual script through the repaired flow', async ({ page }) => {
  await page.goto('/');
  await page.locator('.toolbar-btn').filter({ hasText: 'Scripts' }).click();
  await page.getByRole('button', { name: 'Add Script' }).click();
  await page.getByLabel('Describe what you need:').fill('I need to reschedule my appointment.');
  await page.getByRole('button', { name: 'Create editable starter' }).click();
  await expect(page.getByLabel('Script:')).toHaveValue(/reschedule my appointment/);
  const createView = page.locator('#scriptsCreate');
  await createView.getByLabel('Name').fill('Reschedule');
  await createView.getByRole('button', { name: 'Save' }).click();
  await expect(page.getByRole('dialog', { name: 'Call Scripts' }).getByText('Reschedule', { exact: true })).toBeVisible();
});

test('renders stored user content as text rather than executable HTML', async ({ page }) => {
  await page.addInitScript(() => {
    sessionStorage.setItem('juniperScripts', JSON.stringify([{
      id: 1,
      name: '<img src=x onerror="window.__xss=true">',
      text: '<svg onload="window.__xss=true"></svg>',
      icon: '⭐',
      quick: true
    }]));
  });
  await page.goto('/');
  expect(await page.evaluate(() => window.__xss)).toBeUndefined();
  await expect(page.locator('#scriptsGrid img, #scriptsGrid svg')).toHaveCount(0);
  await expect(page.getByText('<svg onload="window.__xss=true"></svg>', { exact: true })).toBeAttached();
});

test('keeps private profile data and legacy API keys out of persistent storage', async ({ page }) => {
  await page.addInitScript(() => localStorage.setItem('juniperApiKey', 'legacy-test-key'));
  await page.goto('/');
  await page.getByRole('button', { name: 'Info' }).click();
  await page.getByLabel('First Name').fill('Private test');
  await page.getByRole('button', { name: 'Save Info' }).click();
  await page.getByRole('tab', { name: 'API' }).click();
  await expect(page.getByLabel('ElevenLabs API Key')).toHaveCount(0);
  const storage = await page.evaluate(() => ({
    localInfo: localStorage.getItem('juniperInfo'),
    localKey: localStorage.getItem('juniperApiKey'),
    sessionInfo: sessionStorage.getItem('juniperInfo')
  }));
  expect(storage.localInfo).toBeNull();
  expect(storage.localKey).toBeNull();
  expect(storage.sessionInfo).toContain('Private test');
});

test('handles the ElevenLabs voice catalog boundary and safely renders provider data', async ({ page }) => {
  await page.addInitScript(() => {
    window.JUNIPER_BACKEND_TEST_DOUBLE = {
      ready: Promise.resolve(),
      currentUser: () => ({ email: 'approved@example.com' }),
      signIn: async () => ({ email: 'approved@example.com' }),
      signOut: async () => {},
      listVoices: async () => ({ voices: [{
        provider: 'elevenlabs',
        id: 'voice-1',
        name: '<img src=x onerror="window.__voiceXss=true">Juniper Test',
        gender: 'female'
      }] }),
      synthesize: async () => ({ provider: 'google', audioBase64: '', contentType: 'audio/mpeg' })
    };
  });
  await page.goto('/');
  await page.locator('.toolbar-btn').filter({ hasText: 'Voice' }).click();
  await expect(page.getByRole('heading', { name: 'Choose how Juni sounds' })).toBeVisible();
  await expect(page.getByText('Made for Robin')).toBeVisible();
  await expect(page.getByRole('button', { name: 'Google', exact: true })).toBeVisible();
  await expect(page.getByRole('button', { name: 'Device', exact: true })).toBeVisible();
  await expect(page.getByText('<img src=x onerror="window.__voiceXss=true">Juniper Test', { exact: true })).toBeVisible();
  await page.getByRole('button', { name: 'Select <img src=x onerror="window.__voiceXss=true">Juniper Test voice' }).click();
  await expect(page.getByText('<img src=x onerror="window.__voiceXss=true">Juniper Test · Custom · ElevenLabs', { exact: true })).toBeVisible();
  expect(await page.evaluate(() => window.__voiceXss)).toBeUndefined();
});

test('offers signed-in users account switching and sign out controls', async ({ page }) => {
  await page.addInitScript(() => {
    let user = { email: 'first@example.com' };
    window.__authCalls = { switches: 0, signOuts: 0 };
    window.JUNIPER_BACKEND_TEST_DOUBLE = {
      ready: Promise.resolve(),
      currentUser: () => user,
      signIn: async () => user,
      switchAccount: async () => {
        window.__authCalls.switches += 1;
        user = { email: 'second@example.com' };
        return user;
      },
      signOut: async () => {
        window.__authCalls.signOuts += 1;
        user = null;
      },
      listVoices: async () => ({ voices: [] }),
      synthesize: async () => ({ provider: 'device', audioBase64: '', contentType: 'audio/mpeg' })
    };
  });
  await page.goto('/');
  await page.evaluate(() => {
    document.getElementById('voiceAccessSwitch').hidden = false;
    document.getElementById('voiceAccessSignOut').hidden = false;
  });
  await page.getByRole('button', { name: 'Switch account' }).click();
  await expect.poll(() => page.evaluate(() => window.__authCalls.switches)).toBe(1);
  await page.getByRole('button', { name: 'Sign out', exact: true }).click();
  await expect.poll(() => page.evaluate(() => window.__authCalls.signOuts)).toBe(1);
  await expect(page.getByText('Device voice ready · Sign in for cloud voices')).toBeVisible();
});

test('queues only allowlisted Mini Mantis diagnostics while delivery is disabled', async ({ page }) => {
  await page.goto('/');
  const queue = await page.evaluate(() => JSON.parse(sessionStorage.getItem('juniperMiniMantisQueue')));
  expect(queue).toHaveLength(1);
  expect(queue[0]).toMatchObject({
    schemaVersion: '1.0',
    appId: 'juniper-voice-assistant',
    appVersion: '6.4.0',
    event: 'app_loaded',
    outcome: 'ok',
    details: { version: '6.4.0' }
  });
  expect(JSON.stringify(queue[0])).not.toMatch(/message|script|name|address|insurance|apiKey|voiceId|audio/i);
});

test('every inline action resolves to a defined browser function', async ({ page }) => {
  await page.goto('/');
  const missing = await page.evaluate(() => {
    const names = [...document.querySelectorAll('[onclick]')]
      .flatMap(element => [...element.getAttribute('onclick').matchAll(/(?:^|;)\s*([A-Za-z_$][\w$]*)\s*\(/g)].map(match => match[1]))
      .filter(name => name !== 'event');
    return [...new Set(names)].filter(name => typeof window[name] !== 'function');
  });
  expect(missing).toEqual([]);
});

test('traps focus in an open modal and restores it on close', async ({ page }) => {
  await page.goto('/');
  const opener = page.getByRole('button', { name: 'Info' });
  await opener.click();
  const dialog = page.getByRole('dialog', { name: 'My Info' });
  await expect(dialog.getByRole('button', { name: 'Close My Info' })).toBeFocused();
  await page.keyboard.press('Shift+Tab');
  await expect(dialog.getByRole('button', { name: 'Clear private data now' })).toBeFocused();
  await page.keyboard.press('Escape');
  await expect(opener).toBeFocused();
});

test('@a11y main application and dialogs have no serious axe violations', async ({ page }) => {
  await page.goto('/');
  let results = await new AxeBuilder({ page }).withTags(['wcag2a', 'wcag2aa', 'wcag21aa']).analyze();
  expect(results.violations.filter(item => ['serious', 'critical'].includes(item.impact))).toEqual([]);

  for (const name of ['Info', 'Voice', 'Scripts', 'Smart']) {
    await page.locator('.toolbar-btn').filter({ hasText: name }).click();
    results = await new AxeBuilder({ page }).include('.modal-overlay.show').withTags(['wcag2a', 'wcag2aa', 'wcag21aa']).analyze();
    expect(results.violations.filter(item => ['serious', 'critical'].includes(item.impact))).toEqual([]);
    await page.locator('.modal-overlay.show .modal-close').click();
  }
});
