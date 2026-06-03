import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import type { Session } from "@supabase/supabase-js";

const Index = () => {
  const navigate = useNavigate();
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Get initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setLoading(false);
    });

    // Listen for auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  useEffect(() => {
    // Only redirect when we have finished loading
    if (!loading) {
      if (session) {
        // User is logged in, redirect to dashboard
        console.log("User is logged in, redirecting to dashboard.");
        navigate("/dashboard");
      } else {
        // User is not logged in, redirect to login
        console.log("User is not logged in, redirecting to login.");
        navigate("/login");
      }
    }
  }, [session, loading, navigate]);

  // You can return a loading indicator or null while the check happens
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <div className="text-center">
        <h1 className="text-4xl font-bold mb-4">Loading Portal...</h1>
        <p className="text-xl text-gray-600">Checking authentication status.</p>
      </div>
    </div>
  );
};

export default Index;