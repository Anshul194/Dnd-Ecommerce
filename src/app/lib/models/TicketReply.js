import mongoose from 'mongoose';

const ticketReplySchema = new mongoose.Schema(
  {
    ticket: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Ticket',
      required: true,
    },
    sender: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    message: {
      type: String,
      required: true,
      trim: true,
    },
    isInternal: {
      type: Boolean,
      default: false, // if true, only visible to staff
    },
  },
  {
    timestamps: true,
  }
);

export default mongoose.models.TicketReply || mongoose.model('TicketReply', ticketReplySchema);
