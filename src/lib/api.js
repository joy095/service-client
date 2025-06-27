const BASE_URL = 'https://dummyjson.com';

// We'll use these product categories as our property types
const PROPERTY_TYPES = {
	furniture: 'Apartment',
	'home-decoration': 'House',
	lighting: 'Cabin',
	groceries: 'Villa'
};

const LOCATIONS = [
	'Downtown',
	'Beachfront',
	'Mountain View',
	'City Center',
	'Suburbs',
	'Countryside',
	'Lakeside',
	'Urban'
];

export async function getProperties(limit = 12) {
	try {
		// Fetch all products (we'll filter them)
		const response = await fetch(`${BASE_URL}/products?limit=100`);
		const data = await response.json();

		// Filter products to only include our property-like categories
		const propertyProducts = data.products.filter((product) =>
			Object.keys(PROPERTY_TYPES).includes(product.category)
		);

		// Transform to property-like objects
		return propertyProducts.slice(0, limit).map((product, index) => ({
			id: product.id.toString(),
			title: product.title.length > 30 ? product.title.substring(0, 30) + '...' : product.title,
			location: `${LOCATIONS[index % LOCATIONS.length]}, ${product.brand}`,
			price: Math.round(product.price * 15), // Adjusted multiplier for realistic prices
			rating: (product.rating * 1.5).toFixed(1), // Adjusted scaling for ratings
			image: getBestImage(product), // Use the first image or thumbnail
			description: product.description,
			bedrooms: Math.floor(Math.random() * 5) + 1,
			bathrooms: Math.floor(Math.random() * 3) + 1,
			type: PROPERTY_TYPES[product.category] || product.category.replace('-', ' '),
			amenities: getRandomAmenities(),
			squareFeet: Math.floor(Math.random() * 2000) + 800 // Add square footage
		}));
	} catch (error) {
		console.error('Error fetching properties:', error);
		throw new Error('Failed to load properties');
	}
}

export async function getProperty(id) {
	try {
		const response = await fetch(`${BASE_URL}/products/${id}`);
		const product = await response.json();

		// Verify this is a property-like product
		if (!Object.keys(PROPERTY_TYPES).includes(product.category)) {
			throw new Error('Not a valid property type');
		}

		return {
			id: product.id.toString(),
			title: product.title,
			location: `${LOCATIONS[product.id % LOCATIONS.length]}, ${product.brand}`,
			price: Math.round(product.price * 15),
			rating: (product.rating * 1.5).toFixed(1),
			image: getBestImage(product),
			description: product.description,
			bedrooms: Math.floor(Math.random() * 5) + 1,
			bathrooms: Math.floor(Math.random() * 3) + 1,
			type: PROPERTY_TYPES[product.category] || product.category.replace('-', ' '),
			amenities: getRandomAmenities(),
			squareFeet: Math.floor(Math.random() * 2000) + 800,
			images: product.images?.length > 1 ? product.images : [getBestImage(product)],
			reviews: product.reviews || generateMockReviews(product.id)
		};
	} catch (error) {
		console.error(`Error fetching property ${id}:`, error);
		throw new Error('Failed to load property details');
	}
}

function getBestImage(product) {
	// Prefer the first image if available, otherwise use thumbnail
	return product.images?.[0] || product.thumbnail || 'https://via.placeholder.com/400x300';
}

function getRandomAmenities() {
	const allAmenities = [
		'WiFi',
		'Kitchen',
		'Washer',
		'Dryer',
		'AC',
		'Heating',
		'TV',
		'Parking',
		'Pool',
		'Gym',
		'Hot Tub',
		'Fireplace',
		'Workspace',
		'Patio',
		'BBQ Grill',
		'Garden',
		'Balcony',
		'Lake Access'
	];
	return allAmenities.sort(() => 0.5 - Math.random()).slice(0, Math.floor(Math.random() * 6) + 4); // 4-10 amenities
}

function generateMockReviews(propertyId) {
	const reviewCount = Math.floor(Math.random() * 5) + 3; // 3-8 reviews
	const reviews = [];

	for (let i = 0; i < reviewCount; i++) {
		reviews.push({
			id: `${propertyId}-${i}`,
			rating: Math.floor(Math.random() * 2) + 4, // Mostly 4-5 stars
			comment: getRandomReviewComment(),
			reviewerName: getRandomName(),
			date: new Date(Date.now() - Math.random() * 1000 * 60 * 60 * 24 * 365).toISOString()
		});
	}

	return reviews;
}

function getRandomReviewComment() {
	const comments = [
		'Great place, would stay again!',
		'Perfect location and amenities',
		'Lovely property with amazing views',
		'Clean and comfortable, exactly as described',
		'Host was very responsive and helpful',
		'Beautiful decor and spacious rooms',
		"The photos don't do it justice!",
		'Would recommend to anyone visiting the area'
	];
	return comments[Math.floor(Math.random() * comments.length)];
}

function getRandomName() {
	const firstNames = ['Alex', 'Jamie', 'Taylor', 'Morgan', 'Casey', 'Jordan', 'Riley', 'Quinn'];
	const lastNames = ['Smith', 'Johnson', 'Williams', 'Brown', 'Jones', 'Garcia', 'Miller'];
	return `${firstNames[Math.floor(Math.random() * firstNames.length)]} ${
		lastNames[Math.floor(Math.random() * lastNames.length)]
	}`;
}
