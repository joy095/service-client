<script lang="ts">
	import { enhance } from '$app/forms';
	export let data: { publicId: string };

	let success = false;
	let error: string | null = null;

	let loading = false;

	const enhanceOptions = () => {
		loading = true;

		return async ({ result }: { result: { type?: string; data?: { error?: string } } }) => {
			loading = false;
			if (result?.type === 'success') {
				success = true;
				error = null;
			} else if (result?.data?.error) {
				success = false;
				error = result.data.error;
			}
		};
	};
</script>

<form
	method="POST"
	enctype="multipart/form-data"
	use:enhance={enhanceOptions}
	class="mx-auto max-w-xl space-y-4 rounded-xl bg-white p-6 shadow"
>
	<h2 class="text-2xl font-bold">Submit Form</h2>

	<!-- Image -->
	<div>
		<label class="block font-medium">
			Image
			<input
				type="file"
				name="image"
				accept="image/*"
				required
				class="mt-2 w-full rounded border px-3 py-2"
			/>
		</label>
	</div>

	<!-- Price -->
	<div>
		<label class="block font-medium">
			Price
			<input
				type="number"
				name="price"
				min="0"
				step="0.01"
				required
				class="mt-2 w-full rounded border px-3 py-2"
			/>
		</label>
	</div>

	<!-- Description -->
	<div>
		<label class="block font-medium">
			Description
			<textarea
				name="description"
				required
				class="mt-2 w-full resize-none rounded border px-3 py-2"
				rows="3"
			></textarea>
		</label>
	</div>

	<!-- Name -->
	<div>
		<label class="block font-medium">
			Name
			<input type="text" name="name" required class="mt-2 w-full rounded border px-3 py-2" />
		</label>
	</div>

	<!-- Duration -->
	<div>
		<label class="block font-medium">
			Duration (in minutes)
			<input
				type="number"
				name="duration"
				min="1"
				required
				class="mt-2 w-full rounded border px-3 py-2"
			/>
		</label>
	</div>

	<!-- Hidden publicId -->
	<input type="hidden" name="publicId" value={data.publicId} />
	{data.publicId}

	<!-- Submit -->
	<button
		type="submit"
		class="w-full rounded bg-blue-600 py-2 font-semibold text-white transition hover:bg-blue-700 disabled:opacity-50"
		disabled={loading}
	>
		{loading ? 'Submitting...' : 'Submit'}
	</button>

	<!-- Feedback -->
	{#if success}
		<p class="mt-4 font-medium text-green-600">Service created successfully!</p>
	{:else if error}
		<p class="mt-4 font-medium text-red-600">{error}</p>
	{/if}
</form>
