const { GoogleSpreadsheet } = require('google-spreadsheet');
const util = require('util');

class Config {
    constructor(spreadsheetId, clientEmail, privateKey) {
        this.spreadsheetId = spreadsheetId;
        this.clientEmail = clientEmail;
        this.privateKey = privateKey;
    }

    async fetchSheet() {
        // Prepare sheet
        let doc = new GoogleSpreadsheet(this.spreadsheetId);

        // Initialize Auth - see more available options at https://theoephraim.github.io/node-google-spreadsheet/#/getting-started/authentication
        await doc.useServiceAccountAuth({
            client_email: this.clientEmail,
            private_key: this.privateKey
        });

        await doc.loadInfo();

        return doc.sheetsByIndex[0];
    }

    async getRows() {
        let sheet = await this.fetchSheet();
        return await sheet.getRows();
    }

    async findRow(location, alert) {
        let rows = await this.getRows();
        let result = {};
        rows.forEach((row) => {
            if (row.location === location && row.alert === alert) {
                result = row;
                return false;
            }
        });
        return result;
    }

    async getRecipients(location, alert) {
        let row = await this.findRow(location, alert);
        return row.recipients.split("\n");
    }

    async getMessage(location, alert, parameters) {
        let row = await this.findRow(location, alert);
        return util.format(row.message, ...parameters);
    }
}

module.exports = new Config(
    process.env.GOOGLE_SPREADSHEET_ID,
    process.env.GOOGLE_CLIENT_EMAIL,
    process.env.GOOGLE_PRIVATE_KEY.replace(/\\n/g, '\n')
);