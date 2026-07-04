type CheckCircleIcon = {
  circleColor?: string;
  checkColor?: string;
  className?: string;
};

export default function CheckCircleIcon({
  circleColor = '#97C05C',
  checkColor = '#FFFFFF',
  className,
}: CheckCircleIcon) {
  return (
    <svg width="40" height="40" viewBox="0 0 40 40" fill="none" className={className}>
      <rect width="40" height="40" rx="20" fill={circleColor} />
      <path
        d="M29.4634 13.0443C28.8835 12.4644 27.9236 12.4644 27.3436 13.0443L17.063 23.3249L12.4637 18.7246C11.8837 18.1446 10.923 18.1446 10.343 18.7246C9.7633 19.3046 9.76324 20.2645 10.343 20.8444L16.0031 26.5045C16.2831 26.7845 16.6631 26.9443 17.063 26.9443C17.4629 26.9443 17.843 26.7844 18.1229 26.5045L29.4634 15.1641C30.0433 14.5641 30.0434 13.6242 29.4634 13.0443Z"
        fill={checkColor}
      />
    </svg>
  );
}
