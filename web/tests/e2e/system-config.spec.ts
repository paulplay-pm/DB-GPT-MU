import { expect, test } from '@playwright/test';

const BASE_URL = process.env.BASE_URL || 'http://localhost:3000';
const USER = { username: 'kk', password: 'kk123456' };

test.describe('系统配置页面', () => {
  test.beforeEach(async ({ page }) => {
    // 登录
    await page.goto(`${BASE_URL}/login`);
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(1000);
    await page.fill('#login_login_name', USER.username);
    await page.fill('#login_password', USER.password);

    // 点击登录按钮
    await page.click('button[type="submit"]');

    // 等待最多15秒让URL变化
    try {
      await page.waitForURL(url => !url.toString().includes('/login'), {
        timeout: 15000,
      });
    } catch {
      console.log('Login timeout, current URL:', page.url());
    }

    // 等待网络空闲
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(2000);

    const url = page.url();
    console.log('After login, current URL:', url);
  });

  test('访问系统配置页面', async ({ page }) => {
    // 直接导航到系统配置页面
    await page.goto(`${BASE_URL}/`);
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(2000);

    // 使用 Next.js router 导航到系统配置页面
    await page.evaluate(() => {
      const next = (window as any).next;
      if (next && next.router) {
        next.router.push('/admin/system-config');
      }
    });

    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(3000);

    // Debug: 打印页面内容
    console.log('Current URL:', page.url());
    const content = await page.content();
    console.log('Page contains 系统管理:', content.includes('系统管理'));
    console.log('Page contains 系统配置:', content.includes('系统配置'));

    // 验证页面存在 - 检查面包屑或页面标题
    await expect(page.locator('text=系统配置').first()).toBeVisible({ timeout: 15000 });
  });

  test('5个Tab切换正常', async ({ page }) => {
    await page.goto(`${BASE_URL}/`);
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(2000);

    // 使用 Next.js router 导航
    await page.evaluate(() => {
      const next = (window as any).next;
      if (next && next.router) {
        next.router.push('/admin/system-config');
      }
    });

    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(3000);

    // 切换到记忆管理 Tab
    await page.click('.ant-tabs-tab:has-text("记忆管理")');
    await expect(page.locator('text=总记忆条数')).toBeVisible({ timeout: 5000 });

    // 切换到安全设置 Tab
    await page.click('.ant-tabs-tab:has-text("安全设置")');
    await expect(page.locator('text=密码策略')).toBeVisible({ timeout: 5000 });

    // 切换到通知设置 Tab
    await page.click('.ant-tabs-tab:has-text("通知设置")');
    await expect(page.locator('text=邮件通知')).toBeVisible({ timeout: 5000 });

    // 切换到高级设置 Tab
    await page.click('.ant-tabs-tab:has-text("高级设置")');
    await expect(page.locator('text=系统维护')).toBeVisible({ timeout: 5000 });

    // 切回品牌信息 Tab
    await page.click('.ant-tabs-tab:has-text("品牌信息")');
    await expect(page.locator('text=Logo 配置')).toBeVisible({ timeout: 5000 });
  });

  test('品牌信息表单元素存在', async ({ page }) => {
    await page.goto(`${BASE_URL}/`);
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(2000);

    // 使用 Next.js router 导航
    await page.evaluate(() => {
      const next = (window as any).next;
      if (next && next.router) {
        next.router.push('/admin/system-config');
      }
    });

    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(5000);

    // 验证当前 Logo 预览区域存在
    await expect(page.locator('text=当前 Logo')).toBeVisible({ timeout: 10000 });
    await expect(page.locator('text=上传新 Logo')).toBeVisible({ timeout: 5000 });

    // 验证产品名称字段
    await expect(page.locator('text=中文名称')).toBeVisible({ timeout: 5000 });
    await expect(page.locator('text=英文名称')).toBeVisible({ timeout: 5000 });

    // 验证底部操作栏 - 重置按钮在无未保存修改时是disabled状态
    // 注意：按钮文本是"重 置"（有空格）
    await expect(page.locator('button:has-text("重 置")')).toBeAttached({ timeout: 10000 });
    await expect(page.locator('button:has-text("保存配置")')).toBeVisible({ timeout: 5000 });
  });

  test('记忆管理Tab显示统计卡片', async ({ page }) => {
    await page.goto(`${BASE_URL}/`);
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(2000);

    // 使用 Next.js router 导航
    await page.evaluate(() => {
      const next = (window as any).next;
      if (next && next.router) {
        next.router.push('/admin/system-config');
      }
    });

    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(3000);

    // 切换到记忆管理
    await page.click('.ant-tabs-tab:has-text("记忆管理")');

    // 验证4个统计卡片
    await expect(page.locator('text=总记忆条数')).toBeVisible({ timeout: 5000 });
    await expect(page.locator('text=今日新增')).toBeVisible({ timeout: 5000 });
    await expect(page.locator('text=覆盖用户数')).toBeVisible({ timeout: 5000 });
    await expect(page.locator('text=准确率')).toBeVisible({ timeout: 5000 });

    // 验证蒸馏策略
    await expect(page.locator('text=蒸馏策略')).toBeVisible({ timeout: 5000 });

    // 验证操作按钮
    await expect(page.locator('button:has-text("清除全部记忆")')).toBeVisible({ timeout: 5000 });
  });

  test('安全设置Tab配置项', async ({ page }) => {
    await page.goto(`${BASE_URL}/`);
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(2000);

    // 使用 Next.js router 导航
    await page.evaluate(() => {
      const next = (window as any).next;
      if (next && next.router) {
        next.router.push('/admin/system-config');
      }
    });

    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(3000);

    // 切换到安全设置
    await page.click('.ant-tabs-tab:has-text("安全设置")');

    // 验证密码策略
    await expect(page.locator('text=密码策略')).toBeVisible({ timeout: 5000 });
    await expect(page.locator('text=密码最小长度')).toBeVisible({ timeout: 5000 });

    // 验证会话安全
    await expect(page.locator('text=会话安全')).toBeVisible({ timeout: 5000 });

    // 验证数据安全
    await expect(page.locator('text=数据安全')).toBeVisible({ timeout: 5000 });
  });

  test('通知设置Tab表单', async ({ page }) => {
    await page.goto(`${BASE_URL}/`);
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(2000);

    // 使用 Next.js router 导航
    await page.evaluate(() => {
      const next = (window as any).next;
      if (next && next.router) {
        next.router.push('/admin/system-config');
      }
    });

    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(3000);

    // 切换到通知设置
    await page.click('.ant-tabs-tab:has-text("通知设置")');

    // 验证SMTP配置
    await expect(page.locator('text=邮件通知')).toBeVisible({ timeout: 5000 });
    await expect(page.locator('text=SMTP 服务器')).toBeVisible({ timeout: 5000 });

    // 验证通知场景
    await expect(page.locator('text=通知场景')).toBeVisible({ timeout: 5000 });
  });

  test('高级设置Tab系统信息', async ({ page }) => {
    await page.goto(`${BASE_URL}/`);
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(2000);

    // 使用 Next.js router 导航
    await page.evaluate(() => {
      const next = (window as any).next;
      if (next && next.router) {
        next.router.push('/admin/system-config');
      }
    });

    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(3000);

    // 切换到高级设置
    await page.click('.ant-tabs-tab:has-text("高级设置")');

    // 验证系统维护
    await expect(page.locator('text=系统维护')).toBeVisible({ timeout: 5000 });
    await expect(page.locator('text=清除系统缓存')).toBeVisible({ timeout: 5000 });

    // 验证系统信息
    await expect(page.locator('text=系统信息')).toBeVisible({ timeout: 5000 });
    await expect(page.locator('text=系统版本')).toBeVisible({ timeout: 5000 });
  });
});
