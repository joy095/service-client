<script lang="ts">
	import { onMount } from 'svelte';

	// Reactive state using Svelte 5's `reactive` store pattern
	let state = $state({
		image: null as HTMLImageElement | null,
		originalSize: 0,
		width: 0,
		height: 0,
		originalWidth: 0,
		originalHeight: 0,
		brightness: 100,
		contrast: 100,
		saturation: 100,
		hue: 0,
		sepia: 0,
		rotation: 0,
		flipH: false,
		flipV: false,
		format: 'webp' as 'webp' | 'jpeg' | 'png',
		quality: 75,
		maintainAspect: true
	});

	let canvas: HTMLCanvasElement;
	let ctx: CanvasRenderingContext2D | null;
	let fileInput: HTMLInputElement;
	let uploadSection: HTMLElement;
	let editorSection: HTMLElement;
	let timeout: ReturnType<typeof setTimeout>;

	onMount(() => {
		ctx = canvas.getContext('2d');
	});

	function debouncedUpdateSizeInfo() {
		clearTimeout(timeout);
		timeout = setTimeout(updateSizeInfo, 500);
	}

	function handleFileInput(e: Event) {
		const target = e.target as HTMLInputElement;
		const file = target.files?.[0];
		if (!file) return;

		const reader = new FileReader();
		reader.onload = (event) => {
			const img = new Image();
			img.onload = () => {
				const tempCanvas = document.createElement('canvas');
				tempCanvas.width = img.naturalWidth;
				tempCanvas.height = img.naturalHeight;
				const tempCtx = tempCanvas.getContext('2d');
				if (!tempCtx) return;
				tempCtx.drawImage(img, 0, 0);

				tempCanvas.toBlob(
					(blob) => {
						if (!blob) return;
						state.originalSize = blob.size;
						const webpUrl = URL.createObjectURL(blob);
						const processedImg = new Image();
						processedImg.onload = () => {
							state.image = processedImg;
							state.originalWidth = processedImg.naturalWidth;
							state.originalHeight = processedImg.naturalHeight;
							state.width = processedImg.naturalWidth;
							state.height = processedImg.naturalHeight;
							state.format = 'webp';
							state.quality = 80;
							uploadSection.classList.add('hidden');
							editorSection.classList.remove('hidden');
							render();
						};
						processedImg.src = webpUrl;
					},
					'image/webp',
					0.8
				);
			};
			img.src = event.target?.result as string;
		};
		reader.readAsDataURL(file);
	}

	function render() {
		if (!state.image || !ctx) return;

		canvas.width = state.width;
		canvas.height = state.height;

		ctx.save();
		ctx.clearRect(0, 0, canvas.width, canvas.height);

		const centerX = canvas.width / 2;
		const centerY = canvas.height / 2;
		ctx.translate(centerX, centerY);
		ctx.rotate((state.rotation * Math.PI) / 180);
		ctx.scale(state.flipH ? -1 : 1, state.flipV ? -1 : 1);
		ctx.translate(-centerX, -centerY);

		ctx.filter = [
			`brightness(${state.brightness}%)`,
			`contrast(${state.contrast}%)`,
			`saturate(${state.saturation}%)`,
			`hue-rotate(${state.hue}deg)`,
			`sepia(${state.sepia}%)`
		].join(' ');

		ctx.drawImage(state.image, 0, 0, canvas.width, canvas.height);
		ctx.restore();
		updateSizeInfo();
	}

	async function updateSizeInfo() {
		if (!state.image || !canvas) return;
		const mimeType =
			state.format === 'png' ? 'image/png' : state.format === 'jpeg' ? 'image/jpeg' : 'image/webp';
		const quality = state.format === 'png' ? undefined : state.quality / 100;

		canvas.toBlob(
			(blob) => {
				if (!blob) return;
				const originalSizeEl = document.getElementById('originalSize');
				const editedSizeEl = document.getElementById('editedSize');
				const sizeReductionEl = document.getElementById('sizeReduction');
				const sizeInfoEl = document.getElementById('sizeInfo');

				if (!originalSizeEl || !editedSizeEl || !sizeReductionEl || !sizeInfoEl) return;

				originalSizeEl.textContent = formatSize(state.originalSize);
				editedSizeEl.textContent = formatSize(blob.size);
				const reduction = ((state.originalSize - blob.size) / state.originalSize) * 100;
				sizeReductionEl.textContent =
					reduction > 0 ? `↓ ${reduction.toFixed(1)}%` : `↑ ${Math.abs(reduction).toFixed(1)}%`;
				sizeReductionEl.className = 'size-reduction ' + (reduction > 0 ? 'positive' : 'negative');
				sizeInfoEl.classList.remove('hidden');
			},
			mimeType,
			quality
		);
	}

	function formatSize(bytes: number): string {
		if (bytes === 0) return '0 Bytes';
		const k = 1024;
		const sizes = ['Bytes', 'KB', 'MB'];
		const i = Math.floor(Math.log(bytes) / Math.log(k));
		return (bytes / Math.pow(k, i)).toFixed(2) + ' ' + sizes[i];
	}

	function rotate(deg: number) {
		state.rotation = (state.rotation + deg + 360) % 360;
	}

	function toggleFlip(direction: 'h' | 'v') {
		if (direction === 'h') state.flipH = !state.flipH;
		else state.flipV = !state.flipV;
	}

	function setPreset(preset: any) {
		let targetWidth, targetHeight;
		const aspect = state.maintainAspect;

		if (preset === 'hd') {
			targetWidth = 1920;
			targetHeight = 1080;
		} else if (preset === '2k') {
			targetWidth = 2560;
			targetHeight = 1440;
		} else {
			// Square presets: scale to fit within square while maintaining aspect if enabled
			const maxDim = preset;
			if (aspect) {
				const ratio = state.originalWidth / state.originalHeight;
				if (ratio >= 1) {
					state.width = maxDim;
					state.height = Math.round(maxDim / ratio);
				} else {
					state.height = maxDim;
					state.width = Math.round(maxDim * ratio);
				}
			} else {
				state.width = maxDim;
				state.height = maxDim;
			}
			return;
		}

		// Fixed aspect presets: scale to fit within bounds if maintaining aspect
		if (aspect) {
			const targetRatio = targetWidth / targetHeight;
			const origRatio = state.originalWidth / state.originalHeight;
			if (origRatio > targetRatio) {
				state.height = targetHeight;
				state.width = Math.round(targetHeight * origRatio);
			} else {
				state.width = targetWidth;
				state.height = Math.round(targetWidth / origRatio);
			}
		} else {
			state.width = targetWidth;
			state.height = targetHeight;
		}
	}

	function resetFilters() {
		state.brightness = 100;
		state.contrast = 100;
		state.saturation = 100;
		state.hue = 0;
		state.sepia = 0;
		state.rotation = 0;
		state.flipH = false;
		state.flipV = false;
	}

	function resetAll() {
		resetFilters();
		state.image = null;
		state.width = 0;
		state.height = 0;
		uploadSection.classList.remove('hidden');
		editorSection.classList.add('hidden');
		fileInput.value = '';
		const sizeInfo = document.getElementById('sizeInfo');
		if (sizeInfo) sizeInfo.classList.add('hidden');
	}

	$effect(() => {
		if (state.image) render();
	});

	$effect(() => {
		if (state.image) debouncedUpdateSizeInfo();
	});
</script>

<div class="container mx-auto mt-10">
	<div id="uploadSection" class="upload-card" bind:this={uploadSection}>
		<svg class="upload-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
			<path
				stroke-linecap="round"
				stroke-linejoin="round"
				stroke-width="2"
				d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
			/>
		</svg>
		<h2 class="upload-title">Upload an Image</h2>
		<p class="upload-text">Choose an image to start editing with live preview</p>
		<label>
			<input
				type="file"
				accept="image/*"
				bind:this={fileInput}
				on:change={handleFileInput}
				class="file-input"
			/>
			<span class="upload-btn">Select Image</span>
		</label>
	</div>

	<div id="editorSection" class="editor-grid hidden" bind:this={editorSection}>
		<div class="preview-panel">
			<div class="panel-header">
				<h2 class="panel-title">Live Preview</h2>
				<button on:click={resetAll} class="close-btn">✕</button>
			</div>
			<div class="canvas-container">
				<canvas id="mainCanvas" bind:this={canvas}></canvas>
			</div>
		</div>

		<div class="controls-panel">
			<div class="controls-scroll">
				<div class="control-section">
					<h3 class="section-title">Preset Sizes</h3>
					<div class="preset-buttons">
						<button on:click={() => setPreset(512)} class="preset-btn">512px Square</button>
						<button on:click={() => setPreset(1024)} class="preset-btn">1024px Square</button>
						<button on:click={() => setPreset('hd')} class="preset-btn">HD (1920x1080)</button>
						<button on:click={() => setPreset('2k')} class="preset-btn">2K (2560x1440)</button>
					</div>
				</div>

				<div class="control-section">
					<h3 class="section-title">Adjustments</h3>
					<div class="control-item">
						<label class="control-label">Brightness: {state.brightness}%</label>
						<input
							type="range"
							min="0"
							max="200"
							step="5"
							bind:value={state.brightness}
							class="slider"
						/>
					</div>
					<div class="control-item">
						<label class="control-label">Contrast: {state.contrast}%</label>
						<input
							type="range"
							min="0"
							max="200"
							step="5"
							bind:value={state.contrast}
							class="slider"
						/>
					</div>
					<div class="control-item">
						<label class="control-label">Saturation: {state.saturation}%</label>
						<input
							type="range"
							min="0"
							max="200"
							step="5"
							bind:value={state.saturation}
							class="slider"
						/>
					</div>
					<div class="control-item">
						<label class="control-label">Hue: {state.hue}°</label>
						<input type="range" min="0" max="360" step="1" bind:value={state.hue} class="slider" />
					</div>

					<div class="control-item">
						<label class="control-label">Sepia: {state.sepia}%</label>
						<input
							type="range"
							min="0"
							max="100"
							step="5"
							bind:value={state.sepia}
							class="slider"
						/>
					</div>
				</div>

				<div class="control-section">
					<h3 class="section-title">Transform</h3>
					<div class="control-item">
						<label class="control-label">Rotation: {state.rotation}°</label>

						<div class="rotation-control">
							<input
								class="slider"
								type="range"
								min="0"
								max="360"
								step="1"
								bind:value={state.rotation}
								on:input={(e) => rotate(+e.target.value)}
							/>
							<span>{state.rotation}°</span>
						</div>
					</div>
					<div class="button-group">
						<button
							on:click={() => toggleFlip('h')}
							class="transform-btn {state.flipH ? 'active' : ''}">Flip H</button
						>
						<button
							on:click={() => toggleFlip('v')}
							class="transform-btn {state.flipV ? 'active' : ''}">Flip V</button
						>
					</div>
				</div>

				<button on:click={resetFilters} class="reset-btn">Reset Filters</button>
			</div>
		</div>
	</div>
</div>

<style>
	.upload-card {
		background: white;
		border-radius: 1rem;
		box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1);
		padding: 3rem;
		text-align: center;
	}

	.upload-icon {
		width: 4rem;
		height: 4rem;
		margin: 0 auto 1rem;
		color: #9333ea;
	}

	.upload-title {
		font-size: 1.5rem;
		font-weight: 600;
		margin-bottom: 1rem;
	}

	.upload-text {
		color: #6b7280;
		margin-bottom: 1.5rem;
	}

	.file-input {
		display: none;
	}

	.upload-btn {
		display: inline-block;
		background: #9333ea;
		color: white;
		padding: 0.75rem 2rem;
		border-radius: 0.5rem;
		cursor: pointer;
		transition: background 0.2s;
		border: none;
		font-size: 1rem;
	}

	.upload-btn:hover {
		background: #7e22ce;
	}

	.editor-grid {
		display: grid;
		grid-template-columns: 1fr;
		gap: 1.5rem;
	}

	@media (min-width: 1024px) {
		.editor-grid {
			grid-template-columns: 2fr 1fr;
		}
	}

	.preview-panel,
	.controls-panel {
		background: white;
		border-radius: 1rem;
		box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1);
		padding: 1.5rem;
	}

	.panel-header {
		display: flex;
		justify-content: space-between;
		align-items: center;
		margin-bottom: 1rem;
	}

	.panel-title {
		font-size: 1.25rem;
		font-weight: 600;
	}

	.close-btn {
		background: none;
		border: none;
		color: #6b7280;
		cursor: pointer;
		padding: 0.5rem;
	}

	.canvas-container {
		display: flex;
		align-items: center;
		justify-content: center;
		background: #f9fafb;
		border-radius: 0.5rem;
		padding: 1rem;
		min-height: 400px;
	}

	#mainCanvas {
		max-width: 100%;
		height: auto;
		border-radius: 0.5rem;
		box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
	}

	.controls-scroll {
		max-height: calc(100vh - 5rem);
		overflow-y: auto;
		padding-right: 0.5rem;
	}

	.control-section {
		margin-bottom: 1.5rem;
		padding-bottom: 1.5rem;
		border-bottom: 1px solid #e5e7eb;
	}

	.section-title {
		font-weight: 600;
		font-size: 1.125rem;
		margin-bottom: 1rem;
	}

	.control-item {
		margin-bottom: 1rem;
	}

	.control-label {
		display: block;
		font-size: 0.875rem;
		font-weight: 500;
		color: #374151;
		margin-bottom: 0.5rem;
	}

	.preset-buttons {
		display: flex;
		flex-wrap: wrap;
		gap: 0.5rem;
	}

	.preset-btn {
		padding: 0.5rem 0.75rem;
		border: 2px solid #e5e7eb;
		border-radius: 0.375rem;
		background: white;
		cursor: pointer;
		font-size: 0.875rem;
		transition: all 0.2s;
	}

	.preset-btn:hover {
		background: #f3f4f6;
		border-color: #9333ea;
	}

	.slider {
		width: 100%;
		height: 0.5rem;
		border-radius: 0.25rem;
		background: #e5e7eb;
		outline: none;
		-webkit-appearance: none;
	}

	.slider::-webkit-slider-thumb {
		-webkit-appearance: none;
		width: 1.25rem;
		height: 1.25rem;
		border-radius: 50%;
		background: #9333ea;
		cursor: pointer;
	}

	.slider::-moz-range-thumb {
		width: 1.25rem;
		height: 1.25rem;
		border-radius: 50%;
		background: #9333ea;
		cursor: pointer;
		border: none;
	}

	.button-group {
		display: grid;
		grid-template-columns: 1fr 1fr;
		gap: 0.5rem;
	}

	.transform-btn {
		padding: 0.5rem 0.75rem;
		border: none;
		border-radius: 0.375rem;
		background: #e5e7eb;
		cursor: pointer;
		font-size: 0.875rem;
		transition: all 0.2s;
	}

	.transform-btn.active {
		background: #9333ea;
		color: white;
	}

	.reset-btn {
		width: 100%;
		padding: 0.5rem 1rem;
		border: none;
		border-radius: 0.5rem;
		background: #e5e7eb;
		color: #374151;
		cursor: pointer;
		transition: background 0.2s;
	}

	.hidden {
		display: none;
	}
</style>
