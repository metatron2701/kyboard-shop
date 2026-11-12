'use client';

import { loadTossPayments } from "@tosspayments/tosspayments-sdk";
import { useEffect, useState } from "react";

export function CheckoutPage(totalCost : number) {
  const [tossPayments, setTossPayments] = useState<any>(null);

  useEffect(() => {
    async function initToss() {
      const clientKey = process.env.NEXT_PUBLIC_TOSS_CLIENT_KEY || "";
      const payments = await loadTossPayments(clientKey);
      setTossPayments(payments);
    }
    initToss();
  }, []);

  const handlePayment = async () => {
    if (!tossPayments) return;

    try {
      await tossPayments.requestPayment("카드", {
        orderId: new Date().getTime(),
        orderName: "test",
        customerName: "구매자 이름",
        customerEmail: "구매자 이메일",
        amount: {
            currency: "KRW",
            value: totalCost.toLocaleString("ko-KR")
        },
        successUrl: `${window.location.origin}/payment/success`,
        failUrl: `${window.location.origin}/payment/fail`,
      });
    } catch (error) {
      console.error("결제 요청 실패:", error);
    }
  };

  return (
    <div className="p-6">
      <h1 className="text-xl font-bold mb-4">주문 및 결제</h1>
      <button 
        onClick={handlePayment}
        className="bg-blue-600 text-white px-4 py-2 rounded-lg"
      >
        {totalCost.toLocaleString("ko-KR")}원 결제하기
      </button>
    </div>
  );
}