import React from "react";
import ReactLoading from "react-loading";

const LoadingSpinner = ({ type, color }) => (
  <ReactLoading className="py-10" type={type} color={color} height={100} width={100} />
);

export default LoadingSpinner;
