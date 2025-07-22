<script lang="ts">
	import { browser } from '$app/environment';
	import Icon from '@iconify/svelte';
	import { onDestroy, onMount } from 'svelte';

	let openMenuIndex: number | null = null;
	let imageInput: HTMLInputElement | null = null;
	let imagePreviews: { src: string; name: string }[] = [];
	let error: string | null = null;
	let isDragging = false;
	export let value: File[] = [];
	let objectFits: string[] = [];

	// Handle image object-fit mode
	function handleLoad(event: Event, index: number) {
		const img = event.target as HTMLImageElement;
		objectFits[index] = img.naturalHeight > img.naturalWidth ? 'object-contain' : 'object-cover';
	}

	// Handle outside click to close any menu
	function handleClickOutside(event: MouseEvent) {
		const target = event.target as HTMLElement;
		if (!target.closest('.menu-wrapper')) {
			openMenuIndex = null;
		}
	}

	onMount(() => {
		if (browser) {
			document.addEventListener('click', handleClickOutside);
		}
	});

	onDestroy(() => {
		if (browser) {
			document.removeEventListener('click', handleClickOutside);
		}
	});

	const MAX_FILE_SIZE = 10 * 1024 * 1024;

	function handleImageChange(event: Event) {
		const files = (event.target as HTMLInputElement).files;
		if (files) processFiles(Array.from(files));
	}

	function handleDrop(event: DragEvent) {
		event.preventDefault();
		isDragging = false;
		const files = event.dataTransfer?.files;
		if (files) processFiles(Array.from(files));
	}

	function handleDragOver(event: DragEvent) {
		event.preventDefault();
		isDragging = true;
	}

	function handleDragLeave() {
		isDragging = false;
	}

	function processFiles(files: File[]) {
		error = null;
		const validFiles: File[] = [];

		for (const file of files) {
			if (!['image/png', 'image/jpeg', 'image/jpg'].includes(file.type)) {
				error = 'Only PNG and JPG files are supported.';
				continue;
			}
			if (file.size > MAX_FILE_SIZE) {
				error = 'Each file must be less than 10MB.';
				continue;
			}
			validFiles.push(file);

			const reader = new FileReader();
			reader.onload = (e) => {
				imagePreviews = [...imagePreviews, { src: e.target?.result as string, name: file.name }];
			};
			reader.readAsDataURL(file);
		}

		value = [...value, ...validFiles];
	}

	function clearPreview(index: number) {
		imagePreviews = imagePreviews.filter((_, i) => i !== index);
		value = value.filter((_, i) => i !== index);
		objectFits = objectFits.filter((_, i) => i !== index);
		if (openMenuIndex === index) openMenuIndex = null;
	}
</script>

<div class="min-h-screen w-full rounded-lg bg-white p-6 shadow-md">
	<h3 class="mb-4 text-center text-lg font-semibold text-gray-800">Upload Images</h3>

	<div
		class="mx-auto flex max-w-3xl flex-col items-center gap-5 rounded-md border-2 border-dashed px-6 py-10"
		class:border-indigo-600={isDragging}
		class:border-gray-300={!isDragging}
		on:drop={handleDrop}
		on:dragover={handleDragOver}
		on:dragleave={handleDragLeave}
		role="region"
		aria-label="Drag and drop images here"
	>
		<input
			type="file"
			accept="image/png,image/jpeg,image/jpg"
			bind:this={imageInput}
			on:change={handleImageChange}
			class="hidden"
			id="imageInput"
			multiple
		/>
		<label
			for="imageInput"
			class="cursor-pointer rounded-md bg-gray-800 px-5 py-3 text-white hover:bg-black focus:ring-2 focus:ring-indigo-500 focus:outline-none"
		>
			Browser
		</label>

		{#if imagePreviews.length > 0}
			<div class="mt-4 grid w-full max-w-3xl grid-cols-2 gap-5">
				{#each imagePreviews as preview, index}
					<div class={`image-wrapper ${index === 0 ? 'first-image' : ''}`}>
						<div
							class="image-container relative h-full w-full overflow-hidden rounded-md bg-gray-100"
						>
							<img
								src={preview.src}
								alt={preview.name}
								class={`h-[15rem] w-full ${objectFits[index] || 'object-cover'}`}
								on:load={(e) => handleLoad(e, index)}
							/>
						</div>
						<div class="menu-wrapper absolute top-2 left-2 z-10">
							<button
								class="flex h-9 w-9 items-center justify-center rounded-full bg-[#EBEBEB] hover:bg-[#e7e7e7]"
								on:click={() => (openMenuIndex = openMenuIndex === index ? null : index)}
							>
								<Icon class="h-5 w-5 text-black" icon="pepicons-pencil:dots-x" />
							</button>

							{#if openMenuIndex === index}
								<div
									class="absolute right-0 mt-2 w-40 rounded-md border border-gray-200 bg-white py-2 text-sm shadow-lg"
								>
									<button
										class="w-full px-4 py-2 text-left text-red-600 hover:bg-gray-100"
										on:click={() => clearPreview(index)}
									>
										Delete
									</button>
									<button class="w-full px-4 py-2 text-left hover:bg-gray-100">Edit</button>
									<button class="w-full px-4 py-2 text-left hover:bg-gray-100">Set as Cover</button>
								</div>
							{/if}
						</div>
					</div>
				{/each}
			</div>
		{/if}

		{#if error}
			<p class="mt-2 text-sm text-red-500">{error}</p>
		{/if}
		<p class="mt-2 text-2xl font-medium text-gray-800">Drag and drop</p>
		<p class="text-xs text-gray-800">or browse for photos</p>
	</div>
</div>

<style>
	.first-image {
		grid-column: span 2;

		div > img {
			object-fit: cover;
			height: 25rem;
		}
	}

	.first-image .image-container::before {
		content: 'Cover image';
		position: absolute;
		top: 0.5rem;
		left: 0.5rem;
		background-color: #fff;
		color: #000;
		font-size: 0.875rem;
		font-weight: 500;
		padding: 0.25rem 0.5rem;
		border-radius: 0.375rem;
		z-index: 10;
	}

	.image-wrapper {
		position: relative;
	}

	.menu-wrapper {
		position: absolute;
		top: 0.5rem;
		left: auto;
		right: 0.5rem;
		z-index: 20;
	}
</style>
