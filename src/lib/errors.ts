// Ported unchanged from course-scheduler-mobile's apps/mobile/lib/errors.ts.
// Single spot for "what do we show the user" on a thrown/rejected error.
export function getErrorMessage(err: unknown): string {
  return err instanceof Error ? err.message : 'Something went wrong.';
}
