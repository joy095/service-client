const BASE_URL = '/api';

// Map backend categories to more descriptive property types for the frontend display.
// Extend this object as you add more business categories in your backend.
const PROPERTY_TYPES = {
	barber: 'Barber Shop',
	// Example: Add more mappings if you have other categories in your backend
	// 'restaurant': 'Restaurant',
	// 'cafe': 'Cafe',
	// 'retail': 'Retail Store',
	// 'hotel': 'Hotel',
	// 'gym': 'Gym/Fitness Center',
	// 'salon': 'Beauty Salon'
};


/**
 * Helper function to determine the best image URL for a business.
 * Uses the ObjectName from the backend response.
 * @param {object} business - The business object from the backend.
 * @returns {string} The image URL or a placeholder.
 */
function getBestImage(business) {
	// If ObjectName exists and is not null, use it. Otherwise, use a placeholder.
	// The backend provides a full path like "uploads/...webp" directly.
	return business.ObjectName || 'https://placehold.co/400x300/cccccc/000000?text=No+Image';
}

/**
 * Generates random amenities for a property.
 * @returns {string[]} An array of random amenities.
 */
function getRandomAmenities() {
	const allAmenities = [
		'WiFi', 'Kitchen', 'Washer', 'Dryer', 'AC', 'Heating', 'TV', 'Parking',
		'Pool', 'Gym', 'Hot Tub', 'Fireplace', 'Workspace', 'Patio', 'BBQ Grill',
		'Garden', 'Balcony', 'Lake Access'
	];
	// Select a random number of amenities (between 4 and 10)
	return allAmenities.sort(() => 0.5 - Math.random()).slice(0, Math.floor(Math.random() * 6) + 4);
}

/**
 * Generates mock reviews for a property.
 * @param {string} propertyId - The ID of the property for review association.
 * @returns {object[]} An array of mock review objects.
 */
function generateMockReviews(propertyId) {
	const reviewCount = Math.floor(Math.random() * 5) + 3; // 3-8 reviews
	const reviews = [];

	for (let i = 0; i < reviewCount; i++) {
		reviews.push({
			id: `${propertyId}-${i}`,
			rating: Math.floor(Math.random() * 2) + 4, // Mostly 4-5 stars
			comment: getRandomReviewComment(),
			reviewerName: getRandomName(),
			date: new Date(Date.now() - Math.random() * 1000 * 60 * 60 * 24 * 365).toISOString() // Random date within last year
		});
	}
	return reviews;
}

/**
 * Returns a random review comment.
 * @returns {string} A random review comment.
 */
function getRandomReviewComment() {
	const comments = [
		'Great place, would stay again!', 'Perfect location and amenities',
		'Lovely property with amazing views', 'Clean and comfortable, exactly as described',
		'Host was very responsive and helpful', 'Beautiful decor and spacious rooms',
		"The photos don't do it justice!", 'Would recommend to anyone visiting the area'
	];
	return comments[Math.floor(Math.random() * comments.length)];
}

/**
 * Returns a random name for a reviewer.
 * @returns {string} A random full name.
 */
function getRandomName() {
	const firstNames = ['Alex', 'Jamie', 'Taylor', 'Morgan', 'Casey', 'Jordan', 'Riley', 'Quinn'];
	const lastNames = ['Smith', 'Johnson', 'Williams', 'Brown', 'Jones', 'Garcia', 'Miller'];
	return `${firstNames[Math.floor(Math.random() * firstNames.length)]} ${lastNames[Math.floor(Math.random() * lastNames.length)]}`;
}


/**
 * Fetches a list of properties from the backend, with pagination support.
 * @param {number} limit - The maximum number of properties to fetch (defaults to 50 for lazy loading).
 * @param {number} offset - The number of properties to skip (for pagination).
 * @returns {Promise<object[]>} An array of transformed property objects.
 */
export async function getProperties(limit = 50, offset = 0) { // Default limit 50 for lazy fetching
	try {
		// Fetch businesses from your Go backend API with limit and offset
		const response = await fetch(`${BASE_URL}/businesses?limit=${limit}&offset=${offset}`);

		if (!response.ok) {
			// Handle HTTP errors (e.g., 404, 500)
			throw new Error(`HTTP error! status: ${response.status}`);
		}

		const data = await response.json(); // Expected format: { "businesses": [...] }

		// Ensure data.businesses is an array, default to empty array if not present
		const businesses = data.businesses || [];

		// Transform backend business objects into frontend property objects
		return businesses.map((business) => ({
			id: business.id, // Use backend ID directly
			title: business.name, // Use business name as the property title
			location: `${business.city}, ${business.country}`, // Construct location from backend data

			// Generate mock data for fields not present in the backend response
			price: Math.round(Math.random() * 500 + 50), // Mock price (e.g., $50-$550)
			rating: (Math.random() * 2 + 3).toFixed(1), // Mock rating (e.g., 3.0-5.0)
			bedrooms: Math.floor(Math.random() * 5) + 1, // Mock bedrooms (1-5)
			bathrooms: Math.floor(Math.random() * 3) + 1, // Mock bathrooms (1-3)
			squareFeet: Math.floor(Math.random() * 2000) + 800, // Mock square footage (800-2800)
			amenities: getRandomAmenities(), // Mock amenities
			reviews: generateMockReviews(business.id), // Mock reviews

			image: getBestImage(business), // Use ObjectName from backend for the main image
			description: business.about || 'No description available for this business.', // Use business.about, with fallback
			type: PROPERTY_TYPES[business.category] || business.category.replace('-', ' '), // Map backend category to a display type
		}));
	} catch (error) {
		console.error('Error fetching properties:', error);
		throw new Error('Failed to load properties');
	}
}

/**
 * Fetches details for a single property by its ID from the backend.
 * @param {string} id - The ID of the property (business) to fetch.
 * @returns {Promise<object>} The transformed property object.
 */
export async function getProperty(id) {
	try {
		// Fetch a single business from your Go backend API
		const response = await fetch(`${BASE_URL}/businesses/${id}`);

		if (!response.ok) {
			throw new Error(`HTTP error! status: ${response.status}`);
		}

		const data = await response.json(); // Expected format: { "business": {...} }
		const business = data.business; // Access the nested 'business' object

		if (!business) {
			throw new Error('Business not found or invalid response structure');
		}

		// Transform backend business object into frontend property object
		return {
			id: business.id,
			title: business.name,
			location: `${business.city}, ${business.country}`,

			// Generate mock data for fields not present in the backend response
			price: Math.round(Math.random() * 500 + 50),
			rating: (Math.random() * 2 + 3).toFixed(1),
			bedrooms: Math.floor(Math.random() * 5) + 1,
			bathrooms: Math.floor(Math.random() * 3) + 1,
			squareFeet: Math.floor(Math.random() * 2000) + 800,
			amenities: getRandomAmenities(),
			reviews: generateMockReviews(business.id),

			image: getBestImage(business), // Use ObjectName for the main image
			description: business.about || 'No description available for this business.',
			type: PROPERTY_TYPES[business.category] || business.category.replace('-', ' '),

			// For the images array, use ObjectName if available, otherwise a placeholder
			images: business.ObjectName ? [business.ObjectName] : ['https://placehold.co/400x300/cccccc/000000?text=No+Image'],
		};
	} catch (error) {
		console.error(`Error fetching property ${id}:`, error);
		throw new Error('Failed to load property details');
	}
}
