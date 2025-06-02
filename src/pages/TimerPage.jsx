import React from "react";
import Timer from "../components/Timer";
import ExportImportData from "../components/ExportImportData";
import History from "../components/History";

function TimerPage({ user }) {
  return (
    <>
      <h1 className="timer-title">Temporizador</h1>
      <Timer user={user} />
      <ExportImportData user={user} />
      <History user={user} />
    </>
  );
}

export default TimerPage;
