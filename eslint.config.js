import js from '@eslint/js'
import globals from 'globals'
import reactHooks from 'eslint-plugin-react-hooks'
import reactRefresh from 'eslint-plugin-react-refresh'
import tseslint from 'typescript-eslint'

export default tseslint.config(
  // 1. 무시할 폴더 설정 (globalIgnores 대신 tseslint.config 내부에서 처리 가능)
  { ignores: ['dist'] },
  
  // 2. JS 및 TS 추천 설정 적용
  js.configs.recommended,
  ...tseslint.configs.recommended,
  
  // 3. 메인 설정
  {
    files: ['**/*.{ts,tsx}'],
    languageOptions: {
      ecmaVersion: 2020,
      globals: globals.browser,
    },
    plugins: {
      'react-hooks': reactHooks,
      'react-refresh': reactRefresh,
    },
    rules: {
      // 플러그인에서 권장 규칙을 직접 가져와 병합
      ...reactHooks.configs.recommended.rules,
      'react-refresh/only-export-components': [
        'warn',
        { allowConstantExport: true },
      ],
    },
  }
)