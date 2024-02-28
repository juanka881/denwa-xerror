import { defineConfig } from 'vitest/config';

export default defineConfig({
	test: {
		coverage: {
			reportsDirectory: 'dist/coverage',
			provider: 'istanbul'
		}
	}
})
