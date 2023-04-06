import React from "react";
import { Route, Routes } from "react-router-dom";
import TestView from "./TestView";

const TestRoutes = () => {
  return (
    <Routes>
      <Route path="/" Component={TestView} />
    </Routes>
  );
};

export default TestRoutes;
