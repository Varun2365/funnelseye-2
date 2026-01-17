// D:\\PRJ_YCT_Final\\services\\alertService.js

// Replace with your email and WhatsApp service imports
// e.g., const nodemailer = require('nodemailer');
// e.g., const twilio = require('twilio');

const sendEmailAlert = async (sponsor, inactiveMember, message) => {
    console.log(`Sending email alert to ${sponsor.email} for inactive coach ${inactiveMember.name}.`);

    // --- YOUR EMAIL LOGIC GOES HERE ---
    // Example using a placeholder service
    // const transporter = nodemailer.createTransport({...});
    // await transporter.sendMail({
    //     from: '"Your App" <noreply@yourapp.com>',
    //     to: sponsor.email,
    //     subject: 'Inactive Downline Coach Alert',
    //     html: `<p>${message}</p>`
    // });
};

const sendWhatsappAlert = async (sponsor, inactiveMember, message) => {
    console.log(`Sending WhatsApp alert to ${sponsor.phone} for inactive coach ${inactiveMember.name}.`);

    // --- YOUR WHATSAPP LOGIC GOES HERE ---
    // Example using a placeholder service (like Twilio)
    // const client = twilio(process.env.TWILIO_ACCOUNT_SID, process.env.TWILIO_AUTH_TOKEN);
    // await client.messages.create({
    //     body: message,
    //     from: `whatsapp:${process.env.TWILIO_WHATSAPP_NUMBER}`,
    //     to: `whatsapp:${sponsor.phone}`
    // });
};

const createDashboardNotification = async (sponsor, inactiveMember, message) => {
    console.log(`Creating dashboard notification for ${sponsor.email}.`);
    
    // In a real application, this might involve saving a notification to a notifications collection
    // in the database, which the sponsor's dashboard can then query.
    // For now, the inactive status in the schema is the primary dashboard update.
};

const sendAlertToSponsor = async (sponsor, inactiveMember, message) => {
    await sendEmailAlert(sponsor, inactiveMember, message);
    await sendWhatsappAlert(sponsor, inactiveMember, message);
    await createDashboardNotification(sponsor, inactiveMember, message); // The `isInactive` status in schema is the dashboard part of the update.
};

module.exports = sendAlertToSponsor;