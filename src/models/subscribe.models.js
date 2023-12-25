import mongoose, { Schema } from "mongoose";

const subscribeSchema = new Schema(
  {
    subscribedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
    isSubscribed: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true }
);

export const Subscribe = mongoose.model("Subscribe", subscribeSchema);
