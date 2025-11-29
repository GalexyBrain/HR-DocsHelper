interface StatusBadgeProps {
  status: string;
}

export function StatusBadge({ status }: StatusBadgeProps) {
  const lowerStatus = status.toLowerCase();
  let colorClasses = "bg-gray-100 text-gray-800"; // default

  if (lowerStatus === "ready") {
    colorClasses = "bg-green-100 text-green-800";
  } else if (lowerStatus === "processing") {
    colorClasses = "bg-yellow-100 text-yellow-800";
  } else if (lowerStatus === "failed" || lowerStatus === "error") {
    colorClasses = "bg-red-100 text-red-800";
  }

  return (
    <span
      className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${colorClasses}`}
    >
      {status}
    </span>
  );
}
