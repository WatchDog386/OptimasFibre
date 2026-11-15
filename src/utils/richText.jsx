// Safe formatting for blog posts.
//
// Posts are written in a small subset of Markdown:
//   # Heading, ## Subheading, ### Small heading
//   - bullet  /  1. numbered
//   > quote
//   **bold**, *italic*, [link text](https://...), ![image alt](https://...)
//   blank line = new paragraph
//
// Everything is turned into React elements; raw HTML is never injected, so a post
// cannot run scripts on the site. Older posts that were saved as HTML are converted
// to plain paragraphs first.
import React from 'react';

const SAFE_URL = /^(https?:\/\/|\/(?!\/)|mailto:|tel:)/i;

const looksLikeHtml = (text) => /<\/?(p|div|br|h[1-6]|ul|ol|li|strong|em|b|i|a|span)\b/i.test(text);

const htmlToText = (html) =>
  html
    .replace(/<\s*br\s*\/?>/gi, '\n')
    .replace(/<\/(p|div|h[1-6]|li|blockquote)>/gi, '\n\n')
    .replace(/<li[^>]*>/gi, '- ')
    .replace(/<[^>]+>/g, '')
    .replace(/&nbsp;/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'");

/** Inline formatting: images, links, bold, italic. */
const renderInline = (text, keyPrefix) => {
  const pattern = /(!\[([^\]]*)\]\(([^)\s]+)\))|(\[([^\]]+)\]\(([^)\s]+)\))|(\*\*([^*]+)\*\*)|(\*([^*\s][^*]*)\*)/g;
  const parts = [];
  let last = 0;
  let match;
  let index = 0;

  while ((match = pattern.exec(text)) !== null) {
    if (match.index > last) parts.push(text.slice(last, match.index));
    const key = `${keyPrefix}-${index++}`;

    if (match[1]) {
      const [, , alt, src] = match;
      parts.push(SAFE_URL.test(src)
        ? <img key={key} src={src} alt={alt} loading="lazy" className="my-6 w-full rounded-xl object-cover" />
        : match[0]);
    } else if (match[4]) {
      const label = match[5];
      const href = match[6];
      const external = /^https?:\/\//i.test(href);
      parts.push(SAFE_URL.test(href)
        ? (
          <a
            key={key}
            href={href}
            className="font-semibold text-[#015B97] underline decoration-[#d0b216] decoration-2 underline-offset-2 hover:text-[#003d66]"
            {...(external ? { target: '_blank', rel: 'noopener noreferrer' } : {})}
          >
            {label}
          </a>
        )
        : label);
    } else if (match[7]) {
      parts.push(<strong key={key} className="font-bold text-slate-900">{match[8]}</strong>);
    } else if (match[9]) {
      parts.push(<em key={key}>{match[10]}</em>);
    }
    last = pattern.lastIndex;
  }

  if (last < text.length) parts.push(text.slice(last));
  return parts;
};

/** Splits post text into blocks (headings, lists, quotes, paragraphs). */
export const parseBlocks = (source) => {
  const text = looksLikeHtml(source || '') ? htmlToText(source) : String(source || '');
  const lines = text.replace(/\r\n?/g, '\n').split('\n');
  const blocks = [];
  let paragraph = [];
  let list = null;

  const flushParagraph = () => {
    if (paragraph.length) blocks.push({ type: 'p', text: paragraph.join(' ') });
    paragraph = [];
  };
  const flushList = () => {
    if (list) blocks.push(list);
    list = null;
  };

  for (const raw of lines) {
    const line = raw.trim();
    if (!line) {
      flushParagraph();
      flushList();
      continue;
    }

    const heading = line.match(/^(#{1,3})\s+(.*)$/);
    const bullet = line.match(/^[-*•]\s+(.*)$/);
    const numbered = line.match(/^\d+[.)]\s+(.*)$/);
    const quote = line.match(/^>\s?(.*)$/);

    if (heading) {
      flushParagraph();
      flushList();
      blocks.push({ type: `h${heading[1].length}`, text: heading[2] });
    } else if (bullet || numbered) {
      flushParagraph();
      const type = bullet ? 'ul' : 'ol';
      if (!list || list.type !== type) {
        flushList();
        list = { type, items: [] };
      }
      list.items.push((bullet || numbered)[1]);
    } else if (quote) {
      flushParagraph();
      flushList();
      blocks.push({ type: 'quote', text: quote[1] });
    } else {
      flushList();
      paragraph.push(line);
    }
  }
  flushParagraph();
  flushList();
  return blocks;
};

/** Headings in a post, for a table of contents. */
export const getHeadings = (source) =>
  parseBlocks(source)
    .filter((block) => block.type === 'h2' || block.type === 'h1')
    .map((block, index) => ({ id: `section-${index}`, text: block.text.replace(/[*_[\]()]/g, '') }));

/** Renders post text as formatted, safe React elements. */
export const RichText = ({ content, className = '' }) => {
  let headingIndex = 0;
  return (
    <div className={className}>
      {parseBlocks(content).map((block, i) => {
        const key = `b-${i}`;
        switch (block.type) {
          case 'h1':
          case 'h2':
            return (
              <h2 key={key} id={`section-${headingIndex++}`} className="mt-10 mb-4 scroll-mt-32 text-2xl md:text-3xl font-black text-[#015B97] tracking-tight">
                {renderInline(block.text, key)}
              </h2>
            );
          case 'h3':
            return <h3 key={key} className="mt-8 mb-3 text-xl font-bold text-slate-900">{renderInline(block.text, key)}</h3>;
          case 'ul':
            return (
              <ul key={key} className="my-5 space-y-2 pl-1">
                {block.items.map((item, j) => (
                  <li key={j} className="flex gap-3 leading-relaxed">
                    <span className="mt-2.5 h-1.5 w-1.5 flex-shrink-0 rounded-full bg-[#d0b216]" aria-hidden="true" />
                    <span>{renderInline(item, `${key}-${j}`)}</span>
                  </li>
                ))}
              </ul>
            );
          case 'ol':
            return (
              <ol key={key} className="my-5 list-decimal space-y-2 pl-6 marker:font-bold marker:text-[#015B97]">
                {block.items.map((item, j) => <li key={j} className="pl-1 leading-relaxed">{renderInline(item, `${key}-${j}`)}</li>)}
              </ol>
            );
          case 'quote':
            return (
              <blockquote key={key} className="my-6 border-l-4 border-[#d0b216] bg-amber-50/60 px-5 py-3 text-lg italic text-slate-700 rounded-r-lg">
                {renderInline(block.text, key)}
              </blockquote>
            );
          default:
            return <p key={key} className="my-5 leading-relaxed">{renderInline(block.text, key)}</p>;
        }
      })}
    </div>
  );
};

/** Plain-text version (for search and read-time). */
export const toPlainText = (source) =>
  parseBlocks(source)
    .map((block) => (block.items ? block.items.join(' ') : block.text))
    .join(' ')
    .replace(/!\[[^\]]*\]\([^)]*\)/g, '')
    .replace(/\[([^\]]+)\]\([^)]*\)/g, '$1')
    .replace(/[*_#>]/g, '');

export const readingTime = (source) => {
  const words = toPlainText(source).split(/\s+/).filter(Boolean).length;
  return Math.max(1, Math.round(words / 200));
};
