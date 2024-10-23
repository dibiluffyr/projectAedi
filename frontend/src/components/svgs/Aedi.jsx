const AediSvg = (props) => (
  <svg aria-hidden='true' viewBox='0 0 24 24' {...props}>
    <circle cx="12" cy="7" r="1.5"/>
    <text x="12" y="20" fontSize="14" fontWeight="bold" textAnchor="middle">A</text>
    <text x="7" y="22" fontSize="12" fontWeight="bold" textAnchor="middle" transform="rotate(-10 7 22)">D</text>
    <text x="17" y="22" fontSize="12" fontWeight="bold" textAnchor="middle" transform="rotate(10 17 22)">E</text>
  </svg>
);
export default AediSvg;