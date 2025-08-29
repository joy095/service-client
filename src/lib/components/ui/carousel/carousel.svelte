<script lang="ts">
	import {
		type CarouselAPI,
		type CarouselProps,
		type EmblaContext,
		setEmblaContext
	} from './context.js';
	import { cn, type WithElementRef } from '$lib/utils.js';

	let {
		ref = $bindable(null),
		opts = {},
		plugins = [],
		setApi = () => {},
		orientation = 'horizontal',
		class: className,
		children,
		...restProps
	}: WithElementRef<CarouselProps> = $props();

	let carouselState = $state<EmblaContext>({
		api: undefined,
		scrollPrev,
		scrollNext,
		orientation,
		canScrollNext: false,
		canScrollPrev: false,
		handleKeyDown,
		options: opts,
		plugins,
		onInit,
		scrollSnaps: [],
		selectedIndex: 0,
		scrollTo
	});

	setEmblaContext(carouselState);

	function scrollPrev() {
		carouselState.api?.scrollPrev();
	}

	function scrollNext() {
		carouselState.api?.scrollNext();
	}

	function scrollTo(index: number, jump?: boolean) {
		carouselState.api?.scrollTo(index, jump);
	}

	function onSelect() {
		if (!carouselState.api) return;
		carouselState.selectedIndex = carouselState.api.selectedScrollSnap();
		carouselState.canScrollNext = carouselState.api.canScrollNext();
		carouselState.canScrollPrev = carouselState.api.canScrollPrev();
	}

	function onReInit() {
		if (!carouselState.api) return;
		carouselState.scrollSnaps = carouselState.api.scrollSnapList();
		onSelect();
	}

	function handleKeyDown(e: KeyboardEvent) {
		if (orientation === 'vertical') {
			if (e.key === 'ArrowUp') {
				e.preventDefault();
				scrollPrev();
			} else if (e.key === 'ArrowDown') {
				e.preventDefault();
				scrollNext();
			}
			return;
		}
		if (e.key === 'ArrowLeft') {
			e.preventDefault();
			scrollPrev();
		} else if (e.key === 'ArrowRight') {
			e.preventDefault();
			scrollNext();
		}
	}

	function onInit(event: CustomEvent<CarouselAPI>) {
		carouselState.api = event.detail;
		setApi(carouselState.api);

		carouselState.scrollSnaps = carouselState.api.scrollSnapList();
		carouselState.api.on('select', onSelect);
		onSelect();
	}

	$effect(() => {
		return () => {
			const api = carouselState.api;
			api?.off('select', onSelect);
			api?.off?.('reInit', onReInit);
		};
	});
</script>

<div
	bind:this={ref}
	data-slot="carousel"
	class={cn('relative', className)}
	role="region"
	aria-roledescription="carousel"
	{...restProps}
	data-orientation={orientation}
	tabindex="0"
	on:keydown={handleKeyDown}
>
	{@render children?.()}
</div>
