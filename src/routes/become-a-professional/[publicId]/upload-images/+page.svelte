<!-- src/routes/become-a-professional/[publicId]/upload-images/+page.svelte -->
<script lang="ts">
	import { browser } from '$app/environment';
	import { goto } from '$app/navigation';
	import { page } from '$app/stores'; // Import page store to get data
	import { PUBLIC_IMAGE_URL } from '$env/static/public';
	import SecureImage from '$lib/components/SecureImage.svelte';
	import Icon from '@iconify/svelte';
	import { onDestroy, onMount } from 'svelte';
	import { get } from 'svelte/store'; // Import get to access page store value

	// --- State ---
	let openMenuIndex: number | null = $state(null); // Using runes for simpler state management
	let imageInput: HTMLInputElement | null = $state(null);
	// Structure for previews: { src: string; name: string; id?: string; file?: File }
	// id is for existing images fetched from the server
	// file is for new File objects selected by the user
	let imagePreviews: { src: string; name: string; id?: string; file?: File }[] = $state([]);
	let error: string | null = $state(null);
	let isDragging = $state(false);
	let objectFits: string[] = $state([]);
	let isSubmitting = $state(false); // State for loading spinner

	// --- Load existing images from server data ---
	// Use the data loaded by the server's load function
	const pageData = get(page).data;
	if (pageData?.images) {
		// Map server image data to preview format
		// --- FIX: Use imageId as the 'id' ---
		imagePreviews = pageData.images
			.map((img) => {
				// img is now typed based on the updated interface in +page.server.ts
				// Extract a meaningful name or create one from the URL
				let imageName = `Image ${img.position}`;
				try {
					let pathParts: string[];
					if (/^https?:\/\//.test(img.objectName.trim())) {
						// Full URL
						const url = new URL(img.objectName.trim());
						pathParts = url.pathname.split('/');
					} else {
						// Just filename/path
						pathParts = img.objectName.trim().split('/');
					}
					imageName = pathParts.pop()?.replace(/\.[^/.]+$/, '') ?? imageName;
				} catch (e) {
					console.warn('Could not parse image name from URL:', img.objectName, e);
				}

				return {
					src: img.objectName.trim(),
					name: imageName,
					// --- CORRECTED: Use imageId as the unique identifier ---
					id: img.imageId // <--- Use imageId here
					// file: undefined
				};
			})
			.sort((a, b) => {
				// Sorting logic can potentially be simplified if position is reliable,
				// but this way still works.
				const posA = pageData.images.find((i) => i.imageId === a.id)?.position ?? 0; // Use imageId for lookup
				const posB = pageData.images.find((i) => i.imageId === b.id)?.position ?? 0; // Use imageId for lookup
				return posA - posB;
			});

		objectFits = new Array(imagePreviews.length).fill('');
	}

	// --- Server Interaction ---

	// Handle image object-fit mode (for new uploads or loaded images)
	function handleLoad(event: Event, index: number) {
		const img = event.target as HTMLImageElement;
		// Only set object-fit if not already set (e.g., for existing images loaded from URL)
		if (!objectFits[index]) {
			objectFits[index] = img.naturalHeight > img.naturalWidth ? 'object-contain' : 'object-cover';
		}
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

	// --- Image Manipulation ---

	function moveImageUp(index: number) {
		if (index > 0) {
			[imagePreviews[index - 1], imagePreviews[index]] = [
				imagePreviews[index],
				imagePreviews[index - 1]
			];
			[objectFits[index - 1], objectFits[index]] = [objectFits[index], objectFits[index - 1]];
			openMenuIndex = null;
		}
	}

	function moveImageDown(index: number) {
		if (index < imagePreviews.length - 1) {
			[imagePreviews[index + 1], imagePreviews[index]] = [
				imagePreviews[index],
				imagePreviews[index + 1]
			];
			[objectFits[index + 1], objectFits[index]] = [objectFits[index], objectFits[index + 1]];
			openMenuIndex = null;
		}
	}

	// --- File Handling (New Uploads) ---

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
				// Add new file previews to the end
				// Include the File object itself for easy access during upload
				imagePreviews = [
					...imagePreviews,
					{ src: e.target?.result as string, name: file.name, file: file }
				];
				objectFits = [...objectFits, '']; // Add placeholder for object-fit
			};
			reader.readAsDataURL(file);
		}
		// Note: We no longer directly manage a separate 'value' array.
		// The File objects are now stored within imagePreviews[].file for new uploads.
		// Existing images don't have a 'file' property.
	}

	// --- Delete Image ---
	function clearPreview(index: number) {
		// Remove from previews and objectFits
		imagePreviews = imagePreviews.filter((_, i) => i !== index);
		objectFits = objectFits.filter((_, i) => i !== index);

		if (openMenuIndex === index) openMenuIndex = null;
		// No need to explicitly manage 'value' anymore as it's part of imagePreviews
	}

	// --- Submit Logic ---
	async function submitForm(event: Event) {
		event.preventDefault();
		isSubmitting = true; // Start spinner

		const publicId = get(page).params.publicId; // Get publicId from page store
		if (!publicId) {
			console.error('Public ID not found');
			alert('Error: Could not identify business profile.');
			isSubmitting = false;
			return;
		}

		try {
			let response;

			// 1. Handle New File Uploads
			// Filter previews to get only new uploads (those with a 'file' property)
			const newUploads = imagePreviews
				.filter((preview) => preview.file !== undefined)
				.map((p) => p.file) as File[];

			if (newUploads.length > 0) {
				const uploadFormData = new FormData();
				for (const file of newUploads) {
					uploadFormData.append('images', file, file.name);
				}
				response = await fetch(`?/add`, {
					method: 'POST',
					body: uploadFormData
				});

				if (!response.ok) {
					let errorMessage = 'Failed to upload new images';
					try {
						const errorData = await response.json();
						errorMessage = errorData.message || errorMessage;
					} catch (e) {
						errorMessage = `${errorMessage}: ${response.statusText}`;
					}
					throw new Error(errorMessage);
				}
				const uploadResult = await response.json();
			}

			// 2. Handle Reordering / Setting Primary
			// Send the current order of ALL image IDs (existing and new ones get temporary IDs or are handled by position)
			// The backend needs to understand the full order.
			// This assumes your backend API for reorder expects the full list of IDs in the desired order.
			// 2. Handle Reordering
			if (imagePreviews.length > 0) {
				const reorderFormData = new FormData();
				// --- This part now correctly uses imageId because imagePreviews[].id is imageId ---
				const currentOrderIds = imagePreviews
					.map((p) => p.id) // p.id is now imageId
					.filter((id) => id !== undefined)
					.join(',');
				if (currentOrderIds) {
					reorderFormData.append('order', currentOrderIds);
					response = await fetch(`?/reorder`, {
						method: 'POST',
						body: reorderFormData
					});
					if (!response.ok) {
						const errorData = await response.json();
						throw new Error(errorData.message || 'Failed to reorder images');
					}
					const reorderResult = await response.json();
				} else {
					console.log('No existing images to reorder.');
				}
			}

			// 3. Handle Deletions
			// --- FIX: Use imageId for comparison ---
			const originalImageIds = new Set(pageData?.images?.map((img: any) => img.imageId) || []); // <--- Use imageId
			const currentImageIds = new Set(
				imagePreviews.map((p) => p.id).filter((id) => id !== undefined)
			);
			const idsToDelete = [...originalImageIds].filter((id) => !currentImageIds.has(id));

			if (idsToDelete.length > 0) {
				const deletionErrors = [];
				for (const imageId of idsToDelete) {
					// imageId here is the correct UUID
					const deleteFormData = new FormData();
					// --- imageId is now the correct UUID ---
					deleteFormData.append('imageId', imageId); // <--- Correct ID sent
					response = await fetch(`?/delete`, {
						method: 'POST',
						body: deleteFormData
					});

					if (!response.ok) {
						const errorData = await response.json();
						console.error(`Failed to delete image ${imageId}:`, errorData.message);
						// Optionally, you could throw an error here to stop the process
						// or continue trying to delete others. Let's alert for now.
						deletionErrors.push(imageId);
						// Don't throw, try to continue redirecting
					}
				}

				if (deletionErrors.length > 0) {
					alert(`Failed to delete ${deletionErrors.length} image(s). Please try again.`);
				}
			}

			goto(`/become-a-professional/${publicId}/time-table`);
		} catch (err) {
			console.error('Submission error:', err);
			alert(err.message || 'An error occurred while saving changes.');
			// Decide if you want to redirect on error or stay on the page
			// goto('/service'); // Uncomment if you want to redirect even on error
		} finally {
			isSubmitting = false; // Stop spinner regardless of success or failure
		}
	}
</script>

<!-- Rest of your Svelte template (HTML/CSS) -->
<div class="min-h-screen w-full rounded-lg bg-white p-6 shadow-md">
	<h3 class="mb-4 text-center text-lg font-semibold text-gray-800">Manage Images</h3>
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
		<form
			method="POST"
			enctype="multipart/form-data"
			on:submit|preventDefault={submitForm}
			class="flex w-full flex-col items-center"
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
				Add New Images
			</label>
			{#if imagePreviews.length > 0}
				<div class="mt-4 grid w-full max-w-3xl grid-cols-2 gap-5">
					{#each imagePreviews as preview, index}
						<div class={`image-wrapper ${index === 0 ? 'first-image' : ''}`}>
							<div
								class="image-container relative h-full w-full overflow-hidden rounded-md bg-gray-100"
							>
								<SecureImage
									src={preview.file
										? preview.src
										: `${preview.src.replace(/^\/+/, '')}`}
									alt={preview.name}
									className={`w-full ${index === 0 ? 'h-[25rem]' : 'h-[15rem]'} ${objectFits[index] || 'object-cover'}`}
									on:load={(e) => handleLoad(e, index)}
								/>
							</div>
							<div class="menu-wrapper absolute top-2 left-2 z-10">
								<button
									type="button"
									class="flex h-9 w-9 cursor-pointer items-center justify-center rounded-full bg-[#EBEBEB] hover:bg-[#e7e7e7]"
									on:click={() => (openMenuIndex = openMenuIndex === index ? null : index)}
									aria-label="Image options"
								>
									<Icon class="h-5 w-5 text-black" icon="pepicons-pencil:dots-x" />
								</button>
								{#if openMenuIndex === index}
									<div
										class="absolute right-0 mt-2 w-40 rounded-md border border-gray-200 bg-white py-2 text-sm shadow-lg"
									>
										<button
											type="button"
											class="w-full cursor-pointer px-4 py-2 text-left font-medium hover:bg-gray-100"
											on:click={() => clearPreview(index)}
										>
											Delete
										</button>
										<button
											type="button"
											class="w-full cursor-pointer px-4 py-2 text-left font-medium hover:bg-gray-100"
											on:click={() => moveImageUp(index)}
											disabled={index === 0}
										>
											Move Up
										</button>
										<button
											type="button"
											class="w-full cursor-pointer px-4 py-2 text-left font-medium hover:bg-gray-100"
											on:click={() => moveImageDown(index)}
											disabled={index === imagePreviews.length - 1}
										>
											Move Down
										</button>
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
			<!-- Submit button is always present now -->
			<button
				type="submit"
				disabled={isSubmitting}
				class="mt-6 flex w-full max-w-sm items-center justify-center rounded-md bg-indigo-600 px-6 py-3 text-white hover:bg-indigo-700 focus:ring-2 focus:ring-indigo-400 focus:outline-none disabled:opacity-50"
			>
				<!-- Show spinner or text based on isSubmitting state -->
				{#if isSubmitting}
					<svg
						class="mr-3 h-5 w-5 animate-spin text-white"
						xmlns="http://www.w3.org/2000/svg"
						fill="none"
						viewBox="0 0 24 24"
					>
						<circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"
						></circle>
						<path
							class="opacity-75"
							fill="currentColor"
							d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
						></path>
					</svg>
					Saving...
				{:else}
					Save Changes & Continue
				{/if}
			</button>
		</form>
	</div>
</div>

<style>
	.first-image {
		grid-column: span 2;
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
