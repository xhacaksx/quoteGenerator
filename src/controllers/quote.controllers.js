import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { Subscribe } from "../models/subscribe.models.js";
import { User } from "../models/user.models.js";

const subscribeQuote = asyncHandler(async (req, res) => {
  const existingSubscription = await Subscribe.findOne({
    subscribedBy: req.user._id,
  });

  let isSubscribed = false;

  if (!existingSubscription) {
    const sub = await Subscribe.create({
      subscribedBy: req.user._id,
      isSubscribed: false,
    });

    isSubscribed = sub.isSubscribed;
  } else {
    isSubscribed = existingSubscription.isSubscribed;
  }

  console.log(existingSubscription);
  res.render("quote", {
    user: req.user,
    isSubscribed,
  });
});

const subscribe = asyncHandler(async (req, res) => {
  const updatedSubscription = await Subscribe.findOneAndUpdate(
    { subscribedBy: req.user._id },
    {
      $set: {
        isSubscribed: true,
      },
    },
    {
      new: true,
    }
  );

  //console.log(updatedSubscription);
  const sub = updatedSubscription ? updatedSubscription.isSubscribed : false;

  res.render("quote", {
    user: req.user,
    isSubscribed: sub,
  });
});

const unsubscribe = asyncHandler(async (req, res) => {
  const updatedSubscription = await Subscribe.findOneAndUpdate(
    { subscribedBy: req.user._id },
    {
      $set: {
        isSubscribed: false,
      },
    },
    {
      new: true,
    }
  );

  //console.log(updatedSubscription);
  const sub = updatedSubscription ? updatedSubscription.isSubscribed : true;

  res.render("quote", {
    user: req.user,
    isSubscribed: sub,
  });
});
export { subscribeQuote, subscribe, unsubscribe };
