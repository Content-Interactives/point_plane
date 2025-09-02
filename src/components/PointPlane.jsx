import React, { useState, useEffect, useRef } from 'react';
import confetti from 'canvas-confetti';
import { Container } from './ui/reused-ui/Container.jsx'
import CoordinatePlane from './CoordinatePlane.jsx'
import Flexi_Wave from './assets/flexi_wave.png'
import Flexi_Confused from './assets/flexi_confused.png'
import Flexi_Stars from './assets/flexi_stars.png'

const PointPlane = () => {
    // State Management
    const planeRef = useRef(null);
    const [answer, setAnswer] = useState(null);
    const [isConfused, setIsConfused] = useState(false);
    const confuseTimeoutRef = useRef(null);
    const [isStars, setIsStars] = useState(false);
    const [flyTransform, setFlyTransform] = useState('translate(0px, 0px) scale(1)');
    const [transitionEnabled, setTransitionEnabled] = useState(true);
    const [disabled, setDisabled] = useState(false);
    const resetTimeoutRef = useRef(null);
    const [positionReady, setPositionReady] = useState(false);
    const [isCorrect, setIsCorrect] = useState(false);
    const [incorrectPulse, setIncorrectPulse] = useState(false);
    const pulseTimeoutRef = useRef(null);

    // Functions
    const handleClick = () => {
        confetti({
            particleCount: 90,
            spread: 70,
            origin: { y: 0.6 }
        });
        confetti({
            particleCount: 60,
            angle: 60,
            spread: 55,
            origin: { x: 0 },
        });
        confetti({
            particleCount: 60,
            angle: 120,
            spread: 55,
            origin: { x: 1 },
        });
    };

    // Keep these in sync with CoordinatePlane defaults
    const planeSize = 260;
    const planeMargin = 32;
    const planeMax = 5;
    const barHeight = 77;
    const innerSize = planeSize - planeMargin * 2;
    const step = innerSize / planeMax;
    const originX = planeMargin;
    const originY = planeSize - planeMargin;
    const xToSvg = (vx) => originX + vx * step;
    const yToSvg = (vy) => originY - vy * step;

    useEffect(() => {
        // Resting position visually near the bottom bar; no animation and hidden until positioned
        const restX = originX + innerSize / 2;
        const restY = planeSize + barHeight - 10;
        setTransitionEnabled(false);
        setFlyTransform(`translate(${restX}px, ${restY}px) scale(1)`);
        setPositionReady(true);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const startFlyAnimationTo = (vx, vy) => {
        const endX = xToSvg(vx + 1.5);
        const endY = yToSvg(vy + 0.3);
        setTransitionEnabled(true);
        setFlyTransform(`translate(${endX}px, ${endY}px) scale(0.6)`);
    };

    const handlePointClick = ({ x, y }) => {
        if (answer && x === answer.x && y === answer.y) {
            // Correct: celebrate and show stars briefly
            handleClick();
            setIsConfused(false);
            setIsStars(true);
            setIsCorrect(true);
            startFlyAnimationTo(x, y);
            // Disable interactions for 3 seconds, then reset
            setDisabled(true);
            if (resetTimeoutRef.current) clearTimeout(resetTimeoutRef.current);
            resetTimeoutRef.current = setTimeout(() => {
                // Snap back to rest
                const restX = originX + innerSize / 2;
                const restY = planeSize + barHeight - 10;
                setTransitionEnabled(false);
                setFlyTransform(`translate(${restX}px, ${restY}px) scale(1)`);
                setIsStars(false);
                setIsCorrect(false);
                // Next question
                planeRef.current?.randomizeAnswer?.();
                setDisabled(false);
            }, 3000);
        } else {
            // Incorrect: show confused briefly
            setIsStars(false);
            setIsCorrect(false);
            setIsConfused(true);
            // Pulse the coordinate display
            setIncorrectPulse(true);
            if (pulseTimeoutRef.current) {
                clearTimeout(pulseTimeoutRef.current);
            }
            pulseTimeoutRef.current = setTimeout(() => {
                setIncorrectPulse(false);
            }, 500);
            if (confuseTimeoutRef.current) {
                clearTimeout(confuseTimeoutRef.current);
            }
            confuseTimeoutRef.current = setTimeout(() => {
                setIsConfused(false);
            }, 2000);
        }
    };

    useEffect(() => {
        return () => {
            if (confuseTimeoutRef.current) {
                clearTimeout(confuseTimeoutRef.current);
            }
            if (resetTimeoutRef.current) {
                clearTimeout(resetTimeoutRef.current);
            }
            if (pulseTimeoutRef.current) {
                clearTimeout(pulseTimeoutRef.current);
            }
        };
    }, []);

	return (
        <Container
            text="Points & Planes" 
            borderColor="#FF7B00"
            showSoundButton={true}
        >
            {/* Intro Text */}
            <div className='text-center text-sm text-gray-500 p-5 pb-0 flex-start'>
                Flexi is a little lost! Help him find where on the grid he needs to go using the coordinates below!
            </div>

            {/* Coordinate Plane */}
            <div className='h-[77px] w-[100%] flex justify-center flex-grow p-4 pt-0 pb-0'>
                <div className='relative' style={{ width: `${planeSize}px`, height: `${planeSize + barHeight}px` }}>
                    <CoordinatePlane
                        size={planeSize}
                        max={planeMax}
                        margin={planeMargin}
                        ref={planeRef}
                        onAnswerChange={setAnswer}
                        onPointClick={handlePointClick}
                        disabled={disabled}
                    />
                    <img
                        src={isStars ? Flexi_Stars : (isConfused ? Flexi_Confused : Flexi_Wave)}
                        alt='Flexi'
                        style={{
                            position: 'absolute',
                            left: -70,
                            bottom: '80%',
                            width: '48px',
                            transform: flyTransform + ' translate(-50%, -100%)',
                            transition: transitionEnabled ? 'transform 700ms ease-out' : 'none',
                            opacity: positionReady ? 1 : 0,
                            pointerEvents: 'none',
                            zIndex: 5,
                        }}
                    />
                </div>
            </div>


            {/* Coordinates */}
            <div className='absolute bottom-0 pb-3 w-[100%] h-[77px] flex flex-row items-end justify-center gap-3'>
                <div className='text-center text-5xl ml-10 pb-2 font-bold text-blue-500 flex-start'>
                    <span
                        className='inline-block'
                        style={{
                            transform: incorrectPulse ? 'scale(1.12)' : 'scale(1)',
                            transition: 'transform 500ms ease',
                            transitionDelay: incorrectPulse ? '200ms' : '0ms'
                        }}
                    >
                        <span className='text-black pr-1'>(</span>
                        {answer ? (
                            <>
                                <span className={isCorrect ? 'text-green-600' : 'text-blue-600'}>{answer.x}</span>
                                <span className='text-black'>, </span>
                                <span className={isCorrect ? 'text-green-600' : 'text-red-500'}>{answer.y}</span>
                            </>
                        ) : (
                            <span className='text-gray-400'>- , -</span>
                        )}
                        <span className='text-black pl-1'>)</span>
                    </span>
                </div>
            </div>
        </Container>
)
};


export default PointPlane;