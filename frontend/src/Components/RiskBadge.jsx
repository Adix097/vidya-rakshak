const STYLES = {
  low: "bg-green-50 border-green-300 text-green-700",
  medium: "bg-yellow-50 border-yellow-300 text-yellow-700",
  high: "bg-orange-50 border-orange-300 text-orange-700",
  critical: "bg-red-50 border-red-300 text-red-700",
};

const LABELS = {
  low: "Low",
  medium: "Medium",
  high: "High",
  critical: "Critical",
};

const RiskBadge = ({ level }) => {
  const style = STYLES[level] || "bg-gray-50 border-gray-300 text-gray-500";
  const label = LABELS[level] || "Unknown";

  return (
    <span
      className={`inline-block px-2.5 py-1 text-xs rounded border ${style}`}
    >
      {label}
    </span>
  );
};

export default RiskBadge;
