export function getReadingTimeInMinutes(text: string): number {
  const wordsPerMinute = 200
  const words = text.trim().split(/\s+/).filter(Boolean).length
  const minutes = Math.ceil(words / wordsPerMinute)
  return Math.max(1, minutes)
}
