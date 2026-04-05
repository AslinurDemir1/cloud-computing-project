import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://127.0.0.1:8000/api/';

// Login işlemi (POST)
export const login = async (username, password) => {
    const response = await axios.post(`${API_URL}token/`, { username, password });
    if (response.data.access) {
        localStorage.setItem('token', response.data.access);
    }
    return response.data;
};

// Tüm kayıtları getir (GET)
export const fetchRecords = async () => {
    const token = localStorage.getItem('token');
    const response = await axios.get(`${API_URL}health-records/`, {
        headers: { Authorization: `Bearer ${token}` }
    });
    return response.data;
};

// Yeni sağlık kaydı ekle (POST)
export const createRecord = async (data) => {
    const token = localStorage.getItem('token');
    const response = await axios.post(`${API_URL}health-records/`, data, {
        headers: { Authorization: `Bearer ${token}` }
    });
    return response.data;
};

// Sağlık kaydını sil (DELETE)
export const deleteRecord = async (id) => {
    const token = localStorage.getItem('token');
    await axios.delete(`${API_URL}health-records/${id}/`, {
        headers: { Authorization: `Bearer ${token}` }
    });
};
