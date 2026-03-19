const fs = require('fs');
const { google } = require('googleapis');

async function check() {
    const envFile = fs.readFileSync('.env.local', 'utf-8');
    const envs = {};
    envFile.split('\n').forEach(line => {
        if (line.includes('=')) {
            const parts = line.split('=');
            envs[parts[0]] = parts.slice(1).join('=').replace(/^"|"$/g, '').trim();
        }
    });

    const spreadsheetId = envs['GOOGLE_OAUTH_SPREADSHEET_ID'];
    const clientEmail = envs['GOOGLE_CLIENT_EMAIL'];
    const privateKey = envs['GOOGLE_PRIVATE_KEY']?.replace(/\\n/g, "\n");

    const auth = new google.auth.GoogleAuth({
        credentials: { client_email: clientEmail, private_key: privateKey },
        scopes: ["https://www.googleapis.com/auth/spreadsheets.readonly"],
    });

    const sheets = google.sheets({ version: "v4", auth });
    const response = await sheets.spreadsheets.values.get({
        spreadsheetId,
        range: "Sheet1!A2:E",
    });

    const rows = response.data.values;
    let unsuccessful = 0;

    rows.forEach((row, i) => {
        const status = row[4] || "Applied"; // Column E is index 4
        if (status.toLowerCase().includes('reject') || status.toLowerCase().includes('unsuccessful') || status.toLowerCase().includes('ghost')) {
            unsuccessful++;
            console.log(`Row ${i + 2} is unsuccessful: [${status}] | Full row:`, row);
        }
    });

    console.log("Total Unsuccessful Count:", unsuccessful);
}

check().catch(console.error);
