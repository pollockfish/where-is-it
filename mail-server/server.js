const express = require("express");
const mysql = require("mysql2");
const app = express();
const PORT = 3000;

const Imap = require("imap");
const {simpleParser} = require("mailparser");

app.use(express.json());

const imapConfig = {
  user: "whereisitserver@gmail.com",
  password: process.env.APP_PASSWORD,      // Google requires you to generate an 'app password'
  host: "imap.gmail.com",                  // instead of you regular one when remotely connecting via IMAP
  port: 993,
  tls: true,
  tlsOptions: { rejectUnauthorized: false }
};

const imap = new Imap(imapConfig);

const connection = mysql.createConnection({
  host: "where-is-it.cja6qys804n1.us-east-2.rds.amazonaws.com",
  port: 3306,
  user: "admin",
  password: process.env.SQL_PASSWORD,
  database: "where_is_it",
});

connection.connect((err) => {
  if (err) {
    console.error("Database connection failed: " + err.stack);
    return;
  }
  console.log("Connected to the database");
});

imap.once("ready", () => {
  imap.openBox("INBOX", false, (err, box) => {
    if (err) throw err;
    // Search for unseen emails since a certain date
    imap.search(["UNSEEN"], (err, results) => {
      if (err) throw err;
      if (results.length > 0) {
        const fetch = imap.fetch(results, { bodies: "", markSeen: true });
        fetch.on("message", (msg, seqno) => {
          msg.on("body", (stream, info) => {
            simpleParser(stream, (err, parsed) => {
              if (err) throw err;
              console.log(parsed);
              insertEmailIntoDB(parsed);
            });
          });
          msg.once("end", () => {
            console.log("Finished with message #%d", seqno);
          });
        });
        fetch.once("error", (err) => {
          console.log("Fetch error: " + err);
        });
        fetch.once("end", () => {
          console.log("Done fetching all messages!");
          imap.end();
        });
      } else {
        console.log("No new emails found.");
        imap.end();
      }
    });
  });
});

imap.once("error", (err) => {
  console.log(err);
});

imap.once("end", () => {
  console.log("IMAP connection ended");
});

imap.connect();

function insertEmailIntoDB(emailData) {
  const { subject, text } = emailData;
  const from = emailData.from.text;

  if (!from || !subject || !text ) {
    console.error("Missing required email fields.");
  }

  const query = "INSERT INTO emails (`sender`, `subject`, `text`) VALUES (?, ?, ?)";
  // "from" is replaced with "sender" when inserting into table becase "from"
  // is a reserved word in SQL and it would just cause confusion to name a value that
  connection.query(query, [from, subject, text], (err, result) => {
    if (err) {
      console.error("Error inserting email into database:", err);
    }
    console.log("Email inserted:", result.insertId);
  });
}

// app.post("/api/emails", (req, res) => {
//   const { sender, subject, body } = req.body;

//   if (!sender || !subject || !body) {
//     return res.status(400).send("Missing required email fields.");
//   }

//   const query = "INSERT INTO emails (sender, subject, body) VALUES (?, ?, ?)";
//   connection.query(query, [sender, subject, body], (err, result) => {
//     if (err) {
//       console.error("Error inserting email into database:", err);
//       return res.status(500).send("Error saving email.");
//     }
//     console.log("Email inserted:", result.insertId);
//     res.status(201).send(`Email with ID: ${result.insertId} saved.`);
//   });
// });

// Start the server
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
