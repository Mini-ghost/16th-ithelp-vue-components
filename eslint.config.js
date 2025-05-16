import pluginVue from 'eslint-plugin-vue';
import parserVue from 'vue-eslint-parser';
import typeScriptParser from '@typescript-eslint/parser';
import stylistic from '@stylistic/eslint-plugin';

/**
 * @type {import('eslint').Linter.Config}
 */
export default [
  {
    plugins: {
      vue: pluginVue,
    },
  },
  {
    files: ['**/*.ts', '**/*.vue'],
    languageOptions: {
      parser: typeScriptParser,
    },
    rules: {
      indent: 'off',
      quotes: ['error', 'single'],
      semi: ['error', 'always'],
      'no-undef': 'off',
      'no-redeclare': 'off',
      'eol-last': ['error', 'always'],
      'linebreak-style': ['error', 'unix'],
  
      'sort-imports': [
        'error',
        {
          allowSeparatedGroups: true,
          ignoreCase: true,
          ignoreDeclarationSort: true,
          ignoreMemberSort: false,
          memberSyntaxSortOrder: ['none', 'all', 'multiple', 'single'],
        },
      ],

      'object-shorthand': 'error',
      'operator-assignment': 'error',
      'space-infix-ops': 'error',
      'prefer-template': 'error',
      'prefer-const': 'error',
      'comma-spacing': 'error',
      'key-spacing': 'error',
      'keyword-spacing': 'error',
      'object-curly-spacing': ['error', 'always'],
      'template-curly-spacing': 'error',
      'no-multiple-empty-lines': ['error', { max: 1 }],
      'arrow-parens': ['error', 'as-needed'],
      'arrow-spacing': 'error',
      'comma-dangle': ['error', 'always-multiline'],
      'padded-blocks': ['error', 'never'],

      'logical-assignment-operators': [
        'error',
        'always',
        { enforceForIfStatements: true },
      ],

      'space-before-function-paren': [
        'error',
        {
          anonymous: 'never',
          named: 'never',
          asyncArrow: 'always',
        },
      ],
    },
  },

  // @stylistic
  {
    plugins: {
      '@stylistic': stylistic,
    },
    rules: {
      '@stylistic/arrow-parens': 'off',
      '@stylistic/arrow-spacing': ['error', { after: true, before: true }],
      '@stylistic/comma-dangle': ['error', 'always-multiline'],
      '@stylistic/comma-spacing': ['error', { after: true, before: false }],
      '@stylistic/comma-style': ['error', 'last'],
      '@stylistic/computed-property-spacing': [
        'error',
        'never',
        { enforceForClassMembers: true },
      ],
      '@stylistic/dot-location': ['error', 'property'],
      '@stylistic/eol-last': ['error', 'always'],
      '@stylistic/indent': 'off',
      '@stylistic/indent-binary-ops': 'off',
      '@stylistic/key-spacing': 'error',
      '@stylistic/keyword-spacing': 'error',
      '@stylistic/linebreak-style': ['error', 'unix'],
      '@stylistic/no-multiple-empty-lines': ['error', { max: 1 }],
      '@stylistic/object-curly-spacing': ['error', 'always'],
      '@stylistic/padded-blocks': ['error', 'never'],
      '@stylistic/quotes': ['error', 'single'],
      '@stylistic/semi': ['error', 'always'],

      // https://github.com/prettier/prettier/issues/3845
      '@stylistic/space-before-function-paren': 'off',
      '@stylistic/space-infix-ops': 'error',
      '@stylistic/template-curly-spacing': 'error',
    },
  },

  ...pluginVue.configs['flat/essential'],
  ...pluginVue.configs['flat/recommended'],
  ...pluginVue.configs['flat/strongly-recommended'],

  {
    files: ['**/*.vue'],
    languageOptions: {
      parser: parserVue,
      parserOptions: {
        extraFileExtensions: ['.vue'],
        parser: typeScriptParser,
        sourceType: 'module',
      },
    },
    rules: {
      'vue/multi-word-component-names': 'off',
      'vue/no-required-prop-with-default': 'off',

      'vue/block-order': ['error', {
        order: ['script', 'template', 'style'],
      }],

      'vue/component-name-in-template-casing': ['error', 'PascalCase'],
      'vue/multiline-html-element-content-newline': ['error', {
        ignoreWhenEmpty: true,
        ignores: ['pre', 'textarea'],
        allowEmptyLines: false,
      }],

      'vue/attributes-order': [
        'error',
        {
          alphabetical: true,
        },
      ],

      'vue/block-lang': [
        'error',
        {
          script: {
            lang: 'ts',
          },
        },
      ],

      'vue/no-empty-component-block': 'error',
      'vue/prefer-separate-static-class': 'error',
      'vue/padding-line-between-blocks': 'error',

      'vue/prefer-template': 'error',
      'vue/object-shorthand': 'error',
      'vue/space-infix-ops': 'error',
      'vue/eqeqeq': ['error', 'smart'],
      'vue/comma-spacing': 'error',
      'vue/key-spacing': 'error',
      'vue/keyword-spacing': 'error',
      'vue/object-curly-spacing': ['error', 'always'],
      'vue/quote-props': ['error', 'consistent-as-needed'],
      'vue/template-curly-spacing': 'error',
      'vue/arrow-spacing': 'error',
      'vue/comma-dangle': ['error', 'always-multiline'],
      'vue/no-unused-refs': 'error',

      'vue/no-useless-v-bind': [
        'error',
        {
          ignoreIncludesComment: false,
          ignoreStringEscape: true,
        },
      ],

      'vue/html-comment-content-spacing': ['error',
        'always',
        {
          exceptions: ['-'],
        },
      ],

      'vue/block-tag-newline': [
        'error',
        {
          multiline: 'always',
          singleline: 'always',
        },
      ],

      'vue/v-on-event-hyphenation': [
        'error',
        'always',
        {
          autofix: true,
          ignore: [],
        },
      ],
  
      'vue/define-macros-order': [
        'error',
        {
          order: [
            'defineOptions',
            'defineProps',
            'defineEmits',
            'defineSlots',
          ],
        },
      ],
    },
  },
];
