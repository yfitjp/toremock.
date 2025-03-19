'use client';

import { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { useAuth } from '@/app/hooks/useAuth';
import { getExam } from '@/app/lib/exams';

export default function PurchaseSuccessPage() {
  const router = useRouter();
  const params = useParams();
  const { user, loading: authLoading } = useAuth();
  const [examTitle, setExamTitle] = useState<string>('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchExamDetails = async () => {
      if (!user || !params?.id) return;

      try {
        const examId = Array.isArray(params.id) ? params.id[0] : params.id;
        const exam = await getExam(examId);
        if (exam) {
          setExamTitle(exam.title);
        }
      } catch (err) {
        console.error('Error fetching exam details:', err);
        setError('模試情報の取得中にエラーが発生しました。');
      } finally {
        setLoading(false);
      }
    };

    if (!authLoading) {
      if (!user) {
        router.push('/auth/signin');
      } else {
        fetchExamDetails();
      }
    }
  }, [user, authLoading, params, router]);

  if (loading || authLoading) {
    return (
      <div className="flex justify-center items-center min-h-screen bg-gray-50">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
        <div className="text-center max-w-md w-full bg-white p-8 rounded-lg shadow-md">
          <div className="bg-red-50 border border-red-200 text-red-700 p-4 rounded-md">
            {error}
          </div>
          <Link
            href="/exams"
            className="mt-6 inline-block text-blue-600 hover:text-blue-500 font-medium"
          >
            模試一覧に戻る
          </Link>
        </div>
      </div>
    );
  }

  const examId = Array.isArray(params?.id) ? params.id[0] : params?.id;

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4 py-12">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5 }}
        className="max-w-lg w-full bg-white rounded-xl shadow-lg overflow-hidden"
      >
        <div className="relative">
          <div className="absolute inset-0 bg-gradient-to-r from-blue-600 to-indigo-600 opacity-90"></div>
          <div className="relative py-8 px-6 text-center">
            <motion.div
              initial={{ scale: 0, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: 0.3, duration: 0.5, type: "spring" }}
              className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-white"
            >
              <svg
                className="h-8 w-8 text-green-600"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M5 13l4 4L19 7"
                />
              </svg>
            </motion.div>

            <h2 className="mt-4 text-3xl font-bold text-white">
              購入完了！
            </h2>
            <p className="mt-2 text-base text-blue-100">
              {examTitle}の購入が完了しました
            </p>
          </div>
        </div>

        <div className="px-6 py-8">
          <div className="text-center">
            <p className="text-gray-600 mb-6">
              購入いただきありがとうございます。このまま模試を受験するか、模試一覧に戻ることができます。
            </p>

            <div className="mt-8 space-y-4">
              {examId && (
                <motion.div
                  whileHover={{ scale: 1.03 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <Link
                    href={`/exams/${examId}/take`}
                    className="w-full flex justify-center py-3 px-4 border border-transparent rounded-md shadow-md text-base font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-all duration-200"
                  >
                    <span>今すぐ模試を受験する</span>
                    <svg className="ml-2 h-5 w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M10.293 3.293a1 1 0 011.414 0l6 6a1 1 0 010 1.414l-6 6a1 1 0 01-1.414-1.414L14.586 11H3a1 1 0 110-2h11.586l-4.293-4.293a1 1 0 010-1.414z" clipRule="evenodd" />
                    </svg>
                  </Link>
                </motion.div>
              )}
              <Link
                href="/exams"
                className="w-full inline-block text-center py-3 px-4 border border-gray-300 rounded-md text-base font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-all duration-200"
              >
                模試一覧に戻る
              </Link>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
} 