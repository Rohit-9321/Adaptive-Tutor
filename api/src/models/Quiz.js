import mongoose from 'mongoose';
const QuestionSchema = new mongoose.Schema({
  prompt: String,
  choices: [String],
  answerIndex: Number,
  explanation: String,
  difficulty: { type: Number, default: 2 }
},{ _id:false });

const QuizSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  topic: String,
  questions: [QuestionSchema],
  modelUsed: String
},{ timestamps:true });

export default mongoose.model('Quiz', QuizSchema);