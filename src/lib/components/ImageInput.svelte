<script lang="ts">
	let imageInput: HTMLInputElement | null = null;
	let imagePreviews: { src: string; name: string }[] = [];
	let error: string | null = null;
	let isDragging = false;
	export let value: File[] = [];

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
		// if (imageInput) imageInput.value = '';
	}

	function clearAllPreviews() {
		imagePreviews = [];
		value = [];
		if (imageInput) imageInput.value = '';
	}
</script>

<div class="w-full rounded-lg bg-white p-6 shadow-md">
	<h3 class="mb-4 text-center text-lg font-semibold text-gray-800">Upload Images</h3>
	<div
		class="flex flex-col items-center rounded-md border-2 border-dashed p-4"
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
			class="cursor-pointer rounded-md bg-indigo-600 px-4 py-2 text-white hover:bg-indigo-700 focus:ring-2 focus:ring-indigo-500 focus:outline-none"
		>
			Choose Images
		</label>
		{#if imagePreviews.length > 0}
			<div class="mt-4 grid grid-cols-2 gap-4 sm:grid-cols-3">
				{#each imagePreviews as preview, index}
					<div class="flex flex-col items-center">
						<img src={preview.src} alt={preview.name} class="h-24 w-24 rounded-md object-cover" />
						<p class="mt-1 text-xs text-gray-600">{preview.name}</p>
						<button
							on:click={() => clearPreview(index)}
							class="mt-1 text-sm text-red-500 hover:text-red-700"
							aria-label="Remove {preview.name}"
						>
							Remove
						</button>
					</div>
				{/each}
			</div>
			<button
				on:click={clearAllPreviews}
				class="mt-4 text-sm text-red-500 hover:text-red-700"
				aria-label="Clear all images"
			>
				Clear All
			</button>
		{/if}
		{#if error}
			<p class="mt-2 text-sm text-red-500">{error}</p>
		{/if}
		<p class="mt-2 text-xs text-gray-400">Supported formats: PNG, JPG. Max size: 10MB</p>
	</div>
</div>
