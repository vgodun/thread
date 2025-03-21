import mongoose from "mongoose";

const threadSchema = new mongoose.Schema({
  text: {
    type: String,
    required: true,
  },
  author: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  parentId: {
    type: String,
  },
  children: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Thread",
    },
  ],
  likes: [
    {
      type: Object,
    },
  ],
  imgPosts: String,
  tags: [String], // Store Clerk user IDs as strings
});

const Thread = mongoose.models.Thread || mongoose.model("Thread", threadSchema);

export default Thread;
