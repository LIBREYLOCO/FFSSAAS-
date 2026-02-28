const sqlite3 = require('sqlite3').verbose();
const db = new sqlite3.Database('./prisma/dev.db');

db.serialize(() => {
    db.each("SELECT id, businessName, referralCommissionRate FROM VeterinaryClinic", (err, row) => {
        if (err) {
            console.error(err.message);
        }
        console.log(row.id + "\t" + row.businessName + "\t" + row.referralCommissionRate);
    });
});

db.close();
