<script lang="ts">
	import { PUBLIC_API_URL } from '$env/static/public';
	import { createEventDispatcher } from 'svelte';

	const dispatch = createEventDispatcher();

	let searchQuery = '';
	let isSearchFocused = false;
	let suggestions: string[] = [];
	let isLoading = false;
	let selectedIndex = -1;

	// Use trailing slash or ensure your backend handles it
	const API_BASE = `${PUBLIC_API_URL}/business/search/suggestions`;

	let debounceTimer: number | null = null;

	// Show icon when focused, or has text
	$: showSearchIcon = isSearchFocused || !!searchQuery;

	// Fetch suggestions when query changes and input is focused
	$: if (searchQuery && isSearchFocused) {
		if (debounceTimer) clearTimeout(debounceTimer);

		debounceTimer = window.setTimeout(async () => {
			const q = searchQuery.trim();
			if (q.length < 2) {
				suggestions = [];
				return;
			}

			isLoading = true;
			try {
				const res = await fetch(`${API_BASE}?q=${encodeURIComponent(q)}`);
				if (!res.ok) throw new Error(`HTTP ${res.status}`);

				const data = await res.json();
				suggestions = Array.isArray(data.suggestions) ? data.suggestions : [];
			} catch (err) {
				console.warn('Failed to fetch search suggestions:', err);
				suggestions = []; // Fail gracefully
			} finally {
				isLoading = false;
			}
		}, 300);
	}

	// Handle blur with delay to allow click on suggestions
	function handleBlur() {
		setTimeout(() => {
			const isClickInside = document.activeElement?.closest('.suggestion-item');
			if (!isClickInside) {
				isSearchFocused = false;
				suggestions = [];
				selectedIndex = -1;
			}
		}, 150);
	}

	// Navigate and emit event
	const navigate = (path: string) => {
		window.history.pushState({}, '', path);
		dispatch('navigate', path);
	};

	// Perform search
	function performSearch(query: string) {
		const trimmed = query?.trim();
		if (!trimmed) return;

		navigate(`/q/${encodeURIComponent(trimmed)}`);
		resetSearchState(trimmed);
	}

	function resetSearchState(query: string) {
		suggestions = [];
		selectedIndex = -1;
		isSearchFocused = false;
		searchQuery = query; // Keep the final value shown
	}

	// Handle keyboard input
	function searchQueryHandler(event: KeyboardEvent) {
		if (!isSearchFocused || suggestions.length === 0) return;

		if (event.key === 'ArrowDown') {
			event.preventDefault();
			selectedIndex = (selectedIndex + 1) % suggestions.length;
		} else if (event.key === 'ArrowUp') {
			event.preventDefault();
			selectedIndex = selectedIndex <= 0 ? suggestions.length - 1 : selectedIndex - 1;
		} else if (event.key === 'Enter') {
			event.preventDefault();
			if (selectedIndex >= 0) {
				performSearch(suggestions[selectedIndex]);
			} else {
				performSearch(searchQuery);
			}
		} else if (event.key === 'Escape') {
			event.preventDefault();
			resetSearchState(searchQuery);
		}
	}

	// Click on suggestion
	function onSuggestionClick(suggestion: string) {
		performSearch(suggestion);
	}
</script>

<div
	class="sticky top-0 z-20 flex h-14 flex-row items-center justify-between bg-white px-4 text-black transition-colors duration-200 md:px-5 dark:bg-black dark:text-white"
>
	<!-- Search Section -->
	<div class="group relative my-1 mr-7 flex items-center pl-8">
		<!-- Search Icon -->
		<div
			class="absolute left-2.5 z-10 flex h-full items-center justify-center overflow-hidden rounded-l-full border border-r-0 border-blue-500 bg-white text-gray-500"
			class:w-10={showSearchIcon}
			class:w-0={!showSearchIcon}
			class:border-0={!showSearchIcon}
			class:border-1={showSearchIcon}
			class:opacity-100={showSearchIcon}
			class:opacity-0={!showSearchIcon}
		>
			<svg
				xmlns="http://www.w3.org/2000/svg"
				fill="none"
				viewBox="0 0 24 24"
				stroke-width="1.5"
				stroke="currentColor"
				class="h-5 w-5"
			>
				<path
					stroke-linecap="round"
					stroke-linejoin="round"
					d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z"
				/>
			</svg>
		</div>

		<!-- Input Wrapper -->
		<div
			class="flex h-8 rounded-l-3xl border border-gray-400 bg-white transition-all duration-300
             group-focus-within:ml-0 group-focus-within:border-blue-500 group-focus-within:pl-2
             md:h-10 md:pl-2 dark:border-gray-500 dark:bg-gray-800"
		>
			<!-- Input -->
			<input
				type="text"
				bind:value={searchQuery}
				on:focus={() => (isSearchFocused = true)}
				on:blur={handleBlur}
				on:keyup={searchQueryHandler}
				placeholder="Search"
				aria-label="Search businesses"
				class="w-24 bg-transparent px-3 py-1 pl-3 transition-all duration-300 outline-none
                  focus:placeholder:text-gray-400
                 md:w-64 lg:w-96"
			/>
		</div>

		<!-- Search Button -->
		<button
			on:click={() => performSearch(searchQuery)}
			aria-label="Search"
			class="flex h-8 w-[40px] cursor-pointer items-center justify-center rounded-r-3xl border border-l-0 border-gray-400 bg-white/10
				transition hover:bg-gray-200 md:h-10 md:w-[60px] dark:bg-black/10 dark:hover:bg-gray-700"
		>
			<svg
				xmlns="http://www.w3.org/2000/svg"
				fill="none"
				viewBox="0 0 24 24"
				stroke-width="1.5"
				stroke="currentColor"
				class="h-5 w-5"
			>
				<path
					stroke-linecap="round"
					stroke-linejoin="round"
					d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z"
				/>
			</svg>
		</button>

		<!-- Suggestions Dropdown -->
		{#if isSearchFocused && suggestions.length > 0}
			<div
				class="absolute top-full mt-1 w-80 rounded-lg border border-gray-300 bg-white shadow-lg dark:border-gray-700 dark:bg-gray-800"
				role="listbox"
				aria-label="Search suggestions"
				style="z-index: 1000; max-height: 200px; overflow-y-auto;"
			>
				{#each suggestions as suggestion, index}
					<div
						class="suggestion-item cursor-pointer px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-700"
						class:bg-blue-100={selectedIndex === index}
						class:dark:bg-blue-900={selectedIndex === index}
						role="option"
						aria-selected={selectedIndex === index}
						on:click={() => onSuggestionClick(suggestion)}
					>
						{suggestion}
					</div>
				{/each}
			</div>
		{/if}

		<!-- Loading Indicator -->
		{#if isLoading}
			<div class="absolute top-1/2 right-12 -translate-y-1/2 transform">
				<svg
					class="h-4 w-4 animate-spin text-gray-500"
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
			</div>
		{/if}
	</div>
</div>

<!-- Global key handler -->
<svelte:window on:keydown={searchQueryHandler} />
