const express = require('express');
const router = express.Router();

/* GET home page. */
router.get('/', async function(req, res, next) {
  // res.render('index', { title: 'Express' });
  const {html, ttRenderMs} = await ssr(`${req.protocol}://${req.get('host')}/`);
  // Add Server-Timing! See https://w3c.github.io/server-timing/.
  res.set('Server-Timing', `Prerender;dur=${ttRenderMs};desc="Headless render time (ms)"`);
  return res.status(200).send(html); // Serve prerendered page as response.
});

router.get('/message', async function(req, res, next) {
  res.render('message', { someVar: 'some variable'});
});
router.post('/message', async function(req, res, next) {
  res.render('message', { someVar: 'some variable', layout: false});
});

router.post('/message/:id', function(req, res, next) {
  console.log(req.params.id);
  res.render('message', { someVar: req.params.id, layout: false });
});

router.get('/edge', function(req, res, next) {
  res.render('edge', { someVar: 'some variable' });
});

const stripe = require("stripe")('sk_test_51I5xBvACivmIQ25uUpnAiSAsBk7Ssxjh4oF3ix9DPiThMKqKv8qOGzukfms2AeeBU4I8J5g0CtpJRwFjvwxgQ5MQ00oAiMB7tj');

const calculateOrderAmount = (items) => {
  // Replace this constant with a calculation of the order's amount
  // Calculate the order total on the server to prevent
  // people from directly manipulating the amount on the client
  return 1400;
};
router.post("/create-payment-intent", async (req, res) => {
  const { items } = req.body;

  // Create a PaymentIntent with the order amount and currency
  const paymentIntent = await stripe.paymentIntents.create({
    amount: calculateOrderAmount(items),
    currency: "eur",
    // In the latest version of the API, specifying the `automatic_payment_methods` parameter is optional because Stripe enables its functionality by default.
    automatic_payment_methods: {
      enabled: true,
    },
  });

  res.send({
    clientSecret: paymentIntent.client_secret,
  });
});

router.post('/create-checkout-session', async (req, res) => {
  const session = await stripe.checkout.sessions.create({
    ui_mode: 'embedded',
    line_items: [
      {
        // Provide the exact Price ID (for example, pr_1234) of the product you want to sell
        price: '{{PRICE_ID}}',
        quantity: 1,
      },
    ],
    mode: 'payment',
    return_url: `${YOUR_DOMAIN}/return.html?session_id={CHECKOUT_SESSION_ID}`,
    automatic_tax: {enabled: true},
  });

  res.send({clientSecret: session.client_secret});
});



module.exports = router;
