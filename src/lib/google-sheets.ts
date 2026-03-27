import { google } from "googleapis";
import { ApplicationRow, generateMockData } from "./mock-data";

// Type map for google sheets cells
type SheetRow = [string, string, string, string, string, string, string, ...string[]];

export async function getJobApplications(): Promise<ApplicationRow[]> {
    try {
        if (process.env.DEMO_MODE === "true") {
            console.info("ℹ️ DEMO_MODE enabled. Serving mock data.");
            return generateMockData(75);
        }

        const spreadsheetId = process.env.GOOGLE_OAUTH_SPREADSHEET_ID;
        const clientEmail = process.env.GOOGLE_CLIENT_EMAIL;
        const privateKey = process.env.GOOGLE_PRIVATE_KEY?.replace(/\\n/g, "\n"); // Handle newline chars in Vercel/env vars

        if (!spreadsheetId || !clientEmail || !privateKey) {
            console.warn("⚠️ Google Sheets credentials missing. Using mock data instead.");
            console.warn("Please set GOOGLE_OAUTH_SPREADSHEET_ID, GOOGLE_CLIENT_EMAIL, and GOOGLE_PRIVATE_KEY in your .env.local file.");
            return generateMockData(75);
        }

        const auth = new google.auth.GoogleAuth({
            credentials: {
                client_email: clientEmail,
                private_key: privateKey,
            },
            scopes: ["https://www.googleapis.com/auth/spreadsheets.readonly"],
        });

        const sheets = google.sheets({ version: "v4", auth });

        // Columns written by n8n: A=MessageId, B=Date, C=Sender, D=SenderEmail, E=Subject, F=Message, G=Category
        const response = await sheets.spreadsheets.values.get({
            spreadsheetId,
            range: "Sheet1!A2:G",
        });

        const rows = response.data.values as SheetRow[];

        if (!rows || rows.length === 0) {
            console.log("No data found in sheet.");
            return [];
        }

        const seenIds = new Set<string>();
        const applications: ApplicationRow[] = rows.flatMap((row) => {
            const messageId = row[0] || "";
            if (messageId && seenIds.has(messageId)) return [];
            if (messageId) seenIds.add(messageId);

            // A (0) - MessageId
            // B (1) - Date
            // C (2) - Sender
            // D (3) - SenderEmail
            // E (4) - Subject
            // F (5) - Message
            // G (6) - Category

            let companyName = row[2] || "Unknown";
            const senderEmail = (row[3] || "").toLowerCase();

            // Further clean up common senders to consolidate companies on the dashboard
            if (companyName.includes('SEEK')) companyName = 'SEEK / Recruiter';
            else if (senderEmail.includes('vic.gov.au') || companyName.toLowerCase().includes('vicgov')) companyName = 'Vic Gov';
            else if (companyName.includes('donotreply') || companyName.includes('no_reply')) companyName = 'Direct Application';
            else if (companyName.includes('Heidi Hiring Team')) companyName = 'Heidi';
            else if (companyName.includes('Bunnings Group')) companyName = 'Bunnings';
            else if (companyName.includes('Deloitte Recruitment')) companyName = 'Deloitte';
            else companyName = companyName.replace("From: ", "").replace(/['"]/g, '').trim();

            return [{
                dateApplied: row[1] || "",
                company: companyName,
                role: row[4] || "",
                email: senderEmail,
                notes: row[5] || "",
                status: row[6] || "Applied",
                link: "",
                location: "",
            }];
        });

        // Optionally sort by date here if not sorted in sheet
        return applications;
    } catch (error) {
        console.error("Error fetching data from Google Sheets:", error);
        console.warn("Falling back to mock data due to API error.");
        return generateMockData(75);
    }
}
