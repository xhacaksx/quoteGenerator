import { Subscribe } from "../models/subscribe.models.js";
import { User } from "../models/user.models.js";
import cron from "node-cron";
import nodemailer from "nodemailer";

const transporter = nodemailer.createTransport({
  service: "gmail",
  pool: true,
  auth: {
    user: process.env.user,
    pass: process.env.pass,
  },
});

function setupCronJob() {
  cron.schedule("*/3 * * * * *", async () => {
    try {
      const subscribedUsers = await Subscribe.find({ isSubscribed: true });

      for (const sub of subscribedUsers) {
        const userId = sub.subscribedBy;

        const user = await User.findById(userId);

        if (user) {
          let message = {
            from: "smartakshat007@gmail.com",
            to: user.email,
            subject: "Today's Quote...",
            text: `Quote`,
          };

          await transporter.sendMail(message);
          console.log("Emails sent successfully!");
        } else {
          console.log(`User with ID ${userId} not found.`);
        }
      }
    } catch (error) {
      console.error("Error sending emails:", error);
    }
  });
}
export { setupCronJob };
