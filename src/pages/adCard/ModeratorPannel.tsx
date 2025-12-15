// ========================================================================================
// Компонент, формирующий основную панель модератора
// Хендлит нажатие на кнопки одобрить/отклонить/отправить на доработку:
// - Одобрение: простой ПОСТ запрос на сервер
// = Отклонение: всплытие окна-формы при нажатии, где необходимо заполнить поля и вновь
//    подтвердить свой выбор (или нажать Отмена), далее отправляется ПОСТ запрос
// - На доработку: аналогично отклонению, всплывает окно, где модератор обязан дать фидбек
//    автору, далее отправляется ПОСТ запрос или модератор отменяет свое действие
// Перед каждым запросом осуществляется проверка есть ли у модератора права на то или иное действие
// Осуществлены Горячие клавиши: A/a - для оодобрения, D/d - для отклонения. При нажатии клавиши 
// происходит то же, что и при клике на кнопку
// ========================================================================================


import { useState, useEffect, useCallback } from 'react';
import { useModerator } from '../../hooks/useModerator';
import { fetchApprove, fetchReject, fetchRequestChanges } from '../../utils/fetchData';
import ModerationForm from '../../components/ModeratorForm';

import type { ModeratorModel } from '../../models/ModeratorModel';

export default function ModeratorPannel({ id }: {id: number}) {
  const [moderator, loading] = useModerator() as [ModeratorModel, boolean];
  const [showRejectForm, setShowRejectForm] = useState<boolean>(false);
  const [showRequestChangesForm, setShowRequestChangesForm] = useState<boolean>(false);

  const handleApprove = useCallback(async () => {
    const result = await fetchApprove({ moderator, id });
    if (result) {
      window.location.reload();
    } else {
      alert("Ошибка во время одобрения объявления.");
    }
  }, [moderator, id]);

  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      // проверка, откуда нажата клавиша: если из окна ввода, то игнорировать и просто печатать ее, не обрабатывать
      const tag = (e.target as HTMLElement).tagName;
      if (tag === "INPUT" || tag === "TEXTAREA" || tag === "SELECT") return;

      // обработка специальных клавиш (теперь они нажаты вне окон ввода)
      if (e.key === "a" || e.key === "A" || e.key === "ф" || e.key === "Ф") {
        e.preventDefault();
        handleApprove();
      }
      if (e.key === "d" || e.key === "D" || e.key === "в" || e.key === "В") {
        e.preventDefault();
        setShowRejectForm(true);
      }
    };
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [handleApprove]);

  if (loading) {
    return <div>Загрузка...</div>;
  }
  if (!moderator) {
    return <div>Доступ запрещен</div>;
  }

  const handleReject = async({ reason, comment }: {
    reason: string;
    comment: string;
  }) => {
    const body = { 'reason': reason, 'comment': comment.trim() };
    const result = await fetchReject({ moderator, id, body });
    if (result) {
      window.location.reload();
    } else {
      alert('Ошибка во время отклонения объявления.');
    }
  };

  const handleRequestChanges = async({ reason, comment }: {
    reason: string;
    comment: string;
  }) => {
    const body = { 'reason': reason, 'comment': comment.trim() };
    const result = await fetchRequestChanges({ moderator, id, body });
    if (result) {
      window.location.reload();
    } else {
      alert('Ошибка во время отправки объявления на доработку.');
    }
  };
  
  return (
    <>
    <div className="moderators-panel">
      <button className="pannel-approve" onClick={() => { handleApprove() }}>Одобрить</button>
      <button className="pannel-reject" onClick={() => { 
        setShowRejectForm(true);
        setShowRequestChangesForm(false);  
      }}>Отклонить</button>
      <button className="pannel-rewrite" onClick={() => { 
        setShowRequestChangesForm(true); 
        setShowRejectForm(false);  
      }}>Доработать</button>
    </div>
    <div>
    {/* если showRejectForm - состояние, говорящее о том, что была нажата клавиша или кнопка на Отклонение - 
        не false, то показываем окно-форму для заполнения фидбека от модератора, модератор подтверждает 
        свое решение
        При повторном нажатии на кнопку Отклонить, которая находится в окне-форме, отправить ПОСТ запрос на сервер 
        и сменить состояние showRejectForm - отклик уже отправлен, можно закрывать окно-форму*/}
    {showRejectForm && (
          <ModerationForm
          className="reject-form"
          title="Вы уверены, что хотите отклонить это объявление?"
          commentLabel="Комментарий (необязательно)"
          commentRequired={false}
          confirmLabel="Отклонить"
          onCancel={() => setShowRejectForm(false)}
          onSubmit={handleReject}
        />
      )}
      
      {/* Аналогично обработке отклонения */}
      {showRequestChangesForm && (
          <ModerationForm
          className="request-changes-form"
          title="Вы уверены, что хотите отправить объявление на доработку?"
          commentLabel="Комментарий (обязательно)"
          commentRequired={true}
          confirmLabel="На доработку"
          onCancel={() => setShowRequestChangesForm(false)}
          onSubmit={handleRequestChanges}
        />
      )}
    </div>
    </>
  );
}
