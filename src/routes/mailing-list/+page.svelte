<script lang="ts">
    import MailingListForm from '$lib/MailingListForm.svelte';
</script>

<svelte:head>
    <title>Join Our Mailing List</title>
    <meta name="description" content="Subscribe to our mailing list for updates and offers." />
</svelte:head>

<div class="mailing-list-page">
    <MailingListForm />
</div>

<style>
    .mailing-list-page {
        display: flex;
        justify-content: center;
        align-items: center;
        min-height: 100vh; /* Make sure it takes full viewport height */
        background-color: #f0f2f5; /* Light background for the page */
        padding: 20px;
        box-sizing: border-box;
    }
</style>