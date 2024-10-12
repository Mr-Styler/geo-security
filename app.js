const fs = require('fs');
const path = require('path');
const faker = require('faker'); // You may need to install the faker library

// Real countries and cities
const data = {
    'United States': [
        'New York City', 'Los Angeles', 'Chicago', 'Houston', 'Miami',
        'Philadelphia', 'San Antonio', 'San Diego', 'Dallas', 'Austin'
    ],
    'Canada': [
        'Toronto', 'Vancouver', 'Montreal', 'Calgary', 'Ottawa',
        'Edmonton', 'Quebec City', 'Winnipeg', 'Hamilton', 'Kitchener'
    ],
    'United Kingdom': [
        'London', 'Manchester', 'Birmingham', 'Glasgow', 'Liverpool',
        'Leeds', 'Sheffield', 'Bristol', 'Newcastle', 'Nottingham'
    ],
};

const crimeTypes = ['Theft', 'Assault', 'Burglary', 'Vandalism', 'Fraud'];

// Function to generate random crime records
const generateCrimeData = (country, cities, numRecords) => {
    const records = [];

    for (let i = 0; i < numRecords; i++) {
        const city = cities[Math.floor(Math.random() * cities.length)];
        const street = `${faker.address.streetName()} ${faker.address.streetSuffix()}`;
        const crimeType = crimeTypes[Math.floor(Math.random() * crimeTypes.length)];
        const date = faker.date.between('2023-01-01', '2023-12-31').toISOString().split('T')[0];
        const latitude = faker.address.latitude();
        const longitude = faker.address.longitude();

        records.push({ country, city, street, crimeType, date, latitude, longitude });
    }

    return records;
};

// Function to save data to CSV in the specified directory
const saveToCSV = (country, records) => {
    const header = 'Country,City,Street,Crime Type,Date,Latitude,Longitude\n';
    const rows = records.map(record => `${record.country},${record.city},${record.street},${record.crimeType},${record.date},${record.latitude},${record.longitude}`).join('\n');

    const dirPath = path.join(__dirname, 'public', 'datasets');
    // Create the datasets directory if it doesn't exist
    if (!fs.existsSync(dirPath)) {
        fs.mkdirSync(dirPath, { recursive: true });
    }

    const filePath = path.join(dirPath, `${country.toLowerCase().replace(' ', '_')}.csv`);
    fs.writeFileSync(filePath, header + rows, 'utf8');
    console.log(`Crime dataset generated: ${filePath}`);
};

// Generate and save datasets for each country
for (const [country, cities] of Object.entries(data)) {
    const crimeData = generateCrimeData(country, cities, 100); // Generate 100 records for each country
    saveToCSV(country, crimeData);
}
