import { useState } from "react";

const defaultReasons = [
  "Запрещенный товар",
  "Неверная категория",
  "Некорректное описание",
  "Проблемы с фото",
  "Подозрение на мошенничество",
  "Другое",
];

export type ModerationFormValues = {
  reason: string;
  comment: string;
};

type ModerationFormProps = {
  title: string;                   // заголовок / текст над формой
  reasons?: string[];              // список причин, если вдруг хочешь переопределить
  commentLabel: string;            // подпись к textarea
  commentRequired?: boolean;       // обязателен ли комментарий
  confirmLabel: string;            // текст на кнопке подтверждения
  onCancel: () => void;
  onSubmit: (values: ModerationFormValues) => Promise<void> | void;
  className?: string;              // чтобы можно было reuse стили (`reject-form` / `request-changes-form`)
};

export default function ModerationForm({
  title,
  reasons = defaultReasons,
  commentLabel,
  commentRequired = false,
  confirmLabel,
  onCancel,
  onSubmit,
  className,
}: ModerationFormProps) {
  const [reason, setReason] = useState<string>(reasons[0]);
  const [comment, setComment] = useState<string>("");

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    await onSubmit({ reason, comment: comment.trim() });
  };

  return (
    <form className={className} onSubmit={handleSubmit}>
      <label>{title}</label> <br />

      <label>Выберите причину (обязательно):</label>
      <select
        required
        value={reason}
        onChange={(e) => setReason(e.target.value)}
      >
        {reasons.map((r) => (
          <option key={r} value={r}>
            {r}
          </option>
        ))}
      </select>

      <label>{commentLabel}</label>
      <textarea
        value={comment}
        onChange={(e) => setComment(e.target.value)}
        placeholder="Дайте автору комментарий"
        required={commentRequired}
      />

      <div className="send-container">
        <button type="button" onClick={onCancel}>
          Отмена
        </button>
        <button type="submit" className={commentRequired ? "pannel-rewrite" : "pannel-reject"}>
          {confirmLabel}
        </button>
      </div>
    </form>
  );
}
