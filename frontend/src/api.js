import axios from 'axios';

const API_URL = 'http://127.0.0.1:8000/api/health-records/';

// Tüm kayıtları getir (GET)
export const fetchRecords = async () => {
    const response = await axios.get(API_URL);
    return response.data;
};

// Yeni sağlık kaydı ekle (POST)
export const createRecord = async (data) => {
    const response = await axios.post(API_URL, data);
    return response.data;
};

// Sağlık kaydını sil (DELETE)
export const deleteRecord = async (id) => {
    await axios.delete(`${API_URL}${id}/`);
};
