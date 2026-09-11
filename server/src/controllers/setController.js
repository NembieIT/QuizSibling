import Set from '../models/Set.js';

export const getSets = async (req, res) => {
  try {
    const sets = await Set.find().sort({ createdAt: -1 });
    res.json(sets);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const getSetById = async (req, res) => {
  try {
    const set = await Set.findById(req.params.id);
    if (!set) return res.status(404).json({ message: 'Set not found' });
    res.json(set);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const createSet = async (req, res) => {
  try {
    const { title, description, terms } = req.body;
    if (!title || !terms || terms.length === 0) {
      return res.status(400).json({ message: 'Title and at least one term are required' });
    }
    for (const t of terms) {
      if (!t.term || !t.definition) {
        return res.status(400).json({ message: 'Each term needs a term and definition' });
      }
    }
    const set = await Set.create({ title, description: description || '', terms });
    res.status(201).json(set);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const updateSet = async (req, res) => {
  try {
    const { title, description, terms } = req.body;
    if (!title || !terms || terms.length === 0) {
      return res.status(400).json({ message: 'Title and at least one term are required' });
    }
    const set = await Set.findByIdAndUpdate(
      req.params.id,
      { title, description: description || '', terms },
      { new: true, runValidators: true }
    );
    if (!set) return res.status(404).json({ message: 'Set not found' });
    res.json(set);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const deleteSet = async (req, res) => {
  try {
    const set = await Set.findByIdAndDelete(req.params.id);
    if (!set) return res.status(404).json({ message: 'Set not found' });
    res.json({ message: 'Set removed', id: set._id });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};