import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { FaChartBar, FaCheckCircle, FaTimesCircle, FaArrowLeft } from 'react-icons/fa';
import { toast } from 'react-toastify';

const Results = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [result, setResult] = useState(location.state?.result || null);
  const [loading, setLoading] = useState(!result);
  const [expandedQuestion, setExpandedQuestion] = useState(null);

  useEffect(() => {
    if (!result) {
      const fetchResults = async () => {
        try {
          const res = await axios.get('/api/exam/results');
          setResult(res.data[0]); // Get latest result
          setLoading(false);
        } catch (err) {
          toast.error('Failed to load results');
          navigate('/dashboard');
        }
      };
      fetchResults();
    }
  }, [result, navigate]);

  const toggleQuestion = (index) => {
    setExpandedQuestion(expandedQuestion === index ? null : index);
  };

  if (loading || !result) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto py-8 px-4">
        <div className="bg-white rounded-lg shadow-md p-6">
          {/* Header */}
          <div className="flex justify-between items-center mb-6">
            <button
              onClick={() => navigate('/dashboard')}
              className="btn-secondary flex items-center"
            >
              <FaArrowLeft className="mr-2" /> Back to Dashboard
            </button>
            <h1 className="text-2xl font-bold">Exam Results</h1>
          </div>

          {/* Summary */}
          <div className="bg-blue-50 p-4 rounded-lg mb-6">
            <div className="flex justify-between items-center">
              <div>
                <h2 className="text-xl font-semibold">{result.exam.title}</h2>
                <p className="text-gray-600">Completed on: {new Date(result.submittedAt).toLocaleString()}</p>
              </div>
              <div className="text-center">
                <div className="text-4xl font-bold text-primary">
                  {result.score}/{result.totalQuestions}
                </div>
                <div className="text-lg">
                  ({Math.round(result.percentage)}%)
                </div>
              </div>
            </div>
          </div>

          {/* Performance Bar */}
          <div className="w-full bg-gray-200 rounded-full h-4 mb-6">
            <div 
              className="bg-primary h-4 rounded-full" 
              style={{ width: `${result.percentage}%` }}
            ></div>
          </div>

          {/* Detailed Results */}
          <div className="mb-4">
            <h3 className="text-lg font-semibold mb-4 flex items-center">
              <FaChartBar className="mr-2" /> Question Breakdown
            </h3>
            
            {result.answers.map((answer, index) => (
              <div key={index} className="mb-4 border-b pb-4 last:border-b-0">
                <div 
                  className="flex justify-between items-center cursor-pointer"
                  onClick={() => toggleQuestion(index)}
                >
                  <div className="flex items-center">
                    {answer.isCorrect ? (
                      <FaCheckCircle className="text-green-500 mr-2" />
                    ) : (
                      <FaTimesCircle className="text-red-500 mr-2" />
                    )}
                    <span className="font-medium">Question {index + 1}</span>
                  </div>
                  <span className="text-gray-500">
                    {expandedQuestion === index ? 'Hide details' : 'Show details'}
                  </span>
                </div>

                {expandedQuestion === index && (
                  <div className="mt-3 pl-8">
                    <p className="font-medium mb-2">{answer.question.question}</p>
                    <div className="mb-2">
                      <span className="font-medium">Your answer: </span>
                      <span className={answer.isCorrect ? 'text-green-600' : 'text-red-600'}>
                        {Array.isArray(answer.userAnswer) ? answer.userAnswer.join(', ') : answer.userAnswer}
                      </span>
                    </div>
                    {!answer.isCorrect && (
                      <div>
                        <span className="font-medium">Correct answer: </span>
                        <span className="text-green-600">
                          {Array.isArray(answer.question.correctAnswer) 
                            ? answer.question.correctAnswer.join(', ') 
                            : answer.question.correctAnswer}
                        </span>
                      </div>
                    )}
                  </div>
                )}
              </div>
            ))}
          </div>

          {/* Recommendation */}
          {result.percentage >= result.exam.passingScore ? (
            <div className="bg-green-50 text-green-800 p-4 rounded-lg">
              <h3 className="font-semibold">Congratulations!</h3>
              <p>You have passed this placement exam with a score of {Math.round(result.percentage)}%.</p>
            </div>
          ) : (
            <div className="bg-yellow-50 text-yellow-800 p-4 rounded-lg">
              <h3 className="font-semibold">Keep Practicing!</h3>
              <p>You scored {Math.round(result.percentage)}%, which is below the passing score of {result.exam.passingScore}%.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Results;
