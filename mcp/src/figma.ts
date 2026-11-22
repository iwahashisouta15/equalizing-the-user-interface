import type { JsonObject } from './types.js';

export type DesignToken = {
  name: string;
  type: 'color' | 'typography';
  value: JsonObject;
};

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

function rgba(value: unknown): JsonObject | undefined {
  if (!isRecord(value) || typeof value.r !== 'number' || typeof value.g !== 'number' || typeof value.b !== 'number') return;
  return {
    r: value.r,
    g: value.g,
    b: value.b,
    ...(typeof value.a === 'number' ? { a: value.a } : {})
  };
}

/** Extracts observed fills and text styling from a Figma document tree. */
export function extractDesignTokens(document: unknown): DesignToken[] {
  const tokens = new Map<string, DesignToken>();
  const visit = (node: unknown, path: string): void => {
    if (!isRecord(node)) return;
    const name = typeof node.name === 'string' ? node.name : 'unnamed';
    const currentPath = path ? `${path}/${name}` : name;
    if (Array.isArray(node.fills)) {
      node.fills.forEach((fill, index) => {
        if (!isRecord(fill) || fill.type !== 'SOLID') return;
        const color = rgba(fill.color);
        if (color) tokens.set(`color:${currentPath}:${index}`, { name: `${currentPath}/fill-${index}`, type: 'color', value: color });
      });
    }
    if (isRecord(node.style) && (node.type === 'TEXT' || 'fontSize' in node.style)) {
      const style = node.style;
      const typography: JsonObject = {};
      for (const key of ['fontFamily', 'fontPostScriptName', 'fontSize', 'fontWeight', 'lineHeightPx', 'letterSpacing', 'textAlignHorizontal']) {
        const value = style[key];
        if (typeof value === 'string' || typeof value === 'number') typography[key] = value;
      }
      if (Object.keys(typography).length) tokens.set(`typography:${currentPath}`, { name: currentPath, type: 'typography', value: typography });
    }
    if (Array.isArray(node.children)) node.children.forEach(child => visit(child, currentPath));
  };
  visit(document, '');
  return [...tokens.values()];
}

export async function fetchFigmaTokens(fileKey: string, accessToken: string, fetcher: typeof fetch = fetch): Promise<DesignToken[]> {
  if (!/^[A-Za-z0-9:_-]+$/.test(fileKey)) throw new Error('Invalid Figma file key.');
  if (!accessToken.trim()) throw new Error('FIGMA_ACCESS_TOKEN is not configured.');
  const response = await fetcher(`https://api.figma.com/v1/files/${encodeURIComponent(fileKey)}`, {
    headers: { 'X-Figma-Token': accessToken },
    signal: AbortSignal.timeout(15_000)
  });
  if (!response.ok) throw new Error(`Figma API request failed with HTTP ${response.status}. Check the file key, token permissions, and rate limits.`);
  const payload: unknown = await response.json();
  if (!isRecord(payload) || !('document' in payload)) throw new Error('Figma response did not contain a document tree.');
  return extractDesignTokens(payload.document);
}
