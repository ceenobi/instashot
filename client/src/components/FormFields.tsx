import type {
  FieldErrors,
  FieldValues,
  UseFormRegister,
} from "react-hook-form";

interface FormProps {
  isVisible?: boolean;
  setIsVisible?: React.Dispatch<React.SetStateAction<boolean>>;
  label: string;
  type: string;
  placeholder: string;
  id: string;
  register: UseFormRegister<FieldValues>;
  errors?: FieldErrors;
  name: string;
  classname?: string;
  onKeyDown?: (e: React.KeyboardEvent<HTMLInputElement>) => void;
}

export default function FormFields({
  isVisible,
  setIsVisible,
  label,
  type,
  placeholder,
  id,
  register,
  errors,
  name,
  classname,
  onKeyDown,
}: FormProps) {
  const toggleVisibility = () => setIsVisible?.((prev) => !prev);
  return (
    <div className={classname}>
      <label className="floating-label relative">
        <span>{label}</span>
        {name === "description" ? (
          <textarea
            placeholder={placeholder}
            className={`textarea textarea-md w-full ${
              errors?.[name] && "border-red-600"
            }`}
            id={id}
            {...register(name)}
          ></textarea>
        ) : name === "tags" ? (
          <input
            type={type}
            placeholder={placeholder}
            className="input input-md w-full"
            id={id}
            onKeyDown={onKeyDown}
          />
        ) : (
          <input
            type={isVisible ? "text" : type}
            placeholder={placeholder}
            className={`input input-md w-full ${
              errors?.[name] && "border-red-600"
            }`}
            id={id}
            {...register(name)}
          />
        )}
        {type === "password" && (
          <button
            type="button"
            className="absolute inset-y-0 right-2 text-sm border-0 focus:outline-none font-semibold"
            onClick={toggleVisibility}
          >
            {isVisible ? "Hide" : "Show"}
          </button>
        )}
      </label>
      {errors?.[name]?.message && (
        <div className="text-xs text-red-600">
          {errors?.[name]?.message as string}
        </div>
      )}
    </div>
  );
}
