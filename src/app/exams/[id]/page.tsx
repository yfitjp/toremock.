'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/app/contexts/AuthContext';
import { loadStripe } from '@stripe/stripe-js';
import { useToast } from '@/app/hooks/useToast';

// Stripeの初期化
const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!);

export default function ExamDetailPage({ params }: { params: { id: string } }) {
  const router = useRouter();
  const { user, loading } = useAuth();
  const { showToast } = useToast();
  const [exam, setExam] = useState<any>(null);
  const [purchaseStatus, setPurchaseStatus] = useState<'none' | 'pending' | 'completed' | 'failed'>('none');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchExam = async () => {
      try {
        const response = await fetch(`/api/exams/${params.id}`);
        if (!response.ok) {
          throw new Error('模試の取得に失敗しました');
        }
        const data = await response.json();
        setExam(data);
      } catch (error) {
        console.error('模試取得エラー:', error);
        showToast('模試の取得に失敗しました', 'error');
      } finally {
        setIsLoading(false);
      }
    };

    const checkPurchaseStatus = async () => {
      if (!user) return;

      try {
        const response = await fetch(`/api/exams/${params.id}/purchase/status`);
        if (!response.ok) {
          throw new Error('購入状態の取得に失敗しました');
        }
        const data = await response.json();
        setPurchaseStatus(data.status);
      } catch (error) {
        console.error('購入状態取得エラー:', error);
      }
    };

    fetchExam();
    checkPurchaseStatus();
  }, [params.id, user]);

  const handlePurchase = async () => {
    if (!user) {
      showToast('ログインが必要です', 'error');
      return;
    }

    try {
      const response = await fetch(`/api/exams/${params.id}/purchase`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${await user.getIdToken()}`,
        },
      });

      if (!response.ok) {
        const error = await response.text();
        throw new Error(error);
      }

      const { sessionId } = await response.json();
      const stripe = await stripePromise;

      if (!stripe) {
        throw new Error('Stripeの初期化に失敗しました');
      }

      const { error } = await stripe.redirectToCheckout({
        sessionId,
      });

      if (error) {
        throw error;
      }
    } catch (error) {
      console.error('購入処理エラー:', error);
      showToast(error instanceof Error ? error.message : '購入処理に失敗しました', 'error');
    }
  };

  if (isLoading) {
    return <div>読み込み中...</div>;
  }

  if (!exam) {
    return <div>模試が見つかりません</div>;
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6">{exam.title}</h1>
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6 mb-6">
        <p className="text-gray-600 dark:text-gray-300 mb-4">{exam.description}</p>
        <div className="flex items-center justify-between">
          <div className="text-xl font-bold text-gray-900 dark:text-white">
            ¥{exam.price.toLocaleString()}
          </div>
          {purchaseStatus === 'none' && (
            <button
              onClick={handlePurchase}
              className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
            >
              購入する
            </button>
          )}
          {purchaseStatus === 'pending' && (
            <div className="text-yellow-600">支払い処理中...</div>
          )}
          {purchaseStatus === 'completed' && (
            <div className="text-green-600">購入済み</div>
          )}
          {purchaseStatus === 'failed' && (
            <div className="text-red-600">支払い失敗</div>
          )}
        </div>
      </div>
      {/* 他の模試詳細情報 */}
    </div>
  );
} 