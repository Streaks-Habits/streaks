module.exports = {
	singleQuote: true,
	trailingComma: 'all',
	useTabs: true,
	tabWidth: 4,
	overrides: [
		{
			files: ['*.eta'],
			options: {
				parser: 'html',
			},
		},
	],
};
