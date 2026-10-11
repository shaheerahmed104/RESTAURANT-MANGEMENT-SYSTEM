# Royal Feast Restaurant - Restaurant Management System

A small university project built with **HTML5, CSS3, Bootstrap 5 and vanilla JavaScript only**.
There is no backend and no database. `localStorage` (inside the browser) saves the cart, orders,
reservations, menu changes and contact messages.

## How to run

1. Install **VS Code** and the **Live Server** extension (Ritwick Dey).
2. Open the `restaurant-management-system` folder in VS Code (File > Open Folder).
3. Right-click `index.html` and choose **Open with Live Server**.
4. You need an internet connection: Bootstrap, Bootstrap Icons, Chart.js, fonts and food photos load from CDNs.
   (Double-clicking `index.html` also works, but Live Server is recommended.)

## Project structure

```
restaurant-management-system/
  index.html     Home (hero, slider, popular dishes, offers, reviews)
  menu.html      26 dishes, search, category filters, sorting
  cart.html      quantities, remove, bill
  checkout.html  customer details, order type, payment, confirmation
  booking.html   table reservation
  deals.html     combo / family deals and offers
  about.html     story, mission, chefs
  contact.html   contact form, address, hours
  admin.html     manager dashboard
  css/style.css, css/responsive.css
  js/data.js     shared: sample menu, deals, billing rules, localStorage helpers
  js/main.js     navbar, footer, Add-to-Cart buttons, home/deals/contact
  js/menu.js  js/cart.js  js/checkout.js  js/booking.js  js/admin.js
  js/chatbot.js  floating chatbot (loaded on every page)
```

`data.js` is the one extra file. Every page loads it first. Change prices, deals or the
delivery/discount rules at the top of that file.

## Business rules (all in `js/data.js`)

| Rule | Value |
|---|---|
| Delivery fee | PKR 150 (delivery orders only) |
| Free delivery | subtotal of PKR 3,000 or more |
| Discount | 10% when subtotal is PKR 2,500 or more |
| Order statuses | Pending, Preparing, Ready, Completed, Cancelled |

Dashboard note: *Total / Today / This week* count every saved order. *Total sales* and the chart
leave out **Cancelled** orders.

## How to test each feature

1. **Menu and search** - open Menu. Type `burger` in the search box (4 results). Click a category button,
   try the Vegetarian / Spicy switches and the sort list. Type `zzz` to see the empty message.
2. **Cart** - press **Add** on a few dishes (the cart badge in the navbar updates). Open Cart:
   use + / - and the bin icon. Add up to PKR 2,500 to see the 10% discount. Refresh the page: the cart is still there.
3. **Checkout** - press **Place Order** with empty fields to see validation. Fill the form
   (phone like `0300 1234567`). Choose **Takeaway** to see the delivery fee disappear. After placing the order you get a
   number like `RF-20261011-4821`.
4. **Table booking** - submit empty to see validation, then reserve a table for a future date. Past dates and past times
   today are rejected. Each time slot accepts at most 5 bookings.
5. **Deals** - press **Add Deal**; the deal appears in the cart.
6. **Contact** - send a message with a valid email; it is saved in `localStorage`.
7. **Dashboard (`admin.html`)**
   - Click **Load Sample Data** to fill the dashboard with demo orders and reservations (useful for presenting).
   - Check the cards and the Daily / Weekly sales chart. Everything is calculated from saved records.
   - **Orders** tab: change a status with the drop-down, filter by status, click the eye icon for details.
   - **Menu Items** tab: add, edit and delete dishes. Then open Menu and the chatbot: they show your changes.
   - **Reservations** tab: change status or delete.
   - **Reset Demo Data** asks for confirmation, then clears everything and restores the original menu.
   Place a real order first and watch the dashboard numbers change.
8. **Chatbot** - click the gold chat button. Tap a suggested question or type your own. Paste an order number
   (e.g. `RF-20261011-4821`) to see its live status. Change a price in the dashboard and ask
   *"What is the price of a burger?"* again.

## Chatbot: the 25 required questions

1. What dishes are available? 2. What is the price of a burger? 3. What pizzas do you offer?
4. Which dishes are spicy? 5. Do you have vegetarian food? 6. What desserts are available?
7. What drinks do you serve? 8. What are your popular dishes? 9. What deals are available?
10. Do you have family deals? 11. What are your opening hours? 12. Where is your restaurant located?
13. Do you offer delivery? 14. What is the delivery fee? 15. How long does delivery take?
16. How can I order food? 17. How can I track my order? 18. What payment methods are available?
19. Can I customize my food? 20. What ingredients are in a dish? 21. How can I book a table?
22. Can I cancel my order? 23. What is your cheapest dish? 24. What is your most expensive dish?
25. How can I contact the restaurant?

It also understands greetings, thanks, halal, takeaway, and order / reservation IDs, and gives a fallback reply otherwise.

**How it works (good for your presentation):** `getBotReply()` cleans the message, then checks the `INTENTS` list from top to
bottom. The first intent whose `test` matches returns an answer built from the real menu in `localStorage`.

## Good to know

- **Data lives in one browser.** localStorage is per browser and per address
  (`127.0.0.1:5500` and `localhost:5500` are separate). Orders placed on one device do not appear on another.
- **The dashboard has no login**, to keep the project simple. A real system would need authentication and a server.
- **Payments are not real.** The payment option is only saved with the order.
- If a food photo fails to load, a gold "Royal Feast" placeholder is shown instead.
