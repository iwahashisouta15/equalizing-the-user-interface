import assert from 'node:assert/strict';
import test from 'node:test';
import { extractDesignTokens, fetchFigmaTokens } from './figma.js';
import { generateUiContract } from './contract.js';

test('extracts colors and typography from a nested Figma document', () => {
  const tokens = extractDesignTokens({ name: 'Page', children: [{ name: 'Button', fills: [{ type: 'SOLID', color: { r: 0.1, g: 0.2, b: 0.3, a: 1 } }, { type: 'IMAGE' }], children: [{ name: 'Label', type: 'TEXT', style: { fontFamily: 'Example', fontSize: 16, fontWeight: 500 } }] }] });
  assert.equal(tokens.length, 2);
  assert.equal(tokens[0]?.type, 'color');
  assert.equal(tokens[1]?.type, 'typography');
  assert.equal(tokens[1]?.value.fontSize, 16);
});

test('rejects invalid file keys and missing tokens before network access', async () => {
  await assert.rejects(fetchFigmaTokens('bad/key', 'secret', async () => { throw new Error('should not fetch'); }), /Invalid Figma file key/);
  await assert.rejects(fetchFigmaTokens('valid-key', '', async () => { throw new Error('should not fetch'); }), /FIGMA_ACCESS_TOKEN/);
});

test('uses Figma token header and extracts response document', async () => {
  let receivedHeader = '';
  const tokens = await fetchFigmaTokens('valid-key', 'secret', async (_input, init) => {
    receivedHeader = new Headers(init?.headers).get('X-Figma-Token') ?? '';
    return new Response(JSON.stringify({ document: { name: 'Page', fills: [{ type: 'SOLID', color: { r: 1, g: 0, b: 0 } }] } }), { status: 200 });
  });
  assert.equal(receivedHeader, 'secret');
  assert.equal(tokens.length, 1);
});

test('generates provider-neutral contract with streaming and cancellation', () => {
  const contract = generateUiContract();
  assert.match(contract, /AsyncIterable<string>/);
  assert.match(contract, /AbortSignal/);
  assert.match(contract, /ChatMessage/);
});
