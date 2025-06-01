// src/components/Dashboard.jsx

import React from "react";
import { useSession } from "next-auth/react";
import { Navigate } from "react-router-dom";

function Dashboard() {
  const { data: session, status } = useSession();

  if (status === "loading") return <div>Cargando...</div>;

  if (!session) return <Navigate to="/login" />;

  return <div>Bienvenido, {session.user.email}</div>;
}

export default Dashboard;
