<script lang="ts">
	import Icon from '@iconify/svelte';

	let imageInput: HTMLInputElement | null = null;
	let imagePreviews: { src: string; name: string }[] = [];
	let error: string | null = null;
	let isDragging = false;
	export let value: File[] = [];

	let objectFits: string[] = [];

	function handleLoad(event: Event, index: number) {
		const img = event.target as HTMLImageElement;
		objectFits[index] = img.naturalHeight > img.naturalWidth ? 'object-contain' : 'object-cover';
	}

	// Maximum file size (10MB)
	const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB in bytes

	function handleImageChange(event: Event) {
		const files = (event.target as HTMLInputElement).files;
		if (files) {
			processFiles(Array.from(files));
		}
	}

	function handleDrop(event: DragEvent) {
		event.preventDefault();
		isDragging = false;
		const files = event.dataTransfer?.files;
		if (files) {
			processFiles(Array.from(files));
		}
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

		// Update the bound value
		value = [...value, ...validFiles];
	}

	function handleDragOver(event: DragEvent) {
		event.preventDefault();
		isDragging = true;
	}

	function handleDragLeave() {
		isDragging = false;
	}

	function clearPreview(index: number) {
		imagePreviews = imagePreviews.filter((_, i) => i !== index);
		value = value.filter((_, i) => i !== index);
		objectFits = objectFits.filter((_, i) => i !== index);
	}
</script>

<div class="min-h-screen w-full rounded-lg bg-white p-6 shadow-md">
	<h3 class="mb-4 text-center text-lg font-semibold text-gray-800">Upload Images</h3>
	<div
		class="mx-auto flex max-w-2xl flex-col items-center gap-5 rounded-md border-2 border-dashed px-6 py-10"
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
					<div class={`relative ${index === 0 ? 'first-image' : ''}`}>
						<div class="h-full w-full overflow-hidden rounded-md bg-gray-100">
							<img
								src={preview.src}
								alt={preview.name}
								class={`h-[15rem] w-full ${objectFits[index] || 'object-cover'}`}
								on:load={(e) => handleLoad(e, index)}
							/>
						</div>
						<button
							on:click={() => clearPreview(index)}
							aria-label="Remove {preview.name}"
							class="absolute top-1 right-1 cursor-pointer rounded-full bg-white p-2 shadow-md hover:bg-gray-200"
						>
							<Icon icon="line-md:close" class="h-5 w-5 text-gray-500" />
						</button>
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
		grid-column: 1 / span 2;

		&::before {
			position: absolute;
			left: 1rem;
			right: auto;
			top: 1rem;
			border-radius: 0.3rem;
			content: 'Cover image';
			font-weight: 500;
			font-size: 1rem;
			background-color: #fff;
			padding-top: 0.1rem;
			padding-left: 0.5rem;
			z-index: 1;
			height: 1.8rem;
			width: 6.7rem;
		}

		div > img {
			object-fit: cover;
		}
	}
</style>
