const express = require('express');
const axios = require('axios');
const app = express();
const PORT = process.env.PORT || 8080;
const BASE_URL = process.env.BASE_URL || `http://localhost:${PORT}`;

console.log('Starting application...');

const APIKEY = process.env.APIKEY;
const APIURL = process.env.APIURL;
const EVENTKEY = process.env.EVENTKEY;
const ACTID = process.env.ACTID;

if (!APIKEY || !APIURL || !EVENTKEY || !ACTID) {
    console.error('Missing environment variables. Exiting...');
    process.exit(1);
}

console.log('Environment variables loaded.');

app.get('/activeCampaignProxy', async (req, res) => {
    let action = req.query.action;
    let hash = req.query.hash;
    let contactId = req.query.contactId;
    let email = req.query.email;
    let eventName = req.query.eventName;
    let eventData = req.query.eventData;

    console.log('Received request:', req.query);

    if (action === 'trackEvent' && email) {
        try {
            await sendEvent(email, eventName, eventData);
            res.send("all ok");
        } catch (err) {
            res.status(400).end(err);
        }
    } else if (action === 'trackEvent' && contactId) {
        console.log("getting contact Info");
        try {
            let data = await getEmail(contactId);
            await sendEvent(data, eventName, eventData);
            res.send("sent event");
        } catch (err) {
            res.status(400).end(err);
        }
    } else if (action === 'trackEvent' && hash) {
        console.log("getting contact Info from hash");
        try {
            let data = await getEmailHash(hash);
            await sendEvent(data, eventName, eventData);
            res.send("sent event");
        } catch (err) {
            res.status(400).end(err);
        }
    } else {
        console.log(action);
        res.status(400).send('Invalid action');
    }
});

async function sendEvent(email, eventName, eventData) {
    return new Promise((resolve, reject) => {
        let url = 'https://trackcmp.net/event';
        let data = `actid=${ACTID}&key=${EVENTKEY}&event=${eventName}&eventdata=${eventData}&visit=%7B%22email%22%3A%22${encodeURIComponent(email)}%22%7D`;
        axios
            .post(url, data, { headers: { 'content-type': 'application/x-www-form-urlencoded' } })
            .then(res => resolve(res))
            .catch(error => reject(error));
    });
}

async function getEmail(contactId) {
    return new Promise((resolve, reject) => {
        let url = `${APIURL}/api/3/contacts/${contactId}`;
        axios
            .get(url, { headers: { 'Api-Token': APIKEY } })
            .then(res => resolve(res.data.contact.email))
            .catch(error => reject(error));
    });
}

async function getEmailHash(hash) {
    return new Promise((resolve, reject) => {
        let url = `${APIURL}/admin/api.php?api_action=contact_view_hash&api_key=${APIKEY}&hash=${hash}&api_output=json`;
        axios
            .get(url, { headers: { 'content-type': 'application/x-www-form-urlencoded' } })
            .then(res => resolve(res.data.email))
            .catch(error => reject(error));
    });
}

app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server running on port ${PORT}`);
    console.log(`Application is accessible at: ${BASE_URL}`);
});
