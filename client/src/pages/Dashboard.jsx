import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import axios from 'axios';
import { FaClipboardList, FaHistory, FaUser } from 'react-icons/fa';
import { toast } from 'react-toastify';

const Dashboard = () => {
  const { user, logout } = useAuth();
  const [exams, setExams] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchExams = async () => {
      try {
        const res = await axios.get('/api/exam');
        setExams(res.data);
      } catch (err) {
        toast.error('Failed to fetch exams');
      } finally {
        setLoading(false);
      }
    };

    fetchExams();
  }, []);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow">
        <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8 flex justify-between items-center">
          <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
          <div className="flex items-center space-x-4">
            <span className="text-gray-600 flex items-center">
              <FaUser className="mr-2" /> {user?.email}
            </span>
            <button
              onClick={logout}
              className="text-sm text-red-600 hover:text-red-800"
            >
              Logout
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          <h2 className="text-2xl font-semibold mb-6">Available Placement Exams</h2>
          
          {loading ? (
            <div className="flex justify-center">
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
            </div>
          ) : exams.length === 0 ? (
            <p className="text-gray-500">No exams available at the moment.</p>
          ) : (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {exams.map((exam) => (
                <div key={exam._id} className="bg-white p-6 rounded-lg shadow-md">
                  <h3 className="text-xl font-semibold mb-2">{exam.title}</h3>
                  <p className="text-gray-600 mb-4">{exam.description}</p>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-500">
                      Duration: {exam.duration} mins
                    </span>
                    <Link
                      to={`/exam/${exam._id}`}
                      className="btn-primary px-4 py-2 text-sm"
                    >
                      Start Exam
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          )}

          <div className="mt-12">
            <Link
              to="/results"
              className="inline-flex items-center text-primary hover:text-primary-dark"
            >
              <FaHistory className="mr-2" /> View Exam History
            </Link>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Dashboard;
