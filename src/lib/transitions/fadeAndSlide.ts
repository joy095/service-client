// src/lib/transitions/fadeAndSlide.ts
import type { TransitionConfig } from 'svelte/transition';
import { fade, slide } from 'svelte/transition';

export function fadeAndSlide(node: Element, params = {}) {
    const { duration = 200, easing } = params;

    const fadeTransition = fade(node, { duration, easing });
    const slideTransition = slide(node, { duration, easing, axis: 'y' });

    return {
        duration: Math.max(
            fadeTransition.duration as number,
            slideTransition.duration as number
        ),
        css: (t: number) => {
            // Apply opacity from fade
            const opacity = fadeTransition.css ? Number(fadeTransition.css(t).match(/opacity:\s*([0-9.]+)/)?.[1] ?? t) : t;

            return `
                ${fadeTransition.css?.(t) ?? ''}
                ${slideTransition.css?.(t) ?? ''}
                /* Smooth opacity for all children */
                * {
                    transition: opacity ${duration}ms ${easing ? 'cubic-bezier(0.25, 0.1, 0.25, 1)' : 'ease'} ${Math.floor(duration / 3)}ms;
                    opacity: ${opacity};
                }
            `;
        },
        tick: (t: number) => {
            fadeTransition.tick?.(t);
            slideTransition.tick?.(t);
        }
    } satisfies TransitionConfig;
}