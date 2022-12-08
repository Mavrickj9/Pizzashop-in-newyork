const stripe = require("stripe")(process.env.STRIPE_SECRET_KEY);
const express = require("express");
const app = express();
const cors = require("cors");
app.use(
  cors({
    origin: "*",
  })
);

export default async function handler(req, res) {
  if (req.method === "POST") {
    const item = req.body.products;
    try {
      const params = {
        submit_type: "pay",
        mode: "payment",
        payment_method_types: ["card"],
        billing_address_collection: "auto",
        shipping_options: [
          { shipping_rate: "shr_1M1YDCIFgAVPzC843pis8hTo" },
          { shipping_rate: "shr_1M1YGRIFgAVPzC846ntgc487" },
        ],
        line_items: item.map((item) => ({
          description: item.description,
          quantity: item.quantity,
          price_data: {
            currency: "usd",
            product_data: {
              images: [item.img],
              name: item.title,
            },
            unit_amount: item.price * 100,
          },
        })),
        success_url: `${req.headers.origin}/?success=true`,
        cancel_url: `${req.headers.origin}/?canceled=true`,
      };
      // Create Checkout Sessions from body params.
      const session = await stripe.checkout.sessions.create(params);
      res.json({ url: session.url });
    } catch (err) {
      res.status(err.statusCode || 500).json(err.message);
    }
  } else {
    res.setHeader("Allow", "*");
    res.status(405).end("Method Not Allowed");
  }
}
