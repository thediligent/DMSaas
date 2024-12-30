"use client";

import ProtectedRoute from "/components/ProtectedRoute";

export default function Dashboard() {
  return (
    <ProtectedRoute>
      <div>Welcome to the Dashboard! Please wait...</div>
    </ProtectedRoute>
  );
}
