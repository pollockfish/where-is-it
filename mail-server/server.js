// Where Is It? - Mail Server
// server.js
// This server connects to a Gmail account via IMAP, checks for new emails,
// stores them in a MySQL database, and provides an API endpoint to retrieve stored emails.

// API_PASSWORD=$API_PASSWORD SQL_PASSWORD=$SQL_PASSWORD node server.js


const express = require("express");
const mysql = require("mysql2");
const app = express();
const PORT = 3000;
const cors = require('cors');

app.use(cors({ origin: ['http://127.0.0.1:4200', /\app.github\.dev$/]}));

const Imap = require("imap");
const {simpleParser} = require("mailparser");

app.use(express.json());

// Create a reusable database connection pool
const pool = mysql.createPool({
  host: "where-is-it.cja6qys804n1.us-east-2.rds.amazonaws.com",
  port: 3306,
  user: "admin",
  password: process.env.SQL_PASSWORD,
  database: "where_is_it",
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
});

const imapConfig = {
  user: "whereisitserver@gmail.com",
  password: process.env.APP_PASSWORD,      // Google requires you to generate an 'app password'
  host: "imap.gmail.com",                  // instead of you regular one when remotely connecting via IMAP
  port: 993,
  tls: true,
  tlsOptions: { rejectUnauthorized: false }
};

const imap = new Imap(imapConfig);

function checkForNewEmails() {
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
}

app.get("/api/get-stored-emails", (req, res) => {
  checkForNewEmails();

  const query = "SELECT * FROM emails";
  pool.query(query, (err, results) => {
    if (err) {
      console.error("Error fetching emails from database:", err);
      return res.status(500).send("Internal Server Error");
    }
    res.json(results);
  });
});

app.post("/api/get-stored-emails", (req, res) => {
  checkForNewEmails();

  const query = "SELECT * FROM emails";
  pool.query(query, (err, results) => {
    if (err) {
      console.error("Error fetching emails from database:", err);
      return res.status(500).send("Internal Server Error");
    }
    res.json(results);
  });
});

app.post("/api/get-emails-by-sender", async (req, res) => {
  checkForNewEmails();

  const sender = req.body.sender;

  console.log(sender);

  const query = "SELECT * FROM `emails` WHERE `sender` = ?";
  pool.query(query, [sender], (err, results) => {
    if (err) {
      console.error("Error fetching emails from database:", err);
      return res.status(500).send("Internal Server Error");
    }
    if (results.length === 0) results = [{id: 0, sender: sender, subject: "No emails found", text: "No emails found from this sender."}];
    console.log(results);
    res.json(results);
  });
});

// FIX IMAP

function insertEmailIntoDB(emailData) {
  const { subject, text } = emailData;
  var from = emailData.from.text;

  const regex = /<([^>]*)>/g;
  from = [...from.matchAll(regex)].map(match => match[1]);

  if (!from || !subject || !text ) {
    console.error("Missing required email fields.");
    return;
  }

  const query = "INSERT INTO emails (`sender`, `subject`, `text`) VALUES (?, ?, ?)";
  // "from" is replaced with "sender" when inserting into table becase "from"
  // is a reserved word in SQL and it would just cause confusion to name a value that
  pool.query(query, [from, subject, text], (err, result) => {
    if (err) {
      console.error("Error inserting email into database:", err);
    } else {
      console.log("Email inserted:", result.insertId);
    }
  });
}

checkForNewEmails();

// Start the server
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
