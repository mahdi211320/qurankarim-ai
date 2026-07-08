// Edge Function: storage-manager
// ورودی:  { action: 'usage' | 'cleanup-preview' | 'cleanup' }
// خروجی بسته به action:
//   usage:            { used_mb: number, limit_mb: number, breakdown: { label, mb }[] }
//   cleanup-preview:  { files_to_remove: number, mb_to_free: number }
//   cleanup:          { files_removed: number, mb_freed: number }
//
// فقط برای کاربران با نقش admin قابل استفاده است. قاعدهٔ پاک‌سازی: از میان فایل‌های
// صوتی قدیمی‌تر از ۳۰ روز، فقط آخرین تلاوت هر دانش‌آموز برای هر درس نگه داشته می‌شود.

import { handleOptions, jsonResponse, errorResponse } from '../_shared/cors.ts'
import { createServiceClient, isRequestFromAdmin } from '../_shared/supabaseClients.ts'

const STORAGE_LIMIT_MB = 500
const RECITATIONS_BUCKET = 'recitations'
const MAX_AGE_DAYS = 30

Deno.serve(async (req) => {
  const preflight = handleOptions(req)
  if (preflight) return preflight

  try {
    if (!(await isRequestFromAdmin(req))) {
      return errorResponse('این عملیات فقط برای مدیر سامانه مجاز است.', 403)
    }

    const { action } = await req.json()
    const supabase = createServiceClient()

    if (action === 'usage') {
      const usedBytes = await getBucketSizeBytes(supabase)
      return jsonResponse({
        used_mb: Math.round(usedBytes / (1024 * 1024)),
        limit_mb: STORAGE_LIMIT_MB,
        breakdown: [{ label: 'فایل‌های تلاوت (audio_recordings)', mb: Math.round(usedBytes / (1024 * 1024)) }]
      })
    }

    if (action === 'cleanup-preview' || action === 'cleanup') {
      const candidates = await findCleanupCandidates(supabase)

      if (action === 'cleanup-preview') {
        return jsonResponse({
          files_to_remove: candidates.length,
          mb_to_free: Math.round(candidates.reduce((sum, c) => sum + c.sizeBytes, 0) / (1024 * 1024))
        })
      }

      let removed = 0
      let bytesFreed = 0
      for (const c of candidates) {
        const { error: removeError } = await supabase.storage.from(RECITATIONS_BUCKET).remove([c.path])
        if (!removeError) {
          await supabase.from('audio_recordings').delete().eq('id', c.recordId)
          removed++
          bytesFreed += c.sizeBytes
        }
      }

      return jsonResponse({ files_removed: removed, mb_freed: Math.round(bytesFreed / (1024 * 1024)) })
    }

    return errorResponse('action نامعتبر است. مقادیر مجاز: usage، cleanup-preview، cleanup', 400)
  } catch (err) {
    return errorResponse('خطای غیرمنتظره در مدیریت فضای ذخیره‌سازی.', 500, String(err))
  }
})

async function getBucketSizeBytes(supabase: ReturnType<typeof createServiceClient>): Promise<number> {
  const { data: files } = await supabase.storage.from(RECITATIONS_BUCKET).list('', { limit: 10000 })
  return (files ?? []).reduce((sum, f) => sum + (f.metadata?.size ?? 0), 0)
}

/**
 * فایل‌هایی که هم قدیمی‌تر از ۳۰ روز باشند و هم آخرین تلاوت آن دانش‌آموز
 * برای آن درس نباشند را برمی‌گرداند (کاندیدهای پاک‌سازی).
 */
async function findCleanupCandidates(supabase: ReturnType<typeof createServiceClient>) {
  const { data: records } = await supabase
    .from('audio_recordings')
    .select('id, student_id, lesson_id, audio_url, created_at')
    .order('created_at', { ascending: false })

  if (!records) return []

  const seenLatest = new Set<string>()
  const cutoff = Date.now() - MAX_AGE_DAYS * 24 * 60 * 60 * 1000
  const candidates: { recordId: string; path: string; sizeBytes: number }[] = []

  for (const rec of records) {
    const key = `${rec.student_id}_${rec.lesson_id}`
    const isLatestForPair = !seenLatest.has(key)
    if (isLatestForPair) seenLatest.add(key)

    const isOld = new Date(rec.created_at).getTime() < cutoff
    if (!isLatestForPair && isOld) {
      const path = new URL(rec.audio_url).pathname.split(`/${RECITATIONS_BUCKET}/`)[1] ?? ''
      candidates.push({ recordId: rec.id, path, sizeBytes: 3.5 * 1024 * 1024 }) // میانگین حجم هر فایل تخمینی
    }
  }
  return candidates
}
