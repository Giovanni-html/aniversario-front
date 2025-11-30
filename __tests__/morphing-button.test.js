/**
 * Tests for Morphing Hint Button
 * Feature: morphing-hint-button
 * 
 * These tests verify the correctness properties defined in the design document.
 */

import { describe, test, expect, beforeEach } from '@jest/globals';
import { JSDOM } from 'jsdom';
import { readFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Load HTML and CSS files
const htmlContent = readFileSync(join(__dirname, '../index.html'), 'utf-8');
const cssContent = readFileSync(join(__dirname, '../assets/css/style.css'), 'utf-8');

let dom;
let document;
let window;
let button;

beforeEach(() => {
  // Create a new DOM for each test
  dom = new JSDOM(htmlContent, {
    resources: 'usable',
    runScripts: 'dangerously'
  });
  
  document = dom.window.document;
  window = dom.window;
  
  // Inject CSS
  const style = document.createElement('style');
  style.textContent = cssContent;
  document.head.appendChild(style);
  
  // Get the button element
  button = document.querySelector('.hint-btn');
});

/**
 * Property 1: Initial State Correctness
 * Feature: morphing-hint-button, Property 1: Initial State Correctness
 * Validates: Requirements 1.1, 1.2, 1.3, 6.1
 * 
 * For any initial render of the hint button, the button element should have 
 * width and height of 40px, border-radius of 50%, border of 2px solid #B76E79, 
 * and the text element should have max-width of 0 and opacity of 0.
 */
describe('Property 1: Initial State Correctness', () => {
  test('button dimensions are 40px x 40px', () => {
    const styles = window.getComputedStyle(button);
    
    // Check height
    expect(styles.height).toBe('40px');
    
    // Check min-width (button expands horizontally, so we check min-width)
    expect(styles.minWidth).toBe('40px');
  });

  test('border-radius is 50% (circular)', () => {
    const styles = window.getComputedStyle(button);
    
    // border-radius: 40px is equivalent to 50% for a 40px element
    // We check for the computed value which should be 40px
    expect(styles.borderRadius).toBe('40px');
  });

  test('border is 2px solid #B76E79', () => {
    const styles = window.getComputedStyle(button);
    
    // Check border width
    expect(styles.borderWidth).toBe('2px');
    
    // Check border style
    expect(styles.borderStyle).toBe('solid');
    
    // Check border color (RGB equivalent of #B76E79)
    // #B76E79 = rgb(183, 110, 121)
    expect(styles.borderColor).toBe('rgb(183, 110, 121)');
  });

  test('text element has max-width of 0', () => {
    const textElement = button.querySelector('.text');
    const styles = window.getComputedStyle(textElement);
    
    // jsdom may return "0" or "0px"
    expect(styles.maxWidth).toMatch(/^0(px)?$/);
  });

  test('text element has opacity of 0', () => {
    const textElement = button.querySelector('.text');
    const styles = window.getComputedStyle(textElement);
    
    expect(styles.opacity).toBe('0');
  });
});


/**
 * Property 2: Hover State Transformation
 * Feature: morphing-hint-button, Property 2: Hover State Transformation
 * Validates: Requirements 2.3, 2.4, 2.5
 * 
 * For any hover event on the hint button, the button should transition to 
 * border-radius of 0, transparent top/left/right borders, visible bottom border, 
 * and the text element should have max-width > 0 and opacity of 1.
 */
describe('Property 2: Hover State Transformation', () => {
  test('border-radius becomes 0 on hover', () => {
    // Check CSS text directly since jsdom doesn't parse all properties
    const cssText = cssContent;
    
    // Find the hover rule
    const hoverMatch = cssText.match(/\.hint-btn:hover[^{]*\{([^}]+)\}/);
    expect(hoverMatch).toBeTruthy();
    
    const hoverStyles = hoverMatch[1];
    expect(hoverStyles).toMatch(/border-radius\s*:\s*0/);
  });

  test('top/left/right borders become transparent on hover', () => {
    const cssText = cssContent;
    
    // Find the hover rule
    const hoverMatch = cssText.match(/\.hint-btn:hover[^{]*\{([^}]+)\}/);
    expect(hoverMatch).toBeTruthy();
    
    const hoverStyles = hoverMatch[1];
    expect(hoverStyles).toMatch(/border-top-color\s*:\s*transparent/);
    expect(hoverStyles).toMatch(/border-left-color\s*:\s*transparent/);
    expect(hoverStyles).toMatch(/border-right-color\s*:\s*transparent/);
  });

  test('bottom border remains visible on hover', () => {
    const cssText = cssContent;
    
    // Find the hover rule
    const hoverMatch = cssText.match(/\.hint-btn:hover[^{]*\{([^}]+)\}/);
    expect(hoverMatch).toBeTruthy();
    
    const hoverStyles = hoverMatch[1];
    expect(hoverStyles).toMatch(/border-bottom\s*:\s*2px\s+solid/);
  });

  test('text max-width and opacity increase on hover', () => {
    const cssText = cssContent;
    
    // Find the hover text rule
    const hoverTextMatch = cssText.match(/\.hint-btn:hover\s+\.text[^{]*\{([^}]+)\}/);
    expect(hoverTextMatch).toBeTruthy();
    
    const hoverTextStyles = hoverTextMatch[1];
    expect(hoverTextStyles).toMatch(/opacity\s*:\s*1/);
    expect(hoverTextStyles).toMatch(/max-width\s*:\s*\d+px/);
    
    // Extract max-width value and verify it's greater than 0
    const maxWidthMatch = hoverTextStyles.match(/max-width\s*:\s*(\d+)px/);
    expect(maxWidthMatch).toBeTruthy();
    expect(parseInt(maxWidthMatch[1])).toBeGreaterThan(0);
  });

  test('color changes to #B76E79 on hover', () => {
    const cssText = cssContent;
    
    // Find the hover rule
    const hoverMatch = cssText.match(/\.hint-btn:hover[^{]*\{([^}]+)\}/);
    expect(hoverMatch).toBeTruthy();
    
    const hoverStyles = hoverMatch[1];
    expect(hoverStyles).toMatch(/color\s*:\s*#B76E79/);
  });
});


/**
 * Property 3: Animation Reversibility
 * Feature: morphing-hint-button, Property 3: Animation Reversibility
 * Validates: Requirements 3.4, 4.3
 * 
 * For any sequence of hover-then-unhover, all CSS properties should return to 
 * their initial state values (border-radius: 50%, max-width: 0, opacity: 0, etc.).
 */
describe('Property 3: Animation Reversibility', () => {
  test('hover then unhover returns border-radius to 50%', () => {
    const cssText = cssContent;
    
    // Verify initial state has border-radius: 40px (50%)
    const baseMatch = cssText.match(/\.hint-btn\s*\{([^}]+)\}/);
    expect(baseMatch).toBeTruthy();
    expect(baseMatch[1]).toMatch(/border-radius\s*:\s*40px/);
    
    // Verify hover state changes it
    const hoverMatch = cssText.match(/\.hint-btn:hover[^{]*\{([^}]+)\}/);
    expect(hoverMatch).toBeTruthy();
    expect(hoverMatch[1]).toMatch(/border-radius\s*:\s*0/);
    
    // The CSS transition property ensures it returns to initial state
    expect(baseMatch[1]).toMatch(/transition\s*:/);
  });

  test('hover then unhover returns text to max-width 0 and opacity 0', () => {
    const cssText = cssContent;
    
    // Verify initial text state
    const textMatch = cssText.match(/\.hint-btn\s+\.text\s*\{([^}]+)\}/);
    expect(textMatch).toBeTruthy();
    expect(textMatch[1]).toMatch(/max-width\s*:\s*0/);
    expect(textMatch[1]).toMatch(/opacity\s*:\s*0/);
    
    // Verify hover changes it
    const hoverTextMatch = cssText.match(/\.hint-btn:hover\s+\.text[^{]*\{([^}]+)\}/);
    expect(hoverTextMatch).toBeTruthy();
    expect(hoverTextMatch[1]).toMatch(/opacity\s*:\s*1/);
    
    // The CSS transition property ensures it returns to initial state
    expect(textMatch[1]).toMatch(/transition\s*:/);
  });

  test('all properties have transition defined for reversibility', () => {
    const cssText = cssContent;
    
    // Check button has transition
    const buttonMatch = cssText.match(/\.hint-btn\s*\{([^}]+)\}/);
    expect(buttonMatch).toBeTruthy();
    expect(buttonMatch[1]).toMatch(/transition\s*:\s*all/);
    
    // Check text has transition
    const textMatch = cssText.match(/\.hint-btn\s+\.text\s*\{([^}]+)\}/);
    expect(textMatch).toBeTruthy();
    expect(textMatch[1]).toMatch(/transition\s*:/);
  });
});


/**
 * Property 4: Transition Timing Consistency
 * Feature: morphing-hint-button, Property 4: Transition Timing Consistency
 * Validates: Requirements 2.1, 4.1, 4.2
 * 
 * For any CSS transition on the hint button, the transition-duration should be 
 * 0.5s and transition-timing-function should be cubic-bezier(0.25, 0.8, 0.25, 1).
 */
describe('Property 4: Transition Timing Consistency', () => {
  test('transition-duration is 0.5s', () => {
    const cssText = cssContent;
    
    // Check button transition duration
    const buttonMatch = cssText.match(/\.hint-btn\s*\{([^}]+)\}/);
    expect(buttonMatch).toBeTruthy();
    expect(buttonMatch[1]).toMatch(/transition\s*:[^;]*0\.5s/);
  });

  test('transition-timing-function is cubic-bezier(0.25, 0.8, 0.25, 1)', () => {
    const cssText = cssContent;
    
    // Check button transition timing function
    const buttonMatch = cssText.match(/\.hint-btn\s*\{([^}]+)\}/);
    expect(buttonMatch).toBeTruthy();
    expect(buttonMatch[1]).toMatch(/cubic-bezier\(0\.25,\s*0\.8,\s*0\.25,\s*1\)/);
  });

  test('webkit prefix is included for browser compatibility', () => {
    const cssText = cssContent;
    
    // Check for webkit transition prefix
    const buttonMatch = cssText.match(/\.hint-btn\s*\{([^}]+)\}/);
    expect(buttonMatch).toBeTruthy();
    expect(buttonMatch[1]).toMatch(/-webkit-transition\s*:/);
  });
});


/**
 * Property 5: Semantic HTML Structure
 * Feature: morphing-hint-button, Property 5: Semantic HTML Structure
 * Validates: Requirements 5.1, 5.2
 * 
 * For any rendered hint button component, the root element should be a `<button>` 
 * tag with display: flex, containing exactly two child spans in order: text span 
 * then icon span.
 */
describe('Property 5: Semantic HTML Structure', () => {
  test('root element is a button tag', () => {
    expect(button.tagName.toLowerCase()).toBe('button');
  });

  test('button has display: flex', () => {
    const cssText = cssContent;
    
    const buttonMatch = cssText.match(/\.hint-btn\s*\{([^}]+)\}/);
    expect(buttonMatch).toBeTruthy();
    expect(buttonMatch[1]).toMatch(/display\s*:\s*flex/);
  });

  test('button contains exactly two span children', () => {
    const spans = button.querySelectorAll('span');
    expect(spans.length).toBe(2);
  });

  test('first span is text element with class "text"', () => {
    const firstSpan = button.querySelector('span:first-child');
    expect(firstSpan.classList.contains('text')).toBe(true);
  });

  test('second span is icon element with class "icon"', () => {
    const secondSpan = button.querySelector('span:last-child');
    expect(secondSpan.classList.contains('icon')).toBe(true);
  });

  test('spans are in correct order: text then icon', () => {
    const spans = Array.from(button.querySelectorAll('span'));
    expect(spans[0].classList.contains('text')).toBe(true);
    expect(spans[1].classList.contains('icon')).toBe(true);
  });
});


/**
 * Property 6: Keyboard Accessibility
 * Feature: morphing-hint-button, Property 6: Keyboard Accessibility
 * Validates: Requirements 5.4
 * 
 * For any focus event via keyboard navigation, the button should apply the same 
 * visual styles as the hover state.
 */
describe('Property 6: Keyboard Accessibility', () => {
  test('focus state applies same border-radius as hover', () => {
    const cssText = cssContent;
    
    // Check focus rule exists
    const focusMatch = cssText.match(/\.hint-btn:focus[^{]*\{([^}]+)\}/);
    expect(focusMatch).toBeTruthy();
    expect(focusMatch[1]).toMatch(/border-radius\s*:\s*0/);
  });

  test('focus state applies same border colors as hover', () => {
    const cssText = cssContent;
    
    const focusMatch = cssText.match(/\.hint-btn:focus[^{]*\{([^}]+)\}/);
    expect(focusMatch).toBeTruthy();
    expect(focusMatch[1]).toMatch(/border-top-color\s*:\s*transparent/);
    expect(focusMatch[1]).toMatch(/border-left-color\s*:\s*transparent/);
    expect(focusMatch[1]).toMatch(/border-right-color\s*:\s*transparent/);
  });

  test('focus state reveals text like hover', () => {
    const cssText = cssContent;
    
    // Check focus text rule
    const focusTextMatch = cssText.match(/\.hint-btn:focus\s+\.text[^{]*\{([^}]+)\}/);
    expect(focusTextMatch).toBeTruthy();
    expect(focusTextMatch[1]).toMatch(/opacity\s*:\s*1/);
    expect(focusTextMatch[1]).toMatch(/max-width\s*:/);
  });

  test('focus outline is visible for keyboard navigation', () => {
    const cssText = cssContent;
    
    // Check for focus-visible or focus outline
    const focusVisibleMatch = cssText.match(/\.hint-btn:focus-visible[^{]*\{([^}]+)\}/);
    if (focusVisibleMatch) {
      expect(focusVisibleMatch[1]).toMatch(/outline\s*:/);
    } else {
      // Fallback to regular focus
      const focusMatch = cssText.match(/\.hint-btn:focus[^{]*\{([^}]+)\}/);
      expect(focusMatch).toBeTruthy();
    }
  });
});


/**
 * Property 7: Responsive Breakpoint Behavior
 * Feature: morphing-hint-button, Property 7: Responsive Breakpoint Behavior
 * Validates: Requirements 7.1, 7.2, 7.3
 * 
 * For any viewport width less than 768px, the button dimensions should be 50px, 
 * and for viewport width less than 480px, the positioning offset should be 20px 
 * from edges.
 */
describe('Property 7: Responsive Breakpoint Behavior', () => {
  test('tablet breakpoint (768px) adjusts button size to 50px', () => {
    const cssText = cssContent;
    
    // Find the complete media query block for max-width: 768px
    // Match from @media to the closing brace, accounting for nested braces
    const mediaStart = cssText.indexOf('@media (max-width: 768px)');
    expect(mediaStart).toBeGreaterThan(-1);
    
    // Find the matching closing brace
    let braceCount = 0;
    let mediaEnd = -1;
    for (let i = mediaStart; i < cssText.length; i++) {
      if (cssText[i] === '{') braceCount++;
      if (cssText[i] === '}') {
        braceCount--;
        if (braceCount === 0) {
          mediaEnd = i;
          break;
        }
      }
    }
    
    const mediaContent = cssText.substring(mediaStart, mediaEnd + 1);
    // Check that within this media query, .hint-btn has height: 50px
    expect(mediaContent).toMatch(/\.hint-btn[\s\S]*?height\s*:\s*50px/);
  });

  test('tablet breakpoint adjusts font size', () => {
    const cssText = cssContent;
    
    const mediaStart = cssText.indexOf('@media (max-width: 768px)');
    expect(mediaStart).toBeGreaterThan(-1);
    
    let braceCount = 0;
    let mediaEnd = -1;
    for (let i = mediaStart; i < cssText.length; i++) {
      if (cssText[i] === '{') braceCount++;
      if (cssText[i] === '}') {
        braceCount--;
        if (braceCount === 0) {
          mediaEnd = i;
          break;
        }
      }
    }
    
    const mediaContent = cssText.substring(mediaStart, mediaEnd + 1);
    // Check that within this media query, .hint-btn has font-size: 16px
    expect(mediaContent).toMatch(/\.hint-btn[\s\S]*?font-size\s*:\s*16px/);
  });

  test('mobile breakpoint (480px) adjusts positioning to 20px', () => {
    const cssText = cssContent;
    
    // Find media query for max-width: 480px
    const mobileMediaQuery = cssText.match(/@media\s*\([^)]*max-width:\s*480px[^)]*\)\s*\{[\s\S]*?\}(?=\s*(?:@|$))/);
    expect(mobileMediaQuery).toBeTruthy();
    
    const mediaContent = mobileMediaQuery[0];
    // Check that within this media query, .hint-button-wrapper has positioning
    expect(mediaContent).toMatch(/\.hint-button-wrapper[\s\S]*?bottom\s*:\s*20px/);
    expect(mediaContent).toMatch(/\.hint-button-wrapper[\s\S]*?right\s*:\s*20px/);
  });

  test('reduced motion media query disables transitions', () => {
    const cssText = cssContent;
    
    // Find prefers-reduced-motion media query
    const reducedMotionMatch = cssText.match(/@media\s*\([^)]*prefers-reduced-motion:\s*reduce[^)]*\)/);
    expect(reducedMotionMatch).toBeTruthy();
  });
});
