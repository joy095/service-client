<script lang="ts">
	export let variant: 'ring' | 'dots' | 'pulse' = 'ring';
	export let size: 'xs' | 'sm' | 'md' | 'lg' | 'xl' = 'md';
	export let ariaLabel: string = 'Loading...';
	export let className: string = '';

	const sizeMap: Record<typeof size, string> = {
		xs: 'w-3 h-3',
		sm: 'w-4 h-4',
		md: 'w-6 h-6',
		lg: 'w-8 h-8',
		xl: 'w-12 h-12'
	};

	$: sizeClass = sizeMap[size] ?? sizeMap['md'];
</script>

{#if variant === 'ring'}
	<div
		role="status"
		aria-label={ariaLabel}
		class={`inline-block ${sizeClass} animate-spin rounded-full border-2 border-current/30 border-t-current ${className}`}
	>
		<span class="sr-only">{ariaLabel}</span>
	</div>
{:else if variant === 'dots'}
	<div role="status" aria-label={ariaLabel} class={`flex items-center gap-1 ${className}`}>
		<span
			class={`inline-block ${sizeClass} animate-bounce rounded-full bg-current [animation-delay:0ms]`}
		></span>
		<span
			class={`inline-block ${sizeClass} animate-bounce rounded-full bg-current [animation-delay:150ms]`}
		></span>
		<span
			class={`inline-block ${sizeClass} animate-bounce rounded-full bg-current [animation-delay:300ms]`}
		></span>
		<span class="sr-only">{ariaLabel}</span>
	</div>
{:else if variant === 'pulse'}
	<div role="status" aria-label={ariaLabel} class={`flex items-center justify-center ${className}`}>
		<span class={`block ${sizeClass} animate-pulse rounded-full bg-current/40`}></span>
		<span class="sr-only">{ariaLabel}</span>
	</div>
{:else}
	<div
		role="status"
		aria-label={ariaLabel}
		class={`inline-block ${sizeClass} animate-spin rounded-full border-2 border-current/30 border-t-current ${className}`}
	>
		<span class="sr-only">{ariaLabel}</span>
	</div>
{/if}
