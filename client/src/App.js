import React, { useState, useEffect } from 'react';
import apiClient from './api';

function App() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [user, setUser] = useState(null);
  const [isLogin, setIsLogin] = useState(true);
  
  const [products, setProducts] = useState([]);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [productForm, setProductForm] = useState({ title: '', category: '', description: '', price: '' });
  const [showProductForm, setShowProductForm] = useState(false);
  
  const [usersList, setUsersList] = useState([]);
  const [showAdminPanel, setShowAdminPanel] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem('accessToken');
    if (token) {
      fetchUser();
    }
  }, []);

  const fetchUser = async () => {
    try {
      const response = await apiClient.get('/auth/me');
      setUser(response.data);
      fetchProducts();
    } catch (error) {
      localStorage.clear();
      setUser(null);
    }
  };

  const fetchProducts = async () => {
    try {
      const response = await apiClient.get('/products');
      setProducts(response.data);
    } catch (error) {
      console.error('Ошибка загрузки товаров', error);
    }
  };

  const fetchUsers = async () => {
    try {
      const response = await apiClient.get('/users');
      setUsersList(response.data);
    } catch (error) {
      console.error('Ошибка загрузки пользователей', error);
    }
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    try {
      await apiClient.post('/auth/register', {
        email,
        first_name: firstName,
        last_name: lastName,
        password
      });
      setIsLogin(true);
      alert('Регистрация успешна');
    } catch (error) {
      alert(error.response?.data?.error || 'Ошибка регистрации');
    }
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      const response = await apiClient.post('/auth/login', { email, password });
      localStorage.setItem('accessToken', response.data.accessToken);
      localStorage.setItem('refreshToken', response.data.refreshToken);
      await fetchUser();
    } catch (error) {
      alert(error.response?.data?.error || 'Ошибка входа');
    }
  };

  const handleLogout = () => {
    localStorage.clear();
    setUser(null);
    setEmail('');
    setPassword('');
    setProducts([]);
    setUsersList([]);
    setShowAdminPanel(false);
    setShowProductForm(false);
  };

  const handleCreateProduct = async (e) => {
    e.preventDefault();
    try {
      await apiClient.post('/products', productForm);
      setProductForm({ title: '', category: '', description: '', price: '' });
      setShowProductForm(false);
      fetchProducts();
      alert('Товар создан');
    } catch (error) {
      alert(error.response?.data?.error || 'Ошибка создания товара');
    }
  };

  const handleUpdateProduct = async (e) => {
    e.preventDefault();
    try {
      await apiClient.put(`/products/${selectedProduct.id}`, productForm);
      setSelectedProduct(null);
      setProductForm({ title: '', category: '', description: '', price: '' });
      setShowProductForm(false);
      fetchProducts();
      alert('Товар обновлён');
    } catch (error) {
      alert(error.response?.data?.error || 'Ошибка обновления товара');
    }
  };

  const handleDeleteProduct = async (id) => {
    if (window.confirm('Удалить товар?')) {
      try {
        await apiClient.delete(`/products/${id}`);
        fetchProducts();
        alert('Товар удалён');
      } catch (error) {
        alert(error.response?.data?.error || 'Ошибка удаления товара');
      }
    }
  };

  const handleDeleteUser = async (id) => {
    if (window.confirm('Удалить пользователя?')) {
      try {
        await apiClient.delete(`/users/${id}`);
        fetchUsers();
        alert('Пользователь удалён');
      } catch (error) {
        alert(error.response?.data?.error || 'Ошибка удаления пользователя');
      }
    }
  };

  const openEditProduct = (product) => {
    setSelectedProduct(product);
    setProductForm({
      title: product.title,
      category: product.category,
      description: product.description,
      price: product.price
    });
    setShowProductForm(true);
  };

  if (!user) {
    return (
      <div style={{ padding: '20px' }}>
        <h2>{isLogin ? 'Вход' : 'Регистрация'}</h2>
        <form onSubmit={isLogin ? handleLogin : handleRegister}>
          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          /><br/><br/>
          <input
            type="password"
            placeholder="Пароль"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          /><br/><br/>
          {!isLogin && (
            <>
              <input
                type="text"
                placeholder="Имя"
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
                required
              /><br/><br/>
              <input
                type="text"
                placeholder="Фамилия"
                value={lastName}
                onChange={(e) => setLastName(e.target.value)}
                required
              /><br/><br/>
            </>
          )}
          <button type="submit">{isLogin ? 'Войти' : 'Зарегистрироваться'}</button>
        </form>
        <button onClick={() => setIsLogin(!isLogin)}>
          {isLogin ? 'Нет аккаунта? Зарегистрироваться' : 'Есть аккаунт? Войти'}
        </button>
      </div>
    );
  }

  return (
    <div style={{ padding: '20px' }}>
      <h1>Добро пожаловать, {user.first_name} {user.last_name}</h1>
      <p>Email: {user.email} | Роль: {user.role === 'admin' ? 'Администратор' : user.role === 'seller' ? 'Продавец' : 'Пользователь'}</p>
      
      <button onClick={handleLogout}>Выйти</button>
      {(user.role === 'admin' || user.role === 'seller') && (
        <button onClick={() => { setShowProductForm(true); setSelectedProduct(null); setProductForm({ title: '', category: '', description: '', price: '' }); }} style={{ marginLeft: '10px' }}>
          Добавить товар
        </button>
      )}
      {user.role === 'admin' && (
        <button onClick={() => { setShowAdminPanel(!showAdminPanel); if (!showAdminPanel && usersList.length === 0) fetchUsers(); }} style={{ marginLeft: '10px' }}>
          {showAdminPanel ? 'Скрыть админ-панель' : 'Админ-панель'}
        </button>
      )}

      {showProductForm && (
        <div style={{ border: '1px solid #ccc', padding: '20px', margin: '20px 0' }}>
          <h3>{selectedProduct ? 'Редактировать товар' : 'Создать товар'}</h3>
          <form onSubmit={selectedProduct ? handleUpdateProduct : handleCreateProduct}>
            <input
              type="text"
              placeholder="Название"
              value={productForm.title}
              onChange={(e) => setProductForm({ ...productForm, title: e.target.value })}
              required
            /><br/><br/>
            <input
              type="text"
              placeholder="Категория"
              value={productForm.category}
              onChange={(e) => setProductForm({ ...productForm, category: e.target.value })}
              required
            /><br/><br/>
            <textarea
              placeholder="Описание"
              value={productForm.description}
              onChange={(e) => setProductForm({ ...productForm, description: e.target.value })}
              required
            /><br/><br/>
            <input
              type="number"
              placeholder="Цена"
              value={productForm.price}
              onChange={(e) => setProductForm({ ...productForm, price: e.target.value })}
              required
            /><br/><br/>
            <button type="submit">{selectedProduct ? 'Обновить' : 'Создать'}</button>
            <button type="button" onClick={() => { setShowProductForm(false); setSelectedProduct(null); }}>Отмена</button>
          </form>
        </div>
      )}

      <h2>Товары</h2>
      <table border="1" cellPadding="10">
        <thead>
          <tr><th>Название</th><th>Категория</th><th>Описание</th><th>Цена</th><th>Действия</th></tr>
        </thead>
        <tbody>
          {products.map(p => (
            <tr key={p.id}>
              <td>{p.title}</td>
              <td>{p.category}</td>
              <td>{p.description}</td>
              <td>{p.price} руб.</td>
              <td>
                {(user.role === 'admin' || user.role === 'seller') && (
                  <>
                    <button onClick={() => openEditProduct(p)}>Редактировать</button>
                    {user.role === 'admin' && (
                      <button onClick={() => handleDeleteProduct(p.id)} style={{ marginLeft: '5px' }}>Удалить</button>
                    )}
                  </>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {showAdminPanel && user.role === 'admin' && (
        <div style={{ marginTop: '20px' }}>
          <h2>Управление пользователями</h2>
          <table border="1" cellPadding="10">
            <thead>
              <tr><th>Email</th><th>Имя</th><th>Фамилия</th><th>Роль</th><th>Действия</th></tr>
            </thead>
            <tbody>
              {usersList.filter(u => u.id !== user.id).map(u => (
                <tr key={u.id}>
                  <td>{u.email}</td>
                  <td>{u.first_name}</td>
                  <td>{u.last_name}</td>
                  <td>{u.role === 'admin' ? 'Админ' : u.role === 'seller' ? 'Продавец' : 'Пользователь'}</td>
                  <td><button onClick={() => handleDeleteUser(u.id)}>Удалить</button></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

export default App;