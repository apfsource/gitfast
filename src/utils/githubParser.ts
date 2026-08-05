import { ParsedGithubUrl, CdnService, Language } from '../types';
import { i18n } from './translations';

export function parseGithubUrl(rawUrl: string): ParsedGithubUrl {
  const trimmed = rawUrl.trim();

  if (!trimmed) {
    return {
      originalUrl: '',
      user: '',
      repo: '',
      branch: 'main',
      path: '',
      fileName: '',
      fileExtension: '',
      fileCategory: 'other',
      isValid: false,
      error: 'Please paste a GitHub URL',
    };
  }

  try {
    let urlStr = trimmed;
    if (!urlStr.startsWith('http://') && !urlStr.startsWith('https://')) {
      urlStr = 'https://' + urlStr;
    }

    const urlObj = new URL(urlStr);
    const host = urlObj.hostname.toLowerCase();
    const pathname = urlObj.pathname.replace(/^\/+|\/+$/g, '');
    const parts = pathname.split('/').filter(Boolean);

    let user = '';
    let repo = '';
    let branch = 'main';
    let path = '';

    if (host === 'github.com' || host === 'www.github.com') {
      if (parts.length < 2) {
        throw new Error('Invalid GitHub repository URL');
      }
      user = parts[0];
      repo = parts[1];

      if (parts.length >= 4 && (parts[2] === 'blob' || parts[2] === 'raw' || parts[2] === 'tree')) {
        branch = parts[3];
        path = parts.slice(4).join('/');
      } else if (parts.length > 2) {
        path = parts.slice(2).join('/');
      }
    } else if (host === 'raw.githubusercontent.com') {
      if (parts.length < 3) {
        throw new Error('Invalid raw.githubusercontent.com URL');
      }
      user = parts[0];
      repo = parts[1];
      branch = parts[2];
      path = parts.slice(3).join('/');
    } else if (host.endsWith('.github.io')) {
      user = host.replace('.github.io', '');
      if (parts.length < 1) {
        throw new Error('Invalid GitHub Pages URL');
      }
      repo = parts[0];
      path = parts.slice(1).join('/');
      branch = 'main';
    } else if (host === 'cdn.jsdelivr.net') {
      // https://cdn.jsdelivr.net/gh/user/repo@branch/path
      if (parts[0] === 'gh' && parts.length >= 3) {
        user = parts[1];
        const repoAndBranch = parts[2];
        if (repoAndBranch.includes('@')) {
          const [r, b] = repoAndBranch.split('@');
          repo = r;
          branch = b || 'main';
        } else {
          repo = repoAndBranch;
          branch = 'main';
        }
        path = parts.slice(3).join('/');
      } else {
        throw new Error('Invalid jsDelivr URL');
      }
    } else if (host === 'cdn.statically.io') {
      // https://cdn.statically.io/gh/user/repo/branch/path
      if (parts[0] === 'gh' && parts.length >= 4) {
        user = parts[1];
        repo = parts[2];
        branch = parts[3];
        path = parts.slice(4).join('/');
      }
    } else if (host === 'rawcdn.githack.com' || host === 'raw.githack.com') {
      // https://rawcdn.githack.com/user/repo/branch/path
      if (parts.length >= 3) {
        user = parts[0];
        repo = parts[1];
        branch = parts[2];
        path = parts.slice(3).join('/');
      }
    } else {
      throw new Error('URL hostname is not a recognized GitHub or GitHub CDN service');
    }

    // Clean query params / hash from path if attached to pathname
    path = path.split('?')[0].split('#')[0];

    // Decode URL-encoded characters (like %20 or unicode) for human-readable display
    try { path = decodeURIComponent(path); } catch (e) {}
    try { branch = decodeURIComponent(branch); } catch (e) {}

    if (!user || !repo) {
      throw new Error('Could not parse GitHub user or repository name');
    }

    const pathSegments = path.split('/');
    const fileName = pathSegments[pathSegments.length - 1] || `${repo}-file`;
    const extMatch = fileName.match(/\.([a-zA-Z0-9]+)$/);
    const fileExtension = extMatch ? extMatch[1].toLowerCase() : '';

    const fileCategory = getFileCategory(fileExtension);

    return {
      originalUrl: trimmed,
      user,
      repo,
      branch: branch || 'main',
      path,
      fileName,
      fileExtension,
      fileCategory,
      isValid: true,
    };
  } catch (err: any) {
    return {
      originalUrl: trimmed,
      user: '',
      repo: '',
      branch: 'main',
      path: '',
      fileName: '',
      fileExtension: '',
      fileCategory: 'other',
      isValid: false,
      error: err.message || 'Invalid GitHub URL format',
    };
  }
}

function getFileCategory(ext: string): ParsedGithubUrl['fileCategory'] {
  if (['js', 'mjs', 'cjs', 'ts', 'tsx', 'jsx', 'vue', 'svelte', 'py', 'go', 'rs', 'java', 'c', 'cpp', 'php', 'rb'].includes(ext)) {
    return 'javascript';
  }
  if (['css', 'scss', 'less', 'sass', 'styl'].includes(ext)) {
    return 'stylesheet';
  }
  if (['png', 'jpg', 'jpeg', 'svg', 'gif', 'webp', 'ico', 'bmp', 'tiff', 'avif'].includes(ext)) {
    return 'image';
  }
  if (['json', 'json5', 'yaml', 'yml', 'toml'].includes(ext)) {
    return 'json';
  }
  if (['md', 'markdown', 'mdown', 'mkd'].includes(ext)) {
    return 'markdown';
  }
  if (['html', 'htm', 'xhtml'].includes(ext)) {
    return 'html';
  }
  if (['woff', 'woff2', 'ttf', 'otf', 'eot'].includes(ext)) {
    return 'font';
  }
  return 'other';
}

export function generateCdnUrls(
  parsed: ParsedGithubUrl, 
  favoriteIds: string[] = [], 
  lang: Language = 'en',
  minify: boolean = false
): CdnService[] {
  if (!parsed.isValid) return [];
  const t = (i18n as any)[lang];

  const { user, repo, branch, path } = parsed;
  const cleanPath = path.startsWith('/') ? path.slice(1) : path;
  
  // Re-encode properly for URLs so HTTP requests don't break with spaces or unicode characters
  let encodedPath = cleanPath.split('/').map(encodeURIComponent).join('/');
  
  // Auto-minification logic for jsDelivr
  let jsdelivrPath = encodedPath;
  if (minify) {
    if (jsdelivrPath.endsWith('.js') && !jsdelivrPath.endsWith('.min.js')) {
      jsdelivrPath = jsdelivrPath.replace(/\.js$/, '.min.js');
    } else if (jsdelivrPath.endsWith('.css') && !jsdelivrPath.endsWith('.min.css')) {
      jsdelivrPath = jsdelivrPath.replace(/\.css$/, '.min.css');
    }
  }

  const encodedBranch = encodeURIComponent(branch);

  const services: CdnService[] = [
    {
      id: 'jsdelivr',
      name: 'jsDelivr',
      description: t.cdn.jsdelivrDesc,
      tag: minify ? 'Minified Production' : 'Recommended for Production',
      badgeColor: 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20',
      url: `https://cdn.jsdelivr.net/gh/${user}/${repo}@${encodedBranch}/${jsdelivrPath}`,
      note: t.cdn.jsdelivrNote,
    },
    {
      id: 'statically',
      name: 'Statically',
      description: t.cdn.staticallyDesc,
      tag: 'Fast Edge Cache',
      badgeColor: 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20',
      url: `https://cdn.statically.io/gh/${user}/${repo}/${encodedBranch}/${encodedPath}`,
      note: t.cdn.staticallyNote,
    },
    {
      id: 'raw-github',
      name: 'Raw GitHub',
      description: t.cdn.rawGithubDesc,
      tag: 'Official GitHub Raw',
      badgeColor: 'bg-slate-500/10 text-slate-700 dark:text-slate-300 border-slate-500/20',
      url: `https://raw.githubusercontent.com/${user}/${repo}/${encodedBranch}/${encodedPath}`,
      note: t.cdn.rawGithubNote,
    },
    {
      id: 'github-pages',
      name: 'GitHub Pages',
      description: t.cdn.githubPagesDesc,
      tag: 'Official Web Host',
      badgeColor: 'bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/20',
      url: `https://${user}.github.io/${repo}/${encodedPath}`,
      note: t.cdn.githubPagesNote,
    },
    {
      id: 'githack-prod',
      name: 'GitHack (RawCDN)',
      description: t.cdn.githackProdDesc,
      tag: 'RawCDN / Production',
      badgeColor: 'bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border-indigo-500/20',
      url: `https://rawcdn.githack.com/${user}/${repo}/${encodedBranch}/${encodedPath}`,
      note: t.cdn.githackProdNote,
    },
    {
      id: 'githack-dev',
      name: 'GitHack (Dev)',
      description: t.cdn.githackDevDesc,
      tag: 'Development / Live Sync',
      badgeColor: 'bg-purple-500/10 text-purple-600 dark:text-purple-400 border-purple-500/20',
      url: `https://raw.githack.com/${user}/${repo}/${encodedBranch}/${encodedPath}`,
      note: t.cdn.githackDevNote,
    },
  ];

  return services.map(s => ({
    ...s,
    isFavorite: favoriteIds.includes(s.id),
  })).sort((a, b) => {
    if (a.isFavorite && !b.isFavorite) return -1;
    if (!a.isFavorite && b.isFavorite) return 1;
    return 0;
  });
}

export function generateEmbedSnippets(url: string, fileName: string, category: ParsedGithubUrl['fileCategory'], sriHash?: string) {
  const encodedUrl = url;
  const integrity = sriHash ? ` integrity="${sriHash}" crossorigin="anonymous"` : '';

  return {
    script: `<script src="${encodedUrl}"${integrity}></script>`,
    css: `<link rel="stylesheet" href="${encodedUrl}"${integrity}>`,
    markdownLink: `[${fileName}](${encodedUrl})`,
    markdownImg: `![${fileName}](${encodedUrl})`,
    htmlImg: `<img src="${encodedUrl}" alt="${fileName}"${integrity} />`,
    plainUrl: encodedUrl,
  };
}
