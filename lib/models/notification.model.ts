import mongoose from "mongoose";

const notificationSchema = new mongoose.Schema({
  recipient: {
    type: String,
    ref: "User",
    required: true,
  },
  sender: {
    type: String,
    ref: "User",
    required: true,
  },
  type: {
    type: String,
    enum: ["mention", "like", "comment", "follow"],
    required: true,
  },
  threadId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Thread",
  },
  read: {
    type: Boolean,
    default: false,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

const Notification = mongoose.models.Notification || mongoose.model("Notification", notificationSchema);

export default Notification;
