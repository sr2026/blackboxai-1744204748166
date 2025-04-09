const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const Exam = require('../models/Exam');
const Question = require('../models/Question');
const Result = require('../models/Result');

// Get all available exams
router.get('/', auth, async (req, res) => {
  try {
    const exams = await Exam.find({ isActive: true })
      .select('-questions')
      .populate('category', 'name');
    res.json(exams);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
});

// Start an exam (get questions)
router.get('/:id/start', auth, async (req, res) => {
  try {
    const exam = await Exam.findById(req.params.id)
      .select('questions duration')
      .populate('questions', 'question options questionType');

    if (!exam) {
      return res.status(404).json({ msg: 'Exam not found' });
    }

    // Validate exam duration
    if (exam.duration <= 0 || exam.duration > 180) {
      return res.status(400).json({ msg: 'Invalid exam duration' });
    }

    // Shuffle questions and options (for security)
    const shuffledQuestions = exam.questions
      .map(q => ({
        ...q._doc,
        options: q.options.sort(() => Math.random() - 0.5)
      }))
      .sort(() => Math.random() - 0.5);

    res.json({
      examId: exam._id,
      duration: exam.duration,
      questions: shuffledQuestions
    });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
});

// Submit exam answers
router.post('/:id/submit', auth, async (req, res) => {
  try {
    const { answers } = req.body;
    const exam = await Exam.findById(req.params.id).populate('questions');

    if (!exam) {
      return res.status(404).json({ msg: 'Exam not found' });
    }

    // Calculate score
    let score = 0;
    const questionResults = exam.questions.map(question => {
      const userAnswer = answers.find(a => a.questionId.equals(question._id));
      const isCorrect = userAnswer && 
        JSON.stringify(userAnswer.answer) === JSON.stringify(question.correctAnswer);

      if (isCorrect) score++;

      return {
        question: question._id,
        userAnswer: userAnswer ? userAnswer.answer : null,
        isCorrect
      };
    });

    // Save result
    const result = new Result({
      user: req.user.id,
      exam: exam._id,
      score,
      totalQuestions: exam.questions.length,
      answers: questionResults
    });

    await result.save();

    res.json({
      score,
      totalQuestions: exam.questions.length,
      percentage: Math.round((score / exam.questions.length) * 100)
    });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
});

module.exports = router;
