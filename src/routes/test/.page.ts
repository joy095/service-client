export async function load({ fetch }) {
    try {
        const healthResponse = await fetch('https://r2-worker-proxy.joykarmakar987654321.workers.dev/health');
        const healthData = await healthResponse.json();
        return { health: healthData };
    } catch (error) {
        console.error('Failed to fetch health ', error);
        return { health: { status: 'error', message: error.message } };
    }
}