module.exports = {
	'env': {
		'node': true,
		'es2021': true
	},
	'extends': [
		'eslint:recommended',
		'plugin:@typescript-eslint/recommended',
		'plugin:jsdoc/recommended'
	],
	'parser': '@typescript-eslint/parser',
	'parserOptions': {
		'ecmaVersion': 'latest',
		'sourceType': 'module'
	},
	'plugins': [
		'@typescript-eslint',
		'jsdoc'
	],
	'rules': {
		'indent': [
			'error',
			'tab'
		],
		'linebreak-style': [
			'error',
			'unix'
		],
		'quotes': [
			'error',
			'single'
		],
		'semi': [
			'error',
			'never'
		],
		'jsdoc/no-undefined-types': 0,
		'jsdoc/require-jsdoc': ['error', {
			'require': {
				'FunctionDeclaration': true,
				'MethodDefinition': true,
				'ClassDeclaration': true,
				'ArrowFunctionExpression': true,
				'FunctionExpression': false
			}
		}]
	}
}
