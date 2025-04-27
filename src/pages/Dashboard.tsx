import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './Dashboard.css';
import { API_BASE_URL } from '../api';

// Arkadaş nesnesinin tipi
interface Friend {
    id: number;
    name: string;
    birthday: string;
    category: string;
}

function Dashboard() {
    const navigate = useNavigate();
    
    // State tanımlamaları
    const [friends, setFriends] = useState<Friend[]>([]);
    const [newFriend, setNewFriend] = useState({ name: '', birthday: '', category: '' });
    const [editingFriendId, setEditingFriendId] = useState<number | null>(null);
    const [editFormData, setEditFormData] = useState({ name: '', birthday: '', category: '' });
    const [activeTab, setActiveTab] = useState<'all' | 'upcoming'>('all');
    const [searchName, setSearchName] = useState('');
    const [searchCategory, setSearchCategory] = useState('');

    // Bir arkadaşın doğum günü gelecek hafta içinde mi kontrolü
    const isUpcomingBirthday = (birthday: string): boolean => {
        const today = new Date();
        const birthdayDate = new Date(birthday);
        const thisYearBirthday = new Date(today.getFullYear(), birthdayDate.getMonth(), birthdayDate.getDate());
        const diffTime = thisYearBirthday.getTime() - today.getTime();
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        return diffDays >= 0 && diffDays <= 7;
    };

    // Sayfa yüklendiğinde arkadaş listesini çek
    useEffect(() => {
        if (activeTab === 'all') {
            fetchFriends();
        } else if (activeTab === 'upcoming') {
            fetchUpcomingFriends();
        }
    }, [activeTab]);

    // Arkadaşları getiren fonksiyon
    const fetchFriends = async () => {
        const token = localStorage.getItem('token');
        if (!token) {
            navigate('/login');
            return;
        }

        try {
            const response = await fetch(`${API_BASE_URL}/friends`, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`,
                },
                credentials: 'include',
            });

            if (response.ok) {
                const data = await response.json();
                setFriends(data);
            } else {
                alert('Liste alınamadı, lütfen tekrar giriş yapın.');
                navigate('/login');
            }
        } catch (error) {
            console.error(error);
            alert('Bir hata oluştu.');
            navigate('/login');
        }
    };

    // Yaklaşan doğum günü olan arkadaşları getiren fonksiyon
    const fetchUpcomingFriends = async () => {
        const token = localStorage.getItem('token');
        if (!token) {
            navigate('/login');
            return;
        }
        try {
            const response = await fetch(`${API_BASE_URL}/friends/upcoming`, {
                headers: { Authorization: `Bearer ${token}` },
            });
            if (response.ok) {
                const data = await response.json();
                setFriends(data);
            } else {
                alert('Liste alınamadı.');
                navigate('/login');
            }
        } catch (error) {
            console.error(error);
            alert('Hata oluştu.');
            navigate('/login');
        }
    };

    // Yeni arkadaş inputlarını yönetir
    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setNewFriend({ ...newFriend, [e.target.name]: e.target.value });
    };

    // Yeni arkadaş ekler
    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        const token = localStorage.getItem('token');
        if (!token) return;
        try {
            const response = await fetch(`${API_BASE_URL}/friends`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
                body: JSON.stringify(newFriend),
            });
            if (response.ok) {
                alert('Arkadaş eklendi!');
                setNewFriend({ name: '', birthday: '', category: '' });
                fetchFriends();
            } else {
                alert('Ekleme başarısız.');
            }
        } catch (error) {
            console.error(error);
            alert('Hata oluştu.');
        }
    };

    // Arkadaş güncelleme formunu başlatır
    const startEditing = (friend: Friend) => {
        setEditingFriendId(friend.id);
        setEditFormData({
            name: friend.name,
            birthday: friend.birthday,
            category: friend.category,
        });
    };

    // Arkadaş güncelleme form inputlarını yönetir
    const handleEditChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setEditFormData({ ...editFormData, [e.target.name]: e.target.value });
    };

    // Arkadaş güncelleme formu gönderildiğinde çalışır
    const handleUpdateSubmit = async (e: React.FormEvent, id: number) => {
        e.preventDefault();
        const token = localStorage.getItem('token');
        if (!token) return;
        try {
            const response = await fetch(`${API_BASE_URL}/friends/${id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
                body: JSON.stringify(editFormData),
            });
            if (response.ok) {
                alert('Arkadaş güncellendi.');
                setEditingFriendId(null);
                fetchFriends();
            } else {
                alert('Güncelleme başarısız.');
            }
        } catch (error) {
            console.error(error);
            alert('Hata oluştu.');
        }
    };

    // Arkadaş silme işlemi
    const handleDelete = async (id: number) => {
        const token = localStorage.getItem('token');
        if (!token) return;
        const confirmDelete = window.confirm('Bu arkadaşı silmek istediğine emin misin?');
        if (!confirmDelete) return;
        try {
            const response = await fetch(`${API_BASE_URL}/friends/${id}`, {
                method: 'DELETE',
                headers: { Authorization: `Bearer ${token}` },
            });
            if (response.ok) {
                alert('Arkadaş silindi.');
                fetchFriends();
            } else {
                alert('Silme başarısız.');
            }
        } catch (error) {
            console.error(error);
            alert('Hata oluştu.');
        }
    };

    // Kullanıcı çıkışı
    const handleLogout = () => {
        localStorage.removeItem('token');
        navigate('/login');
    };

    // Arkadaş araması
    const handleSearch = async (e: React.FormEvent) => {
        e.preventDefault();
        const token = localStorage.getItem('token');
        if (!token) return;
        try {
            const queryParams = new URLSearchParams();
            if (searchName) queryParams.append('name', searchName);
            if (searchCategory) queryParams.append('category', searchCategory);

            const response = await fetch(`${API_BASE_URL}/friends/search?${queryParams.toString()}`, {
                headers: { Authorization: `Bearer ${token}` },
            });
            if (response.ok) {
                const data = await response.json();
                setFriends(data);
            } else {
                alert('Arama başarısız.');
            }
        } catch (error) {
            console.error(error);
            alert('Hata oluştu.');
        }
    };

    // Arama formunu temizler
    const handleClearSearch = () => {
        setSearchName('');
        setSearchCategory('');
        fetchFriends();
    };

    return (
        <div className="container" >
            
            <div className="top-bar">
                <h1>Doğum Günleri</h1>
                <button className="logout-btn" onClick={handleLogout}>
                    Çıkış Yap
                </button>
            </div>

            <div className="tabs">
                <button onClick={() => setActiveTab('all')}>Tüm Arkadaşlar</button>
                <button onClick={() => setActiveTab('upcoming')}>Yaklaşan Doğum Günleri</button>
            </div>

            {activeTab === 'all' && (
                <>
                    <form onSubmit={handleSearch} className="search-form">
                        <input
                            type="text"
                            placeholder="İsim Ara"
                            value={searchName}
                            onChange={(e) => setSearchName(e.target.value)}
                        />
                        <input
                            type="text"
                            placeholder="Kategori Ara"
                            value={searchCategory}
                            onChange={(e) => setSearchCategory(e.target.value)}
                        />
                        <button type="submit">Ara</button>
                        <button type="button" onClick={handleClearSearch}>Temizle</button>
                    </form>
                </>
            )}

            <h2>Yeni Arkadaş Ekle</h2>
            <form onSubmit={handleSubmit}>
                <input name="name" type="text" placeholder="İsim" value={newFriend.name} onChange={handleChange} required />
                <input name="birthday" type="date" placeholder="Doğum Günü" value={newFriend.birthday} onChange={handleChange} required />
                <input name="category" type="text" placeholder="Kategori" value={newFriend.category} onChange={handleChange} />
                <button type="submit">Ekle</button>
            </form>

            <h2>Arkadaşlar</h2>
            <ul className="friend-list">
                {friends.map((friend) => (
                    <li
                        key={friend.id}
                        className={isUpcomingBirthday(friend.birthday) ? 'upcoming' : ''}
                    >
                        {editingFriendId === friend.id ? (
                            <form onSubmit={(e) => handleUpdateSubmit(e, friend.id)}>
                                <input type="text" name="name" value={editFormData.name} onChange={handleEditChange} required />
                                <input type="date" name="birthday" value={editFormData.birthday} onChange={handleEditChange} required />
                                <input type="text" name="category" value={editFormData.category} onChange={handleEditChange} />
                                <button type="submit">Kaydet</button>
                                <button type="button" onClick={() => setEditingFriendId(null)}>İptal</button>
                            </form>
                        ) : (
                            <div className="friend-row">
                                <span>{friend.name} - {friend.birthday} ({friend.category})</span>
                                <div className="button-group">
                                    <button onClick={() => startEditing(friend)}>Güncelle</button>
                                    <button onClick={() => handleDelete(friend.id)}>Sil</button>
                                </div>
                            </div>
                        )}
                    </li>
                ))}
            </ul>
        </div>
    );
}

export default Dashboard;
