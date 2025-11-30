/* ============================================================= */
/*  server/seed.js – KNOWLEDGE BASE LOADER (SAFE MODE)           */
/* ============================================================= */

require('dotenv').config();
const mongoose = require('mongoose'); // <--- This was missing!

const MONGO_URI = process.env.MONGO_URI;

// Define the Schema for Knowledge
const KnowledgeSchema = new mongoose.Schema({
    topic: String,
    content: String,
    category: String
});

const Knowledge = mongoose.model('Knowledge', KnowledgeSchema);

// The Data to Feed the AI
const schoolData = [
    {
        topic: "School Anthem",
        category: "Identity",
        content: `The Official School Anthem:

        "You have built nations of men!
        You will make great men of them!
        Generations of scholars salute you;
        Black and grey acknowledge you.

        A life-time of feeding,
        In thought, in words, and deed.

        Esse Quam Videri!
        Esse Quam Videri!
        Esse Quam Videri!
        True to that spirit we live.

        Grasp the substance! Leave the shadow!
        Then onward to the truth.
        Esse Quam Videri - Our great family!"

        (Instructions: Recite this proudly if asked to sing).`
    },
    {
        topic: "The Big Four (Founders)",
        category: "History",
        content: `The school was founded by four visionary educators:
        1. Dr. Kofi George Konuah
        2. Gottfried Narku Alema
        3. James Akwei Halm-Addo
        4. Samuel Neils Awuletey.
        They established the school to provide affordable, high-quality education to students who could not afford the expensive government schools.`
    },
    {
        topic: "Houses and Halls",
        category: "Student Life",
        content: `The school has residential halls named after founders and prominent figures:
        1. Alema Hall
        2. Halm-Addo Hall
        3. Ellen Hall (Named after the first building, Ellen House)
        4. Plange Hall
        5. Konuah Hall
        6. Awuletey Hall`
    },
    {
        topic: "Notable Alumni (Bleoobi)",
        category: "Legacy",
        content: `Accra Academy is known as the 'School of Speakers' and 'School of Judges'.
        Notable Alumni include:
        - Rt. Hon. Edward Doe Adjaho (Former Speaker of Parliament)
        - Rt. Hon. Peter Ala Adjetey (Former Speaker of Parliament)
        - Justice Fred Apaloo (Former Chief Justice)
        - Justice Azu Crabbe (Former Chief Justice)
        - Lt. Gen. Joseph Arthur Ankrah (Former Head of State)`
    },
    {
        topic: "General Info",
        category: "General",
        content: `Location: Bubuashie, Greater Accra.
        Colors: Royal Blue, Gold, and White.
        Motto: Esse Quam Videri (To be, rather than to seem).
        Nickname: Bleoo.`
    }
];

// Run the Seeder (SAFE MODE)
const seedDB = async () => {
    try {
        await mongoose.connect(MONGO_URI);
        console.log("✅ Connected to DB.");

        // 🔒 SENIOR DEV MODIFICATION:
        // We comment this out so we don't wipe data added via Admin Dashboard.
        // await Knowledge.deleteMany({});
        // console.log("🗑️ Cleared old data...");

        console.log("🌱 Planting (Appending) immutable data...");

        await Knowledge.insertMany(schoolData);

        console.log("🎉 Database updated! (Existing data preserved)");
        mongoose.connection.close();
    } catch (err) {
        console.error("❌ Error seeding database:", err);
    }
};

seedDB();