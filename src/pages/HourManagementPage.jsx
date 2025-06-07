import React from "react";
import History from "../components/History";

function HourManagementPage({ user }) {
  return (
    <>
      <History user={user} />
    </>
  );
}

export default HourManagementPage;
