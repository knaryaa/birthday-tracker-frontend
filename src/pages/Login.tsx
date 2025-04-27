import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { API_BASE_URL } from '../api';

function Login() {
    const navigate = useNavigate();
    const [formData, setFormData] = useState({ email: '', password: '' }); // Form verilerini tutuyor

    // Input alanlarındaki değişiklikleri yönetir
    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    // Form gönderildiğinde çalışır
    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            const response = await fetch(`${API_BASE_URL}/users/login`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData),
                credentials: 'include', // Cookie veya header taşımak için eklenir
            });

            if (response.ok) {
                const data = await response.json();
                console.log('Login response:', data); // Sunucudan dönen cevabı console'a yaz
                localStorage.setItem('token', data.data.access_token); // Token'ı localStorage'a kaydet
                alert('Giriş başarılı!');
                navigate('/dashboard'); // Başarılı giriş sonrası dashboard'a yönlendir
            } else {
                alert('Giriş başarısız.');
            }
        } catch (error) {
            console.error(error);
            alert('Bir hata oluştu.');
        }
    };
    
    return (
        <div className="container">
            <h1>Giriş Yap</h1>
            <form onSubmit={handleSubmit}>
                <input name="email" type="email" placeholder="Email" onChange={handleChange} required /><br />
                <input name="password" type="password" placeholder="Şifre" onChange={handleChange} required /><br />
                <button type="submit">Giriş Yap</button>
            </form>
            
            <p>Hesabın yok mu? <a onClick={() => navigate('/register')}>Kayıt Ol</a></p>
            
        </div>
    );
}

export default Login;