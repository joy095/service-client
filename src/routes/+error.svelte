<script lang="ts">
	import { page } from '$app/stores';

	const statusMessages: Record<number, string> = {
		403: "You don't have permission to view this page.",
		404: "The page you're looking for was not found.",
		500: 'Something went wrong on our end. Please try again later.'
	};

	// Function to get appropriate image source based on error type
	function getErrorImageSrc(status: number) {
		if (status === 500) {
			return '/img/500.svg';
		} else {
			return '/img/404.svg';
		}
	}

	// Function to get appropriate alt text based on error type
	function getImageAltText(status: number) {
		if (status === 500) {
			return '500 server error icon';
		} else {
			return '404 page not found icon';
		}
	}

	// Function to get appropriate title based on error type
	function getTitleMessage(status: number) {
		if (status === 500) {
			return 'Server Error';
		} else {
			return 'Page Not Found';
		}
	}

	// Function to get appropriate description based on error type
	function getDescriptionMessage(status: number) {
		if (status === 500) {
			return "We're experiencing technical difficulties. Please try again later.";
		} else {
			return "We're working to bring it back.";
		}
	}
</script>

<svelte:head>
	<title>{`Error ${$page.status} - ${statusMessages[$page.status] || 'Unexpected Error'}`}</title>
	<meta
		name="description"
		content={statusMessages[$page.status] ||
			"We're sorry, something went wrong. Please try again later."}
	/>
</svelte:head>

<section class="">
	<div class="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
		<div
			class="inline-flex w-full flex-col items-center justify-start gap-10 pt-12 pb-12 lg:gap-16 lg:pb-28"
		>
			<div class="h-[550px] w-full rounded-lg border border-indigo-300">
				<div class="flex items-center justify-between border-b border-indigo-100 p-8">
					<div class="block">
						<svg
							width="204"
							height="18"
							viewBox="0 0 204 18"
							fill="none"
							xmlns="http://www.w3.org/2000/svg"
						>
							<circle
								cx="8.78677"
								cy="8.78677"
								r="8.78677"
								transform="matrix(1 0 0 -1 0 17.6912)"
								fill="#E0E7FF"
							/>
							<circle
								cx="8.78677"
								cy="8.78677"
								r="8.78677"
								transform="matrix(1 0 0 -1 28.1177 17.6912)"
								fill="#A5B4FC"
							/>
							<circle
								cx="8.78677"
								cy="8.78677"
								r="8.78677"
								transform="matrix(1 0 0 -1 56.2353 17.6912)"
								fill="#E0E7FF"
							/>
							<path
								d="M91.3824 8.9044C91.3824 13.7572 95.3164 17.6912 100.169 17.6912H195.066C199.919 17.6912 203.853 13.7572 203.853 8.9044C203.853 4.0516 199.919 0.117632 195.066 0.117632H100.169C95.3163 0.117632 91.3824 4.0516 91.3824 8.9044Z"
								fill="#E0E7FF"
							/>
						</svg>
					</div>
					<div class="block">
						<svg
							width="18"
							height="18"
							viewBox="0 0 18 18"
							fill="none"
							xmlns="http://www.w3.org/2000/svg"
						>
							<circle
								cx="8.78677"
								cy="8.78677"
								r="8.78677"
								transform="matrix(1 0 0 -1 0 17.6912)"
								fill="#E0E7FF"
							/>
						</svg>
					</div>
				</div>
				<div class="relative flex h-[calc(550px-85px)] flex-col items-center justify-center">
					<img
						src={getErrorImageSrc($page.status)}
						alt={getImageAltText($page.status)}
						class="h-64 w-64 object-contain"
						width="256"
						height="256"
					/>
					<div class="mt-5 block text-center">
						<h5 class="mb-1.5 text-lg leading-8 font-medium text-gray-900 md:text-xl">
							<span class="font-semibold text-indigo-600">Oops!</span>
							{getTitleMessage($page.status)}
						</h5>
						<p class="text-sm text-gray-500">{getDescriptionMessage($page.status)}</p>
					</div>
				</div>
			</div>
		</div>
	</div>
</section>
