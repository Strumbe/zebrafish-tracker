import { useEffect } from "react";
import { useRouter } from "next/router";
import { supabase } from "../lib/supabase";

export default function SuccessPage() {
  const router = useRouter();

  useEffect(() => {
    const redirectToDashboard = async () => {
      setTimeout(() => {
        router.push("/dashboard");
      }, 3000);
    };
    redirectToDashboard();
  }, [router]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-green-50">
      <div className="bg-white p-6 rounded-lg shadow-md text-center">
        <h1 className="text-2xl font-bold text-green-600">Success!</h1>
        <p className="text-gray-700 mt-4">You will be redirected to your dashboard shortly.</p>
      </div>
    </div>
  );
}