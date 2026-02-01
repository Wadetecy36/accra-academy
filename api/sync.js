const mongoose = require('mongoose');
const fs = require('fs');
const path = require('path');
const bcrypt = require('bcryptjs');
const Student = require('./models/student');
require('dotenv').config();

const MONGO_URI = process.env.MONGO_URI;

if (!MONGO_URI) {
    console.error("❌ No MONGO_URI found in .env");
    process.exit(1);
}

async function syncData() {
    try {
        await mongoose.connect(MONGO_URI);
        console.log("✅ Connected to MongoDB");

        const csvPath = path.join(__dirname, '../csv/students.csv');
        if (!fs.existsSync(csvPath)) {
            console.error("❌ csv/students.csv not found");
            return;
        }

        const data = fs.readFileSync(csvPath, 'utf8');
        const lines = data.split('\n').slice(1); // Skip header

        console.log(`⏳ Importing ${lines.length} students...`);

        const salt = await bcrypt.genSalt(10);
        const defaultPassword = await bcrypt.hash('Student@123', salt);

        for (let line of lines) {
            if (!line.trim()) continue;

            // Improved CSV parsing for quoted values
            const parts = line.match(/(".*?"|[^",\s]+)(?=\s*,|\s*$)/g) || [];
            const cleanParts = parts.map(p => p.replace(/^"|"$/g, '').trim());

            if (cleanParts.length < 4) continue;

            const [name, index, yearStr, program, house] = cleanParts;

            // Map "Form X" to enrollmentYear
            const currentYear = new Date().getFullYear();
            let enrollmentYear = currentYear;
            if (yearStr.includes('3')) enrollmentYear = currentYear - 2;
            if (yearStr.includes('2')) enrollmentYear = currentYear - 1;

            const studentData = {
                name,
                indexNumber: index,
                enrollmentYear,
                program: program === "Science" ? "General Science" : program,
                hall: house.includes('Alema') ? 'Alema Hall' : house,
                password: defaultPassword
            };

            await Student.findOneAndUpdate(
                { indexNumber: index },
                studentData,
                { upsert: true, new: true }
            );
            console.log(`✨ Synced: ${name}`);
        }

        console.log("🎉 Sync Complete!");
        process.exit(0);
    } catch (e) {
        console.error("❌ Sync Error:", e);
        process.exit(1);
    }
}

syncData();
