<script lang="ts">
	// You can add any TypeScript logic here if needed for your homepage.
	// For a simple static page, it might not be necessary.
	import { fly } from 'svelte/transition';
	import { quintOut } from 'svelte/easing';
</script>

<svelte:head>
	<title>Welcome to Our Site!</title>
	<meta name="description" content="Your friendly hub for amazing content and updates." />
</svelte:head>

<div class="homepage-container">
	<header class="hero-section" in:fly={{ y: -50, duration: 800, easing: quintOut }}>
		<h1>Welcome to Our Awesome Site!</h1>
		<p>Your one-stop destination for everything you need to know and more.</p>
		<a href="/mailing-list" class="cta-button">Join Our Mailing List!</a>
	</header>

	<section class="features-section">
		<div class="feature-card" in:fly={{ x: -50, duration: 600, delay: 200 }}>
			<h2>🚀 Fast & Modern</h2>
			<p>Built with SvelteKit for a blazing-fast user experience.</p>
		</div>
		<div class="feature-card" in:fly={{ y: 50, duration: 600, delay: 400 }}>
			<h2>📧 Stay Updated</h2>
			<p>Subscribe to our mailing list for the latest news and offers.</p>
		</div>
		<div class="feature-card" in:fly={{ x: 50, duration: 600, delay: 600 }}>
			<h2>✨ Simple & Clean</h2>
			<p>A focus on usability and a sleek design.</p>
		</div>
	</section>

	<footer class="homepage-footer">
		<p>&copy; {new Date().getFullYear()} Your Company Name. All rights reserved.</p>
		<p>Made with ❤️ in India.</p>
	</footer>
</div>

<style>
	:global(body) {
		margin: 0;
		font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
		background-color: #f8f9fa;
		color: #333;
		line-height: 1.6;
	}

	.homepage-container {
		display: flex;
		flex-direction: column;
		min-height: 100vh;
		align-items: center;
		text-align: center;
		padding: 20px;
		box-sizing: border-box;
	}

	.hero-section {
		background-color: #007bff;
		color: white;
		padding: 80px 20px;
		width: 100%;
		max-width: 1000px;
		border-radius: 12px;
		margin-bottom: 40px;
		box-shadow: 0 8px 20px rgba(0, 123, 255, 0.2);
	}

	.hero-section h1 {
		font-size: 3.5em;
		margin-bottom: 15px;
		line-height: 1.2;
	}

	.hero-section p {
		font-size: 1.3em;
		margin-bottom: 30px;
		opacity: 0.9;
	}

	.cta-button {
		display: inline-block;
		background-color: #28a745; /* Green for CTA */
		color: white;
		padding: 15px 30px;
		border-radius: 8px;
		text-decoration: none;
		font-size: 1.1em;
		font-weight: bold;
		transition:
			background-color 0.3s ease,
			transform 0.2s ease;
		box-shadow: 0 4px 10px rgba(0, 0, 0, 0.1);
	}

	.cta-button:hover {
		background-color: #218838;
		transform: translateY(-3px);
	}

	.features-section {
		display: flex;
		flex-wrap: wrap;
		justify-content: center;
		gap: 30px;
		margin-bottom: 60px;
		max-width: 1200px;
	}

	.feature-card {
		background-color: white;
		padding: 30px;
		border-radius: 10px;
		box-shadow: 0 4px 15px rgba(0, 0, 0, 0.08);
		flex: 1;
		min-width: 280px;
		max-width: 350px;
		text-align: center;
		transition: transform 0.3s ease;
	}

	.feature-card:hover {
		transform: translateY(-8px);
	}

	.feature-card h2 {
		color: #007bff;
		font-size: 1.8em;
		margin-bottom: 15px;
	}

	.feature-card p {
		font-size: 1em;
		color: #555;
	}

	.homepage-footer {
		width: 100%;
		padding: 30px 20px;
		background-color: #343a40;
		color: #ccc;
		font-size: 0.9em;
		margin-top: auto; /* Pushes footer to the bottom */
	}

	.homepage-footer p {
		margin: 5px 0;
	}

	/* Responsive adjustments */
	@media (max-width: 768px) {
		.hero-section {
			padding: 60px 15px;
		}

		.hero-section h1 {
			font-size: 2.5em;
		}

		.hero-section p {
			font-size: 1.1em;
		}

		.cta-button {
			padding: 12px 25px;
			font-size: 1em;
		}

		.features-section {
			flex-direction: column;
			align-items: center;
		}

		.feature-card {
			min-width: unset;
			width: 90%;
		}
	}

	@media (max-width: 480px) {
		.hero-section h1 {
			font-size: 2em;
		}
		.hero-section p {
			font-size: 1em;
		}
	}
</style>
