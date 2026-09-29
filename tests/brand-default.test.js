// 品牌默认值（演知中文独立版）：未设置 YANZHI_BRAND 时为国际中文教育版“演知中文”。
import { test } from 'node:test';
import assert from 'node:assert/strict';
delete process.env.YANZHI_BRAND;
const { BRAND, BRAND_KEY, brandText } = await import('../server/brand.js');

test('未设置 YANZHI_BRAND：默认显示“演知中文”', () => {
  assert.equal(BRAND_KEY, 'zw');
  assert.equal(BRAND?.name, '演知中文');
  assert.equal(BRAND?.slogan, '国际中文教师多智能体研课与课堂预演平台');
  assert.equal(brandText('欢迎使用研思智境'), '欢迎使用演知中文');
});
