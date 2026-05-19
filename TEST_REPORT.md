# Quality Assurance Test Report 📊

**Date:** May 2026  
**Framework:** Vitest, React Testing Library, JSDOM  
**Coverage Engine:** v8

## ⚙️ Testing Infrastructure Setup

To satisfy Lab 6 QA standards, the application is wrapped in a high-performance Vitest environment.
- **`vite.config.js`**: Extended to define the `jsdom` testing environment, establish global variable support, and configure coverage exclusion boundaries.
- **`setupTests.js`**: Injects `@testing-library/jest-dom` matchers globally for intuitive assertions (`.toBeInTheDocument()`) and safely mocks terminal browser APIs like `window.print` and `localStorage` to ensure a sanitized testing lifecycle.

## 🧪 Test Suite Summaries

### 1. State Engine & Storage Integrations (`CartContext.test.jsx`)
This comprehensive suite validates the `useReducer` cart logic by mounting the provider over a test consumer. It verifies:
- Clean initialization of state boundaries.
- Accurate total price and quantity mathematics upon `ADD_ITEM` dispatches.
- Strict enforcement of stock limits (preventing additions beyond the `stock` integer).
- In-place modifications via `UPDATE_QUANTITY`.
- Proper object filtration during `REMOVE_ITEM`.
- Flawless cache serialization: verifying that updates are accurately mirrored inside `localStorage`.

### 2. Component Integration & Routing Checks (`Navbar.test.jsx`)
By leveraging `vi.mock` to isolate and control the `AuthContext` and `CartContext`, this suite asserts proper responsive layout rendering under various simulated conditions:
- **Guest Environments**: Validates the presence of standard navigation and the "Sign In" button, confirming that administrative panels remain hidden.
- **Authenticated Environments**: Validates the rendering of personalized greetings and secure logout mechanisms.
- **Privilege Escalation**: Confirms that injecting an `isAdmin: true` state successfully mounts the protected "Admin Panel 🛡️" route.
- **Dynamic Notifications**: Asserts that injecting an integer into `cartCount` successfully mounts the notification badge with the correct class and value.

## 🏆 Finalized Empirical Metrics

The testing framework was executed via `npm run test:coverage`, yielding the following official metrics:

- **Total Test Files Executed:** 2
- **Total Individual Tests Passed:** 10 / 10 (100% Pass Rate)

### Code Coverage Report (v8)

| Metric | Score Achieved | Target Threshold | Status |
| :--- | :--- | :--- | :--- |
| **Statement Coverage** | **78.33%** | `>= 70%` | ✅ PASS |
| **Lines Coverage** | **78.94%** | N/A | ✅ PASS |
| **Functions Coverage** | **80.00%** | N/A | ✅ PASS |

**Conclusion:** The application meets and significantly exceeds the required certification benchmarks for testing stability and code coverage.
