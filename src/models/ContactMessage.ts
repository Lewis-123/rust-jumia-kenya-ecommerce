import mongoose, { Document, Model, Schema } from "mongoose";

export interface IContactMessage {
  fullName: string;
  email: string;
  message: string;
  isRead: boolean;
}

export interface IContactMessageDocument extends IContactMessage, Document {}

const contactMessageSchema = new Schema<IContactMessageDocument>(
  {
    fullName: {
      type: String,
      required: [true, "Full name is required."],
      trim: true,
      minlength: [2, "Full name must be at least 2 characters long."],
      maxlength: [80, "Full name cannot exceed 80 characters."],
    },

    email: {
      type: String,
      required: [true, "Email address is required."],
      lowercase: true,
      trim: true,
      match: [
        /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
        "Please provide a valid email address.",
      ],
    },

    message: {
      type: String,
      required: [true, "Message is required."],
      trim: true,
      minlength: [10, "Message must be at least 10 characters long."],
      maxlength: [1500, "Message cannot exceed 1500 characters."],
    },

    isRead: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  }
);

const ContactMessage: Model<IContactMessageDocument> =
  mongoose.models.ContactMessage ||
  mongoose.model<IContactMessageDocument>(
    "ContactMessage",
    contactMessageSchema
  );

export default ContactMessage;