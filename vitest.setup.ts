import '@testing-library/jest-dom/vitest'
import { vi } from 'vitest'

// ─── Default env stubs ────────────────────────────────────────────────────────
// Some modules (transactions.ts, use-allocator.ts) throw at module load if
// these env vars are absent. Providing safe defaults here means individual
// test files don't need to stub them unless they need different values.

vi.stubEnv('NEXT_PUBLIC_ALLOCATOR_PROGRAM_ID', '2QtJ5kmxLuW2jYCFpJMtzZ7PCnKdoMwkeueYoDUi5z5P')
vi.stubEnv('NEXT_PUBLIC_USDC_MINT', 'BiTXT15XyfSakk5Yz8L8QrzHPWbK8NjoZeEMFrDvKdKh')
