import mongoose from 'mongoose';
const ProgressSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  topic: String,
  score: Number,
  difficulty: Number,
  answers: [{ correct: Boolean, timeMs: Number }]
},{ timestamps:true });
export default mongoose.model('Progress', ProgressSchema);