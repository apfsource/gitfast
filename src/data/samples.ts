export interface SampleUrl {
  title: string;
  category: string;
  url: string;
  description: string;
}

export const SAMPLE_GITHUB_URLS: SampleUrl[] = [
  {
    title: 'Vue.js Framework',
    category: 'JS',
    url: 'https://github.com/vuejs/core/blob/main/packages/vue/dist/vue.global.js',
    description: 'Popular frontend JavaScript framework bundle file.',
  },
  {
    title: 'Animate.css',
    category: 'CSS',
    url: 'https://github.com/animate-css/animate.css/blob/main/animate.css',
    description: 'Cross-browser animation library for CSS.',
  },
  {
    title: 'GitHub Logo SVG',
    category: 'Image',
    url: 'https://github.com/primer/octicons/blob/main/icons/mark-github-16.svg',
    description: 'Vector SVG icon file from Primer Octicons.',
  },
  {
    title: 'World Countries JSON',
    category: 'JSON',
    url: 'https://github.com/mledoze/countries/blob/master/countries.json',
    description: 'Comprehensive JSON dataset of world countries.',
  },
  {
    title: 'React README',
    category: 'MD',
    url: 'https://github.com/facebook/react/blob/main/README.md',
    description: 'Markdown documentation file from Facebook React repository.',
  },
];
