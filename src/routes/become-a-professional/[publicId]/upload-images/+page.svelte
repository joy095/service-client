<!-- src/routes/become-a-professional/[publicId]/upload-images/+page.svelte -->
<script lang="ts">
	import { goto } from '$app/navigation';
	import { page } from '$app/stores'; // Import page store to get data
	import Icon from '@iconify/svelte';
	import { get } from 'svelte/store'; // Import get to access page store value

	const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB

	// --- File Handling (New Uploads) ---

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

	// Handle image object-fit mode (This function was also missing)
	function handleLoad(event: Event, index: number) {
		const img = event.target as HTMLImageElement;
		// Only set object-fit if not already set (e.g., for existing images loaded from URL)
		// You might refine this logic further if needed.
		if (!objectFits[index]) {
			objectFits[index] = img.naturalHeight > img.naturalWidth ? 'object-contain' : 'object-cover';
		}
	}

	// Handle outside click to close any menu (This function was also missing)
	function handleClickOutside(event: MouseEvent) {
		const target = event.target as HTMLElement;
		if (!target.closest('.menu-wrapper')) {
			openMenuIndex = null;
		}
	}

	// Import necessary lifecycle functions
	import { onDestroy, onMount } from 'svelte';
	import { browser } from '$app/environment'; // Import browser

	// Add lifecycle hooks
	onMount(() => {
		if (browser) {
			// Only run in the browser
			document.addEventListener('click', handleClickOutside);
		}
	});

	onDestroy(() => {
		if (browser) {
			// Only run in the browser
			document.removeEventListener('click', handleClickOutside);
		}
	});

	function processFiles(files: File[]) {
		error = null;
		const validFiles: File[] = [];
		for (const file of files) {
			if (!['image/png', 'image/jpeg', 'image/jpg'].includes(file.type)) {
				error = 'Only PNG and JPG files are supported.';
				console.warn('Unsupported file type:', file.name, file.type);
				continue;
			}
			if (file.size > MAX_FILE_SIZE) {
				error = 'Each file must be less than 10MB.';
				console.warn('File too large:', file.name, file.size);
				continue;
			}
			validFiles.push(file);
			const reader = new FileReader();
			reader.onload = (e) => {
				// Add new file previews to the END of the list
				// You might want different logic for insertion point.
				imagePreviews = [...imagePreviews, { src: e.target?.result as string, name: file.name }];
				objectFits = [...objectFits, '']; // Add placeholder for object-fit
				// Note: value array is updated AFTER the loop to ensure all valid files are included.
			};
			reader.readAsDataURL(file);
		}
		// Update the value array which holds the actual File objects to be uploaded
		value = [...value, ...validFiles];
		// Adding new files is a change
		if (validFiles.length > 0) {
			hasChanges = true;
		}
		console.log(
			'Processed files. New value length:',
			value.length,
			'New imagePreviews length:',
			imagePreviews.length
		);
	}

	// --- State ---
	let openMenuIndex: number | null = null;
	let imageInput: HTMLInputElement | null = null;
	// Update type to include potential 'id' for existing images if available from API
	// For now, we'll use objectName as the identifier for existing images if 'id' isn't present
	let imagePreviews: { src: string; name: string; id?: string; objectName?: string }[] = [];
	let error: string | null = null;
	let isDragging = false;
	let value: File[] = []; // Files selected for upload
	let objectFits: string[] = [];
	let hasChanges = false; // Track if user made edits

	const pageData = get(page).data;
	// console.log('Raw page data:', pageData); // Debug log

	if (pageData?.images && Array.isArray(pageData.images)) {
		// Sort by position to ensure correct initial order
		const sortedImages = [...pageData.images].sort((a, b) => a.position - b.position);

		// Map server image data to preview format
		// Assuming server returns { isPrimary: boolean, objectName: string, position: number }
		// Use objectName as src and id if available, otherwise use objectName as a temporary id
		imagePreviews = sortedImages.map((img) => {
			// Derive a name from the URL or use a generic one
			const urlParts = img.objectName.split('/');
			const fileName = urlParts[urlParts.length - 1]?.split('?')[0] || `Image_${img.position}`;
			return {
				src: img.objectName.trim(), // Trim whitespace from URL
				name: fileName,
				// If your API provides a unique 'id', use it: id: img.id
				// Otherwise, for reordering, we might need to track objectName or find another unique ID
				// For deletion, you'll likely need a unique 'id' from the API.
				objectName: img.objectName.trim() // Store original objectName for potential use
			};
		});
		// Initialize objectFits array based on the number of loaded images
		objectFits = new Array(imagePreviews.length).fill('');
		console.log('Loaded and sorted images:', imagePreviews);
		// Initially, no changes have been made
		hasChanges = false;
	} else {
		console.log('No images data found or not an array in pageData:', pageData?.images);
		imagePreviews = [];
		objectFits = [];
		hasChanges = false;
	}

	// --- Server Interaction, Image Manipulation, File Handling, Delete, Submit Logic ---
	// ... (Keep the rest of your existing logic, adapting the submitForm as shown previously)
	// Important: Ensure submitForm uses the correct logic for handling changes, new uploads, reordering, and deletion
	// based on your API endpoints and the data structure (especially finding the correct ID for deletion).

	// Example adaptation for clearPreview to mark changes:
	function clearPreview(index: number) {
		// Mark change when deleting
		hasChanges = true;
		imagePreviews = imagePreviews.filter((_, i) => i !== index);
		// Note: For new uploads in 'value', you might need different logic if 'value' indices don't align perfectly.
		// A more robust way is to manage 'value' strictly for new uploads and imagePreviews for display.
		// Let's assume imagePreviews corresponds to display order, including new uploads at the end.
		// If imagePreviews mixes existing and new, logic gets complex. Simplifying: assume imagePreviews
		// index maps to objectFits and potentially a separate tracking for new file indices if needed.
		// For now, just filter objectFits. Adjust 'value' handling if needed based on how new uploads are added.
		objectFits = objectFits.filter((_, i) => i !== index);
		if (openMenuIndex === index) openMenuIndex = null;
		// TODO: Implement actual deletion call if deleting an existing image.
		// You'll need the unique ID (img.id if API provides it) for the delete action.
	}

	// Example adaptation for move functions to mark changes:
	function moveImageUp(index: number) {
		if (index > 0) {
			[imagePreviews[index - 1], imagePreviews[index]] = [
				imagePreviews[index],
				imagePreviews[index - 1]
			];
			// Ensure objectFits moves with the image
			if (index < objectFits.length) {
				[objectFits[index - 1], objectFits[index]] = [objectFits[index], objectFits[index - 1]];
			}
			openMenuIndex = null;
			hasChanges = true; // Mark change on reorder
		}
	}

	function moveImageDown(index: number) {
		if (index < imagePreviews.length - 1) {
			[imagePreviews[index + 1], imagePreviews[index]] = [
				imagePreviews[index],
				imagePreviews[index + 1]
			];
			// Ensure objectFits moves with the image
			if (index < objectFits.length && index + 1 < objectFits.length) {
				[objectFits[index + 1], objectFits[index]] = [objectFits[index], objectFits[index + 1]];
			}
			openMenuIndex = null;
			hasChanges = true; // Mark change on reorder
		}
	}

	// --- Adapted Submit Logic (Conceptual) ---
	// Inside your submitForm function:
	async function submitForm(event: Event) {
		event.preventDefault();

		const publicId = get(page).params.publicId;
		if (!publicId) {
			console.error('Public ID not found');
			alert('Error: Could not identify business profile.');
			return;
		}

		try {
			let uploadSuccess = true;
			let reorderSuccess = true;
			let deleteSuccess = true; // If you implement individual deletes

			if (value.length > 0) {
				// --- Upload New Images ---
				console.log('Uploading new files...');
				const uploadFormData = new FormData();
				for (const file of value) {
					uploadFormData.append('images', file, file.name);
				}
				const response = await fetch(`?/add`, {
					method: 'POST',
					body: uploadFormData
				});

				if (!response.ok) {
					const errorData = await response.json();
					throw new Error(errorData.message || 'Failed to upload new images');
				}
				const uploadResult = await response.json();
				console.log('Upload result:', uploadResult);
				// Optionally, update imagePreviews with the new images returned from the API if needed
				// This might require refetching or processing the uploadResult
				// For simplicity, assume UI reflects changes, and backend handles final state.
			}

			if (hasChanges) {
				// Only send reorder if there were changes (move/delete)
				// --- Reorder Images ---
				// You need to determine the correct identifiers for your API's reorder endpoint.
				// If it's based on 'objectName' or a unique 'id' returned by the API.
				// Assuming your API expects a comma-separated list of identifiers (ids or objectNames)
				// corresponding to the new order.
				// This example uses a placeholder 'getIdForReorder' function.
				// You need to implement this based on your API requirements.
				// If your API provides a unique 'id', use that. Otherwise, 'objectName' might work if unique.
				// IMPORTANT: Ensure getIdForReorder correctly identifies the image for the API.

				// Placeholder function - Replace with logic to get the correct ID for your API
				// This is a CRITICAL part that depends on your backend API
				const getIdForReorder = (preview: { id?: string; objectName?: string }) => {
					// Example: Prefer 'id' if available, otherwise use trimmed 'objectName'
					// Check your API docs for what identifier it expects for reordering
					// return preview.id || (preview.objectName ? preview.objectName.trim() : '');
					// If your API uses 'objectName' as the ID for reordering:
					return preview.objectName ? preview.objectName.trim() : '';
				};

				const newOrder = imagePreviews
					.map((preview) => getIdForReorder(preview))
					.filter((id) => id !== '');

				if (newOrder.length > 0) {
					console.log('Sending reorder request with order:', newOrder.join(','));
					const reorderFormData = new FormData();
					reorderFormData.append('order', newOrder.join(','));

					const response = await fetch(`?/reorder`, {
						method: 'POST',
						body: reorderFormData
					});

					if (!response.ok) {
						const errorData = await response.json();
						// Decide if reorder failure is critical or just a warning
						console.error('Reorder failed:', errorData.message || response.statusText);
						// alert('Warning: Image order might not be saved.');
						// Or treat as error:
						throw new Error(errorData.message || 'Failed to reorder images');
					}
					const reorderResult = await response.json();
					console.log('Reorder result:', reorderResult);
					// Handle success/warning from reorderResult if needed
				} else {
					console.warn('New order list is empty, skipping reorder request.');
				}

				// --- Delete Images (Conceptual) ---
				// If you track deleted image IDs separately:
				// Loop through deletedIds array and call delete action for each
				// for (const deletedId of deletedIds) {
				//   const deleteFormData = new FormData();
				//   deleteFormData.append('imageId', deletedId);
				//   const response = await fetch(`?/delete`, { method: 'POST', body: deleteFormData });
				//   if (!response.ok) { ... handle error ... }
				// }
			}

			// --- Redirect Regardless ---
			// Use goto for client-side redirect after handling actions
			// Or use SvelteKit's redirect if you prefer server-side (requires throwing redirect)
			alert('Changes saved successfully!');
			goto(`/become-a-professional/${publicId}/service`); // Change to your desired redirect path
		} catch (err) {
			console.error('Submission error:', err);
			alert(err.message || 'An error occurred while saving changes.');
			// Decide if you want to redirect on error or stay
			// goto('/service');
		}
	}
</script>

<!-- Rest of your Svelte template (HTML/CSS) remains largely the same -->
<!-- Ensure the form calls submitForm -->
<!-- Make sure image previews loop correctly, especially handling existing images with IDs -->
<!-- You might want to add visual indicators for new vs. existing images -->

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
								<img
									src={preview.src}
									alt={preview.name}
									class={`h-[15rem] w-full ${objectFits[index] || 'object-cover'}`}
									on:load={(e) => handleLoad(e, index)}
								/>
							</div>
							<div class="menu-wrapper absolute top-2 left-2 z-10">
								<button
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
											class="w-full cursor-pointer px-4 py-2 text-left font-medium hover:bg-gray-100"
											on:click={() => clearPreview(index)}
										>
											Delete
										</button>
										<button
											class="w-full cursor-pointer px-4 py-2 text-left font-medium hover:bg-gray-100"
											on:click={() => moveImageUp(index)}
											disabled={index === 0}
										>
											Move Up
										</button>
										<button
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
				class="mt-6 w-full max-w-sm rounded-md bg-indigo-600 px-6 py-3 text-white hover:bg-indigo-700 focus:ring-2 focus:ring-indigo-400 focus:outline-none"
			>
				Save Changes & Continue
			</button>
		</form>
	</div>
</div>

<style>
	.first-image {
		grid-column: span 2;
	}
	.first-image div > img {
		object-fit: cover;
		height: 25rem;
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
