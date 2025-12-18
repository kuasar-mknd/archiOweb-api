import globals from 'globals'
import pluginJs from '@eslint/js'

export default [
  {
    languageOptions: { 
      globals: { 
        ...globals.node, 
        ...globals.mocha 
      },
      ecmaVersion: 2022,
      sourceType: 'module'
    }
  },
  pluginJs.configs.recommended,
  {
    rules: {
      'no-unused-vars': 'warn',
      'no-undef': 'error'
    }
  }
]
