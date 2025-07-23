// .prettierrc.js
module.exports = {
  semi: true, // punto y coma al final
  singleQuote: true, // comillas simples
  trailingComma: 'all', // comas finales en objetos y arrays
  printWidth: 100, // longitud máxima de línea
  tabWidth: 2, // espacios por tabulación
  bracketSpacing: true, // espacio entre llaves { foo: bar }
  arrowParens: 'avoid', // omite paréntesis en arrow functions de un solo argumento
  plugins: [
    'prettier-plugin-tailwindcss', // opcional, ordena clases de Tailwind automáticamente
  ],
};
