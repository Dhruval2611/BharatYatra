import { test, expect } from '@playwright/test';

// Grouping all API tests related to packages
test.describe('Packages API', () => {
    test.use({ baseURL: 'http://localhost:5000' });

    test.describe.configure({ mode: 'serial' });

    let createdPackageId: string;

    /**
     * 1. GET Request: Fetch all packages
     */
    test('should get all packages', async ({ request }) => {
        const response = await request.get('/api/packages');

        expect(response.status()).toBe(200);

        const packages = await response.json();
        expect(Array.isArray(packages)).toBeTruthy();

        if (packages.length > 0) {
            console.log('First package:', packages[0]);
        }
    });

    /**
     * 2. POST Request: Create a new package
     */
    test('should create a new package', async ({ request }) => {
        const newPackage = {
            title: 'Test Adventure Package',
            description: 'A test package created by Playwright',
            duration: '3 Days / 2 Nights',
            days: 3,
            price: 5000,
            imageUrls: ['/images/test.jpg'],
            itineraries: [{ day: 1, description: 'Test Day 1' }],
            category: ['Adventure'],
            placeTags: ['TestPlace'],
            attractionTags: ['TestAttraction']
        };

        const response = await request.post('/api/packages', {
            data: newPackage
        });

        expect(response.status()).toBe(201);

        const matchResponse = await response.json();

        expect(matchResponse.title).toBe(newPackage.title);
        expect(matchResponse.price).toBe(newPackage.price);

        createdPackageId = matchResponse.id;
        console.log('Created Package ID:', createdPackageId);
    });

    /**
     * 3. PUT Request: Update the created package
     */
    test('should update the package', async ({ request }) => {
        expect(createdPackageId).toBeDefined();

        const updatedData = {
            title: 'Updated Test Adventure Package',
            description: 'Updated description',
            duration: '4 Days / 3 Nights',
            days: 4,
            price: 6000,
            imageUrls: ['/images/test_updated.jpg'],
            itineraries: [{ day: 1, description: 'Updated Day 1' }],
            category: ['Adventure', 'Updated'], // Must be array 1-3 items
            placeTags: ['TestPlace'],
            attractionTags: ['TestAttraction']
        };

        const response = await request.put(`/api/packages/${createdPackageId}`, {
            data: updatedData
        });

        expect(response.status()).toBe(200);

        const responseBody = await response.json();
        expect(responseBody.title).toBe(updatedData.title);
        expect(responseBody.price).toBe(updatedData.price);
    });

    /**
     * 4. DELETE Request: Delete the package
     */
    test('should delete the package', async ({ request }) => {
        expect(createdPackageId).toBeDefined();

        const response = await request.delete(`/api/packages/${createdPackageId}`);

        expect(response.status()).toBe(200);

        const responseBody = await response.json();
        expect(responseBody.message).toContain('deleted successfully');

        const getResponse = await request.get(`/api/packages/${createdPackageId}`);
        expect(getResponse.status()).toBe(404);
    });
});

// Grouping all API tests related to Users
test.describe('Users API', () => {
    test.use({ baseURL: 'http://localhost:5000' });

    test.describe.configure({ mode: 'serial' });

    let createdUserId: string;
    const uniqueId = Date.now();
    const testUser = {
        username: `user_${uniqueId}`,
        email: `user_${uniqueId}@example.com`,
        phone: '1234567890',
        password: 'securepassword',
        profileImageUrl: 'http://example.com/avatar.jpg'
    };

    /**
     * 1. POST Request: Create (Register) a new user
     */
    test('should create (register) a new user', async ({ request }) => {
        const response = await request.post('/api/users', {
            data: testUser
        });

        expect(response.status()).toBe(201);

        const matchResponse = await response.json();
        expect(matchResponse.username).toBe(testUser.username);
        expect(matchResponse.email).toBe(testUser.email);

        expect(matchResponse.id).toBeDefined();
        createdUserId = matchResponse.id;
        console.log('Created User ID:', createdUserId);
    });

    /**
     * 2. GET Request: Verify data is fetched after action
     */
    test('should verify user data is fetched after creation', async ({ request }) => {
        const response = await request.get('/api/users');
        expect(response.status()).toBe(200);

        const users = await response.json();
        expect(Array.isArray(users)).toBeTruthy();

        const foundUser = users.find((u: any) => u.id == createdUserId);
        expect(foundUser).toBeDefined();
        expect(foundUser.username).toBe(testUser.username);
        console.log('User verified in database:', foundUser.username);
    });

    /**
     * 3. PUT Request: Profile Updation
     */
    test('should update user profile', async ({ request }) => {
        expect(createdUserId).toBeDefined();

        const updatedData = {
            ...testUser,
            phone: '9876543210',
            profileImageUrl: 'http://example.com/new_avatar.jpg'
        };

        const response = await request.put(`/api/users/${createdUserId}`, {
            data: updatedData
        });

        expect(response.status()).toBe(200);
        const responseBody = await response.json();

        expect(responseBody.phone).toBe('9876543210');
        expect(responseBody.profileImageUrl).toBe('http://example.com/new_avatar.jpg');
    });

    /**
     * 4. DELETE Request: Account Delete
     */
    test('should delete the user account', async ({ request }) => {
        expect(createdUserId).toBeDefined();

        const response = await request.delete(`/api/users/${createdUserId}`);
        expect(response.status()).toBe(200);

        const responseBody = await response.json();
        expect(responseBody.message).toContain('deleted successfully');

        const listResponse = await request.get('/api/users');
        const users = await listResponse.json();
        const foundUser = users.find((u: any) => u.id == createdUserId);
        expect(foundUser).toBeUndefined();
    });

});
