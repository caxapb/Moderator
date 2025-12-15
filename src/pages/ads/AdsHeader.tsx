import './styles/AdsHeader.css'
import { useState } from 'react';
import { fetchApprove, fetchReject, fetchRequestChanges } from '../../utils/fetchData';
import { useModerator } from '../../hooks/useModerator';
import ModerationForm from '../../components/ModeratorForm';
import type { ModeratorModel } from '../../models/ModeratorModel';

export type AdsHeaderProps = {
  sortBy: 'createdAt' | 'price' | 'priority' | ''; 
  setSortBy: (a: string) => void;
  sortOrder: 'asc' |'desc' | '';
  setSortOrder: (a: string) => void;
  limit: number;
  changeLimit: () => void;
  selectedIds: Set<number>;
  allAreChosen: boolean;
  selectAll: () => void;
}

export default function AdsHeader({
  sortBy, setSortBy,
  sortOrder, setSortOrder,
  limit, changeLimit,
  selectedIds, allAreChosen, 
  selectAll
}: AdsHeaderProps) {
  const [showApproveForm, setShowApproveForm] = useState(false);
  const [showRejectForm, setShowRejectForm] = useState(false);
  const [showRequestChangesForm, setShowRequestChangesForm] = useState(false);
  const [moderator, loadingModerator] = useModerator() as [ModeratorModel, boolean];

  const handleApprove = async (e: React.FormEvent) => {
    e.preventDefault();
    for (let id of selectedIds) {
      const result = await fetchApprove({ moderator, id });
      if (!result) {
        alert("Ошибка во время одобрения объявления.");
      }
    }
    window.location.reload();
  }

  const handleReject = async ({ reason, comment }: {
    reason: string;
    comment: string;
  }) => {
    for (let id of selectedIds) {
      const body = { 'reason': reason, 'comment': comment.trim() };
      const result = await fetchReject({ moderator, id, body });
      if (!result) {
        alert('error');
      }
    }
    window.location.reload();
  }

  const handleRequestChanges = async ({ reason, comment }: {
    reason: string;
    comment: string;
  }) => {
    for (let id of selectedIds) {
      const body = { 'reason': reason, 'comment': comment.trim() };
      const result = await fetchRequestChanges({ moderator, id, body });
      if (!result) {
        alert('Ошибка во время отклонения объявления.');
      }
    }
    window.location.reload();
  }

  if (loadingModerator) return <div>Загрузка данных о пользователе</div>;


  return (
  <div className='list-header'>
  <div className="sorting-container" id='pageBeginning'>
    <div className='sorting-block'> 
      <div> <label>Сортировка:&nbsp;</label> </div>
      <div> 
        <select value={sortBy} onChange={(e) => setSortBy(e.target.value)}>
        <option value="">Нет</option>
        <option value="createdAt">По дате</option>
        <option value="price">По цене</option>
        <option value="priority">По приоритету</option>
        </select>
      </div>

      <div>
        <select value={sortOrder} onChange={(e) => setSortOrder(e.target.value)}>
        <option value="">Порядок</option>
        <option value="asc">Возрастание</option>
        <option value="desc">Убывание</option>
        </select>
      </div>
    </div>

    <div className='pagination-block'>
      <label>Единиц на странице:  </label>
      <input type="number" value={limit}
        onChange={changeLimit}/>
    </div>   
  </div>
  <div className='bulk-container'>
    <label> Выбрать все 
      <input type="checkbox" checked={allAreChosen ? true : false} onChange={() => { selectAll(); }}/>
      <span className="checkmark"></span>
    </label>
    {selectedIds.size !== 0 && (
      <label className='chosen-amount'> Выбрано: {selectedIds.size}</label>
    )}

    <div className='bulk-actions'>
        <button className='pannel-approve' onClick={() => { 
          setShowApproveForm(!showApproveForm); 
          setShowRejectForm(false);
          setShowRequestChangesForm(false);
        }}>Одобрить выбранные</button>
        <button className='pannel-reject' onClick={() => { 
          setShowRejectForm(!showRejectForm); 
          setShowApproveForm(false);
          setShowRequestChangesForm(false);
        }}>Отклонить выбранные</button>
        <button className='pannel-rewrite' onClick={() => { 
          setShowRequestChangesForm(!showRequestChangesForm); 
          setShowApproveForm(false);
          setShowRejectForm(false);
        }}>Отправить выбранные на доработку</button>
      </div>

    {showApproveForm && (
      <div className='forms'>
        <form className='approve-form' onSubmit={handleApprove}>
          <label> Вы уверены что хотите одобрить все выбранные объявления?</label> <br />
          <div className='send-container'>
            <button onClick={() => {setShowApproveForm(false)}}>Отмена</button>
            <button type='submit' className='pannel-approve'>Одобрить</button>
          </div>
        </form>
      </div>
    )}
    {showRejectForm && (
        <div className="forms">
          <ModerationForm
            className="reject-form"
            title="Вы уверены, что хотите отклонить все выбранные объявления?"
            commentLabel="Комментарий (необязательно)"
            commentRequired={false}
            confirmLabel="Отклонить"
            onCancel={() => setShowRejectForm(false)}
            onSubmit={handleReject}
          />
        </div>
    )}

    {showRequestChangesForm && (
      <div className="forms">
        <ModerationForm
          className="request-changes-form"
          title="Вы уверены, что хотите отправить на доработку все выбранные объявления?"
          commentLabel="Комментарий (обязательно)"
          commentRequired={true}
          confirmLabel="На доработку"
          onCancel={() => setShowRequestChangesForm(false)}
          onSubmit={handleRequestChanges}
        />
      </div>
    )}
  </div>  
  </div>
  );
}