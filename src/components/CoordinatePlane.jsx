import React, { useState, useEffect, useImperativeHandle, forwardRef } from 'react';

const CoordinatePlane = forwardRef(({ size = 260, max = 5, margin = 32, onPointClick, onAnswerChange, disabled = false }, ref) => {
	const innerSize = size - margin * 2;
	const step = innerSize / max;
	const originX = margin;
	const originY = size - margin;

	const xToSvg = (x) => originX + x * step;
	const yToSvg = (y) => originY - y * step;
	const ticks = Array.from({ length: max }, (_, i) => i + 1);
	const [hovered, setHovered] = useState(null);
	const makeRandomPoint = () => ({ x: 1 + Math.floor(Math.random() * max), y: 1 + Math.floor(Math.random() * max) });
	const [answer, setAnswer] = useState(makeRandomPoint);

	const randomizeAnswer = () => {
		const next = makeRandomPoint();
		setAnswer(next);
	};

	useEffect(() => {
		if (onAnswerChange) onAnswerChange(answer);
	}, [answer, onAnswerChange]);

	// Clear hover when disabling interactions or when a new answer is chosen
	useEffect(() => {
		setHovered(null);
	}, [disabled, answer]);

	useEffect(() => {
		// Re-roll answer if grid size changes
		randomizeAnswer();
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [max]);

	useImperativeHandle(ref, () => ({ answer, randomizeAnswer }), [answer]);

	const arrow = hovered
		? {
			ax: xToSvg(hovered.x),
			tipY: yToSvg(hovered.y) - 2,
			baseY: yToSvg(hovered.y) - 12,
			leftX: xToSvg(hovered.x) - 6,
			rightX: xToSvg(hovered.x) + 6,
		}
		: null;

	return (
		<svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} role="img" aria-label="Quadrant I coordinate plane from 0 to 5" onMouseLeave={() => setHovered(null)}>
			{/* Grid guidelines */}
			{ticks.map((i) => (
				<line
					key={`v-${i}`}
					x1={xToSvg(i)}
					y1={originY}
					x2={xToSvg(i)}
					y2={originY - innerSize}
					stroke="#d1d5db"
					strokeWidth={1}
					shapeRendering="crispEdges"
				/>
			))}
			{ticks.map((i) => (
				<line
					key={`h-${i}`}
					x1={originX}
					y1={yToSvg(i)}
					x2={originX + innerSize}
					y2={yToSvg(i)}
					stroke="#d1d5db"
					strokeWidth={1}
					shapeRendering="crispEdges"
				/>
			))}
			{/* Axes */}
			<line x1={originX} y1={originY} x2={originX + innerSize} y2={originY} stroke="#222" strokeWidth={2} />
			<line x1={originX} y1={originY} x2={originX} y2={originY - innerSize} stroke="#222" strokeWidth={2} />

			{/* Interactive points at grid intersections (1..max, 1..max) */}
			{ticks.map((x) => (
				<g key={`row-${x}`}>
					{ticks.map((y) => (
						<circle
							key={`pt-${x}-${y}`}
							cx={xToSvg(x)}
							cy={yToSvg(y)}
							r={8}
							fill="transparent"
							stroke="transparent"
							pointerEvents={disabled ? 'none' : 'all'}
							onMouseEnter={() => !disabled && setHovered({ x, y })}
							onMouseLeave={() => !disabled && setHovered(null)}
							onClick={() => (!disabled && onPointClick ? onPointClick({ x, y }) : undefined)}
							style={{ cursor: disabled ? 'default' : 'pointer' }}
						/>
					))}
				</g>
			))}

			{/* X-axis points and labels (1-6) */}
			{ticks.map((i) => (
				<g key={`x-${i}`}>
					<text x={xToSvg(i)} y={originY + 16} fontSize={12} textAnchor="middle" fill="#2563eb" fontWeight="bold" fontFamily="'Comic Sans MS', 'Comic Sans', cursive">{i}</text>
				</g>
			))}

			{/* Y-axis points and labels (1-6) */}
			{ticks.map((i) => (
				<g key={`y-${i}`}>
					<text x={originX - 12} y={yToSvg(i) + 4} fontSize={12} textAnchor="end" fill="red" fontWeight="bold" fontFamily="'Comic Sans MS', 'Comic Sans', cursive">{i}</text>
				</g>
			))}

			{/* Origin label */}
			<text x={originX - 6} y={originY + 14} fontSize={12} textAnchor="end" fill="#111827" fontWeight="bold" fontFamily="'Comic Sans MS', 'Comic Sans', cursive">0</text>

			{/* Hover arrow above the active point */}
			{!disabled && arrow && (
				<polygon
					points={`${arrow.ax},${arrow.tipY} ${arrow.leftX},${arrow.baseY} ${arrow.rightX},${arrow.baseY}`}
					fill="red"
					pointerEvents="none"
					aria-hidden="true"
				/>
			)}
		</svg>
	);
});

export default CoordinatePlane;


