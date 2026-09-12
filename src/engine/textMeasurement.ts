import { TextAdElement } from './types';

/**
 * Text Measurement Engine using HTML5 Canvas measureText with fallback.
 * Measures exact string width and calculates wrapped line height.
 */
export interface TextMeasurement {
  width: number;
  height: number;
  lineCount: number;
  fontSize: number;
}

let cachedCanvasContext: CanvasRenderingContext2D | null = null;

function getCanvasContext(): CanvasRenderingContext2D | null {
  if (cachedCanvasContext) return cachedCanvasContext;
  if (typeof document !== 'undefined') {
    const canvas = document.createElement('canvas');
    cachedCanvasContext = canvas.getContext('2d');
  }
  return cachedCanvasContext;
}

export function measureTextReal(
  element: TextAdElement,
  fontSize: number,
  availableWidth: number,
  fontFamily: string = 'Inter, sans-serif'
): TextMeasurement {
  const ctx = getCanvasContext();
  const padding = 12;
  const usableWidth = Math.max(60, availableWidth - padding);
  const text = element.content;

  if (ctx) {
    ctx.font = `${element.fontWeight ?? 'normal'} ${fontSize}px ${fontFamily}`;
    
    // Split text into words and compute wrapped lines
    const words = text.split(' ');
    let currentLine = '';
    let lineCount = 1;
    let maxLineWidth = 0;

    for (let i = 0; i < words.length; i++) {
      const testLine = currentLine ? `${currentLine} ${words[i]}` : words[i];
      const metrics = ctx.measureText(testLine);
      const testWidth = metrics.width;

      if (testWidth > usableWidth && currentLine !== '') {
        lineCount++;
        currentLine = words[i];
      } else {
        currentLine = testLine;
        maxLineWidth = Math.max(maxLineWidth, testWidth);
      }
    }

    const lineHeight = Math.round(fontSize * 1.3);
    const measuredWidth = Math.min(availableWidth, Math.ceil(maxLineWidth + padding));
    const measuredHeight = lineCount * lineHeight + 8;

    return {
      width: measuredWidth,
      height: measuredHeight,
      lineCount,
      fontSize,
    };
  }

  // Fallback to ratio-based estimation if running headless without Canvas DOM
  const avgCharWidthRatio = 0.58;
  const charWidth = fontSize * avgCharWidthRatio;
  const charsPerLine = Math.max(8, Math.floor(usableWidth / charWidth));
  const lineCount = Math.ceil(text.length / charsPerLine);
  const lineHeight = Math.round(fontSize * 1.3);

  return {
    width: Math.min(availableWidth, Math.max(80, Math.ceil(Math.min(text.length, charsPerLine) * charWidth + padding))),
    height: lineCount * lineHeight + 8,
    lineCount,
    fontSize,
  };
}
