const sgMail = require('@sendgrid/mail')

sgMail.setApiKey(process.env.SENDGRID_API_KEY)

const sendWelcomeEmail = (email, name) => {

    sgMail.send({
        to: email,
        from: 'usmansahmed@gmail.com',
        subject: 'Thanks for joining in!',
        text: `Welcome to the app, ${name}, Let us know how you get along with the app`
    })
}

const sendFarewellEmail = (email, name) => {

    sgMail.send({
        to: email,
        from: 'usmansahmed@gmail.com',
        subject: 'Thank You for using our services!',
        text: `Thank You ${name} for using our services. Please provide us with valuable feedback`
    })
}

module.exports = {
    sendWelcomeEmail,
    sendFarewellEmail
}



