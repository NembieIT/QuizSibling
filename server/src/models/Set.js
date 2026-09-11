import mongoose from 'mongoose';

const termSchema = new mongoose.Schema(
  {
    term: { type: String, required: true, trim: true },
    definition: { type: String, required: true, trim: true },
  },
  { _id: false }
);

const setSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true },
    description: { type: String, default: '', trim: true },
    terms: { type: [termSchema], required: true, validate: [(v) => v.length > 0, 'Set needs at least one term'] },
  },
  { timestamps: true }
);

const Set = mongoose.model('Set', setSchema);

export default Set;