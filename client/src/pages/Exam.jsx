import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import Countdown from 'react-countdown';
import { FaClock, FaCheck, FaArrowRight } from 'react-icons/fa';
import { toast } from 'react-toastify';

const Exam = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [exam, setExam] = useState(null);
  const [answers, setAnswers] = useState([]);
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [timeLeft, setTimeLeft] = useState(null);
  const countdownRef = useRef(null);

  // Save timer state to localStorage
  useEffect(() => {
    const savedTime = localStorage.getItem(`examTimer_${id}`);
    if (savedTime) {
      setTimeLeft(parseInt(savedTime));
    }
  }, [id]);

  // Prevent accidental navigation
  useEffect(() => {
    const handleBeforeUnload = (e) => {
      if (!submitting) {
        e.preventDefault();
        e.returnValue = 'Are you sure you want to leave? Your exam progress will be lost.';
      }
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
    };
  }, [submitting]);

  useEffect(() => {
    const fetchExam = async () => {
      try {
        const res = await axios.get(`/api/exam/${id}/start`);
        setExam(res.data);
        setLoading(false);
      } catch (err) {
        toast.error('Failed to load exam');
        navigate('/dashboard');
      }
    };

    fetchExam();
  }, [id, navigate]);

  const handleAnswerSelect = (questionId, answer) => {
    setAnswers(prev => {
      const existing = prev.find(a => a.questionId === questionId);
      if (existing) {
        return prev.map(a => 
          a.questionId === questionId ? { ...a, answer } : a
        );
      }
      return [...prev, { questionId, answer }];
    });
  };

  const handleNextQuestion = () => {
    if (currentQuestion < exam.questions.length - 1) {
      setCurrentQuestion(currentQuestion + 1);
    }
  };

  const handlePrevQuestion = () => {
    if (currentQuestion > 0) {
      setCurrentQuestion(currentQuestion - 1);
    }
  };

  const handleSubmitExam = async () => {
    setSubmitting(true);
    try {
      const res = await axios.post(`/api/exam/${id}/submit`, { answers });
      localStorage.removeItem(`examTimer_${id}`);
      toast.success('Exam submitted successfully!');
      navigate('/results', { state: { result: res.data } });
    } catch (err) {
      toast.error('Failed to submit exam');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading || !exam) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  const currentQ = exam.questions[currentQuestion];
  const currentAnswer = answers.find(a => a.questionId === currentQ._id)?.answer;

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto py-8 px-4">
        <div className="bg-white rounded-lg shadow-md p-6">
          {/* Exam Header */}
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-2xl font-bold">{exam.title}</h1>
            <div className="flex items-center text-red-500">
              <FaClock className="mr-2" />
              <Countdown
                ref={countdownRef}
                date={timeLeft || Date.now() + exam.duration * 60000}
                renderer={({ minutes, seconds, completed }) => {
                  if (completed) {
                    return <span>Time's up!</span>;
                  }
                  
                  // Show warning when 5 minutes left
                  if (minutes === 5 && seconds === 0) {
                    toast.warning('Only 5 minutes remaining!');
                  }
                  
                  // Show urgent warning when 1 minute left
                  if (minutes === 1 && seconds === 0) {
                    toast.error('Hurry! Only 1 minute left!');
                  }

                  // Save remaining time
                  const remainingMs = countdownRef.current?.api.getTime();
                  if (remainingMs) {
                    localStorage.setItem(
                      `examTimer_${id}`,
                      Date.now() + remainingMs
                    );
                  }

                  return (
                    <span>
                      {minutes}:{seconds < 10 ? `0${seconds}` : seconds}
                    </span>
                  );
                }}
                onComplete={() => {
                  localStorage.removeItem(`examTimer_${id}`);
                  handleSubmitExam();
                }}
              />
            </div>
          </div>

          {/* Progress Bar */}
          <div className="w-full bg-gray-200 rounded-full h-2.5 mb-6">
            <div 
              className="bg-primary h-2.5 rounded-full" 
              style={{ width: `${((currentQuestion + 1) / exam.questions.length) * 100}%` }}
            ></div>
          </div>

          {/* Question */}
          <div className="mb-8">
            <p className="text-lg font-medium mb-4">
              Question {currentQuestion + 1} of {exam.questions.length}: {currentQ.question}
            </p>
            
            {currentQ.options.map((option, index) => (
              <div 
                key={index}
                className={`p-3 mb-2 border rounded-md cursor-pointer transition-colors ${
                  JSON.stringify(currentAnswer) === JSON.stringify(option)
                    ? 'border-primary bg-primary bg-opacity-10'
                    : 'border-gray-300 hover:border-primary'
                }`}
                onClick={() => handleAnswerSelect(currentQ._id, option)}
              >
                {option}
              </div>
            ))}
          </div>

          {/* Navigation Buttons */}
          <div className="flex justify-between">
            <button
              onClick={handlePrevQuestion}
              disabled={currentQuestion === 0}
              className="btn-secondary px-4 py-2 disabled:opacity-50"
            >
              Previous
            </button>
            
            {currentQuestion < exam.questions.length - 1 ? (
              <button
                onClick={handleNextQuestion}
                className="btn-primary px-4 py-2 flex items-center"
              >
                Next <FaArrowRight className="ml-2" />
              </button>
            ) : (
              <button
                onClick={handleSubmitExam}
                disabled={submitting}
                className="btn-primary px-4 py-2 flex items-center"
              >
                {submitting ? 'Submitting...' : (
                  <>
                    Submit <FaCheck className="ml-2" />
                  </>
                )}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Exam;
