interface ActionButtonProps {
  type?: "button" | "submit" | "reset" | undefined;
  loading?: boolean;
  text?: string;
  classname?: string;
  onClick?: () => void;
  disabled?: boolean;
}

export default function ActionButton({
  type,
  loading,
  text,
  classname,
  onClick,
  disabled,
}: ActionButtonProps) {
  return (
    <button
      type={type}
      disabled={loading || disabled}
      onClick={onClick}
      className={`btn hover:text-white border-0 font-bold ${classname}`}
    >
      {loading ? <span className="loading loading-spinner"></span> : text}
    </button>
  );
}
