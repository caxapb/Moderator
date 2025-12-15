import type { ModeratorModel } from "../models/ModeratorModel";

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';

export default async function fetchData<T = unknown>(url: string, params?: RequestInit): Promise<T> {
  const response = await fetch(url, params);
  let message: string;

  if (!response.ok) {
    try {
      const error = (await response.json()) as {
        error: string;
        message?: string;
        id?: number;
      };
      message = `Ошибка ${response.status}: ${error.error} \n ${error.message || 'Запрос для id ' + error.id || ''}`;
    } catch {
      message = `Ошибка обработки ответа от сервера. ${response.status}: ${response.statusText}`;
    }
    throw new Error(`${message}`);
  }
  return (await response.json()) as T;
}


async function fetchApprove(params : {
  moderator: ModeratorModel;
  id: number;
}):  Promise<boolean | void> {
  const {moderator, id} = params;

  if (!moderator.permissions.includes("approve_ads")) {
    alert("У вас недостаточно прав");
    return;
  }

  try {
    await fetchData(`${API_URL}/api/v1/ads/${id}/approve`, { method: 'POST' });
    return true;
  } catch (err) {
    if (err instanceof TypeError) {
      console.error("Сетевая ошибка:", err.message);
      return false;
    } else {
      const error = err as Error;
      console.error("Ошибка при одобрении объявления.", error.message);
      return false;
    }
  }
}

async function fetchReject(params: { 
  moderator: ModeratorModel; 
  id: number; 
  body: { reason: string; comment: string};
}):  Promise<boolean> {
  const {moderator, id, body} = params;

  if (!moderator.permissions.includes("request_changes")) {
    alert("У вас недостаточно прав");
    return false;
  }

  try {
    await fetchData(`${API_URL}/api/v1/ads/${id}/reject`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    });
    return true;

  } catch (err) {
    if (err instanceof TypeError) {
      console.error("Сетевая ошибка:", err.message);
      return false;
    } else {
      const error = err as Error;
      console.error("Ошибка при отправке объявления на доработку.", error.message);
      return false;
    }
  }
}

async function fetchRequestChanges(params: { 
  moderator: ModeratorModel; 
  id: number; 
  body: { reason: string; comment: string};
}): Promise<boolean> {
  const {moderator, id, body} = params;

  if (!moderator.permissions.includes("request_changes")) {
    alert("У вас недостаточно прав");
    return false;
  }

  try {
    await fetchData(`${API_URL}/api/v1/ads/${id}/request-changes`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    });
    return true;

  } catch (err) {
    if (err instanceof TypeError) {
      console.error("Сетевая ошибка:", err.message);
      return false;
    } else {
      const error = err as Error;
      console.error("Ошибка при отправке объявления на доработку.", error.message);
      return false;
    }
  }
}

export {fetchData, fetchApprove, fetchReject, fetchRequestChanges};
