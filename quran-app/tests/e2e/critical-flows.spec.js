import { test, expect } from '@playwright/test'

test.describe('ورود آزمایشی و مسیرهای اصلی', () => {
  test('ورود آزمایشی دانش‌آموز و مشاهدهٔ داشبورد', async ({ page }) => {
    await page.goto('/login')
    await page.getByText('دانش‌آموز', { exact: true }).click()
    await expect(page.getByText(/سلام .* عزیز/)).toBeVisible()
  })

  test('باز کردن یک درس و دیدن تب‌های فعالیت', async ({ page }) => {
    await page.goto('/login')
    await page.getByText('دانش‌آموز', { exact: true }).click()
    await page.getByText('درس ۱').first().click()
    await expect(page.getByText('متن قرآن')).toBeVisible()
    await expect(page.getByText('فعالیت ۱')).toBeVisible()
  })

  test('ورود آزمایشی معلم و مشاهدهٔ داشبورد پنل معلم', async ({ page }) => {
    await page.goto('/login')
    await page.getByText('معلم', { exact: true }).click()
    await expect(page).toHaveURL(/\/teacher$/)
    await expect(page.getByText('فعالیت‌های اخیر')).toBeVisible()
  })

  test('ورود آزمایشی مدیر و مشاهدهٔ ویجت فضای ذخیره‌سازی', async ({ page }) => {
    await page.goto('/login')
    await page.getByText('مدیر', { exact: true }).click()
    await expect(page).toHaveURL(/\/admin$/)
    await expect(page.getByText('فضای ابری (Supabase Storage)')).toBeVisible()
  })

  test('دسترسی غیرمجاز به پنل ادمین بدون ورود، به صفحهٔ ورود هدایت می‌شود', async ({ page }) => {
    await page.goto('/admin')
    await expect(page).toHaveURL(/\/login$/)
  })
})
