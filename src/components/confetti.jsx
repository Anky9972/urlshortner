// ConfettiComponent.jsx
import React from 'react';
import Confetti from 'react-confetti';
import { useWindowSize } from 'react-use';

const ConfettiComponent = ({ run }) => {
  const { width, height } = useWindowSize();

  return (
    <Confetti
      width={width}
      height={height}
      run={run}
      tweenDuration={3000}
    />
  );
};

export default ConfettiComponent;
