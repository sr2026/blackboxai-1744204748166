import React from 'react';
import { Link } from 'react-router-dom';
import { FaChalkboardTeacher, FaUserGraduate, FaClipboardCheck } from 'react-icons/fa';

const Home = () => {
  return (
    <div className="min-h-screen flex flex-col">
      {/* Hero Section */}
      <section className="bg-primary text-white py-20">
        <div className="container mx-auto px-4 text-center">
          <h1 className="text-4xl md:text-5xl font-bold mb-6">Placement Exam System</h1>
          <p className="text-xl mb-8 max-w-2xl mx-auto">
            Assess your skills and get placed in the right course with our comprehensive placement test
          </p>
          <div className="flex justify-center gap-4">
            <Link to="/register" className="btn-secondary inline-flex items-center px-6 py-3">
              Get Started
            </Link>
            <Link to="/login" className="btn-primary inline-flex items-center px-6 py-3">
              Login
            </Link>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16 bg-white">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-12">How It Works</h2>
          <div className="grid md:grid-cols-3 gap-8">
            <div className="text-center p-6 rounded-lg shadow-md">
              <FaUserGraduate className="text-5xl text-primary mx-auto mb-4" />
              <h3 className="text-xl font-semibold mb-2">Create Account</h3>
              <p>Register as a student to take the placement test and track your progress.</p>
            </div>
            <div className="text-center p-6 rounded-lg shadow-md">
              <FaClipboardCheck className="text-5xl text-primary mx-auto mb-4" />
              <h3 className="text-xl font-semibold mb-2">Take the Test</h3>
              <p>Complete the timed exam that assesses your knowledge across key subjects.</p>
            </div>
            <div className="text-center p-6 rounded-lg shadow-md">
              <FaChalkboardTeacher className="text-5xl text-primary mx-auto mb-4" />
              <h3 className="text-xl font-semibold mb-2">Get Results</h3>
              <p>Receive immediate feedback and course placement recommendations.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="mt-auto bg-gray-800 text-white py-8">
        <div className="container mx-auto px-4 text-center">
          <p>© {new Date().getFullYear()} Placement Exam System. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
};

export default Home;
