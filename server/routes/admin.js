const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const { check, validationResult } = require('express-validator');
const Exam = require('../models/Exam');
const Question = require('../models/Question');

// @route   POST api/admin/exam
// @desc    Create new exam
// @access  Private (Admin)
router.post(
  '/exam',
  [
    auth,
    [
      check('title', 'Title is required').not().isEmpty(),
      check('description', 'Description is required').not().isEmpty(),
      check('duration', 'Duration is required').isNumeric()
    ]
  ],
  async (req, res) => {
    // Check if user is admin
    if (req.user.role !== 'admin') {
      return res.status(403).json({ msg: 'Admin access required' });
    }

    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    try {
      const { title, description, duration, passingScore, category } = req.body;

      const exam = new Exam({
        title,
        description,
        duration,
        passingScore: passingScore || 70,
        category
      });

      await exam.save();
      res.json(exam);
    } catch (err) {
      console.error(err.message);
      res.status(500).send('Server error');
    }
  }
);

// @route   POST api/admin/question
// @desc    Create new question
// @access  Private (Admin)
router.post(
  '/question',
  [
    auth,
    [
      check('question', 'Question is required').not().isEmpty(),
      check('options', 'Options are required').isArray({ min: 2 }),
      check('correctAnswer', 'Correct answer is required').not().isEmpty(),
      check('questionType', 'Question type must be single or multiple').isIn(['single', 'multiple'])
    ]
  ],
  async (req, res) => {
    // Check if user is admin
    if (req.user.role !== 'admin') {
      return res.status(403).json({ msg: 'Admin access required' });
    }

    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    try {
      const { question, options, correctAnswer, questionType, difficulty, category } = req.body;

      const newQuestion = new Question({
        question,
        options,
        correctAnswer: Array.isArray(correctAnswer) ? correctAnswer : [correctAnswer],
        questionType,
        difficulty: difficulty || 'medium',
        category
      });

      await newQuestion.save();
      res.json(newQuestion);
    } catch (err) {
      console.error(err.message);
      res.status(500).send('Server error');
    }
  }
);

// @route   PUT api/admin/exam/:examId/add-question/:questionId
// @desc    Add question to exam
// @access  Private (Admin)
router.put('/exam/:examId/add-question/:questionId', auth, async (req, res) => {
  // Check if user is admin
  if (req.user.role !== 'admin') {
    return res.status(403).json({ msg: 'Admin access required' });
  }

  try {
    const exam = await Exam.findById(req.params.examId);
    const question = await Question.findById(req.params.questionId);

    if (!exam || !question) {
      return res.status(404).json({ msg: 'Exam or question not found' });
    }

    // Check if question already in exam
    if (exam.questions.includes(question._id)) {
      return res.status(400).json({ msg: 'Question already in exam' });
    }

    exam.questions.push(question._id);
    await exam.save();

    res.json(exam);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
});

module.exports = router;
