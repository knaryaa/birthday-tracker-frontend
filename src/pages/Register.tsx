import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { API_BASE_URL } from '../api';

function Register() {
    const navigate = useNavigate();
    const [formData, setFormData] = useState({ email: '', password: '', name: '' }); // Form verilerini tutuyor

    // Input alanlarındaki değişiklikleri yönetir
    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    // Form gönderildiğinde çalışır
    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            const response = await fetch(`${API_BASE_URL}/users/register`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData),
            });

            if (response.ok) {
                alert('Kayıt başarılı! Şimdi giriş yapabilirsiniz.');
                navigate('/login'); // Başarılı kayıt sonrası login sayfasına yönlendir
            } else {
                alert('Kayıt başarısız.');
            }
        } catch (error) {
            console.error(error);
            alert('Bir hata oluştu.');
        }
    };

    return (
        <div className="container">
            <h1>Kayıt Ol</h1>
            <form onSubmit={handleSubmit}>
                <input name="name" type="text" placeholder="İsim" onChange={handleChange} required /><br />
                <input name="email" type="email" placeholder="Email" onChange={handleChange} required /><br />
                <input name="password" type="password" placeholder="Şifre" onChange={handleChange} required /><br />
                <button type="submit">Kayıt Ol</button>
            </form>

            <p>Zaten hesabın var mı? <a onClick={() => navigate('/login')}>Giriş Yap</a></p>
            
        </div>
    );
}

export default Register;
