import mongoose from 'mongoose';
const UserSchema = new mongoose.Schema({
  email: { type: String, required: true, unique: true },
  name: { type: String, required: true },
  passwordHash: { type: String, required: true },
  role: { type: String, enum: ['student','teacher','admin'], default: 'student' },
  profile: {
    learningStyle: { type: String, enum: ['visual','auditory','reading','kinesthetic','mixed'], default: 'mixed' },
    goals: [String]
  }
},{ timestamps:true });
export default mongoose.model('User', UserSchema);